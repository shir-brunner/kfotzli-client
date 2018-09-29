const config = require('../../config');
const commonConfig = require('../common_config');

class Debug {
    constructor() {
        this.debugPoints = [];
        this.debugTexts = [];
        this.info = [];
    }

    point(x, y, color, text) {
        this.debugPoints.push({ x: x, y: y, color: color, text: text });
    }

    log(text) {
        if(this.debugTexts.length > 5)
            this.debugTexts.shift();

        this.debugTexts.push(text);
    }

    renderDebugTexts(context) {
        this.debugTexts.forEach((text, index) => {
            context.font = "20px Arial";
            context.fillText(text, 20, ((index + 1 + this.info.length) * 45) + 130);
        });
    }

    renderDebugPoints(context) {
        let odd = false;
        this.debugPoints.forEach(point => {
            odd = !odd;

            let radius = 10;
            context.beginPath();
            context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = point.color || 'red';
            context.fill();
            context.stroke();
            if(point.text) {
                context.font = "30px Arial";
                context.fillText(point.text, point.x + 20, point.y + radius);
            }
            context.font = "12px Arial";
            let pointY = point.y - radius - 15;
            if(odd)
                pointY -= 20;
            context.fillText('(' + Math.round(point.x) + ', ' + Math.round(point.y) + ')', point.x, pointY);
        });
    }

    clearPoints(filter) {
        this.debugPoints = filter ? this.debugPoints.filter(p => !filter(p)) : [];
    }

    clearLog() {
        this.debugTexts = [];
    }

    setDebugInfo(deltaTime, game) {
        let desiredFrameRate = Math.round(1000 / commonConfig.fps);

        this.info = [
            'DESIRED FPS: ' + commonConfig.fps + ', ACTUAL: ' + Math.round(1000 / deltaTime),
            'DESIRED FRAME RATE: ' + desiredFrameRate + ' MS, ACTUAL: ' + deltaTime + ' MS',
        ];

        this.info.push(...game.world.players.map(player => {
            return `${player.name}:  X = ${Math.round(player.x)}, Y = ${Math.round(player.y)}, VERTICAL SPEED: ${Math.round(player.verticalSpeed)}` + (player.isLocal ? ' (LOCAL)' : '');
        }));
    }

    renderDebugInfo(context) {
        if(!config.debug.showGameInfo)
            return;

        this.info.forEach((text, index) => {
            context.font = "20px Arial";
            context.fillText(text, 20, ((index + 1) * 45) + 130);
        });
    }
}

module.exports = new Debug();