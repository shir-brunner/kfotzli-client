const getClosest = require('get-closest');

module.exports = class InputBuffer {
    constructor(bufferSize) {
        this.buffer = [];
        this.bufferSize = bufferSize;
    }

    addInput(input) {
        if (this.buffer.length >= this.bufferSize)
            this.buffer.shift();

        this.buffer.push(input);
    }

    at(frame) {
        let index = getClosest.lowerNumber(frame, this.buffer.map(input => input.frame));
        return this.buffer[index];
    }

    removeOldInputs(untilFrame) {
        this.buffer = this.buffer.filter(input => input.frame >= untilFrame);
    }
};