const Drawable = require('../../graphics/drawable');
const config = require('../../common_config');
const _ = require('lodash');

module.exports = class BodyPart extends Drawable {
    constructor(player) {
        let width = _.random(20, 50);
        let height = _.random(20, 50);
        let x = _.random(0, player.width - width);
        let y = _.random(0, player.height - height);

        super({
            x: player.x + x,
            y: player.y + y,
            width: width,
            height: height,
            image: player.image,
            crop: {
                x: x,
                y: y,
                width: width,
                height: height
            },
        });

        this.horizontalSpeed = _.random(-30, 30);
        this.verticalSpeed = _.random(-30, 30);
        this.expiration = Date.now() + config.bodyParts.expiration;
    }
};