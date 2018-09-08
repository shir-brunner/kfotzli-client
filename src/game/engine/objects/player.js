const Drawable = require('../../graphics/drawable');
const _ = require('lodash');
const Timeline = require('../timeline');

module.exports = class Player extends Drawable {
    constructor(params) {
        super(_.pick(params, ['x', 'y', 'width', 'height', 'image', 'animations']));
        this.id = params.id;
        this.name = params.name;
        this.isLocal = params.isLocal;
        this.speed = params.speed;
        this.verticalSpeed = 0;
        this.timeline = new Timeline();
        this.controller = {};
    }

    update(delta, ticks) {
        //TODO: update timeline
        //timeline state elements: x, y, verticalSpeed, controller
        //this.timeline.set(state, time);
        return super.update(delta, ticks);
    }
};