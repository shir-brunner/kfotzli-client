const eventHandlers = {
    DEATH: require('./events/death'),
    RESPAWN: require('./events/respawn'),
    PLAYER_LEFT: require('./events/player_left'),
    COLLECT: require('./events/collect')
};

module.exports = class Gameplay {
    constructor(world) {
        this.world = world;
        this.rules = world.level.gameplay.rules;
        this.events = [];
        this.eventHandlers = eventHandlers;
    }

    applyEvents(events) {
        events.forEach(event => {
            if(!this.eventHandlers[event.type])
                return;

             this.eventHandlers[event.type].apply(event.data, this.world);
        });
    }

    addEvent(eventType, data) {
        this.events.push({ type: eventType, data: data });
    }

    collectEvents() {
        let events = this.events;
        this.events = [];
        return events;
    }

    update() {
        this.world.physics.events.forEach(event => {
            switch (event.type) {
                case 'HEAD_BUMP':
                    this._addDeathByHeadBumpEvent(event.data);
                    break;
                case 'PLAYER_COLLIDED':
                    if (event.data.gameObject.obstacle)
                        this._addDeathEvent(event.data);
                    if (event.data.gameObject.collectable)
                        this._addCollectedEvent(event.data);
                    break;
                case 'PLAYER_OUTSIDE_WORLD_BOUNDS':
                    this._addDeathEvent(event.data);
                    break;
            }
        });
    }

    _addDeathByHeadBumpEvent(eventData) {
        if (eventData.bumpedPlayer.isDead || eventData.bumpedPlayer.respawning)
            return;

        if (eventData.bumpingPlayer.team && eventData.bumpingPlayer.team === eventData.bumpedPlayer.team)
            return;

        this.addEvent('DEATH', { deadPlayerId: eventData.bumpedPlayer.id, killerPlayerId: eventData.bumpingPlayer.id });
    }

    _addDeathEvent(eventData) {
        if (eventData.player.isDead)
            return;

        this.addEvent('DEATH', { deadPlayerId: eventData.player.id });
    }

    _addCollectedEvent(eventData) {
        let collectingPlayer = eventData.player;
        let collectable = eventData.gameObject;

        if (collectingPlayer.collectable || collectingPlayer.isDead)
            return;

        this.addEvent('COLLECT', { collectingPlayerId: collectingPlayer.id, collectableId: collectable.id });
    }
};