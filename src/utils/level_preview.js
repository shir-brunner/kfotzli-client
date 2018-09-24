const $ = require('jquery');
const config = require('../config');

module.exports = {
    appendTo($target, level, { showSize, height, width } = {}) {
        if (!level.background)
            return;

        let $levelPreview = $('<div class="level-preview"></div>');
        $target.empty().append($levelPreview);
        let $background = $('<img style="width: 100%; height: 100%; border-radius: 10px;" src="' + config.assetsBaseUrl + '/' + level.background + '" />');
        $levelPreview.append($background);

        let previewWidth = width || $levelPreview.width();
        if (height === 'auto')
            height = $levelPreview.parent().height();

        let previewHeight = height || (previewWidth / (level.size.width / level.size.height));
        $levelPreview.css('height', previewHeight);
        $levelPreview.css('width', previewWidth);

        level.gameObjects.forEach(gameObject => {
            if(gameObject.invisible)
                return;

            let $gameObject = $('<img src="' + config.assetsBaseUrl + '/' + gameObject.image + '" />');
            $gameObject.css({
                position: 'absolute',
                left: gameObject.x / level.size.width * previewWidth,
                top: gameObject.y / level.size.height * previewHeight,
                width: 100 / level.size.width * previewWidth,
                height: 100 / level.size.height * previewHeight,
            });
            $levelPreview.append($gameObject);
        });

        (level.gameplay.flags || []).forEach(flag => {
            let $flag = $('<img src="' + config.assetsBaseUrl + '/' + flag.image + '" />');
            $flag.css({
                position: 'absolute',
                left: flag.x / level.size.width * previewWidth,
                top: flag.y / level.size.height * previewHeight,
                width: 100 / level.size.width * previewWidth,
                height: 100 / level.size.height * previewHeight,
            });
            $levelPreview.append($flag);
        });

        if (showSize) {
            let $size = $('<div class="level-preview-size">' + level.size.width + 'x' + level.size.height + '</div>');
            $levelPreview.append($size);
        }

        return $levelPreview;
    }
};