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
        this.crop = params.crop;
        this.opacity = 1;
    }

    render(context, camera) {
        if (!physicsUtil.intersects(this, camera.location)) {
            return;
        }

        let image = assets.getImage(this.currentFrame);
        context.globalAlpha = this.opacity;

        if (this.crop)
            context.drawImage(image, this.crop.x, this.crop.y, this.crop.width, this.crop.height,
                Math.round(this.x), Math.round(this.y), this.width, this.height);
        else
            context.drawImage(image, Math.round(this.x), Math.round(this.y), this.width, this.height);

        context.globalAlpha = 1;
    }

    update() {
        let currentAnimation = this.currentAnimation;
        let animation = _.get(this, `animations.${currentAnimation}`, {});
        let frames = animation.frames || [];
        if (frames.length) {
            let now = Date.now();
            if (now > this.lastFrameChangeTime + config.animation.changeRate) {
                this.currentFrameIndex++;
                if (this.currentFrameIndex > (frames.length - 1)) {
                    if(animation.repeatable)
                        this.currentFrameIndex = 0;
                    else
                        this.currentAnimation = 'idle';
                }
                this.currentFrame = frames[this.currentFrameIndex];
                if(!this.currentFrame) {
                    this.currentFrameIndex = 0;
                    this.currentFrame = frames[0];
                }
                this.lastFrameChangeTime = now;
            }
        } else {
            this.currentFrame = this.image;
        }
    }

    setAnimation(animationType) {
        this.currentAnimation = animationType;
    }
};