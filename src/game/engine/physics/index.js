const config = require('../../common_config');
const _ = require('lodash');
const intersectionUtil = require('../utils/intersection');

module.exports = class Physics {
    constructor(gameState) {
        this.gameState = gameState;
    }

    update(delta, gameTime) {
        this._updatePlayersPhysics(delta, gameTime);
        this.gameState.update(delta, gameTime);
    }

    _updatePlayersPhysics(delta) {
        let intersectionsByPlayer = this._getIntersectionsByPlayer();

        this.gameState.players.forEach(player => {
            player.verticalSpeed += config.gravity * delta;
            player.y += player.verticalSpeed * delta;

            this._stopFallingIfLanded(player, intersectionsByPlayer[player.id]);

            if(player.controller.isLeftPressed)
                player.x -= player.speed * delta;
            else if(player.controller.isRightPressed)
                player.x += player.speed * delta;
        });
    }

    _getIntersectionsByPlayer() {
        let intersectionsByPlayer = {};
        let gameObjects = this.gameState.gameObjects;

        this.gameState.players.forEach(player => {
            intersectionsByPlayer[player.id] = gameObjects.filter(gameObject => {
                return intersectionUtil.intersects(player, gameObject);
            });
        });

        return intersectionsByPlayer;
    }

    _stopFallingIfLanded(player, playerIntersections = []) {
        let standable = playerIntersections.find(gameObject => {
            return gameObject.stuckable && gameObject.y >= player.y;
        });

        if(standable) {
            player.verticalSpeed = 0;
            player.y = standable.y - player.height;
        }
    }
};