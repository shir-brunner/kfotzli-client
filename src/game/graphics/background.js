const Drawable = require('./drawable');
const assets = require('../../services/assets');

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

    render(context) {
        context.clearRect(0, 0, this.width, this.height);
    }
};