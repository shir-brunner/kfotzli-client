const physicsUtil = require('../utils/physics');
const config = require('../../config');

module.exports = class Camera {
    constructor(viewSize, levelSize, fullLevelView = false) {
        this.viewSize = viewSize;
        this.levelSize = levelSize;
        this.location = { x: 0, y: 0, width: this.viewSize.width, height: this.viewSize.height };
        this.fullLevelView = fullLevelView;
        this.animating = false;
    }

    follow(followed) {
        this.followed = followed;
        let targetPoint = this._getTargetPoint();
        this.location.x = targetPoint.x;
        this.location.y = targetPoint.y;
    }

    update() {
        if (this.fullLevelView) {
            this.location = { x: 0, y: 0, width: this.levelSize.width, height: this.levelSize.height };
            return;
        }

        let targetPoint = this._getTargetPoint();

        if(Math.abs(targetPoint.x - this.location.x) > 100 ||
            Math.abs(targetPoint.y - this.location.y) > 100) {
            this.animating = true;
        }

        if(this.animating) {
            this._animate(targetPoint);
        } else {
            this.location.x = targetPoint.x;
            this.location.y = targetPoint.y;
        }
    }

    _animate(targetPoint) {
        let speed = config.camera.speed;
        let smoothingSpeed = 1;

        if (targetPoint.x > this.location.x) {
            if ((this.location.x + speed) < targetPoint.x)
                this.location.x += speed;
            else
                this.location.x += smoothingSpeed;
        }
        else if (targetPoint.x < this.location.x) {
            if ((this.location.x - speed) > targetPoint.x)
                this.location.x -= speed;
            else
                this.location.x -= smoothingSpeed;
        }

        if (targetPoint.y > this.location.y) {
            if ((this.location.y + speed) < targetPoint.y)
                this.location.y += speed;
            else
                this.location.y += smoothingSpeed;
        }
        else if (targetPoint.y < this.location.y) {
            if ((this.location.y - speed) > targetPoint.y)
                this.location.y -= speed;
            else
                this.location.y -= smoothingSpeed;
        }

        if(this.location.x === targetPoint.x &&
            this.location.y === targetPoint.y) {
            this.animating = false;
        }
    }

    _getTargetPoint() {
        let x = this.followed.x - this.viewSize.width / 2 + (this.followed.width / 2);
        let y = this.followed.y - this.viewSize.height / 2 + (this.followed.height / 2);

        if (x < 0)
            x = 0;

        if (x > this.levelSize.width - this.viewSize.width)
            x = this.levelSize.width - this.viewSize.width;

        if (y < 0)
            y = 0;

        if (y > this.levelSize.height - this.viewSize.height)
            y = this.levelSize.height - this.viewSize.height;

        return { x: Math.round(x), y: Math.round(y) };
    }
};