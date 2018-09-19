module.exports = {
    isControllerPressed(controller) {
        return controller.isLeftPressed ||
            controller.isRightPressed ||
            controller.isUpPressed ||
            controller.isDownPressed;
    },

    emptyController() {
        return {
            isLeftPressed: false,
            isRightPressed: false,
            isUpPressed: false,
            isDownPressed: false
        };
    }
};