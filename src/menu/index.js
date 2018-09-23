const $ = require('jquery');
const background = require('./background');
const images = require('../config/images');
const localization = require('../localization/index');
const roomMenu = require('./room_menu');
const menuUtil = require('../utils/menu');

let $mainMenu = $('#main-menu').show();
let $gameTitle = $mainMenu.find('.big-title').html(localization.translate('gameTitle'));
let $clientName = $('#client-name');

document.title = localization.translate('gameTitle');

background.onBackgroundReady(() => {
    let $playWithFriends = menuUtil.extraLargeButton(localization.translate('playWithFriends'), 'friends.png').hide();
    let $playWithStrangers = menuUtil.extraLargeButton(localization.translate('playWithStrangers'), 'play.png').hide();
    let $facebookButton = $('<img class="menu-button" src="' + images.buttons['facebook'] + '" />');
    let $twitterButton = $('<img class="menu-button" src="' + images.buttons['twitter'] + '" />');
    let $helpButton = $('<img class="menu-button" src="' + images.buttons['help'] + '" />');
    let $settingsButton = $('<img class="menu-button" src="' + images.buttons['settings'] + '" />');
    let $muteButton = $('<img class="menu-button" src="' + images.buttons['mute'] + '" />');
    let $menuButtonsLeft = $('.menu-buttons-left');
    let $menuButtonsRight = $('.menu-buttons-right');
    let $connectButtonContainer = $('#connect-button-container');
    let $connectButton = menuUtil.largeButton(localization.translate('join')).css('margin-top', 20).hide();

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
            roomMenu.connect(clientName, error => {
                $gameTitle.html(localization.translate('cannotConnect'));
            });
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