const ms = require('ms');

module.exports = {
    gravity: 2,
    animationChangeRate: 80,
    squareSize: 100,
    fps: 30,
    bodyParts: {
        count: 30,
        expiration: 5000
    },
    respawnTime: ms('2 seconds')
};