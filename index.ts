class socketHandler {
    get: URLSearchParams;

    constructor() {
        this.get = new URLSearchParams();
    }

    addData(key: string, value: string) {
        if (this.get.has(key)) {
            this.get.set(key, value);
        } else {
            this.get.append(key, value);
        }
    }

    handleMessages(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data);
            console.log(message);
        } catch (error) {
            console.log(error);
        }
    }

    construct() {

    }
}

class Engine {
    browser_token?: string;
    ev?: number;
    socketHandler: socketHandler;

    constructor() {
        this.socketHandler = new socketHandler();
    }

    connect() {
        const ws = new WebSocket("");
        ws.onopen = () => {

        }
        ws.onmessage = this.socketHandler.handleMessages.bind(this.socketHandler);
        
        for (let i = 0; i < 5; i++) {
            console.log(`init=${i}`)
        }
    }
}

new Engine().connect();
