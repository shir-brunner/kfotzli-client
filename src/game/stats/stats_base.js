const $ = require('jquery');
const $gameInfo = $('#game-info');
const localization = require('../../localization');
const dialogUtil = require('../../utils/dialog');

module.exports = class StatsBase {
    constructor(gameplay) {
        this.gameplay = gameplay;
        this.world = this.gameplay.world;
        this.rules = this.world.level.gameplay.rules;

        this.refresh();
    }

    refresh() {
        $gameInfo.empty();
    }

    showGameOverDialog(eventData, dialogButtons) {
        if (eventData.reason === 'TOO_FEW_PLAYERS')
            this._showGameOverDueToFewPlayersDialog(eventData, dialogButtons);
        else
            this._showWinLoseDialog(eventData, dialogButtons);
    }

    _showWinLoseDialog(eventData, dialogButtons) {
        throw new Error('_showWinLoseDialog() must be implemented');
    }

    _showGameOverDueToFewPlayersDialog(eventData, dialogButtons) {
        let html = '';
        html += '<div style="margin-top: 30px;">';
        html += localization.translate('messages.gameOverDueToFewPlayers', { playerName: eventData.leavingPlayerName }) + '.';
        html += '</div>';

        let $dialog = dialogUtil.showDialog({
            title: localization.translate('gameOver'),
            content: html,
            buttons: dialogButtons
        });

        return $dialog;
    }
};