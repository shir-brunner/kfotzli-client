const config = require('../../../../common_config');
const BodyPart = require('../../../objects/body_part');
const _ = require('lodash');

module.exports = {
    apply(data, world) {
        world.players.forEach(player => {
            if(player.collectable) {
                player.collectable && player.collectable.drop();
                player.collectable = null;
            }
            player.die();
            for(let i = 0; i < config.bodyParts.count; i++)
                world.bodyParts.push(new BodyPart(player));
        });

        world.gameplay.reset();

        setTimeout(() => {
            world.players.forEach(player => {
                world.gameplay.addEvent('RESPAWN', {
                    playerId: player.id,
                    spawnPoint: player.spawnPoint
                });
            });
        }, config.respawnTime);
    }
};