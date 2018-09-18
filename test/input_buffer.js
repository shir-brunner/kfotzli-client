const InputBuffer = require('../src/game/input/input_buffer');
const chalk = require('chalk');
const assert = (condition, message) => {
    if(!condition) {
        console.log(chalk.red.bold(message));
    }
};

const assertEquals = (actual, expected) => {
    assert(actual === expected, `expected ${actual} to equal ${expected}`);
};

const testInputBuffer = () => {
    let inputBuffer = new InputBuffer();

    inputBuffer.addInput({ frame: 10, keyCode: 39, isPressed: true });
    inputBuffer.addInput({ frame: 20, keyCode: 39, isPressed: false });
    inputBuffer.addInput({ frame: 30, keyCode: 39, isPressed: true });
    inputBuffer.addInput({ frame: 40, keyCode: 39, isPressed: false });

    assertEquals(inputBuffer.at(20).frame, 20);
    assertEquals(inputBuffer.at(22).frame, 20);
    assertEquals(inputBuffer.at(28).frame, 20);
    assertEquals(inputBuffer.at(30).frame, 30);

    inputBuffer.removeOldInputs(20);
    assertEquals(inputBuffer.buffer.length, 3);
    assertEquals(inputBuffer.buffer[0].frame, 20);
};

testInputBuffer();