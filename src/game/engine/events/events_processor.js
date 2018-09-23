const handlersByType = {
    DEATH: require('./handlers/death'),
    RESPAWN: require('./handlers/respawn'),
    PLAYER_LEFT: require('./handlers/player_left')
};

module.exports = class EventsProcessor {
    constructor(world) {
        this.world = world;
    }

    process(events) {
        events.forEach(event => handlersByType[event.type] && handlersByType[event.type].handle(event.data, this.world));
    }
};