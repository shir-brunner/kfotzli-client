const Drawable = require('../../graphics/drawable');
const _ = require('lodash');
const Timeline = require('../timeline');
const SHARED_ATTRIBUTES = ['id', 'x', 'y', 'verticalSpeed', 'controller'];

module.exports = class Player extends Drawable {
    constructor(params) {
        super(_.pick(params, ['x', 'y', 'width', 'height', 'image', 'animations']));
        this.id = params.id;
        this.name = params.name;
        this.isLocal = params.isLocal || false;
        this.speed = params.speed;
        this.jumpHeight = params.jumpHeight;
        this.verticalSpeed = 0;
        this.sharedState = new Timeline();
        this.controller = {
            isLeftPressed: false,
            isRightPressed: false,
            isUpPressed: false,
            isDownPressed: false
        };
    }

    update(delta, gameTime) {
        this.sharedState.set(gameTime, _.pick(this, SHARED_ATTRIBUTES));
        return super.update(delta, gameTime);
    }

    getSharedState(gameTime) {
        return this.sharedState.at(gameTime) || _.pick(this, SHARED_ATTRIBUTES);
    }

    setSharedState(state) {
        this.sharedState.set(gameTime, state);
    }

    isFalling() {
        return this.verticalSpeed > 0;
    }

    isJumping() {
        return this.verticalSpeed < 0;
    }
};