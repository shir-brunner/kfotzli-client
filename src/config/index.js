module.exports = {
    debug: {
        showGameInfo: false,
        quickStart: false,
        fullLevelView: false,
        showNetworkCorrections: false,
        disableSmoothCorrection: true //TODO: improve this and re enable
    },
    serverUrl: 'ws://192.168.14.56:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    pingsCount: 1,
    camera: {
        speed: 40,
        viewSize: { width: 1920, height: 1280 }
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
            horizontalMovementInterval: 20
        }
    },
    smoothCorrection: {
        speed: 3
    }
};