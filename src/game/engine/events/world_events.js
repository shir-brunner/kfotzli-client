module.exports = class WorldEvents {
    constructor(world) {
        this.world = world;
        this.events = [];
    }

    addEvent(eventType, data) {
        this.events.push({ type: eventType, data: data });
    }

    updateEvents() {
        this.world.physics.events.forEach(event => {
            switch (event.type) {
                case 'HEAD_BUMP':
                    this._addDeathEvent(event.data);
                    break;
            }
        });
    }

    collectEvents() {
        let events = this.events;
        this.events = [];
        return events;
    }

    _addDeathEvent(headBump) {
        this.addEvent('DEATH', {
            deadPlayerId: headBump.on.id,
            killerPlayerId: headBump.by.id
        });
    }
};