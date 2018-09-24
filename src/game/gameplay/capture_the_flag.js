const GameObject = require('../engine/objects/game_object');

module.exports = class CaptureTheFlag {
    constructor(world) {
        if(!world.level.gameplay.flags)
            throw new Error('Cannot play capture the flag without flags');

        this.world = world;
        this.rules = world.level.gameplay.rules;

        this.scoreByTeam = {};
        world.teams.forEach(team => this.scoreByTeam[team] = 0);

        this.flags = world.level.gameplay.flags.map(flag => this._createFlagGameObject(flag));
        world.gameObjects.push(...this.flags);
    }

    _createFlagGameObject(flag) {
        flag.id = flag.team + '_flag';
        flag.width = 100;
        flag.height = 100;
        flag.collectable = true;
        flag.collectableByTeams = this.world.teams.filter(team => team !== flag.team);
        flag.fallable = true;

        return new GameObject(flag);
    }

    getStats() {
        const CaptureTheFlagStats = require('../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    update(events) {

    }
};