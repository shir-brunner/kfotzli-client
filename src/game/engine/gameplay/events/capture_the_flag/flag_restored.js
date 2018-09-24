module.exports = {
    apply(data, world) {
        let flag = world.gameObjects.find(gameObject => gameObject.id === data.flagId);
        if (!flag)
            return;

        flag.x = data.position.x;
        flag.y = data.position.y;
    }
};