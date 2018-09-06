class Connection {
    constructor(url) {
        this._connection = new WebSocket(url);
        this._messageHandlers = {};
        this._connection.addEventListener('message', event => {
            let message = JSON.parse(event.data);
            if(this._messageHandlers[message.type])
                this._messageHandlers[message.type](message.body);
        });
    }

    on(eventName, callback) {
        if (_.startsWith(eventName, 'message.'))
            this._messageHandlers[eventName.slice('message.'.length)] = callback;
        else
            this._connection.addEventListener(eventName, callback);

        return this;
    }

    off(eventName) {
        if (_.startsWith(eventName, 'message'))
            delete this._messageHandlers[eventName.slice('message.'.length)];
        else
            this._connection.removeEventListener(eventName);

        return this;
    }

    send(messageType, body) {
        this._connection.send(JSON.stringify({
            type: messageType,
            body: body
        }));

        return this;
    }

    close() {
        this._connection.close();
    }
}

module.exports = Connection;