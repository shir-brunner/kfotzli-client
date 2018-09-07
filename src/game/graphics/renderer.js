const Camera = require('./camera');
const Drawable = require('./drawable');
const config = require('../../config');

module.exports = class Renderer {
    constructor(screenCanvas, level) {
        let offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = level.size.width;
        offScreenCanvas.height = level.size.height;

        let viewSize = { width: 1920, height: 1280 };
        screenCanvas.width = viewSize.width;
        screenCanvas.height = viewSize.height;

        this._offScreenContext = offScreenCanvas.getContext('2d');
        this._screenContext = screenCanvas.getContext('2d');
        this._level = level;
        this._camera = new Camera(viewSize, this._level.size, config.debug.fullLevelView);
        this._background = new Drawable({
            x: 0,
            y: 0,
            width: level.size.width,
            height: level.size.height,
            image: level.background
        });

        if(this._camera.fullLevelView) {
            this._screenContext.canvas.width = level.size.width;
            this._screenContext.canvas.height = level.size.height;
        }
    }

    render(gameState) {
        this._background.render(this._offScreenContext);
        gameState.render(this._offScreenContext);

        this._camera.follow(gameState.players.find(player => player.isLocal));
        this._camera.update();

        let cameraLocation = this._camera.location;
        let offScreenImage = this._offScreenContext.getImageData(cameraLocation.x, cameraLocation.y, cameraLocation.width, cameraLocation.height);
        this._screenContext.putImageData(offScreenImage, 0, 0);
    }
};