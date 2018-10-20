const ms = require('ms');

module.exports = {
    debug: {
        showGameInfo: false,
        quickStart: true,
        fullLevelView: false,
        showNetworkCorrections: false,
        ignoreServer: false,
        showObjectsBounds: false,
        markLandedObjects: false
    },
    serverUrl: 'ws://localhost:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    pingsCount: 1,
    camera: {
        speed: 40,
        viewSize: { width: 2100, height: 1180 }
    },
    menu: {
        background: {
            defaultBackground: 'img/backgrounds/colored_land.png',
            slidingBackgrounds: [
                'img/backgrounds/colored_desert.png',
                'img/backgrounds/colored_grass.png',
                'img/backgrounds/colored_shroom.png',
            ],
            verticalMovementInterval: 5,
            horizontalMovementInterval: 20,
            scrollDownOnLoad: false
        }
    },
    smoothCorrection: {
        speed: 3
    },
    messageDuration: ms('2.5 seconds')
};