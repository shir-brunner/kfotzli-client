const Drawable = require('./drawable');

module.exports = class Background extends Drawable {
    constructor(level) {
        super({
            x: 0,
            y: 0,
            width: level.size.width,
            height: level.size.height,
            image: level.background
        });
    }
};