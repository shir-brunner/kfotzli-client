const $ = require('jquery');
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;
const ACTION_KEYS = [LEFT_KEY, RIGHT_KEY, UP_KEY, DOWN_KEY];

let $document = $(document);

module.exports = class InputHandler {
    constructor(localPlayer, connection, game) {
        this.localPlayer = localPlayer;
        this.connection = connection;
        this.statesByKey = {};
        this.game = game;

        $document.off('keydown keyup');
        $document.on('keydown', event => this._handleInput(event.keyCode, true));
        $document.on('keyup', event => this._handleInput(event.keyCode, false));
    }

    _handleInput(keyCode, isPressed) {
        if (ACTION_KEYS.indexOf(keyCode) === -1)
            return;

        if (this.statesByKey[keyCode] === isPressed)
            return;

        if (this.localPlayer.isDead)
            return;

        this.statesByKey[keyCode] = isPressed;

        let input = { frame: this.game.lastFrame, keyCode: keyCode, isPressed: isPressed };
        if (this._shouldSendInput(input))
            this.connection.send('INPUT', input);

        this.applyInput(this.localPlayer, input);
    }

    applyInput(player, input) {
        switch (input.keyCode) {
            case LEFT_KEY:
                player.controller.isLeftPressed = input.isPressed;
                break;
            case RIGHT_KEY:
                player.controller.isRightPressed = input.isPressed;
                break;
            case UP_KEY:
                player.controller.isUpPressed = input.isPressed;
                break;
            case DOWN_KEY:
                player.controller.isDownPressed = input.isPressed;
                break;
        }
    }

    _shouldSendInput(input) {
        if (this.localPlayer.isJumping()) {
            if (input.keyCode === UP_KEY && input.isPressed)
                return false;
        }

        return true;
    }
};