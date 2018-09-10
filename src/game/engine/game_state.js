const _ = require('lodash');
const Player = require('./objects/player');
const GameObject = require('./objects/game_object');
const config = require('../common_config');

module.exports = class GameState {
    constructor({ players, level }) {
        this.players = players;
        this.level = level;
        this.gameObjects = level.gameObjects.map(gameObject => new GameObject(gameObject));
    }

    update(delta, gameTime) {
        this.players.forEach(player => player.update(delta, gameTime));
        this.gameObjects.forEach(gameObject => gameObject.update(delta, gameTime));
    }

    render(context, camera) {
        this.gameObjects.forEach(gameObject => gameObject.render(context, camera));
        this.players.forEach(player => player.render(context, camera));
    }

    getSharedState(gameTime) {
        return {
            gameTime: gameTime,
            players: this.players.map(player => player.getSharedState(gameTime))
        };
    }

    static create(level, clients) {
        return new GameState({
            players: clients.map((client, index) => {
                let spawnPoint = level.spawnPoints[index];
                let playerParams = client.character;
                playerParams.x = spawnPoint.x;
                playerParams.y = spawnPoint.y - client.character.height + config.squareSize;
                _.assign(playerParams, client);
                return new Player(playerParams);
            }),
            level: level
        });
    }
};
