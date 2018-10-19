const _ = require('lodash');

module.exports = class Snow {
    constructor(level) {
        this.level = level;
        this.flakes = [];
        this.lastFlakeTime = 0;
        this.interval = 0;
    }

    render(context) {
        this.flakes.forEach(flake => {
            context.beginPath();
            context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2, false);
            context.fillStyle = 'white';
            context.fill();
            context.strokeStyle = 'white';
            context.stroke();
        });
    }

    update() {
        let now = Date.now();
        if (now > this.lastFlakeTime + this.interval) {
            this._createFlake();
            this.interval = _.random(0, 100);
            this.lastFlakeTime = now;
        }

        this.flakes.forEach(flake => {
            flake.y += flake.speed;
            if (flake.y + flake.radius > this.level.size.height)
                flake.toBeRemoved = true;
        });

        this.flakes = this.flakes.filter(flake => !flake.toBeRemoved);
    }

    _createFlake() {
        this.flakes.push({
            x: _.random(0, this.level.size.width),
            y: 0,
            radius: _.random(4, 13),
            speed: _.random(4, 8)
        });
    }
};