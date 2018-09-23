const CaptureTheFlag = require('./capture_the_flag');
const Deathmatch = require('./deathmatch');
const TeamDeathmatch = require('./team_deathmatch');
const KingOfTheHill = require('./king_of_the_hill');
const LastManStanding = require('./last_man_standing');

module.exports = class GameplayFactory {
    getGameplay(world) {
        switch(world.level.gameplay.name) {
            case 'captureTheFlag':
                return new CaptureTheFlag(world);
            case 'deathmatch':
                if(world.level.teams.length)
                    return new TeamDeathmatch(world);

                return new Deathmatch(world);
            case 'kingOfTheHill':
                return new KingOfTheHill(world);
            case 'lastManStanding':
                return new LastManStanding(world);
        }

        throw new Error(`Game type "${gameType}" is not supported`);
    }
};