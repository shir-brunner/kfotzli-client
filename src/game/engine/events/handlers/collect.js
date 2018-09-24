module.exports = {
    handle(data, world) {
        let collectingPlayer = world.players.find(player => player.id === data.collectingPlayerId);
        let collectable = world.gameObjects.find(gameObject => gameObject.id === data.collectableId);

        if (!collectingPlayer || !collectable)
            return;

        collectingPlayer.collect(collectable);
    }
};