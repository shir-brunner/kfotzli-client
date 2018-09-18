const config = require('../common_config');
const physicsUtil = require('../utils/physics');
const _ = require('lodash');
const FRAME_RATE = Math.round(1000 / config.fps);

module.exports = class Physics {
    constructor(gameState) {
        this.gameState = gameState;
        this.stuckables = gameState.gameObjects.filter(gameObject => gameObject.stuckable);
        this.climbables = gameState.gameObjects.filter(gameObject => gameObject.climbable);
        this.levelSize = this.gameState.level.size;
        this.localPlayer = this.gameState.players.find(player => player.isLocal);
    }

    update(delta) {
        this.gameState.players.forEach(player => this._updatePlayerPhysics(player, delta));
        this.gameState.update(delta);
    }

    _updatePlayerPhysics(player, delta) {
        let canMoveLeft = player.x > 0;
        let canMoveRight = (player.x + player.width) < this.levelSize.width;
        let climbing = false;
        let speed = player.speed * delta;
        player.isStanding = false;

        this.stuckables.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();

            if (player.y + player.height > collidablePosition.y &&
                player.y < collidablePosition.y + collidablePosition.height) {

                if (player.x + player.width + speed >= collidablePosition.x &&
                    player.x + speed <= collidablePosition.x + collidablePosition.width) {
                    canMoveRight = false;
                }

                if (player.x - speed <= collidablePosition.x + collidablePosition.width &&
                    player.x + player.width - speed >= collidablePosition.x) {
                    canMoveLeft = false;
                }
            }
        });

        this.climbables.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();
            if (physicsUtil.intersects(player, collidablePosition) &&
                (player.controller.isUpPressed || player.controller.isDownPressed)) {
                climbing = true;
            }
        });

        if (!climbing) {
            player.verticalSpeed += config.gravity * delta;
            player.y += player.verticalSpeed;
            player.setAnimation('jump');

            this.stuckables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();

                if (this._canLand(player, collidablePosition))
                    this._land(player, collidablePosition);

                if (this._canButt(player, collidablePosition))
                    this._butt(player, collidablePosition);
            });
        }

        if (player.controller.isLeftPressed && canMoveLeft)
            player.move('left', speed);
        else if (player.controller.isRightPressed && canMoveRight) {
            player.move('right', speed);
        }

        if (player.x < 0)
            player.x = 0;

        if (player.x + player.width > this.levelSize.width)
            player.x = this.levelSize.width - player.width;

        if (player.controller.isUpPressed && climbing)
            player.climb('up', player.climbSpeed * delta);
        else if (player.controller.isDownPressed && climbing)
            player.climb('down', player.climbSpeed * delta);
        else if (player.controller.isUpPressed && player.isStanding)
            player.bump(player.jumpHeight);
    }

    _canLand(player, collidablePosition) {
        return player.isFalling() &&
            player.y + player.height >= collidablePosition.y &&
            player.x + player.width >= collidablePosition.x &&
            player.x < collidablePosition.x + collidablePosition.width &&
            player.y <= collidablePosition.y + collidablePosition.height - (player.height / 2);
    }

    _land(player, collidablePosition) {
        player.verticalSpeed = 0;
        player.y = collidablePosition.y - player.height;
        player.isStanding = true;
        player.setAnimation('idle');
    }

    _canButt(player, collidablePosition) {
        return player.isJumping() &&
            player.y + player.height >= collidablePosition.y &&
            player.x + player.width >= collidablePosition.x &&
            player.x < collidablePosition.x + collidablePosition.width &&
            player.y <= collidablePosition.y + collidablePosition.height;
    }

    _butt(player, collidablePosition) {
        player.verticalSpeed = 0;
        player.y = collidablePosition.y + collidablePosition.height;
    }

    applySharedState(sharedState) {
        sharedState.players.forEach(playerState => {
            let player = this.gameState.players.find(player => player.id === playerState.id);
            _.assign(player, playerState);
        });
    }

    fastForwardLocalPlayer(now, deltaTime, inputHandler) {
        let deltaFrames = deltaTime / FRAME_RATE;
        for (let frame = 1; frame <= deltaFrames; frame++) {
            let inputEntry = inputHandler.history.at(now - deltaTime);
            if (inputEntry)
                input.applyInput(this.localPlayer, inputEntry.keyCode, inputEntry.isPressed);
            deltaTime -= FRAME_RATE;
            this._updatePlayerPhysics(this.localPlayer, 1);
        }
    }
};