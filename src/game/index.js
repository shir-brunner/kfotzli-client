const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const commonConfig = require('./common_config');
const Physics = require('./engine/physics');
const Input = require('./input');
const FRAME_RATE = Math.round(1000 / commonConfig.fps);
const physicsUtil = require('./utils/physics');
const debug = require('./utils/debug');

module.exports = class Game {
    constructor(room, connection, gameCanvas, latency) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.gameState = GameState.create(room.level, room.clients);
        this.physics = new Physics(this.gameState);
        this.physicsSimulator = new Physics(_.cloneDeep(this.gameState));
        this.connection = connection;
        this.latency = latency;

        let localPlayer = this.gameState.players.find(player => player.isLocal);
        this.input = new Input(localPlayer, connection, this);

        this.stopEngine = false;
        this.lastFrame = 0;
        this.timestamp = 0;
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
        console.log = text => debug.log(text);
    }

    _mainLoop(timestamp) {
        this.lastTimestamp = this.lastTimestamp || timestamp;

        let currentFrame = Math.round((timestamp - this.lastTimestamp) / FRAME_RATE);
        let deltaTime = (currentFrame - this.lastFrame) * FRAME_RATE;

        if (deltaTime) {
            let deltaFrames = deltaTime / FRAME_RATE;

            while (deltaFrames > 0) {
                if (deltaFrames >= 1) {
                    this.physics.update(1);
                } else {
                    this.physics.update(deltaFrames);
                }

                deltaFrames--;
            }

            this.sharedState && this._onServerUpdate(timestamp, this.sharedState);
            this.renderer.render(this.gameState);
            if (this.stopEngine)
                throw new Error('Engine has been stopped');

            debug.setDebugInfo(deltaTime, this);
        }

        this.lastFrame = currentFrame;
        this.timestamp = timestamp;
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _onServerUpdate(now, sharedState) {
        let deltaTime = this.latency * 2;

        this.physicsSimulator.applySharedState(sharedState);
        this.physicsSimulator.fastForward(now - sharedState.time, deltaTime, this.input);

        let shouldCorrectPositions = false;
        this.physicsSimulator.gameState.players.forEach(simulatedPlayer => {
            if(!simulatedPlayer.positionChanged)
                return;

            if(!simulatedPlayer.isLocal) {
                shouldCorrectPositions = true;
                return;
            }

            let predictedPlayer = this.gameState.players.find(player => player.id === simulatedPlayer.id);

            debug.point(simulatedPlayer.x, simulatedPlayer.y, 'blue', 'corrected position ' + simulatedPlayer.verticalSpeed);
            debug.point(predictedPlayer.x, predictedPlayer.y, 'red', 'previous position ' + predictedPlayer.verticalSpeed);

            let distance = physicsUtil.getDistance(simulatedPlayer, predictedPlayer);
            if (distance > config.mispredictionDistance && !config.debug.preventNetworkCorrections)
                shouldCorrectPositions = true;
        });

        if (shouldCorrectPositions) {
            this.physics.applySharedState(sharedState);
            this.physics.fastForward(now - sharedState.time, deltaTime, this.input);
        }

        if (this.been) {
            //this.stopEngine = true;
        }
        this.been = true;
        //this.stopEngine = true;

        this.sharedState = null;
    }
};