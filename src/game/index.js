const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const Physics = require('./engine/physics/index');
const Input = require('./input');
const FRAME_RATE = Math.round(1000 / config.fps);
const $debug = require('../utils/debug')();

module.exports = class Game {
    constructor(room, connection, gameCanvas, latency) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.absoluteStartTime = Date.now();
        this.lastTimestamp = this.absoluteStartTime;
        this.gameState = GameState.create(room.level, room.clients);
        this.physics = new Physics(this.gameState);
        this.connection = connection;
        this.latency = latency;
        this.gameTime = 0;

        let localPlayer = this.gameState.players.find(player => player.isLocal);
        new Input(localPlayer, connection);
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.setSharedState(sharedState));
        window.requestAnimationFrame(this._mainLoop.bind(this));
    }

    _mainLoop() {
        let actualGameTime = Date.now() - this.absoluteStartTime;
        let now = Date.now();
        let deltaTime = now - this.lastTimestamp;
        if (deltaTime > FRAME_RATE) {
            let deltaFrames = deltaTime / FRAME_RATE;
            while (deltaFrames > 0) {
                if (deltaFrames >= 1) {
                    this.physics.update(1, this.gameTime);
                    this.gameTime += FRAME_RATE;
                } else {
                    this.physics.update(deltaFrames, this.gameTime);
                    this.gameTime += deltaFrames * FRAME_RATE;
                }
                deltaFrames--;
            }
            this.renderer.render(this.gameState);
            this.lastTimestamp = now;

            config.debug.showGameInfo && this._showGameInfo(deltaTime);
        }

        if (config.debug.stopGameAfter && actualGameTime >= config.debug.stopGameAfter) {
            console.log(`Game has been stopped for debugging after ${config.debug.stopGameAfter / 1000} seconds`);
            console.log('latency:', this.latency);
            console.log(`actualGameTime: ${actualGameTime}`);
            console.log(`gameTime: ${this.gameTime}`);
            return;
        }

        window.requestAnimationFrame(this._mainLoop.bind(this));
    }

    _showGameInfo(deltaTime) {
        let info = [
            'DESIRED FPS: ' + config.fps,
            'ACTUAL FPS: ' + Math.round(1000 / deltaTime),
            'DESIRED FRAME RATE: ' + FRAME_RATE + ' MS',
            'ACTUAL FRAME RATE: ' + deltaTime + ' MS',
            'GAME TIME: ' + this.gameTime,
            'NETWORK LATENCY: ' + this.latency + ' MS',
            'NUMBER OF PLAYERS: ' + this.gameState.players.length,
            '---------------------------------------'
        ];

        info.push(...this.gameState.players.map(player => {
            return `${player.name}:  X = ${Math.round(player.x)}, Y = ${Math.round(player.y)}, VERTICAL SPEED: ${Math.round(player.verticalSpeed)}` + (player.isLocal ? ' (LOCAL)' : '');
        }));

        $debug.html(info.join('<br/>'));
    }

    setSharedState(sharedState) {
        let gameTime = sharedState.gameTime;

        sharedState.players.forEach(playerState => {
            let player = this.gameState.players.find(player => player.id === playerState.id);

        });
    }
};