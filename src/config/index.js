module.exports = {
    debug: {
        showGameInfo: false,
        quickStart: true,
        fullLevelView: false,
        preventNetworkCorrections: false,
        showNetworkCorrections: true
    },
    camera: {
        speed: 40,
        viewSize: { width: 1920, height: 1280 }
    },
    serverUrl: 'ws://192.168.14.56:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    pingsCount: 5,
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