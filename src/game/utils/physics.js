module.exports = {
    intersects(r1, r2) {
        return !(r2.x > (r1.x + r1.width) ||
            (r2.x + r2.width) < r1.x ||
            r2.y > (r1.y + r1.height) ||
            (r2.y + r2.height) < r1.y);
    },

    getDistance(obj1, obj2) {
        let a = obj1.x - obj2.x;
        let b = obj1.y - obj2.y;
        return Math.sqrt((a * a) + (b * b));
    },

    isPointInRect(point, rect) {
        return point.x > rect.x &&
            point.x < rect.x + rect.width &&
            point.y > rect.y &&
            point.y < rect.y + rect.height;
    },

    pointsEqual(point1, point2) {
        return point1.x === point2.x &&
            point1.y === point2.y;
    }
};