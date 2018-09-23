const textUtil = require('./text');
const config = require('../config');
const $ = require('jquery');

module.exports = {
    complexBar() {
        let $complexBar = $('<div class="complex-bar"></div>');

        let html = '';
        html += '<div class="square"></div>';
        html += '<div class="wide"></div>';
        html += '<div class="left"></div>';
        html += '<div class="right"></div>';

        return $complexBar.html(html);
    },

    largeButton(text) {
        let $button = $('<div class="menu-button-lg red">' + textUtil.htmlEncode(text) + '</div>');
        return $button;
    },

    extraLargeButton(title, image) {
        let html = '';

        html += '<div class="menu-button-xl">';
        html += '   <img src="' + config.assetsBaseUrl + '/img/buttons/' + image + '" />';
        html += '   <h3>' + textUtil.htmlEncode(title) + '</h3>';
        html += '</div>';

        return $(html);
    }
};