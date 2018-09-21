const $ = require('jquery');
const localization = require('../localization');
const config = require('../config');
const textUtil = require('../utils/text');
const levelPreview = require('../utils/level_preview');
const assets = require('../services/assets');
const Game = require('../game');
const background = require('./background');
const mathUtil = require('../utils/math');
const Promise = require('bluebird');

let $game = $('#game');
let $gameBackground = $('#game-background');
let $gameCanvas = $('#game-canvas');
let gameCanvas = $gameCanvas[0];
let $mainMenu = $('#main-menu');
let $room = $('#room');
let $slots = $room.find('.slots');
let $miniMap = $room.find('.mini-map');
let $clock = $room.find('.clock');
let $loadingGame = $('#loading-game');
let $loadingText = $loadingGame.find('.text').html(localization.translate('loadingGame'));
let $loadingProgress = $loadingGame.find('.progress');

module.exports = {
    enter(room, connection) {
        $clock.hide();
        renderRoom(room, connection);
        levelPreview.appendTo($miniMap, room.level, { width: 396, height: 216 });
        $mainMenu.fadeOut('slow', () => $room.fadeIn());

        connection.on('message.ROOM', room => renderRoom(room, connection));
        connection.on('message.PREPARE', room => loadAssets(connection, room));
    }
};

let clockInterval = null;
let previousRoom = null;

function renderRoom(room, connection) {
    $slots.empty();

    for (let slot = 1; slot <= room.maxPlayers; slot++) {
        let $slot = $('<div class="slot vertical room-slot"></div>');

        let client = room.clients.find(client => client.slot === slot);
        if (client) {
            $slot.append('<img class="slot-player" src="' + config.assetsBaseUrl + '/' + client.character.image + '"/>');
            if (client.isLocal) {
                let $leaveButton = $('<div class="menu-button-lg blue leave-button">' + textUtil.htmlEncode(localization.translate('leave')) + '</div>');
                $slot.append($leaveButton);
                $leaveButton.on('click', function () {
                    connection.close();
                    $room.fadeOut('slow', () => $mainMenu.fadeIn());
                });
            }
        }

        $slot.append('<div class="slot-head">' + textUtil.htmlEncode(_.get(client, 'name', '')) + '</div>');
        $slots.append($slot);
    }

    clearInterval(clockInterval);
    if (shouldRestartClock(room, previousRoom)) {
        let remainingSeconds = Math.round(room.roomTimeout / 1000) - 1;

        $clock.html(remainingSeconds).fadeIn();
        clockInterval = setInterval(() => $clock.html(Math.max(--remainingSeconds, 0)), 1000);
    }
    else
        $clock.fadeOut();

    previousRoom = room;
}

function shouldRestartClock(newRoom, oldRoom) {
    if (newRoom.clients.length < newRoom.level.minPlayers)
        return false;

    if (!oldRoom)
        return true;

    return !_.isEqual(newRoom.clients, oldRoom.clients);
}

function loadAssets(connection, room) {
    $gameBackground.attr('src', config.assetsBaseUrl + '/' + room.level.background);
    $room.fadeOut('slow', () => {
        $loadingGame.fadeIn();
        assets.loadRoom(room, { $progress: $loadingProgress }).then(() => {
            connection.send('READY').on('message.GAME_STARTED', room => {
                let game = new Game(room, connection, gameCanvas);
                game.start();
                background.stop();
                $loadingGame.fadeOut('slow', () => {
                    $gameBackground.fadeIn('slow');
                    $game.fadeIn('slow');
                });
            });
        });
    });
}