const Promise = require('bluebird');
const _ = require('lodash');
const config = require('../config');

class Assets {
    constructor() {
        this._images = {};
    }

    getImage(url) {
        if(!this._images[url])
            throw new Error(`Image "${url} does not exist in assets."`);

        return this._images[url];
    }

    loadRoom(room, options = {}) {
        let imageUrls = this._getRoomImages(room);
        let loadedCount = 0;

        return Promise.map(imageUrls, imageUrl => {
            return new Promise((resolve, reject) => {
                let image = new Image();
                image.onload = () => {
                    loadedCount++;
                    options.$progress && options.$progress.html(`${Math.round(loadedCount / imageUrls.length * 100)}%`);
                    resolve();
                };
                image.src = `${config.assetsBaseUrl}/${imageUrl}`;
                this._images[imageUrl] = image;
            });
        });
    }

    _getRoomImages(room) {
        let imageUrls = [room.level.background];

        room.level.gameObjects.forEach(gameObject => {
            imageUrls.push(gameObject.image);
            imageUrls.push(...this._getImagesFromAnimations(gameObject.animations));
        });

        room.clients.forEach(client => {
            imageUrls.push(client.character.image);
            imageUrls.push(...this._getImagesFromAnimations(client.character.animations));
        });

        return _.uniq(imageUrls);
    }

    _getImagesFromAnimations(animations = {}) {
        let imageUrls = [];
        Object.keys(animations).forEach(animationType => {
            let animation = animations[animationType];
            animation.frames && imageUrls.push(...animation.frames);
        });
        return imageUrls;
    }
};

module.exports = new Assets();