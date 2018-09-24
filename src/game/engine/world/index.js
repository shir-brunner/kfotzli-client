const Player = require('../objects/player');
const GameObject = require('../objects/game_object');
const commonConfig = require('../../common_config');
const Physics = require('../physics/index');
const WorldEvents = require('../events/world_events');
const _ = require('lodash');

module.exports = class World {
    constructor({ players, level, camera }) {
        this.players = players;
        this.level = level;
        this.gameObjects = level.gameObjects.map(gameObject => new GameObject(gameObject));
        this.physics = new Physics(this);
        this.localPlayer = this.players.find(player => player.isLocal);
        this.worldEvents = new WorldEvents(this);
        this.bodyParts = [];
        this.camera = camera;
        this.camera && this.camera.follow(this.localPlayer);

        this.teams = [];
        this.players.forEach(player => {
            if (this.teams.indexOf(player.team) === -1)
                this.teams.push(player.team);
        });
    }

    update(delta, currentFrame) {
        this.physics.update(delta, currentFrame);
        this.players.forEach(player => player.update(delta, currentFrame));
        this.gameObjects.forEach(gameObject => gameObject.update(delta, currentFrame));
        this.worldEvents.updateEvents();
        this.removeExpiredBodyParts();
        this.camera && this.camera.update(delta);
    }

    render(context) {
        this.gameObjects.forEach(gameObject => {
            if (gameObject.invisible || gameObject.collected)
                return;

            gameObject.render(context, this.camera)
        });
        this.players.forEach(player => player.render(context, this.camera));
        this.bodyParts.forEach(bodyPart => bodyPart.render(context, this.camera));
    }

    removeExpiredBodyParts() {
        let now = Date.now();
        this.bodyParts.forEach(bodyPart => {
            if (now > bodyPart.expiration - 2500)
                bodyPart.ignoreCollisions = true;
        });

        this.bodyParts = this.bodyParts.filter(bodyPart => now < bodyPart.expiration);
    }

    static create(level, clients, camera) {
        return new World({
            players: clients.map((client, index) => {
                let teamClients = clients.filter(c => c.team === client.team);
                let teamSpawnPoints = level.spawnPoints.filter(spawnPoint => spawnPoint.team === client.team);
                let playerParams = client.character;
                let spawnPoint = client.team ? teamSpawnPoints[teamClients.indexOf(client)] : level.spawnPoints[index];
                playerParams.x = spawnPoint.x;
                playerParams.y = spawnPoint.y - client.character.height + commonConfig.squareSize;
                _.assign(playerParams, client);
                return new Player(playerParams);
            }),
            level: level,
            camera: camera
        });
    }
};
