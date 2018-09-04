module.exports = {
    serverUrl: 'ws://localhost:4001',
    language: 'hebrew',
    assetsBaseUrl: 'diststatic',
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