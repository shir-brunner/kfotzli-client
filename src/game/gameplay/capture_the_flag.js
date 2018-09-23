module.exports = class CaptureTheFlag {
    constructor(world) {
        this.world = world;
        this.rules = world.level.gameplay.rules;
        this.scoreByTeam = {};
        world.teams.forEach(team => this.scoreByTeam[team] = 0);
    }

    getStats() {
        const CaptureTheFlagStats = require('../stats/capture_the_flag');
        return new CaptureTheFlagStats(this);
    }

    update(events) {

    }
};