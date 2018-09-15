const Camera = require('./camera');
const Background = require('./background');
const config = require('../../config');
const debug = require('../utils/debug');

module.exports = class Renderer {
    constructor(screenCanvas, level) {
        let offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = level.size.width;
        offScreenCanvas.height = level.size.height;

        let viewSize = { width: 1920, height: 1280 };
        screenCanvas.width = viewSize.width;
        screenCanvas.height = viewSize.height;

        this.offScreenContext = offScreenCanvas.getContext('2d');
        this.screenContext = screenCanvas.getContext('2d');
        this.level = level;
        this.camera = new Camera(viewSize, this.level.size, config.debug.fullLevelView);
        this.background = new Background(level);

        if (this.camera.fullLevelView) {
            this.screenContext.canvas.width = level.size.width;
            this.screenContext.canvas.height = level.size.height;
        }
    }

    render(gameState) {
        this.background.render(this.offScreenContext, this.camera);
        gameState.render(this.offScreenContext, this.camera);

        this.camera.follow(gameState.players.find(player => player.isLocal));
        this.camera.update();

        debug.renderDebugPoints(this.offScreenContext);
        let cameraLocation = this.camera.location;
        let offScreenImage = this.offScreenContext.getImageData(cameraLocation.x, cameraLocation.y, cameraLocation.width, cameraLocation.height);
        this.screenContext.putImageData(offScreenImage, 0, 0);
        debug.renderDebugTexts(this.screenContext);
        debug.renderDebugInfo(this.screenContext);
    }
};