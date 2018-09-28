const GameObject = require('../objects/game_object');
const Gameplay = require('./gameplay');
const physicsUtil = require('../../utils/physics');
const _ = require('lodash');
const ms = require('ms');
const RESTORE_DROPPED_FLAG_AFTER = ms('10 seconds');

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

        this.flagsById = {};
        this.flagsSpawnPointsByTeam = {};

        world.level.gameplay.flags.forEach(flagInfo => {
            let flag = this._createFlagGameObject(flagInfo);
            this.flagsById[flag.id] = flag;
            this.flagsSpawnPointsByTeam[flag.team] = _.pick(flag, ['x', 'y']);
            world.gameObjects.push(flag);
        });

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

    update() {
        super.update();
        this._restoreFlags();
    }

    _addCollectedEvent(eventData) {
        let collectingPlayer = eventData.player;
        let collectable = eventData.gameObject;

        let flag = this.flagsById[collectable.id];
        let playerCollectedHisOwnFlag = flag && collectingPlayer.team === flag.team;
        if (playerCollectedHisOwnFlag) {
            this._restoreFlag(flag);
            return;
        }

        super._addCollectedEvent(eventData);
    }

    _restoreFlags() {
        _.forEach(this.flagsById, flag => {
            if(flag.collected || !flag.droppedAt)
                return;

            if(Date.now() >= flag.droppedAt + RESTORE_DROPPED_FLAG_AFTER)
                this._restoreFlag(flag);
        });
    }

    _restoreFlag(flag) {
        if (this._isFlagAtSpawnPoint(flag))
            return;

        let flagSpawnPoint = this.flagsSpawnPointsByTeam[flag.team];
        this.addEvent('FLAG_RESTORED', { flagId: flag.id, flagSpawnPoint: flagSpawnPoint });
    }

    _isFlagAtSpawnPoint(flag) {
        return physicsUtil.pointsEqual(flag, this.flagsSpawnPointsByTeam[flag.team]);
    }
};