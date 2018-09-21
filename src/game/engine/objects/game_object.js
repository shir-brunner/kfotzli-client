const Drawable = require('../../graphics/drawable');
const _ = require('lodash');

module.exports = class GameObject extends Drawable {
    constructor(params) {
        super(_.pick(params, ['x', 'y', 'width', 'height', 'image', 'animations']));
        this.id = params._id;
        this.stuckable = params.stuckable;
        this.climbable = params.climbable;
        this.obstacle = params.obstacle;
        this.bumpable = params.bumpable;
        this.bumpHeight = params.bumpHeight;
        this.padding = params.padding || {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
    }

    getCollidablePosition() {
        return {
            x: this.x + this.padding.left,
            y: this.y + this.padding.top,
            width: this.width - this.padding.right - this.padding.left,
            height: this.height - this.padding.bottom - this.padding.top,
        };
    }
};