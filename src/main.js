require('../static/css/main.scss');
require('./menu');

const config = require('./config');
const moment = require('moment');

function requireAll(r) {r.keys().forEach(r);}
requireAll(require.context('../static/img/', true));

window.WebSocket = window.WebSocket || window.MozWebSocket;

console.logCopy = console.log.bind(console);
console.log = function () {
    this.logCopy(moment().format('YYYY-MM-DD HH:mm:ss') + ':', ...arguments);
};

if(config.debug.quickStart) {
    const $ = require('jquery');

    setTimeout(() => {
        $('#client-name').val('Player ' + _.random(1, 99));
        $('#connect-button-container .menu-button-lg').trigger('click');
    }, 10);
}