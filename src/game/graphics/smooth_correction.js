const config = require('../../config');

module.exports = class SmoothCorrection {
    constructor(world) {
        this.world = world;
    }

    apply() {
        let localPlayer = this.world.localPlayer;
        let targetPosition = localPlayer.targetPosition;
        if (!targetPosition)
            return;

        if (config.debug.disableSmoothCorrection) {
            this._snap(localPlayer, targetPosition);
            return;
        }

        let speed = config.smoothCorrection.speed;
        if (localPlayer.x < targetPosition.x) {
            localPlayer.x += speed;
        }
        else if (localPlayer.x > targetPosition.x) {
            localPlayer.x -= speed;
        }

        if (Math.abs(localPlayer.x - targetPosition.x) <= speed)
            this._snap(localPlayer, targetPosition);
    }

    _snap(localPlayer, targetPosition) {
        localPlayer.x = targetPosition.x;
        localPlayer.targetPosition = null;
    }
};