const $ = require('jquery');
const textUtil = require('./text');
const $body = $('body');

module.exports = {
    showDialog(options = {}) {
        $body.find('.dialog-overlay').remove();
        let $dialogOverlay = $('<div class="dialog-overlay no-select"></div>').hide();
        let $dialog = $('<div class="dialog slot horizontal"></div>').appendTo($dialogOverlay);
        $dialog.append($('<div class="slot-head">' + textUtil.htmlEncode(options.title) + '</div>'));
        $dialog.append($('<div class="content">' + options.content + '</div>'));
        let $buttons = $('<div class="buttons"></div>').appendTo($dialog);

        if (options.buttons)
            options.buttons.forEach(button => $buttons.append(this._formatButton(button)));

        $dialogOverlay.appendTo($body).fadeIn();
        return $dialog;
    },

    _formatButton(button) {
        let $button = $('<div class="menu-button-lg button blue">' + textUtil.htmlEncode(button.text) + '</div>');
        $button.on('click', button.onClick);
        return $button;
    },

    closeDialog() {
        $body.find('.dialog-overlay').fadeOut(function () {
            $(this).remove();
        });
    }
};