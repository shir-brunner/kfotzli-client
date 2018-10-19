const Snow = require('./snow');
const Rain = require('./rain');
const Sun = require('./sun');

module.exports = class WeatherFactory {
    getWeather(level) {
        switch (level.weather) {
            case 'snow':
                return new Snow(level);
            case 'rain':
                return new Rain(level);
        }

        return new Sun(level);
    }
};