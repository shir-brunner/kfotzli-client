const ms = require('ms');

module.exports = {
    gravity: 1.5,
    animation: {
        changeRate: 100
    },
    squareSize: 80,
    fps: 30,
    bodyParts: {
        count: 15,
        expiration: 5000
    },
    respawnTime: ms('2 seconds')
};