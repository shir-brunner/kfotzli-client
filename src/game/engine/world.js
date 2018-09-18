const _ = require('lodash');
const Player = require('./objects/player');
const GameObject = require('./objects/game_object');
const config = require('../common_config');
const Physics = require('./physics');

module.exports = class World {
    constructor({ players, level }) {
        this.players = players;
        this.level = level;
        this.gameObjects = level.gameObjects.map(gameObject => new GameObject(gameObject));
        this.physics = new Physics(this);
        this.localPlayer = this.players.find(player => player.isLocal);
    }

    update(delta) {
        this.physics.update(delta);
        this.players.forEach(player => player.update(delta));
        this.gameObjects.forEach(gameObject => gameObject.update(delta));
    }

    applySharedState(sharedState) {
        sharedState.players.forEach(playerState => {
            let player = this.players.find(player => player.id === playerState.id);
            _.assign(player, playerState);
        });
    }

    render(context, camera) {
        this.gameObjects.forEach(gameObject => gameObject.render(context, camera));
        this.players.forEach(player => player.render(context, camera));
    }

    static create(level, clients) {
        return new World({
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
