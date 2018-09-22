const localization = require('../localization');

module.exports = {
    format(level) {
        let html = '';
        let gameplayTitle = localization.translate('gameplay.title');
        let gameplayTranslated = localization.translate(`gameplay.${level.gameplay.name}`);
        let goalTitle = localization.translate('goal');
        let killsTitle = localization.translate('kills');
        let timeLimitTitle = localization.translate('timeLimit');
        let minutesTitle = localization.translate('minutes');
        let secondsTitle = localization.translate('seconds');
        let teamsTitle = localization.translate('teams.title');
        let minimumPlayersTitle = localization.translate('minimumPlayers');
        let winsTitle = localization.translate('wins');
        let holdTimeTitle = localization.translate('holdTime');

        html += `<div>${gameplayTitle}: ${gameplayTranslated}</div>`;

        if(level.gameplay.rules.killsToWin)
            html += `<div>${goalTitle}: ${level.gameplay.rules.killsToWin} ${killsTitle}</div>`;

        if(level.gameplay.rules.roundsToWin)
            html += `<div>${goalTitle}: ${level.gameplay.rules.roundsToWin} ${winsTitle}</div>`;

        if(level.gameplay.rules.timeLimit)
            html += `<div>${timeLimitTitle}: ${level.gameplay.rules.timeLimit} ${minutesTitle}</div>`;

        if(level.gameplay.rules.holdTime)
            html += `<div>${holdTimeTitle}: ${level.gameplay.rules.holdTime} ${secondsTitle}</div>`;

        if(level.teams.length) {
            let teamsString = level.teams.map(team => localization.translate(`teams.${team}`));
            html += `<div>${teamsTitle}: ${teamsString.join(', ')}</div>`;
        }

        html += `<div>${minimumPlayersTitle}: ${level.minPlayers}</div>`;

        return html;
    }
};