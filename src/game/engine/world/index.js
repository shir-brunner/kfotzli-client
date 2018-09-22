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
    }

    update(delta, currentFrame) {
        this.physics.update(delta, currentFrame);
        this.players.forEach(player => player.update(delta, currentFrame));
        this.gameObjects.forEach(gameObject => gameObject.update(delta, currentFrame));
        this.worldEvents.updateEvents();
        this.removeExpiredBodyParts();
        this.camera && this.camera.update(delta);

/*        if(this.players[0].controller.isRightPressed)
            this.startForDebug = true;

        if(this.startForDebug)
            console.log('CURRENT FRAME = ' + currentFrame + ', X = ' + this.players[0].x + ', CONTROLLER STATE = ' + this.players[0].controller.isRightPressed);*/
    }

    render(context) {
        this.gameObjects.forEach(gameObject => gameObject.render(context, this.camera));
        this.players.forEach(player => player.render(context, this.camera));
        this.bodyParts.forEach(bodyPart => bodyPart.render(context, this.camera));
    }

    setPlayersPositions(players) {
        players.forEach(playerState => {
            let player = this.players.find(player => player.id === playerState.id);
            _.assign(player, playerState);
        });
    }

    removeExpiredBodyParts() {
        let now = Date.now();
        this.bodyParts.forEach(bodyPart => {
            if(now > bodyPart.expiration - 2500)
                bodyPart.ignorePhysics = true;
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
