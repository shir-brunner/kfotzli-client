module.exports = {
    debug: {
        showGameInfo: false,
        quickStart: true,
        fullLevelView: false,
        preventNetworkCorrections: false,
        showNetworkCorrections: false
    },
    camera: {
        speed: 40,
        viewSize: { width: 1920, height: 1280 }
    },
    serverUrl: 'ws://localhost:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    pingsCount: 1,
    mispredictionDistance: 30,
    inputBufferSize: 10,
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