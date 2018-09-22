const physicsUtil = require('./physics');
const _ = require('lodash');

module.exports = {
    findFreeSpawnPoint(forPlayerId, world) {
        let forPlayer = world.players.find(player => player.id === forPlayerId);
        let availableSpawnPoints = world.level.spawnPoints;
        if(world.level.teams.length)
            availableSpawnPoints = world.level.spawnPoints.filter(spawnPoint => spawnPoint.team === forPlayer.team);

        let spawnPoints = _.shuffle(availableSpawnPoints);
        for (let i = 0; i < spawnPoints.length; i++) {
            let spawnPoint = spawnPoints[i];
            let isFree = !world.players.find(player => {
                if (player.id === forPlayer.id)
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

        return _.sample(availableSpawnPoints);
    }
};