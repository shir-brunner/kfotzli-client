const config = require('../../common_config');
const physicsUtil = require('../../utils/physics');
const _ = require('lodash');

module.exports = class Physics {
    constructor(world) {
        this.world = world;
        this.stuckables = world.gameObjects.filter(gameObject => gameObject.stuckable);
        this.bumpables = world.gameObjects.filter(gameObject => gameObject.bumpable);
        this.climbables = world.gameObjects.filter(gameObject => gameObject.climbable);
        this.obstacles = world.gameObjects.filter(gameObject => gameObject.obstacle);
        this.levelSize = this.world.level.size;
        this.players = this.world.players;
        this.events = [];
    }

    update(delta) {
        this.events = [];
        this.world.players.forEach(player => this._updatePlayerPhysics(player, delta));
        this.world.bodyParts.forEach(bodyPart => this._updateBodyPartPhysics(bodyPart, delta));
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

        this.players.forEach(otherPlayer => {
            if (otherPlayer.id === player.id || otherPlayer.isDead)
                return;

            if (player.y + player.height > otherPlayer.y &&
                player.y < otherPlayer.y + otherPlayer.height) {

                if (player.x + player.width + speed >= otherPlayer.x &&
                    player.x + speed <= otherPlayer.x + otherPlayer.width) {
                    canMoveRight = false;
                }

                if (player.x - speed <= otherPlayer.x + otherPlayer.width &&
                    player.x + player.width - speed >= otherPlayer.x) {
                    canMoveLeft = false;
                }
            }

            if (physicsUtil.intersects(player, otherPlayer) &&
                otherPlayer.y > player.y) {
                player.bump(player.jumpHeight);
                this._addEvent('HEAD_BUMP', { by: player, on: otherPlayer });
            }
        });

        this.obstacles.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();
            if (physicsUtil.intersects(player, collidablePosition))
                this._addEvent('TOUCHED_OBSTACLE', { player: player, obstacle: gameObject });
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

            this.bumpables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();
                if(this._canLand(player, collidablePosition)) {
                    gameObject.setAnimation('bump');
                    player.bump(gameObject.bumpHeight);
                }
            });
        }

        this._applyPlayerMovement(player, canMoveLeft, canMoveRight, speed, climbing, delta);
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

    fastForwardLocalPlayer(fromFrame, toFrame, controllerHistory) {
        console.log('fromFrame', fromFrame);
        console.log('toFrame', toFrame);

        for (let frame = fromFrame; frame <= toFrame; frame++) {
            console.log('simulated player at frame ' + frame + ' is X = ' + this.world.localPlayer.x);
            let controller = controllerHistory.at(frame);
            if (controller) {
                _.assign(this.world.localPlayer.controller, controller);
                console.log('GETTING CONTROLLER, FRAME = ' + frame + ', STATE = ' + controller.isRightPressed);
            }
            this._updatePlayerPhysics(this.world.localPlayer, 1);
        }
    }

    _applyPlayerMovement(player, canMoveLeft, canMoveRight, speed, climbing, delta) {
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

    _updateBodyPartPhysics(bodyPart, delta) {
        if(!bodyPart.ignorePhysics) {
            this.stuckables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();
                if(physicsUtil.intersects(bodyPart, collidablePosition)) {
                    bodyPart.verticalSpeed *= -0.9;
                    bodyPart.y = collidablePosition.y - bodyPart.height;
                }
            });
        }

        bodyPart.x += bodyPart.horizontalSpeed * delta;
        bodyPart.verticalSpeed += config.gravity * delta;
        bodyPart.y += bodyPart.verticalSpeed;
    }

    _addEvent(eventType, data) {
        this.events.push({ type: eventType, data: data });
    }
};