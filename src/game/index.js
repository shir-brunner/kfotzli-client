const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const $debug = require('../utils/debug')();
const Physics = require('./engine/physics/index');
const FRAME_RATE = Math.round(1000 / config.fps);
const moment = require('moment');

module.exports = class Game {
    constructor(room, connection, gameCanvas) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.lastTimestamp = Date.now();
        this.gameState = GameState.create(room.level, room.clients);
        this.physics = new Physics(this.gameState);
        this.connection = connection;
        this.absoluteStartTime = Date.now();
    }

    start(latency) {
        this.connection.on('message.SHARED_STATE', sharedState => {

        });

        this.gameTime = 0;
        this.latency = latency;
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
            console.log(this.gameTime);
        }

        if (config.debug.stopGameAfter && actualGameTime >= config.debug.stopGameAfter) {
            console.log(`Game has been stopped for debugging after ${config.debug.stopGameAfter / 1000} seconds`);
            console.log('latency:', this.latency);
            console.log(`actualGameTime: ${actualGameTime}`);
            console.log(`gameTime: ${this.gameTime}`);
            return;
        }

        window.requestAnimationFrame(this._mainLoop.bind(this));
        config.debug.showGameInfo && this._showGameInfo(deltaTime);
    }

    _showGameInfo(deltaTime) {
        let info = [
            'DESIRED FPS: ' + config.fps,
            'ACTUAL FPS: ' + Math.round(1000 / deltaTime),
            'DESIRED FRAME RATE: ' + FRAME_RATE + ' MS',
            'ACTUAL FRAME RATE: ' + deltaTime + ' MS',
            'GAME TIME: ' + this.gameTime,
            'SERVER GAME TIME: ' + (this.gameTime - this.latency),
            'LATENCY: ' + this.latency,
            'NUMBER OF PLAYERS: ' + this.gameState.players.length,
            '---------------------------------------'
        ];

        info.push(...this.gameState.players.map(player => `${player.name}:  X = ${player.x}, Y = ${player.y}`));
        $debug.html(info.join('<br/>'));
    }
};