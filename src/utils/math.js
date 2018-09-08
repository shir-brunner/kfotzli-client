module.exports = {
    median(values) {
        values.sort((a, b) => a - b);
        let half = Math.floor(values.length / 2);
        if (values.length % 2)
            return values[half];
        else
            return (values[half - 1] + values[half]) / 2.0;
    }
};