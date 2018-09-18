const _ = require('lodash');
const physicsUtil = require('../../utils/physics');

module.exports = class WorldEvents {
    constructor(world) {
        this.world = world;
        this.events = [];
    }

    _addEvent(eventType, data) {
        this.events.push({ type: eventType, data: data });
    }

    updateEvents() {
        this.events = [];
        this.world.physics.events.forEach(event => {
            switch (event.type) {
                case 'HEAD_BUMP':
                    this._addDeathEvent(event.data);
                    break;
            }
        });
    }

    _addDeathEvent(headBump) {
        this._addEvent('DEATH', {
            deadPlayerId: headBump.on.id,
            killerPlayerId: headBump.by.id,
            spawnPoint: this._findFreeSpawnPoint()
        });
    }

    _findFreeSpawnPoint() {
        let spawnPoints = _.shuffle(this.world.level.spawnPoints);
        for (let spawnPoint in spawnPoints) {
            let isFree = this.world.players.filter(player => physicsUtil.isPointInRect(spawnPoint, player)).length === 0;
            if (isFree)
                return spawnPoint;
        }

        return null;
    }
};