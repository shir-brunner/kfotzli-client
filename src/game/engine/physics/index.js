const config = require('../../common_config');
const _ = require('lodash');
const intersectionUtil = require('../utils/intersection');

module.exports = class Physics {
    constructor(gameState) {
        this.gameState = gameState;
    }

    update(delta, ticks) {
        this._updatePlayersPhysics(delta, ticks);
        this.gameState.update(delta, ticks);
    }

    _updatePlayersPhysics(delta) {
        let intersectionsByPlayer = this._getIntersectionsByPlayer();

        this.gameState.players.forEach(player => {
            player.verticalSpeed += config.gravity * delta;
            player.y += player.verticalSpeed * delta;

            this._stopFallingIfLanded(player, intersectionsByPlayer[player.id]);
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