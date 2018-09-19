const Renderer = require('./graphics/renderer');
const _ = require('lodash');
const World = require('./engine/world/index');
const config = require('../config');
const commonConfig = require('./common_config');
const InputHandler = require('./input/input_handler');
const FRAME_RATE = Math.round(1000 / commonConfig.fps);
const physicsUtil = require('./utils/physics');
const debug = require('./utils/debug');
const EventsProcessor = require('./engine/events/events_processor');
const Camera = require('./graphics/camera');

module.exports = class Game {
    constructor(room, connection, gameCanvas, latency) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.camera = new Camera(config.camera.viewSize, room.level.size, config.debug.fullLevelView);
        this.world = World.create(room.level, room.clients, this.camera);
        this.worldPlayground = _.cloneDeep(this.world);
        this.connection = connection;
        this.latency = latency;
        this.localPlayer = this.world.localPlayer;
        this.inputHandler = new InputHandler(this.localPlayer, connection, this);
        this.eventsProcessor = new EventsProcessor(this.world);
        this.pendingEvents = [];
        this.lastFrame = 0;
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        this.connection.on('message.EVENTS', events => this.pendingEvents.push(...events));
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _mainLoop(timestamp) {
        this.lastTimestamp = this.lastTimestamp || timestamp;

        let currentFrame = Math.round((timestamp - this.lastTimestamp) / FRAME_RATE);
        let deltaTime = (currentFrame - this.lastFrame) * FRAME_RATE;

        if (deltaTime) {
            let deltaFrames = deltaTime / FRAME_RATE;
            for (let frame = 1; frame <= deltaFrames; frame++)
                this.world.update(1);

            this.sharedState && this._onServerUpdate(this.sharedState, currentFrame);
            this.eventsProcessor.process(this.pendingEvents);
            this.pendingEvents = [];
            this.renderer.render(this.world);

            if(this.stopEngine)
                throw new Error('hello world');

            debug.setDebugInfo(deltaTime, this);
        }

        this.lastFrame = currentFrame;
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _onServerUpdate(sharedState, currentFrame) {
        let framesForward = Math.ceil((this.latency * 2) / FRAME_RATE);

        this.worldPlayground.setPlayersPositions(sharedState.players);
        this.worldPlayground.physics.fastForwardLocalPlayer(framesForward, this.inputHandler, currentFrame);

        if (this._misprediction()) {
            this.world.setPlayersPositions(sharedState.players);
            this.world.physics.fastForwardLocalPlayer(framesForward, this.inputHandler, currentFrame);
        }

        this.inputHandler.inputBuffer.removeOldInputs(this.localPlayer.lastProcessedFrame);
        this.sharedState = null;
    }

    _misprediction() {
        let misprediction = false;

        this.worldPlayground.players.forEach(simulatedPlayer => {
            if (!simulatedPlayer.positionChanged)
                return;

            let isRemotePlayer = !simulatedPlayer.isLocal;
            if (isRemotePlayer) {
                misprediction = true;
                return;
            }

            let predictedPlayer = this.world.players.find(player => player.id === simulatedPlayer.id);

            if (config.debug.showNetworkCorrections) {
                debug.point(simulatedPlayer.x, simulatedPlayer.y, 'blue');
                debug.point(predictedPlayer.x, predictedPlayer.y, 'red');
            }

            let distance = physicsUtil.getDistance(simulatedPlayer, predictedPlayer);
            if (distance > 0)
                misprediction = true;
        });

        return misprediction;
    }
};