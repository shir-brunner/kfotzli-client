const $ = require('jquery');

module.exports = {
    htmlEncode(value) {
        return $('<div/>').text(value).html();
    },

    capitalize(string) {
        return string.replace(/\b\w/g, l => l.toUpperCase());
    }
};