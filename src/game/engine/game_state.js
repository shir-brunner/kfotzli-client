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

    update(delta) {
        this.players.forEach(player => player.update(delta));
        this.gameObjects.forEach(gameObject => gameObject.update(delta));
    }

    render(context, camera) {
        this.gameObjects.forEach(gameObject => gameObject.render(context, camera));
        this.players.forEach(player => player.render(context, camera));
    }

    getLocalPlayer() {
        return this.players.find(player => player.isLocal);
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
