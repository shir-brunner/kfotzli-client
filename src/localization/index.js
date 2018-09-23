const config = require('../config');
const hebrew = require('./translations/hebrew');
const english = require('./translations/english');
const _ = require('lodash');

class Localization {
    constructor() {
        this._language = config.language || 'english';
        this._translations = {
            hebrew: hebrew,
            english: english
        };
    }

    translate(entry, params = {}) {
        let translated = _.get(this, `_translations.${this._language}.${entry}`, entry);
        Object.keys(params).forEach(key => translated = translated.replace('{{' + key + '}}', params[key]));
        return translated;
    }
}

module.exports = new Localization();