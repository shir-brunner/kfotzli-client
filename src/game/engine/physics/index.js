const config = require('../../common_config');
const physicsUtil = require('../../utils/physics');
const _ = require('lodash');

module.exports = class Physics {
    constructor(world) {
        this.world = world;
        this.levelSize = world.level.size;
        this.events = [];
        this.stuckables = [];
        this.bumpables = [];
        this.climbables = [];
        this.collidables = [];
        this.fallables = [];
    }

    update(delta) {
        this._indexGameObjects();
        this.events = [];
        this.world.players.forEach(player => this._updatePlayerPhysics(player, delta));
        this.world.bodyParts.forEach(bodyPart => this._updateBodyPartPhysics(bodyPart, delta));
        this.fallables.forEach(fallable => this._updateFallablePhysics(fallable, delta));
    }

    _indexGameObjects() {
        this.stuckables = [];
        this.bumpables = [];
        this.climbables = [];
        this.collidables = [];
        this.fallables = [];

        this.world.gameObjects.forEach(gameObject => {
            gameObject.stuckable && this.stuckables.push(gameObject);
            gameObject.bumpable && this.bumpables.push(gameObject);
            gameObject.climbable && this.climbables.push(gameObject);
            gameObject.obstacle && this.collidables.push(gameObject);
            gameObject.collectable && !gameObject.collected && this.collidables.push(gameObject);
            gameObject.fallable && this.fallables.push(gameObject);
        });
    }

    _updatePlayerPhysics(player, delta) {
        if (player.isDead)
            return;

        let canMoveLeft = player.x > 0;
        let canMoveRight = (player.x + player.width) < this.levelSize.width;
        let slopeOnRight = null;
        let slopeOnLeft = null;
        let canClimbDown = true;
        let canClimbUp = true;
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
                    if(gameObject.slope === 'left')
                        slopeOnRight = gameObject;
                }

                if (player.x - speed <= collidablePosition.x + collidablePosition.width &&
                    player.x + player.width - speed >= collidablePosition.x) {
                    canMoveLeft = false;
                    if(gameObject.slope === 'right')
                        slopeOnLeft = gameObject;
                }
            }

            if (player.x + player.width > collidablePosition.x &&
                player.x < collidablePosition.x + collidablePosition.width) {

                if (player.y + player.height + player.climbSpeed >= collidablePosition.y &&
                    player.y + player.climbSpeed <= collidablePosition.y + collidablePosition.height) {
                    canClimbDown = false;
                }

                if (player.y - player.climbSpeed <= collidablePosition.y + collidablePosition.height &&
                    player.y + player.height - player.climbSpeed >= collidablePosition.y) {
                    canClimbUp = false;
                }
            }
        });

        this.world.players.forEach(otherPlayer => {
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
                this._addEvent('HEAD_BUMP', { bumpingPlayer: player, bumpedPlayer: otherPlayer });
            }
        });

        this.collidables.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();
            if (physicsUtil.intersects(player, collidablePosition))
                this._addEvent('PLAYER_COLLIDED', { player: player, gameObject: gameObject });
        });

        this.climbables.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();
            if (physicsUtil.intersects(player, collidablePosition)) {
                if (canClimbUp && player.controller.isUpPressed)
                    climbing = true;

                if (canClimbDown && player.controller.isDownPressed)
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
                if (this._canLand(player, collidablePosition)) {
                    gameObject.setAnimation('bump');
                    player.bump(gameObject.bumpHeight);
                }
            });
        }

        if (player.y + player.height > this.levelSize.height)
            this._addEvent('PLAYER_OUTSIDE_WORLD_BOUNDS', { player: player });

        this._applyPlayerMovement(player, canMoveLeft, canMoveRight, speed, climbing, delta, slopeOnRight, slopeOnLeft);
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
        this._indexGameObjects();

        for (let frame = fromFrame; frame <= toFrame; frame++) {
            let controller = controllerHistory.at(frame);
            controller && _.assign(this.world.localPlayer.controller, controller);
            this._updatePlayerPhysics(this.world.localPlayer, 1);
        }
    }

    _applyPlayerMovement(player, canMoveLeft, canMoveRight, speed, climbing, delta, slopeOnRight, slopeOnLeft) {
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

        if(slopeOnRight && player.controller.isRightPressed) {
            player.move('right', speed);
            player.y -= speed;
        } else if(slopeOnLeft && player.controller.isLeftPressed) {
            player.move('left', speed);
            player.y -= speed;
        }
    }

    _updateBodyPartPhysics(bodyPart, delta) {
        if (!bodyPart.ignoreCollisions) {
            this.stuckables.forEach(gameObject => {
                let collidablePosition = gameObject.getCollidablePosition();
                if (physicsUtil.intersects(bodyPart, collidablePosition)) {
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

    _updateFallablePhysics(fallable, delta) {
        this.stuckables.forEach(gameObject => {
            let collidablePosition = gameObject.getCollidablePosition();
            if (physicsUtil.intersects(fallable, collidablePosition))
                this._land(fallable, collidablePosition);
        });

        fallable.verticalSpeed += config.gravity * delta;
        fallable.y += fallable.verticalSpeed;
    }

    _handleSlope(player, gameObject) {
        let slope = gameObject.slope;

    }
};