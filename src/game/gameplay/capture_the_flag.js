const GameObject = require('../engine/objects/game_object');
const _ = require('lodash');

module.exports = class CaptureTheFlag {
    constructor(world) {
        if(!world.level.gameplay.flags)
            throw new Error('Cannot play capture the flag without flags');

        this.world = world;
        this.rules = world.level.gameplay.rules;

        this.scoreByTeam = {};
        world.teams.forEach(team => this.scoreByTeam[team] = 0);

        this.flags = world.level.gameplay.flags.map(flag => this._createFlagGameObject(flag));

        this.flagsSpawnPointsByTeam = {};
        this.flags.forEach(flag => this.flagsSpawnPointsByTeam[flag.team] = _.pick(flag, ['x', 'y']));

        world.gameObjects.push(...this.flags);
    }

    _createFlagGameObject(flag) {
        flag.id = flag.team + '_flag';
        flag.width = 100;
        flag.height = 100;
        flag.collectable = true;
        flag.fallable = true;

        return new GameObject(flag);
    }

    getStats() {
        const CaptureTheFlagStats = require('../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    update(events) {
        events.forEach(event => {
            switch(event.type) {
                case 'COLLECT':
                    this._handleCollectEvent(event.data);
                    break;
            }
        });
    }

    _handleCollectEvent(eventData) {
        let collectingPlayer = this.world.players.find(player => player.id === eventData.collectingPlayerId);
        let collectable = this.world.gameObjects.find(gameObject => gameObject.id === eventData.collectableId);

        if (!collectingPlayer || !collectable)
            return;

        let flag = this.flags.find(flag => flag.id === collectable.id);
        if(flag) { // "collectable" is a flag
            if(collectingPlayer.team === flag.team) { // player collected his own flag
                flag.collected = false;
                collectingPlayer.collectable = null;
                _.assign(flag, this.flagsSpawnPointsByTeam[flag.team]);
            }
        }
    }
};