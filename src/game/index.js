const Renderer = require('./renderer');
const Engine = require('./engine');

module.exports = class Game {
    constructor(room) {
        this._room = room;
        this._renderer = new Renderer();
        this._engine = new Engine();
    }

    start() {
        this._engine.run();
    }
};