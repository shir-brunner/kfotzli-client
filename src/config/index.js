const ms = require('ms');

module.exports = {
    debug: {
        showGameInfo: true,
        quickStart: true,
        fullLevelView: true,
        stopGameAfter: ms('0 seconds')
    },
    serverUrl: 'ws://localhost:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    fps: 30,
    menu: {
        background: {
            defaultBackground: 'img/backgrounds/colored_land.png',
            slidingBackgrounds: [
                'img/backgrounds/colored_desert.png',
                'img/backgrounds/colored_grass.png',
                'img/backgrounds/colored_shroom.png',
            ],
            verticalMovementInterval: 5,
            horizontalMovementInterval: 20
        }
    },
};