const Drawable = require('../../graphics/drawable');
const _ = require('lodash');

module.exports = class GameObject extends Drawable {
    constructor(params) {
        super(_.pick(params, ['x', 'y', 'width', 'height', 'image', 'animations']));
        this.id = params._id;
        this.stuckable = params.stuckable;
        this.climbable = params.climbable;
        this.causesDeath = params.causesDeath;
        this.bumpable = params.bumpable;
    }
};