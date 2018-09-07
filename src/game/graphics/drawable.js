const assets = require('../../services/assets');
const config = require('../common_config');
const _ = require('lodash');

module.exports = class Drawable {
    constructor(params) {
        this.x = params.x;
        this.y = params.y;
        this.width = params.width;
        this.height = params.height;
        this.image = params.image;
        this.animations = params.animations || {};
        this.currentAnimation = 'idle';
        this.currentFrame = this.image;
        this.currentFrameIndex = 0;
        this.lastFrameChangeTick = 0;
    }

    render(context) {
        let image = assets.getImage(this.currentFrame);
        context.drawImage(image, this.x, this.y, this.width, this.height);
    }

    update(delta, ticks) {
        console.log(ticks);
        let currentAnimation = this.currentAnimation;
        let frames = _.get(this, `animations.${currentAnimation}.frames`, []);
        if(frames.length) {
            if(ticks > this.lastFrameChangeTick + config.animationChangeRate) {
                this.currentFrameIndex++;
                if(this.currentFrameIndex > (frames.length - 1)) {
                    this.currentFrameIndex = 0;
                }
                this.currentFrame = frames[this.currentFrameIndex];
                this.lastFrameChangeTick = ticks;
            }
        } else {
            this.currentFrame = this.image;
        }
    }
};