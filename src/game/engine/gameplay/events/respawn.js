module.exports = {
    apply(data, world) {
        let player = world.players.find(player => player.id === data.playerId);
        player.respawn(data.spawnPoint);
        if(world.camera)
            world.camera.animating = true;
    }
}