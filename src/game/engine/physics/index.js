const config = require('../../common_config');
const _ = require('lodash');

module.exports = class Physics {
    constructor(gameState) {
        this.gameState = gameState;
        this.stuckables = gameState.gameObjects.filter(gameObject => gameObject.stuckable);
    }

    update(delta, gameTime) {
        this._updatePlayersPhysics(delta, gameTime);
        this.gameState.update(delta, gameTime);
    }

    _updatePlayersPhysics(delta) {
        this.gameState.players.forEach(player => {
            let canMoveLeft = true;
            let canMoveRight = true;
            let speed = player.speed * delta;

            this.stuckables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();

                if(player.y + player.height > collidablePosition.y &&
                    player.y < collidablePosition.y + collidablePosition.height) {

                    if(player.x + player.width + speed >= collidablePosition.x &&
                        player.x + speed <= collidablePosition.x + collidablePosition.width) {
                        canMoveRight = false;
                    }

                    if(player.x - speed <= collidablePosition.x + collidablePosition.width &&
                        player.x + player.width - speed >= collidablePosition.x) {
                        canMoveLeft = false;
                    }
                }
            });

            player.isStanding = false;
            player.verticalSpeed += config.gravity * delta;
            player.y += player.verticalSpeed;

            this.stuckables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();

                if(this._canLand(player, collidablePosition))
                    this._land(player, collidablePosition);

                if(this._canButt(player, collidablePosition))
                    this._butt(player, collidablePosition);
            });

            if (player.controller.isLeftPressed && canMoveLeft)
                player.x -= speed;
            else if (player.controller.isRightPressed && canMoveRight)
                player.x += speed;

            if (player.controller.isUpPressed && player.isStanding) {
                player.verticalSpeed = -player.jumpHeight;
            }
        });
    }

    _canLand(player, collidablePosition) {
        return player.isFalling() &&
            player.y + player.height >= collidablePosition.y &&
            player.x + player.width >= collidablePosition.x &&
            player.x < collidablePosition.x + collidablePosition.width &&
            player.y <= collidablePosition.y + collidablePosition.height;
    }

    _land(player, collidablePosition) {
        player.verticalSpeed = 0;
        player.y = collidablePosition.y - player.height;
        player.isStanding = true;
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
};