const $ = require('jquery');
const $game = $('#game');
const $gameInfo = $('#game-info');
const localization = require('../../localization');
const dialogUtil = require('../../utils/dialog');
const config = require('../../config');

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
        if (eventData.reason === 'TOO_FEW_PLAYERS') {
            let message = localization.translate('messages.gameOverDueToFewPlayers', { playerName: eventData.leavingPlayerName }) + '.';
            this._showUnexpectedGameOverDialog(message, dialogButtons);
        }
        else if (eventData.reason === 'EMPTY_TEAM') {
            let message = localization.translate('messages.gameOverDueToEmptyTeam', { team: localization.translate(`teams.${eventData.team}`) }) + '.';
            this._showUnexpectedGameOverDialog(message, dialogButtons);
        }
        else
            this._showWinLoseDialog(eventData, dialogButtons);
    }

    _showWinLoseDialog(eventData, dialogButtons) {
        throw new Error('_showWinLoseDialog() must be implemented');
    }

    _showUnexpectedGameOverDialog(message, dialogButtons) {
        let $dialog = dialogUtil.showDialog({
            title: localization.translate('gameOver'),
            content: '<div style="margin-top: 30px;">' + message + '</div>',
            buttons: dialogButtons
        });

        return $dialog;
    }

    showMessage(text) {
        $('#message').remove();
        let $message = $('<div id="message"></div>').text(text);
        $game.append($message);
        $message.addClass('swing animated');
        setTimeout(() => $message.fadeOut(() => $message.remove()), config.messageDuration);
    }
};