const $ = require('jquery');
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;

let $document = $(document);

module.exports = class Input {
    constructor(localPlayer, connection) {
        this.localPlayer = localPlayer;
        this.connection = connection;

        $document.off('keydown keyup');
        $document.on('keydown', event => this._handleInput(event.keyCode, true));
        $document.on('keyup', event => this._handleInput(event.keyCode, false));
    }

    _handleInput(keyCode, isPressed) {
        switch(keyCode) {
            case LEFT_KEY:
                this.localPlayer.controller.isLeftPressed = isPressed;
            case RIGHT_KEY:
                this.localPlayer.controller.isRightPressed = isPressed;
            case UP_KEY:
                this.localPlayer.controller.isUpPressed = isPressed;
            case DOWN_KEY:
                this.localPlayer.controller.isDownPressed = isPressed;
        }

        this.connection.send('INPUT', { keyCode: keyCode, isPressed: isPressed });
    }
};