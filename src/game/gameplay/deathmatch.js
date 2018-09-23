module.exports = class Deathmatch {
    constructor(world) {
        this.world = world;
        this.rules = world.level.gameplay.rules;
        this.killsByPlayer = {};
        world.players.forEach(player => this.killsByPlayer[player.id] = 0);
    }

    getStats() {
        const DeathmatchStats = require('../stats/deathmatch');
        return new DeathmatchStats(this);
    }

    update(events) {
        events.forEach(event => {
            switch(event.type) {
                case 'DEATH':
                    if(event.data.killerPlayerId) {
                        this.killsByPlayer[event.data.killerPlayerId]++;
                        if(this.killsByPlayer[event.data.killerPlayerId] >= this.rules.killsToWin)
                            this.world.worldEvents.addEvent('GAME_OVER', { winnerPlayerId: event.data.killerPlayerId });
                    }
                    break;
            }
        });
    }
};