const menuUtil = require('../../utils/menu');
const config = require('../../config');
const textUtil = require('../../utils/text');
const $ = require('jquery');
const $gameInfo = $('#game-info');
const localization = require('../../localization');
const dialogUtil = require('../../utils/dialog');
const StatsBase = require('./stats_base');

module.exports = class TeamDeathmatchStats extends StatsBase {
    refresh(events = []) {
        super.refresh(events);
        this.world.teams.forEach(team => {
            let firstTeamPlayer = this.world.players.find(player => player.team === team);
            if(!firstTeamPlayer)
                return;

            $gameInfo.append(this._createTeamBar(firstTeamPlayer.team, firstTeamPlayer.image, events));
        });
    }

    _createTeamBar(team, image, events = []) {
        let $complexBar = menuUtil.complexBar();
        $complexBar.find('.square').append('<img src="' + config.assetsBaseUrl + '/' + image + '" class="player" />');
        $complexBar.find('.left').append(textUtil.htmlEncode(localization.translate(`teams.${team}`)));
        $complexBar.find('.wide').append(this.gameplay.killsByTeam[team] + ' / ' + this.rules.killsToWin);

        events.forEach(event => {
            if (event.type === 'DEATH' && event.data.killerPlayerId) {
                let killerPlayer = this.world.players.find(player => player.id === event.data.killerPlayerId);
                if(killerPlayer && killerPlayer.team === team)
                    $complexBar.addClass('tada animated');
            }
        });

        return $complexBar;
    }
};