module.exports = {
    apply(data, world) {
        let droppedByPlayer = world.players.find(player => player.id === data.byPlayerId);
        let collectable = world.gameObjects.find(gameObject => gameObject.id === data.collectableId);

        collectable && collectable.drop();
        if (droppedByPlayer)
            droppedByPlayer.collectable = null;
    }
};