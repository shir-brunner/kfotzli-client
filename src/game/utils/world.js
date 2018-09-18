const _ = require('lodash');
const physicsUtil = require('./physics');

module.exports = {
    findFreeSpawnPoint(forPlayerId, world) {
        let spawnPoints = _.shuffle(world.level.spawnPoints);
        for (let i = 0; i < spawnPoints.length; i++) {
            let spawnPoint = spawnPoints[i];
            let isFree = !world.players.find(player => {
                if (player.id === forPlayerId)
                    return false;

                let rect = {
                    x: spawnPoint.x - (player.width / 2),
                    y: spawnPoint.y - (player.height / 2),
                    width: player.width,
                    height: player.height
                };

                return physicsUtil.intersects(rect, player);
            });

            if (isFree)
                return spawnPoint;
        }

        return null;
    }
};