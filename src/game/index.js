const Renderer = require('./graphics/renderer');
const World = require('./engine/world/index');
const config = require('../config');
const commonConfig = require('./common_config');
const InputHandler = require('./input/input_handler');
const FRAME_RATE = Math.round(1000 / commonConfig.fps);
const debug = require('./utils/debug');
const EventsProcessor = require('./engine/events/events_processor');
const Camera = require('./graphics/camera');
const SmoothCorrection = require('./graphics/smooth_correction');
const GameplayFactory = require('./gameplay/gameplay_factory');
const _ = require('lodash');

module.exports = class Game {
    constructor(room, connection, gameCanvas, onGameOver) {
        this.renderer = new Renderer(gameCanvas, room.level);
        this.camera = new Camera(config.camera.viewSize, room.level.size, config.debug.fullLevelView);
        this.world = World.create(room.level, room.clients, this.camera);
        this.worldPlayground = _.cloneDeep(this.world);
        this.connection = connection;
        this.localPlayer = this.world.localPlayer;
        this.inputHandler = new InputHandler(this.localPlayer, connection, this);
        this.eventsProcessor = new EventsProcessor(this.world);
        this.gameplay = (new GameplayFactory()).getGameplay(this.world);
        this.stats = this.gameplay.getStats();
        this.pendingEvents = [];
        this.lastFrame = 0;
        this.smoothCorrection = new SmoothCorrection(this.world);
        this.onGameOver = onGameOver;
        this.stopped = false;
    }

    start() {
        this.connection.on('message.SHARED_STATE', sharedState => this.sharedState = sharedState);
        this.connection.on('message.EVENTS', events => {
            events.forEach(event => event.type === 'GAME_OVER' && this.onGameOver(event.data));
            this.pendingEvents.push(...events);
        });
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _mainLoop(timestamp) {
        if(this.stopped)
            return;

        this.startTime = this.startTime || timestamp;

        let currentFrame = Math.ceil((timestamp - this.startTime) / FRAME_RATE);
        let deltaTime = (currentFrame - this.lastFrame) * FRAME_RATE;

        if (deltaTime) {
            let deltaFrames = deltaTime / FRAME_RATE;
            for (let frame = deltaFrames; frame >= 1; frame--) {
                this.inputHandler.update(currentFrame - frame);
                this.world.update(1, currentFrame - frame);
                this.sharedState && this._onServerUpdate(this.sharedState, currentFrame - frame);
            }

            this.smoothCorrection.apply();
            this.eventsProcessor.process(this.pendingEvents);
            this.gameplay.update(this.pendingEvents);
            this.pendingEvents.length && this.stats.refresh(this.pendingEvents);
            this.pendingEvents = [];
            this.renderer.render(this.world);

            if (debug.stopEngine)
                throw new Error('Engine has been stopped');

            debug.setDebugInfo(deltaTime, this);
        }

        this.lastFrame = currentFrame;
        window.requestAnimationFrame(timestamp => this._mainLoop(timestamp));
    }

    _onServerUpdate(sharedState, currentFrame) {
        sharedState.players.forEach(playerState => {
            let playgroundPlayer = this.worldPlayground.players.find(player => player.id === playerState.id);
            _.assign(playgroundPlayer, playerState);
        });

        if(this.worldPlayground.localPlayer.positionChanged) {
            // +1 because "lastProcessedFrame" is already processed
            let fromFrame = this.worldPlayground.localPlayer.lastProcessedFrame + 1;
            let toFrame = currentFrame;

            this.worldPlayground.physics.fastForwardLocalPlayer(fromFrame, toFrame, this.localPlayer.controllerHistory);

            if (config.debug.showNetworkCorrections) {
                debug.point(this.worldPlayground.localPlayer.x, this.worldPlayground.localPlayer.y, 'blue');
                debug.point(this.localPlayer.x, this.localPlayer.y, 'red');
            }

            if (config.debug.disableSmoothCorrection) {
                _.assign(this.localPlayer, _.pick(this.worldPlayground.localPlayer, ['x', 'y', 'verticalSpeed']));
            } else {
                this.localPlayer.targetPosition = _.pick(this.worldPlayground.localPlayer, ['x', 'y', 'verticalSpeed']);
            }
        }

        this.worldPlayground.players.forEach(playgroundPlayer => {
            if(playgroundPlayer.isLocal)
                return; // already moved him above

            if(playgroundPlayer.positionChanged) {
                let realPlayer = this.world.players.find(player => player.id === playgroundPlayer.id);
                _.assign(realPlayer, _.pick(playgroundPlayer, ['x', 'y', 'verticalSpeed', 'controller']));
            }
        });

        this.sharedState = null;
    }
};