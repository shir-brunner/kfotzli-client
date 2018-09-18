const $ = require('jquery');
const background = require('./background');
const images = require('../config/images');
const localization = require('../localization/index');
const config = require('../config');
const roomMenu = require('./room_menu');
const Connection = require('../utils/connection');
const textUtil = require('../utils/text');

let $mainMenu = $('#main-menu').show();
let $gameTitle = $mainMenu.find('.big-title').html(localization.translate('gameTitle'));
let $clientName = $('#client-name');

document.title = localization.translate('gameTitle');

background.onBackgroundReady(() => {
    let $playWithFriends = createExtraLargeButton(localization.translate('playWithFriends'), 'friends').hide();
    let $playWithStrangers = createExtraLargeButton(localization.translate('playWithStrangers'), 'play').hide();
    let $facebookButton = $('<img class="menu-button" src="' + images.buttons['facebook'] + '" />');
    let $twitterButton = $('<img class="menu-button" src="' + images.buttons['twitter'] + '" />');
    let $helpButton = $('<img class="menu-button" src="' + images.buttons['help'] + '" />');
    let $settingsButton = $('<img class="menu-button" src="' + images.buttons['settings'] + '" />');
    let $muteButton = $('<img class="menu-button" src="' + images.buttons['mute'] + '" />');
    let $menuButtonsLeft = $('.menu-buttons-left');
    let $menuButtonsRight = $('.menu-buttons-right');
    let $connectButtonContainer = $('#connect-button-container');
    let $connectButton = createLargeButton(localization.translate('join')).css('margin-top', 20).hide();

    $mainMenu.append($playWithFriends);
    $mainMenu.append($playWithStrangers);
    $menuButtonsLeft.append($facebookButton);
    $menuButtonsLeft.append($twitterButton);
    $menuButtonsRight.append($helpButton);
    $menuButtonsRight.append($settingsButton);
    $menuButtonsRight.append($muteButton);

    $connectButtonContainer.append($connectButton);

    $gameTitle.fadeIn(function () {
        $playWithFriends.fadeIn();
        $playWithStrangers.fadeIn(function () {
            $menuButtonsLeft.fadeIn();
            $menuButtonsRight.fadeIn();
        });
    });

    $playWithStrangers.on('click', function () {
        $playWithStrangers.hide();
        $playWithFriends.hide();
        $gameTitle.html(localization.translate('whatIsYourName'));
        $clientName.show().focus();
        $connectButton.show();
    });

    $clientName.on('keypress', function (e) {
        e.keyCode === 13 && $connectButton.trigger('click');
    });

    $connectButton.on('click', function () {
        let clientName = $clientName.val();
        if (clientName) {
            connect(clientName);
        }
        else
            $clientName.focus();
    });

    $(document).on('keyup', function (e) {
        if (e.keyCode === 27) {
            $clientName.hide();
            $connectButton.hide();
            $playWithStrangers.show();
            $playWithFriends.show();
            $gameTitle.html(localization.translate('gameTitle'));
        }
    });
});

function createExtraLargeButton(title, imageName) {
    let html = '';

    html += '<div class="menu-button-xl">';
    html += '   <img src="' + images.buttons[imageName] + '" />';
    html += '   <h3>' + title + '</h3>';
    html += '</div>';

    return $(html);
}

let connecting = false;
function connect(clientName) {
    if(connecting)
        return;

    connecting = true;
    let connection = new Connection(config.serverUrl);
    connection.on('open', () => {
        connection.send('CLIENT_DETAILS', { client: { name: clientName } });
        connection.on('message.ROOM', room => {
            connection.off('message.ROOM');
            setTimeout(() => connecting = false, 2000);
            roomMenu.enter(room, connection);
        });
    });

    connection.on('error', error => {
        connecting = false;
        $gameTitle.html(localization.translate('cannotConnect'));
    });
}

function createLargeButton(text) {
    let $button = $('<div class="menu-button-lg red">' + textUtil.htmlEncode(text) + '</div>');
    return $button;
}