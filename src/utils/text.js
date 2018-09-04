const $ = require('jquery');

module.exports = {
    htmlEncode(value) {
        return $('<div/>').text(value).html();
    }
};