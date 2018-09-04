import '../static/css/main.scss';
import './menu/index';

function requireAll(r) {r.keys().forEach(r);}
requireAll(require.context('../static/img/', true));

window.WebSocket = window.WebSocket || window.MozWebSocket;