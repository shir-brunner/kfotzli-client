const menuUtil = require('../../utils/menu');
const config = require('../../config');
const textUtil = require('../../utils/text');
const localization = require('../../localization');
const dialogUtil = require('../../utils/dialog');
const StatsBase = require('./stats_base');
const $ = require('jquery');
const $gameInfo = $('#game-info');

module.exports = class CaptureTheFlagStats extends StatsBase {
    refresh(events = []) {
        super.refresh(events);
        this.world.teams.forEach(team => {
            let firstTeamPlayer = this.world.players.find(player => player.team === team);
            if (!firstTeamPlayer)
                return;

            $gameInfo.append(this._createTeamBar(firstTeamPlayer.team, firstTeamPlayer.image, events));
        });

        events.forEach(event => {
            switch(event.type) {
                case 'COLLECT':
                    let takenFlag = this.gameplay.flagsById[event.data.collectableId];
                    if (takenFlag) {
                        let takingPlayer = this.world.players.find(player => player.id === event.data.collectingPlayerId);
                        takingPlayer && this._onFlagTaken(takenFlag, takingPlayer);
                    }
                    break;
                case 'DROPPED':
                    let droppedFlag = this.gameplay.flagsById[event.data.collectableId];
                    droppedFlag && this._onFlagDropped(droppedFlag);
                    break;
                case 'FLAG_RETURNED':
                    let returnedFlag = this.gameplay.flagsById[event.data.flagId];
                    returnedFlag && this._onFlagReturned(returnedFlag);
                    break;
                case 'ROUND_OVER':
                    this.showMessage(localization.translate('messages.teamWonRound', {
                        team: localization.translate(`teams.${event.data.winnerTeam}`)
                    }));
                    break;
            }
        });
    }

    _createTeamBar(team, image, events = []) {
        let $complexBar = menuUtil.complexBar();
        $complexBar.find('.square').append('<img src="' + config.assetsBaseUrl + '/' + image + '" class="player" />');
        $complexBar.find('.left').append(textUtil.htmlEncode(localization.translate(`teams.${team}`)));
        $complexBar.find('.wide').append(this.gameplay.scoreByTeam[team] + ' / ' + this.rules.roundsToWin);

        events.forEach(event => {
            if (event.type === 'ROUND_OVER' && event.data.winnerTeam === team)
                $complexBar.addClass('tada animated');
        });

        return $complexBar;
    }

    _showWinLoseDialog(eventData, dialogButtons) {
        let winnerTeam = eventData.winnerTeam;
        let firstTeamPlayer = this.world.players.find(player => player.team === winnerTeam);
        let localPlayer = this.world.localPlayer;
        let winMessage = localization.translate('youWin') + ' :)';
        let loseMessage = localization.translate('youLost') + ' :(';
        let title = localPlayer.team === winnerTeam ? winMessage : loseMessage;
        let html = '';

        if (localPlayer.team === winnerTeam)
            html += '<div style="margin-top: 10px;">' + localization.translate('messages.yourTeamHasWonTheMatch') + '!</div>';
        else
            html += '<div style="margin-top: 10px;">' + localization.translate('messages.yourTeamHasLostTheMatch', { winnerTeam: localization.translate(`teams.${winnerTeam}`) }) + '.</div>';

        html += '<img class="player small" src="' + config.assetsBaseUrl + '/' + firstTeamPlayer.image + '"></div>';

        let $dialog = dialogUtil.showDialog({
            title: title,
            content: html,
            buttons: dialogButtons
        });

        if (localPlayer.team === winnerTeam)
            $dialog.addClass('tada animated');

        return $dialog;
    }

    _onFlagTaken(flag, byPlayer) {
        let teamTranslated = localization.translate(`teams.${flag.team}`);
        this.showMessage(localization.translate('messages.flagTaken', {
            team: teamTranslated,
            by: byPlayer.name
        }) + '!');
    }

    _onFlagDropped(flag) {
        let teamTranslated = localization.translate(`teams.${flag.team}`);
        this.showMessage(localization.translate('messages.flagDropped', { team: teamTranslated }));
    }

    _onFlagReturned(flag) {
        let teamTranslated = localization.translate(`teams.${flag.team}`);
        this.showMessage(localization.translate('messages.flagReturned', { team: teamTranslated }));
    }
};