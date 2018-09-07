const _ = require('lodash');

module.exports = class Timeline {
    constructor() {
        this.history = [];
        this.maxHistorySize = 20;
    }

    set(state, time) {
        this.history.push({
            time: time,
            state: _.cloneDeep(state),
        });

        //TODO: if has future values after "time", remove them from history

        if (this.history.length > this.maxHistorySize)
            this.history.shift();
    }

    at(time, interpolate = true) {

    }
};