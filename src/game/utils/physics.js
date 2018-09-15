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
    }
};