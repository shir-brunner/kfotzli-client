const Drawable = require('../../graphics/drawable');
const _ = require('lodash');
const SHARED_ATTRIBUTES = ['id', 'x', 'y', 'verticalSpeed', 'controller', 'positionChanged', 'lastProcessedFrame'];

module.exports = class Player extends Drawable {
    constructor(params) {
        super(_.pick(params, ['x', 'y', 'width', 'height', 'image', 'animations']));
        this.id = params.id;
        this.name = params.name;
        this.isLocal = params.isLocal || false;
        this.speed = params.speed;
        this.jumpHeight = params.jumpHeight;
        this.climbSpeed = params.climbSpeed;
        this.verticalSpeed = 0;
        this.direction = 'front';
        this.controller = {
            isLeftPressed: false,
            isRightPressed: false,
            isUpPressed: false,
            isDownPressed: false
        };
    }

    getSharedState() {
        return _.cloneDeep(_.pick(this, SHARED_ATTRIBUTES));
    }

    setAnimation(animationType) {
        if(animationType === 'walk')
            animationType = this.direction === 'left' ? 'walkLeft' : 'walkRight';

        if(animationType === 'jump')
            animationType = this.direction === 'left' ? 'jumpLeft' : 'jumpRight';

        this.currentAnimation = animationType;
    }

    isFalling() {
        return this.verticalSpeed > 0;
    }

    isJumping() {
        return this.verticalSpeed < 0;
    }

    bump(height) {
        this.verticalSpeed = -height;
    }

    move(direction, speed) {
        if(direction === 'left')
            this.x -= speed;
        else
            this.x += speed;

        this.direction = direction;

        if(this.verticalSpeed !== 0)
            this.setAnimation('jump');
        else
            this.setAnimation('walk');
    }

    climb(direction, speed) {
        if(direction === 'up')
            this.y -= speed;
        else
            this.y += speed;

        this.setAnimation('climb');
    }
};