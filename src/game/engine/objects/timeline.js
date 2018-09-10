const _ = require('lodash');

module.exports = class Timeline {
    constructor() {
        this.history = [];
        this.maxHistorySize = 30;
    }

    set(gameTime, state) {
        //remove any future values after "gameTime"
        this.history = this.history.filter(entry => entry.gameTime < gameTime);
        this.history.push({ gameTime: gameTime, state: _.cloneDeep(state) });

        if (this.history.length >= this.maxHistorySize)
            this.history.shift();
    }

    at(gameTime, interpolate = true) {
        let index = this.history.length - 1;
        let closestEntryIndex = -1;

        while (index > -1) {
            let entry = this.history[index];
            if (closestEntryIndex === -1) {
                closestEntryIndex = index;
            } else {
                let closestEntryDiff = Math.abs(this.history[closestEntryIndex].gameTime - gameTime);
                let entryDiff = Math.abs(entry.gameTime - gameTime);
                if (entryDiff < closestEntryDiff) {
                    closestEntryIndex = index;
                }
            }
            index--;
        }

        if (interpolate) {
            //TODO: interpolate
        }

        return this.history[closestEntryIndex] && this.history[closestEntryIndex].state;
    }
};