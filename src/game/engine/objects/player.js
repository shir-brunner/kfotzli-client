const Drawable = require('../../graphics/drawable');
const SHARED_ATTRIBUTES = ['id', 'x', 'y', 'verticalSpeed', 'controller', 'positionChanged', 'lastProcessedFrame'];
const Timeline = require('../../utils/timeline');
const controllerUtil = require('../../utils/controller');
const commonConfig = require('../../common_config');
const _ = require('lodash');

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
        this.respawning = true;
        this.team = params.team;
        this.collectable = null;
        this.positionChanged = false;
        this.lastProcessedFrame = 0;
        this.spawnPoint = { x: this.x, y: this.y };
    }

    update(delta, currentFrame) {
        if (this.isLocal)
            this.controllerHistory.set(currentFrame, this.controller);

        if (this.respawning && this.opacity < 1)
            this.opacity += 0.02;
        else
            this.respawning = false;

        if(this.collectable) {
            this.collectable.x = this.x + this.width / 2;
            this.collectable.y = this.y - this.height / 2;
        }

        super.update(delta, currentFrame);
    }

    render(context, camera) {
        if (this.isDead)
            return;

        super.render(context, camera);

        context.globalAlpha = this.opacity;
        context.font = '20px makabi';
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText(this.name, this.x + (this.width / 2), this.y - 20);
        context.globalAlpha = 1;

        this.collectable && this.collectable.render(context, camera);
    }

    getSharedState() {
        return _.cloneDeep(_.pick(this, SHARED_ATTRIBUTES));
    }

    setAnimation(animationType) {
        if (animationType === 'walk')
            animationType = this.direction === 'left' ? 'walkLeft' : 'walkRight';

        if (animationType === 'jump')
            animationType = this.direction === 'left' ? 'jumpLeft' : 'jumpRight';

        super.setAnimation(animationType);
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
        if (direction === 'left')
            this.x -= speed;
        else
            this.x += speed;

        this.direction = direction;

        if (this.verticalSpeed !== 0)
            this.setAnimation('jump');
        else
            this.setAnimation('walk');
    }

    climb(direction, speed) {
        if (direction === 'up')
            this.y -= speed;
        else
            this.y += speed;

        this.setAnimation('climb');
    }

    die() {
        this.verticalSpeed = 0;
        this.controller = controllerUtil.emptyController();
        this.isDead = true;
    }

    respawn(spawnPoint) {
        spawnPoint = spawnPoint || this.spawnPoint;
        this.x = spawnPoint.x;
        this.y = spawnPoint.y - this.height + commonConfig.squareSize;
        this.opacity = 0;
        this.isDead = false;
        this.respawning = true;
    }

    collect(collectable) {
        collectable.collected = true;
        this.collectable = collectable;
    }
};