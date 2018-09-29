const GameObject = require('../objects/game_object');
const Gameplay = require('./gameplay');
const physicsUtil = require('../../utils/physics');
const worldUtil = require('../../utils/world');
const commonConfig = require('../../common_config');
const _ = require('lodash');
const ms = require('ms');
const RETURN_DROPPED_FLAG_AFTER = ms('10 seconds');

const eventHandlers = {
    FLAG_RETURNED: require('./events/capture_the_flag/flag_returned'),
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
        this.reset();
    }

    _createFlagGameObject(flag) {
        flag.id = flag.team + '_flag';
        flag.width = commonConfig.squareSize;
        flag.height = commonConfig.squareSize;
        flag.collectable = true;
        flag.fallable = true;

        return new GameObject(flag);
    }

    applyEvents(events) {
        super.applyEvents(events);

        events.forEach(event => {
            if (event.type === 'ROUND_OVER') {
                this.scoreByTeam[event.data.winnerTeam]++;
                if (this.scoreByTeam[event.data.winnerTeam] >= this.rules.roundsToWin)
                    this.world.gameplay.addEvent('GAME_OVER', {
                        reason: 'TEAM_WON',
                        winnerTeam: event.data.winnerTeam
                    });
            }
        });
    }

    getStats() {
        const CaptureTheFlagStats = require('../../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    update() {
        super.update();
        this._autoReturnDroppedFlags();
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
                this._returnFlag(collectedFlag);
            return;
        }

        super._addCollectedEvent(eventData);
    }

    _autoReturnDroppedFlags() {
        _.forEach(this.flagsById, flag => {
            if (flag.collected || !flag.droppedAt)
                return;

            let isOutsideWorldBounds = worldUtil.isOutsideWorldBounds(flag, this.world.level.size);
            if ((Date.now() >= flag.droppedAt + RETURN_DROPPED_FLAG_AFTER) || isOutsideWorldBounds)
                this._returnFlag(flag);
        });
    }

    _returnFlag(flag) {
        if (this._isFlagAtSpawnPoint(flag))
            return;

        this.addEvent('FLAG_RETURNED', { flagId: flag.id, flagSpawnPoint: flag.spawnPoint });
    }

    _isFlagAtSpawnPoint(flag) {
        return physicsUtil.pointsEqual(flag, flag.spawnPoint);
    }

    _playerCarriesEnemyFlag(player) {
        if (!player.collectable)
            return false;

        let isCollectableAFlag = !!this.flagsById[player.collectable.id];
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