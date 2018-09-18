const Timeline = require('../src/game/utils/timeline');
const chalk = require('chalk');
const assert = (condition, message) => {
    if(!condition) {
        console.log(chalk.red.bold(message));
    }
};

const assertEquals = (actual, expected) => {
    assert(actual === expected, `expected ${actual} to equal ${expected}`);
};

const maxHistorySize = () => {
    let timeline = new Timeline(5);
    timeline.set(0, { x: 0 });
    timeline.set(100, { x: 2 });
    timeline.set(200, { x: 4 });
    timeline.set(300, { x: 6 });
    timeline.set(400, { x: 8 });
    timeline.set(500, { x: 8 });
    assert(timeline.history.length === 5, `Expected timeline history to be 5 but it is ${timeline.history.length}`);
};

const futureValuesShouldBeRemoved = () => {
    let timeline = new Timeline(5);
    timeline.set(0, { x: 0 });
    timeline.set(100, { x: 2 });
    timeline.set(200, { x: 4 });
    timeline.set(300, { x: 6 });
    timeline.set(100, { x: 8 });

    assert(timeline.history.length === 2, `Expected timeline history to be 2 but it is ${timeline.history.length}`);
    assert(timeline.history[0].time === 0, `timeline.history[0].time is not 0`);
    assert(timeline.history[0].state.x === 0, `timeline.history[0].state.x is not 0`);
    assert(timeline.history[1].time === 100, `timeline.history[1].time is not 100`);
    assert(timeline.history[1].state.x === 8, `timeline.history[1].state.x is not 8`);
};

const getHistory = () => {
    let timeline = new Timeline(5);
    timeline.set(0, { x: 0 });
    timeline.set(100, { x: 2 });
    timeline.set(200, { x: 4 });
    timeline.set(300, { x: 6 });
    timeline.set(400, { x: 8 });

    assertEquals(timeline.at(200).x, 4);
    assertEquals(timeline.at(260).x, 4);
    assertEquals(timeline.at(310).x, 6);
    assertEquals(timeline.at(500).x, 8);

    assertEquals(timeline.at(260, 'closest').x, 6);
};

const getAllAfter = () => {
    let timeline = new Timeline(5);
    timeline.set(0, { x: 0 });
    timeline.set(100, { x: 2 });
    timeline.set(200, { x: 4 });
    timeline.set(300, { x: 6 });
    timeline.set(400, { x: 8 });

    let allAfter = timeline.getAllAfter(300);
    assertEquals(allAfter[0].time, 400);
    assertEquals(allAfter[0].state.x, 8);
};

maxHistorySize();
futureValuesShouldBeRemoved();
getHistory();
getAllAfter();