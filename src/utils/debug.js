const $ = require('jquery');

let $body = $('body');
let $debugs = $('<div id="debugs"></div>').appendTo($body);
$debugs.css({
    position: 'absolute',
    left: 20,
    top: 20,
    'font-size': '30px',
    'font-family': 'arial',
    'z-index': 100
});

module.exports = text => {
    let $debug = $('<div></div>');
    $debugs.append($debug);

    if(Array.isArray(text)) {
        $debug.html(text.join('<br/>'));
    } else {
        $debug.html(text);
    }

    return $debug;
};