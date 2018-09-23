const menuUtil = require('../../utils/menu');
const config = require('../../config');
const textUtil = require('../../utils/text');
const $ = require('jquery');
const $gameInfo = $('#game-info');
const localization = require('../../localization');
const dialogUtil = require('../../utils/dialog');
const StatsBase = require('./stats_base');

module.exports = class DeathmatchStats extends StatsBase {
    refresh(events = []) {
        super.refresh(events);
        this.world.players.forEach(player => $gameInfo.append(this._createPlayerBar(player, events)));
    }

    _createPlayerBar(player, events = []) {
        let $complexBar = menuUtil.complexBar();
        $complexBar.find('.square').append('<img src="' + config.assetsBaseUrl + '/' + player.image + '" class="player" />');
        $complexBar.find('.left').append(textUtil.htmlEncode(player.name));
        $complexBar.find('.wide').append(this.gameplay.killsByPlayer[player.id] + ' / ' + this.rules.killsToWin);

        events.forEach(event => {
            if (event.type === 'DEATH' && event.data.killerPlayerId === player.id)
                $complexBar.addClass('tada animated');
        });

        return $complexBar;
    }

    _showWinLoseDialog(eventData, dialogButtons) {
        let winnerPlayer = this.world.players.find(player => player.id === eventData.winnerPlayerId);
        let localPlayer = this.world.localPlayer;
        let winMessage = localization.translate('youWin') + ' :)';
        let loseMessage = localization.translate('youLost') + ' :(';
        let title = winnerPlayer.id === localPlayer.id ? winMessage : loseMessage;
        let html = '';

        if (winnerPlayer.id === localPlayer.id)
            html += '<div style="margin-top: 10px;">' + localization.translate('congratulations') + '!</div>';
        else
            html += '<div style="margin-top: 10px;">' + localization.translate('theWinnerIs') + ': ' + textUtil.htmlEncode(winnerPlayer.name) + '</div>';

        html += '<img class="player" src="' + config.assetsBaseUrl + '/' + winnerPlayer.image + '"></div>';

        let $dialog = dialogUtil.showDialog({
            title: title,
            content: html,
            buttons: dialogButtons
        });

        if (winnerPlayer.id === localPlayer.id)
            $dialog.addClass('tada animated');

        return $dialog;
    }
};