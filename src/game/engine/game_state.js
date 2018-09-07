const _ = require('lodash');
const Timeline = require('./timeline');

module.exports = class GameState {
    constructor({ players, gameObjects}) {
        this.players = players;
        this.gameObjects = gameObjects;
    }

    update(delta, ticks) {
        this.players.forEach(player => player.update(delta, ticks));
        this.gameObjects.forEach(gameObject => gameObject.update(delta, ticks));
    }

    render(context) {
        this.players.forEach(player => player.render(context));
        this.gameObjects.forEach(gameObject => gameObject.render(context));
    }
};
