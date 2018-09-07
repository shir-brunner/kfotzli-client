const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const GameObject = require('./engine/objects/game_object');
const Player = require('./engine/objects/player');
const $debug = require('../utils/debug')();
const Physics = require('./engine/physics/index');
const FRAME_RATE = 1000 / config.fps;

module.exports = class Game {
    constructor(room, connection, gameCanvas) {
        this.gameState = this._createInitialGameState(room);
        this.renderer = new Renderer(gameCanvas, room.level);
        this.lastTimestamp = Date.now();
        this.physics = new Physics(this.gameState);
    }

    _createInitialGameState(room) {
        return new GameState({
            players: room.clients.map((client, index) => {
                let spawnPoint = room.level.spawnPoints[index];
                let playerParams = client.character;
                playerParams.x = spawnPoint.x;
                playerParams.y = spawnPoint.y - client.character.height + config.squareSize;
                _.assign(playerParams, _.omit(client, ['name']));
                return new Player(playerParams);
            }),
            gameObjects: room.level.gameObjects.map(gameObject => new GameObject(gameObject))
        });
    }

    start() {
        this.ticks = 0;
        window.requestAnimationFrame(this._mainLoop.bind(this));
    }

    _mainLoop(ss) {
        let now = Date.now();
        let deltaTime = now - this.lastTimestamp;
        if(deltaTime > FRAME_RATE) {
            let deltaInFrameRates = deltaTime / FRAME_RATE;
            while(deltaInFrameRates > 0) {
                if(deltaInFrameRates % 1) //is whole number
                    this.physics.update(1, ++this.ticks);
                else
                    this.physics.update(deltaInFrameRates, ++this.ticks);
                deltaInFrameRates--;
            }
            this.renderer.render(this.gameState);
            this.lastTimestamp = now;
        }

        window.requestAnimationFrame(this._mainLoop.bind(this));

        config.debug.showFps && $debug.html([
            'DESIRED FPS: ' + config.fps,
            'ACTUAL FPS: ' + Math.round(1000 / deltaTime),
            'DELTA: ' + deltaTime / 1000,
            'PLAYERS: ' + this.gameState.players.length
        ].join('<br>'));
    }
};