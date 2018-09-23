module.exports = class TeamDeathmatch {
    constructor(world) {
        this.world = world;
        this.rules = world.level.gameplay.rules;
        this.killsByTeam = {};
        world.teams.forEach(team => this.killsByTeam[team] = 0);
    }

    getStats() {
        const TeamDeathmatchStats = require('../stats/team_deathmatch');
        return new TeamDeathmatchStats(this);
    }

    update(events) {
        events.forEach(event => {
            switch (event.type) {
                case 'DEATH':
                    if (event.data.killerPlayerId) {
                        let killerPlayer = this.world.players.find(player => player.id === event.data.killerPlayerId);
                        if(!killerPlayer)
                            return;

                        this.killsByTeam[killerPlayer.team]++;
                        if (this.killsByTeam[killerPlayer.team] >= this.rules.killsToWin)
                            this.world.worldEvents.addEvent('GAME_OVER', { reason: 'TEAM_WON', winnerTeam: killerPlayer.team });
                    }
                    break;
            }
        });
    }
};