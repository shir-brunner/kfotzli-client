const Drawable = require('../../graphics/drawable');
const _ = require('lodash');
const SHARED_ATTRIBUTES = ['id', 'x', 'y', 'verticalSpeed', 'controller', 'positionChanged', 'lastProcessedFrame'];
const Timeline = require('../../utils/timeline');
const controllerUtil = require('../../utils/controller');

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
        this.isDead = false;
        this.controller = controllerUtil.emptyController();
        this.controllerHistory = new Timeline(50);
    }

    update(delta, currentFrame) {
        if(this.isLocal)
            this.controllerHistory.set(currentFrame, this.controller);

        super.update(delta, currentFrame);
    }

    render(context, camera) {
        if(this.isDead)
            return;

        super.render(context, camera);
        context.font = '20px makabi';
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText(this.name, this.x + (this.width / 2), this.y - 20);
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

    die() {
        this.verticalSpeed = 0;
        this.controller.isRightPressed = false;
        this.controller.isLeftPressed = false;
        this.controller.isUpPressed = false;
        this.controller.isDownPressed = false;
        this.isDead = true;
    }

    respawn(spawnPoint) {
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;
        this.isDead = false;
        this.opacity = 0;
    }
};