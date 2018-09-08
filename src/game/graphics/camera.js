module.exports = class Camera {
    constructor(viewSize, levelSize, fullLevelView = false) {
        this.viewSize = viewSize;
        this.levelSize = levelSize;
        this.location = { x: 0, y: 0, width: this.viewSize.width, height: this.viewSize.height };
        this.fullLevelView = fullLevelView;
    }

    follow(followed) {
        this.followed = followed;
    }

    update() {
        if(this.fullLevelView) {
            this.location = { x: 0, y: 0, width: this.levelSize.width, height: this.levelSize.height };
            return;
        }

        this.location.x = this.followed.x - this.viewSize.width / 2 + (this.followed.width / 2);
        this.location.y = this.followed.y - this.viewSize.height / 2 + (this.followed.height / 2);

        if(this.location.x < 0)
            this.location.x = 0;

        if(this.location.x > this.levelSize.width - this.viewSize.width)
            this.location.x = this.levelSize.width - this.viewSize.width;

        if(this.location.y < 0)
            this.location.y = 0;

        if(this.location.y > this.levelSize.height - this.viewSize.height)
            this.location.y = this.levelSize.height - this.viewSize.height;
    }
};