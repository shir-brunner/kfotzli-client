const Drawable = require('../../graphics/drawable');
const config = require('../../common_config');
const _ = require('lodash');

module.exports = class BodyPart extends Drawable {
    constructor(player) {
        let width = _.random(25, 45);
        let height = width / (player.width / player.height);
        let x = _.random(0, player.width - width);
        let y = _.random(0, player.height - height);

        super({
            x: player.x + x,
            y: player.y + y,
            width: width,
            height: height,
            image: player.image
        });

        this.horizontalSpeed = _.random(-15, 15);
        this.verticalSpeed = _.random(-75, 75);
        this.expiration = Date.now() + config.bodyParts.expiration;
        this.ignorePhysics = false;
    }
};