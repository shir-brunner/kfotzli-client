const GameObject = require('../objects/game_object');
const Gameplay = require('./gameplay');
const physicsUtil = require('../../utils/physics');
const _ = require('lodash');
const ms = require('ms');
const RESTORE_DROPPED_FLAG_AFTER = ms('10 seconds');

const eventHandlers = {
    FLAG_RESTORED: require('./events/capture_the_flag/flag_restored'),
    ROUND_OVER: require('./events/capture_the_flag/round_over'),
};

module.exports = class CaptureTheFlag extends Gameplay {
    constructor(world) {
        super(world);

        if (!world.level.gameplay.flags)
            throw new Error('Cannot play capture the flag without flags');

        this.scoreByTeam = {};
        world.teams.forEach(team => this.scoreByTeam[team] = 0);

        this.flagsById = {};

        world.level.gameplay.flags.forEach(flagInfo => {
            let flag = this._createFlagGameObject(flagInfo);
            this.flagsById[flag.id] = flag;
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

    applyEvents(events) {
        super.applyEvents(events);

        events.forEach(event => {
            if(event.type === 'ROUND_OVER') {
                this.scoreByTeam[event.data.winnerTeam]++;
                if(this.scoreByTeam[event.data.winnerTeam] >= this.rules.roundsToWin)
                    this.world.gameplay.addEvent('GAME_OVER', { reason: 'TEAM_WON', winnerTeam: event.data.winnerTeam });
            }
        });
    }

    getStats() {
        const CaptureTheFlagStats = require('../../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    update() {
        super.update();
        this._autoRestoreDroppedFlags();
    }

    _addCollectedEvent(eventData) {
        let collectingPlayer = eventData.player;
        let collectable = eventData.gameObject;

        let collectedFlag = this.flagsById[collectable.id];
        let playerCollectedHisOwnFlag = collectedFlag && collectingPlayer.team === collectedFlag.team;
        if (playerCollectedHisOwnFlag) {
            if (this._isFlagAtSpawnPoint(collectedFlag) && this._playerCarriesEnemyFlag(collectingPlayer))
                this._victoryForTeam(collectingPlayer.team);
            else
                this._restoreFlag(collectedFlag);
            return;
        }

        super._addCollectedEvent(eventData);
    }

    _autoRestoreDroppedFlags() {
        _.forEach(this.flagsById, flag => {
            if (flag.collected || !flag.droppedAt)
                return;

            if (Date.now() >= flag.droppedAt + RESTORE_DROPPED_FLAG_AFTER)
                this._restoreFlag(flag);
        });
    }

    _restoreFlag(flag) {
        if (this._isFlagAtSpawnPoint(flag))
            return;

        this.addEvent('FLAG_RESTORED', { flagId: flag.id, flagSpawnPoint: flag.spawnPoint });
    }

    _isFlagAtSpawnPoint(flag) {
        return physicsUtil.pointsEqual(flag, flag.spawnPoint);
    }

    _playerCarriesEnemyFlag(player) {
        if (!player.collectable)
            return false;

        let isCollectableAFlag = _.includes(Object.keys(this.flagsById), player.collectable.id);
        if (!isCollectableAFlag)
            return false;

        return player.collectable.team !== player.team;
    }

    _victoryForTeam(team) {
        this.addEvent('ROUND_OVER', { winnerTeam: team });
    }

    reset() {
        _.forEach(this.flagsById, flag => {
            flag.x = flag.spawnPoint.x;
            flag.y = flag.spawnPoint.y;
            flag.fallable = false;
            flag.droppedAt = null;
        });
    }
};