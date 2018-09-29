const _ = require('lodash');

module.exports = {
    apply(data, world) {
        let flag = world.gameObjects.find(gameObject => gameObject.id === data.flagId);
        if (!flag)
            return;

        _.assign(flag, data.flagSpawnPoint);
        flag.fallable = false;
        flag.droppedAt = null;
    }
};