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
const SmoothCorrection = require('./graphics/smooth_correction');
const controllerUtil = require('./utils/controller');

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
        this.smoothCorrection = new SmoothCorrection(this.world);
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        this.connection.on('message.EVENTS', events => this.pendingEvents.push(...events));
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _mainLoop(timestamp) {
        this.startTime = this.startTime || timestamp;

        let currentFrame = Math.ceil((timestamp - this.startTime) / FRAME_RATE);
        let deltaTime = (currentFrame - this.lastFrame) * FRAME_RATE;

        if (deltaTime) {
            let deltaFrames = deltaTime / FRAME_RATE;
            for (let frame = 1; frame <= deltaFrames; frame++)
                this.world.update(1, currentFrame);

            this.inputHandler.update(currentFrame);
            this.sharedState && this._onServerUpdate(this.sharedState);
            this.smoothCorrection.apply();
            this.eventsProcessor.process(this.pendingEvents);
            this.pendingEvents = [];
            this.renderer.render(this.world);

            if (debug.stopEngine)
                throw new Error('hello world');

            debug.setDebugInfo(deltaTime, this);
        }

        this.lastFrame = currentFrame;
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _onServerUpdate(sharedState) {
        this.worldPlayground.setPlayersPositions(sharedState.players);
        let framesForward = Math.floor((this.latency * 2) / FRAME_RATE);
        let lastProcessedFrame = this.worldPlayground.localPlayer.lastProcessedFrame;

        this.worldPlayground.physics.fastForwardLocalPlayer(lastProcessedFrame, lastProcessedFrame + framesForward, this.localPlayer.controllerHistory);

        if (config.debug.showNetworkCorrections) {
            debug.point(this.worldPlayground.localPlayer.x, this.worldPlayground.localPlayer.y, 'blue');
            debug.point(this.localPlayer.x, this.localPlayer.y, 'red');
        }

        if (config.debug.disableSmoothCorrection) {
            _.assign(this.localPlayer, _.pick(this.worldPlayground.localPlayer, ['x', 'y', 'verticalSpeed']));
        } else {
            this.localPlayer.targetPosition = _.pick(this.worldPlayground.localPlayer, ['x', 'y', 'verticalSpeed']);
        }

        let changedPlayers = this.worldPlayground.players.filter(player => player.positionChanged && !player.isLocal);
        this.world.setPlayersPositions(changedPlayers);

        this.sharedState = null;

        let sentForDebug = this.inputHandler.sentForDebug.find(x => x.frame === lastProcessedFrame);
        let roundtrip = Date.now() - sentForDebug.timestamp;
        console.log('input took ' + roundtrip + ' roundtrip');
        console.log('which is ' + (roundtrip / FRAME_RATE) + ' frames');
        console.log('framesForward is ' + framesForward);
    }
};