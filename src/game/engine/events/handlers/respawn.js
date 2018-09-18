module.exports = {
    handle(data, world) {
        let player = world.players.find(player => player.id === data.playerId);
        player.respawn(data.spawnPoint);
    }
}