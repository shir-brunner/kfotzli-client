const config = require('../../config');
const debug = require('../utils/debug');

module.exports = class Renderer {
    constructor(screenCanvas, level) {
        let offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = level.size.width;
        offScreenCanvas.height = level.size.height;

        let viewSize = config.camera.viewSize;
        screenCanvas.width = viewSize.width;
        screenCanvas.height = viewSize.height;

        this.offScreenContext = offScreenCanvas.getContext('2d');
        this.screenContext = screenCanvas.getContext('2d');
        this.level = level;
    }

    render(world) {
        if (world.camera.fullLevelView) {
            this.screenContext.canvas.width = world.level.size.width;
            this.screenContext.canvas.height = world.level.size.height;
        }

        let cameraLocation = world.camera.location;
        this.offScreenContext.clearRect(cameraLocation.x, cameraLocation.y, cameraLocation.width, cameraLocation.height);
        world.render(this.offScreenContext);

        debug.renderDebugPoints(this.offScreenContext);
        let offScreenImage = this.offScreenContext.getImageData(cameraLocation.x, cameraLocation.y, cameraLocation.width, cameraLocation.height);
        this.screenContext.putImageData(offScreenImage, 0, 0);
        debug.renderDebugTexts(this.screenContext);
        debug.renderDebugInfo(this.screenContext);
    }
};