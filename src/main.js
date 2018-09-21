require('../static/css/main.scss');
require('./menu');

const config = require('./config');

function requireAll(r) {r.keys().forEach(r);}
requireAll(require.context('../static/img/', true));

window.WebSocket = window.WebSocket || window.MozWebSocket;

if(config.debug.quickStart) {
    const $ = require('jquery');

    setTimeout(() => {
        $('#client-name').val('Player ' + _.random(1, 99));
        $('#connect-button-container .menu-button-lg').trigger('click');
    }, 10);
}