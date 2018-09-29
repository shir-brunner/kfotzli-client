const eventHandlers = {
    DEATH: require('./events/death'),
    RESPAWN: require('./events/respawn'),
    PLAYER_LEFT: require('./events/player_left'),
    COLLECT: require('./events/collect'),
    DROPPED: require('./events/dropped')
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
            if (!this.eventHandlers[event.type])
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
                        this._addDeathEvent(event.data.player);
                    if (event.data.gameObject.collectable)
                        this._addCollectedEvent(event.data);
                    break;
                case 'PLAYER_OUTSIDE_WORLD_BOUNDS':
                    this._addDeathEvent(event.data.player);
                    break;
            }
        });
    }

    _addDeathByHeadBumpEvent(eventData) {
        if (eventData.bumpingPlayer.team && eventData.bumpingPlayer.team === eventData.bumpedPlayer.team)
            return;

        this._addDeathEvent(eventData.bumpedPlayer, eventData.bumpingPlayer);
    }

    _addDeathEvent(deadPlayer, killerPlayer) {
        if (deadPlayer.isDead || deadPlayer.respawning)
            return;

        if (deadPlayer.collectable) {
            this.addEvent('DROPPED', {
                byPlayerId: deadPlayer.id,
                collectableId: deadPlayer.collectable.id
            });
        }

        let data = { deadPlayerId: deadPlayer.id };
        if(killerPlayer)
            data.killerPlayerId = killerPlayer.id;

        this.addEvent('DEATH', data);
    }

    _addCollectedEvent(eventData) {
        let collectingPlayer = eventData.player;
        let collectable = eventData.gameObject;

        if (collectingPlayer.collectable || collectingPlayer.isDead)
            return;

        this.addEvent('COLLECT', { collectingPlayerId: collectingPlayer.id, collectableId: collectable.id });
    }
};