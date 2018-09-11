const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const Physics = require('./engine/physics');
const Input = require('./input');
const FRAME_RATE = Math.round(1000 / config.fps);
const $debug = require('../utils/debug')();

module.exports = class Game {
    constructor(room, connection, gameCanvas, latency) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.startTime = Date.now() - latency;
        this.lastTimestamp = this.startTime;
        this.gameState = GameState.create(room.level, room.clients);
        this.physics = new Physics(this.gameState);
        this.connection = connection;
        this.latency = latency;
        this.gameTime = latency;

        let localPlayer = this.gameState.players.find(player => player.isLocal);
        this.input = new Input(localPlayer, connection, this);

        this.sharedState = null;
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        window.requestAnimationFrame(() => this._mainLoop());
    }

    _mainLoop() {
        let now = Date.now();
        let deltaTime = now - this.lastTimestamp;
        if (deltaTime > FRAME_RATE) {
            let deltaFrames = deltaTime / FRAME_RATE;
            while (deltaFrames > 0) {
                if (deltaFrames >= 1) {
                    this.gameTime += FRAME_RATE;
                    this.physics.update(1, this.gameTime);
                } else {
                    this.gameTime += deltaFrames * FRAME_RATE;
                    this.physics.update(deltaFrames, this.gameTime);
                }
                deltaFrames--;
            }

            if(this.sharedState)
                this.setSharedState(this.sharedState);

            this.renderer.render(this.gameState);
            this.lastTimestamp = now;

            config.debug.showGameInfo && this._showGameInfo(deltaTime);
        }

        window.requestAnimationFrame(() => this._mainLoop());
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
        let deltaTime = (Date.now() - this.startTime) - gameTime;
        let deltaFrames = deltaTime / FRAME_RATE;

        sharedState.players.forEach(playerState => {
            let player = this.gameState.players.find(player => player.id === playerState.id);
            _.assign(player, playerState);
        });

        while (deltaFrames > 0) {
            if (deltaFrames >= 1) {
                this.physics.update(1, gameTime);
                gameTime += FRAME_RATE;
            } else {
                this.physics.update(deltaFrames, gameTime);
                gameTime += deltaFrames * FRAME_RATE;
            }
            this.input.applyControllerAt(gameTime);
            deltaFrames--;
        }

        this.sharedState = null;
    }
};