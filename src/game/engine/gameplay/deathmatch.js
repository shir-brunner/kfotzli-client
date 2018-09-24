const Gameplay = require('./gameplay');

module.exports = class Deathmatch extends Gameplay {
    constructor(world) {
        super(world);
        this.killsByPlayer = {};
        world.players.forEach(player => this.killsByPlayer[player.id] = 0);
    }

    getStats() {
        const DeathmatchStats = require('../../stats/deathmatch');
        return new DeathmatchStats(this);
    }

    applyEvents(events) {
        super.applyEvents(events);

        events.forEach(event => {
            switch (event.type) {
                case 'DEATH':
                    if (event.data.killerPlayerId) {
                        this.killsByPlayer[event.data.killerPlayerId]++;
                        if (this.killsByPlayer[event.data.killerPlayerId] >= this.rules.killsToWin)
                            this.world.gameplay.addEvent('GAME_OVER', { reason: 'PLAYER_WON', winnerPlayerId: event.data.killerPlayerId });
                    }
                    break;
            }
        });
    }
};