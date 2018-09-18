module.exports = {
    handle(data, world) {
        let player = world.players.find(player => player.id === data.deadPlayerId);
        player.x = data.spawnPoint.x;
        player.y = data.spawnPoint.y;
        player.verticalSpeed = 0;
        player.isDead = true;
    }
};