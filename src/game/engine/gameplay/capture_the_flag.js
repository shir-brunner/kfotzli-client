const GameObject = require('../objects/game_object');
const Gameplay = require('./gameplay');
const physicsUtil = require('../../utils/physics');
const _ = require('lodash');

const eventHandlers = {
    FLAG_RESTORED: require('./events/capture_the_flag/flag_restored'),
};

module.exports = class CaptureTheFlag extends Gameplay {
    constructor(world) {
        super(world);

        if (!world.level.gameplay.flags)
            throw new Error('Cannot play capture the flag without flags');

        this.scoreByTeam = {};
        world.teams.forEach(team => this.scoreByTeam[team] = 0);

        this.flags = world.level.gameplay.flags.map(flag => this._createFlagGameObject(flag));

        this.flagsSpawnPointsByTeam = {};
        this.flags.forEach(flag => this.flagsSpawnPointsByTeam[flag.team] = _.pick(flag, ['x', 'y']));

        world.gameObjects.push(...this.flags);
        _.assign(this.eventHandlers, eventHandlers);
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
        const CaptureTheFlagStats = require('../../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    _addCollectedEvent(eventData) {
        let collectingPlayer = eventData.player;
        let collectable = eventData.gameObject;

        let flag = this.flags.find(flag => flag.id === collectable.id);
        if (flag && collectingPlayer.team === flag.team) { // player collected his own flag
            let flagSpawnPoint = this.flagsSpawnPointsByTeam[flag.team];
            if(physicsUtil.pointsEqual(flag, flagSpawnPoint))
                return;

            this.addEvent('FLAG_RESTORED', { flagId: flag.id, flagSpawnPoint: flagSpawnPoint });
            return;
        }

        super._addCollectedEvent(eventData);
    }
};