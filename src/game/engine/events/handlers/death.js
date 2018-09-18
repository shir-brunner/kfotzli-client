const config = require('../../../common_config');
const BodyPart = require('../../objects/body_part');
const worldUtil = require('../../../utils/world');

module.exports = {
    handle(data, world) {
        let player = world.players.find(player => player.id === data.deadPlayerId);
        player.die();

        for(let i = 0; i < config.bodyParts.count; i++)
            world.bodyParts.push(new BodyPart(player));

        setTimeout(() => world.worldEvents.addEvent('RESPAWN', {
            playerId: player.id,
            spawnPoint: worldUtil.findFreeSpawnPoint(player.id, world)
        }), config.respawnTime);
    }
};