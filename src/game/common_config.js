const ms = require('ms');

module.exports = {
    gravity: 2,
    animation: {
        changeRate: 60
    },
    squareSize: 100,
    fps: 60,
    bodyParts: {
        count: 15,
        expiration: 4000
    },
    respawnTime: ms('2 seconds')
};