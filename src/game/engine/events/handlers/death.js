const config = require('../../../common_config');
const BodyPart = require('../../objects/body_part');
const worldUtil = require('../../../utils/world');

module.exports = {
    handle(data, world) {
        let playerToKill = world.players.find(player => player.id === data.deadPlayerId);
        playerToKill.die();

        for(let i = 0; i < config.bodyParts.count; i++)
            world.bodyParts.push(new BodyPart(playerToKill));

        setTimeout(() => {
            // player might have been removed by now, so check if he still exists in the world
            if(!world.players.find(player => player.id === playerToKill.id))
                return;

            world.worldEvents.addEvent('RESPAWN', {
                playerId: playerToKill.id,
                spawnPoint: worldUtil.findFreeSpawnPoint(playerToKill, world)
            });
        }, config.respawnTime);
    }
};