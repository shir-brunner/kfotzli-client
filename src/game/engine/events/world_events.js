module.exports = class WorldEvents {
    constructor(world) {
        this.world = world;
        this.events = [];
    }

    addEvent(eventType, data) {
        this.events.push({ type: eventType, data: data });
    }

    collectEvents() {
        let events = this.events;
        this.events = [];
        return events;
    }

    updateEvents() {
        this.world.physics.events.forEach(event => {
            switch (event.type) {
                case 'HEAD_BUMP':
                    this._addDeathByHeadBumpEvent(event.data);
                    break;
                case 'TOUCHED_OBSTACLE':
                    this._addDeathByObstacleEvent(event.data);
                    break;
            }
        });
    }

    _addDeathByHeadBumpEvent(eventData) {
        if(eventData.bumpedPlayer.isDead || eventData.bumpedPlayer.respawning)
            return;

        this.addEvent('DEATH', { deadPlayerId: eventData.bumpedPlayer.id, killerPlayerId: eventData.bumpingPlayer.id });
    }

    _addDeathByObstacleEvent(eventData) {
        if(eventData.player.isDead)
            return;

        this.addEvent('DEATH', { deadPlayerId: eventData.player.id });
    }
};