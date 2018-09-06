const $ = require('jquery');
const _ = require('lodash');
const config = require('../config');

let velocity = 1;
let backgroundReadyCallback = null;
let defaultBackgroundUrl = config.menu.background.defaultBackground;
let $background = $('#menu .background').attr('src', defaultBackgroundUrl);
let $background2 = $background.clone();
let imageSize = $(window).width();
$background.css({ width: imageSize, height: imageSize });
let backgroundY = 0;
let backgroundX = 0;
let background2X = 0;
let backgroundInterval = setInterval(() => {
    $background.css({ top: backgroundY-- });

    let stopY = -450;
    if (backgroundY <= stopY) {
        $background.after($background2);
        $background2.css({ width: imageSize, height: imageSize, left: imageSize, top: stopY + 3 });
        background2X = imageSize;
        startMovingHorizontally();
        backgroundReadyCallback && backgroundReadyCallback();
    }
}, _.get(config, 'menu.background.verticalMovementInterval', 5));

function startMovingHorizontally() {
    clearInterval(backgroundInterval);
    backgroundInterval = setInterval(moveHorizontally, _.get(config, 'menu.background.horizontalMovementInterval', 15));
}

function moveHorizontally() {
    $background.css({ left: backgroundX -= velocity });
    $background2.css({ left: background2X -= velocity });

    if (backgroundX < 0 - imageSize)
        backgroundX = imageSize - 1;

    if (background2X < 0 - imageSize) {
        background2X = imageSize - 1;
        if (_.random(0, 2) === 0) {
            $background2.attr('src', getRandomBackgroundUrl());
        } else {
            $background2.attr('src', defaultBackgroundUrl);
        }
    }
}

function getRandomBackgroundUrl() {
    let slidingBackgrounds = config.menu.background.slidingBackgrounds;
    let index = _.random(0, slidingBackgrounds.length - 1);
    return slidingBackgrounds[index];
}

module.exports = {
    onBackgroundReady(callback) {
        backgroundReadyCallback = callback;
    },
    start() {
        startMovingHorizontally();
    },
    stop() {
        clearInterval(backgroundInterval);
    }
};