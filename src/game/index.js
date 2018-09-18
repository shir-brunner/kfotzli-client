const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const GameState = require('./engine/game_state');
const config = require('../config');
const commonConfig = require('./common_config');
const Physics = require('./engine/physics');
const InputHandler = require('./input/input_handler');
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
        this.inputHandler = new InputHandler(localPlayer, connection, this);

        this.stopEngine = false;
        this.lastFrame = 0;
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _mainLoop(timestamp) {
        this.lastTimestamp = this.lastTimestamp || timestamp;

        let currentFrame = Math.round((timestamp - this.lastTimestamp) / FRAME_RATE);
        let deltaTime = (currentFrame - this.lastFrame) * FRAME_RATE;

        if (deltaTime) {
            let deltaFrames = deltaTime / FRAME_RATE;
            for (let frame = 1; frame <= deltaFrames; frame++)
                this.physics.update(1);

            this.sharedState && this._onServerUpdate(this.sharedState, currentFrame);
            this.renderer.render(this.gameState);
            if (this.stopEngine)
                throw new Error('Engine has been stopped');

            debug.setDebugInfo(deltaTime, this);
        }

        this.lastFrame = currentFrame;
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _onServerUpdate(sharedState, currentFrame) {
        let framesForward = Math.round((this.latency * 2) / FRAME_RATE);

        this.physicsSimulator.applySharedState(sharedState);
        this.physicsSimulator.fastForwardLocalPlayer(framesForward, this.inputHandler, currentFrame);

        if (this.shouldCorrectPositions()) {
            this.physics.applySharedState(sharedState);
            this.physics.fastForwardLocalPlayer(framesForward, this.inputHandler, currentFrame);
        }

        this.inputHandler.inputBuffer.removeOldInputs(this.physicsSimulator.localPlayer.lastProcessedFrame);
        this.sharedState = null;
    }

    shouldCorrectPositions() {
        let shouldCorrectPositions = false;
        this.physicsSimulator.gameState.players.forEach(simulatedPlayer => {
            if (!simulatedPlayer.positionChanged)
                return;

            let isRemotePlayer = !simulatedPlayer.isLocal;
            if (isRemotePlayer) {
                shouldCorrectPositions = true;
                return;
            }

            let predictedPlayer = this.gameState.players.find(player => player.id === simulatedPlayer.id);

            if(config.debug.showNetworkCorrections) {
                debug.point(simulatedPlayer.x, simulatedPlayer.y, 'blue', 'corrected position ' + simulatedPlayer.verticalSpeed);
                debug.point(predictedPlayer.x, predictedPlayer.y, 'red', 'previous position ' + predictedPlayer.verticalSpeed);
            }

            let distance = physicsUtil.getDistance(simulatedPlayer, predictedPlayer);
            if (distance > config.mispredictionDistance && !config.debug.preventNetworkCorrections)
                shouldCorrectPositions = true;
        });

        return shouldCorrectPositions;
    }
};