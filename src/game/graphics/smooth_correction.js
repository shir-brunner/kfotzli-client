const controllerUtil = require('../utils/controller');
const config = require('../../config');
const _ = require('lodash');

module.exports = class SmoothCorrection {
    constructor(world) {
        this.world = world;
    }

    apply() {
        let localPlayer = this.world.localPlayer;
        let targetPosition = localPlayer.targetPosition;
        if (!targetPosition || controllerUtil.isControllerPressed(localPlayer.controller))
            return;

        if(config.debug.disableSmoothCorrection) {
            localPlayer.x = targetPosition.x;
            localPlayer.targetPosition = null;
            return;
        }

        let speed = 5;
        if (localPlayer.x < targetPosition.x) {
            localPlayer.x += speed;
        }
        else if (localPlayer.x > targetPosition.x) {
            localPlayer.x -= speed;
        }

        if (Math.abs(localPlayer.x - targetPosition.x) <= speed) {
            localPlayer.x = targetPosition.x;
            localPlayer.targetPosition = null;
        }
    }
};