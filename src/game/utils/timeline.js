const _ = require('lodash');

module.exports = class Timeline {
    constructor(maxHistorySize) {
        this.maxHistorySize = maxHistorySize;
        this.history = [];
    }

    set(time, state) {
        if (this.history.length >= this.maxHistorySize)
            this.history.shift();

        //remove any future values after "time"
        this.history = this.history.filter(entry => entry.time < time);
        this.history.push({ time: time, state: _.cloneDeep(state) });
    }

    at(time, strategy = 'floor') {
        let index = this.history.length - 1;
        let selectedEntryIndex = -1;

        while (index > -1) {
            let currentEntry = this.history[index];
            if (selectedEntryIndex === -1) {
                selectedEntryIndex = index;
            } else {
                if (currentEntry.time === time) {
                    selectedEntryIndex = index;
                    break;
                }

                let closestEntryDiff = Math.abs(this.history[selectedEntryIndex].time - time);
                let entryDiff = Math.abs(currentEntry.time - time);
                if (entryDiff < closestEntryDiff) {
                    selectedEntryIndex = index;
                }
            }
            index--;
        }

        let selectedEntry = this.history[selectedEntryIndex];
        if(selectedEntryIndex > 0 && strategy === 'floor' && selectedEntry.time !== time) {
            let prevEntry = this.history[selectedEntryIndex - 1];
            if(time < selectedEntry.time) {
                selectedEntry = prevEntry;
            }
        }

        return selectedEntry && selectedEntry.state;
    }

    getAllAfter(time) {
        return this.history.filter(entry => entry.time > time).map(entry => _.cloneDeep(entry));
    }

    clear() {
        this.history = [];
    }

    first() {
        return this.history[0];
    }
};