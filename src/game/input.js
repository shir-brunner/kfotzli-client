const Timeline = require('./utils/timeline');
const $ = require('jquery');
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;
const ACTION_KEYS = [LEFT_KEY, RIGHT_KEY, UP_KEY, DOWN_KEY];

let $document = $(document);

module.exports = class Input {
    constructor(localPlayer, connection, game) {
        this.localPlayer = localPlayer;
        this.connection = connection;
        this.statesByKey = {};
        this.history = new Timeline(10);
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

        this.statesByKey[keyCode] = isPressed;

        let historyEntry = { keyCode: keyCode, isPressed: isPressed };
        this.history.set(this.game.timestamp, historyEntry);
        this.applyInput(this.localPlayer, keyCode, isPressed);

        if (this._shouldSendInput(keyCode, isPressed))
            this.connection.send('INPUT', historyEntry);
    }

    applyInput(player, keyCode, isPressed) {
        switch (keyCode) {
            case LEFT_KEY:
                player.controller.isLeftPressed = isPressed;
                break;
            case RIGHT_KEY:
                player.controller.isRightPressed = isPressed;
                break;
            case UP_KEY:
                player.controller.isUpPressed = isPressed;
                break;
            case DOWN_KEY:
                player.controller.isDownPressed = isPressed;
                break;
        }
    }

    _shouldSendInput(keyCode, isPressed) {
        if (this.localPlayer.isJumping()) {
            if (keyCode === UP_KEY && isPressed)
                return false;
        }

        return true;
    }
};