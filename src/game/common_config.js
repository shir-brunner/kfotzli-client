const ms = require('ms');

module.exports = {
    gravity: 1.5,
    animation: {
        changeRate: 60
    },
    squareSize: 100,
    fps: 45,
    bodyParts: {
        count: 15,
        expiration: 5000
    },
    respawnTime: ms('2 seconds')
};