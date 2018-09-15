const assets = require('../../services/assets');
const config = require('../common_config');
const _ = require('lodash');
const physicsUtil = require('../utils/physics');

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
        this.lastFrameChangeTime = 0;
    }

    render(context, camera) {
        if(!physicsUtil.intersects(this, camera.location)) {
            return;
        }

        let image = assets.getImage(this.currentFrame);
        context.drawImage(image, Math.round(this.x), Math.round(this.y), this.width, this.height);
    }

    update() {
        let currentAnimation = this.currentAnimation;
        let frames = _.get(this, `animations.${currentAnimation}.frames`, []);
        if(frames.length) {
            let now = Date.now();
            if(now > this.lastFrameChangeTime + config.animationChangeRate) {
                this.currentFrameIndex++;
                if(this.currentFrameIndex > (frames.length - 1)) {
                    this.currentFrameIndex = 0;
                }
                this.currentFrame = frames[this.currentFrameIndex];
                this.lastFrameChangeTime = now;
            }
        } else {
            this.currentFrame = this.image;
        }
    }
};