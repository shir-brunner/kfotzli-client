module.exports = {
    debug: {
        showFps: true,
        quickStart: true,
        fullLevelView: false,
    },
    serverUrl: 'ws://localhost:4001',
    squareSize: 100,
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
    fps: 30,
    menu: {
        background: {
            defaultBackground: require('../../static/img/backgrounds/colored_land.png'),
            slidingBackgrounds: [
                require('../../static/img/backgrounds/colored_desert.png'),
                require('../../static/img/backgrounds/colored_grass.png'),
                require('../../static/img/backgrounds/colored_shroom.png'),
            ],
            verticalMovementInterval: 5,
            horizontalMovementInterval: 20
        }
    },
};