import WebSocket from "ws"
import type {hero,map,mob} from "./types/types"
interface User {
    world: string,
    chash: string,
    hs3: string,
    mchar_id: number,
    user_id: number,
}

interface Instance {
    browser_token: string;
    ev: number;
}

class socketHandler {
    get: URLSearchParams;
    instance: Instance;
    dataToSend: string;

    constructor(instance: Instance, dataToSend: string = "") {
        this.get = new URLSearchParams();
        this.instance = instance;
        this.dataToSend = dataToSend;
    }

    addData(key: string, value: string) {
        if (this.get.has(key)) {
            this.get.set(key, value);
        } else {
            this.get.append(key, value);
        }
    }

    handleMessages(data: WebSocket.Data) {
        try {
            const message = typeof data === 'string' ? data : data.toString('utf8');
            const parsedMessage = JSON.parse(message);
            if(parsedMessage?.t === "stop"){
                console.log(parsedMessage?.alert);
                process.exit(0)
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    
    construct() {
        if (this.instance.ev) {
            this.addData("ev", this.instance.ev.toString());
        }
        if (this.instance.browser_token) {
            this.addData("browser_token", this.instance.browser_token);
        }
        return { g: decodeURIComponent(this.get.toString()), p: this.dataToSend };
    }
}

class Engine {
    socketHandler: socketHandler;
    user: User;
    instance: Instance;

    constructor(user: User) {
        this.instance = {
            browser_token: "",
            ev: 0
        };
        this.socketHandler = new socketHandler(this.instance);
        this.user = user;
    }


    async sendInitMessages(engine: WebSocket) {
        for (let init = 1; init < 5; init++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            this.socketHandler.addData('t', init < 5 ? 'init' : '_');
            this.socketHandler.addData('initlvl', init.toString());
            this.socketHandler.addData('clientTs', (Date.now() / 1000).toString());
            this.socketHandler.addData('mucka', Math.random().toString());
            const initData = this.socketHandler.construct()
            console.log("Sending:", initData);
            engine.send(JSON.stringify(initData));
        }
    }

    connect() {
        const cookieString = Object.entries(this.user)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

            const options = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36",
                    "Origin": `https://${this.user.world}.margonem.pl`,
                    "Referer": `https://${this.user.world}.margonem.pl`,
                    "Host": `${this.user.world}.margonem.pl`,
                    "Cookie": cookieString
                }
            };
        const engine = new WebSocket(`wss://${this.user.world}.margonem.pl/ws-engine`, options);

        engine.on('message', (data: WebSocket.Data) => {
            this.socketHandler.handleMessages(data);
        });

        engine.onopen = () => {
            this.sendInitMessages(engine);
        };
    }
}

new Engine({
    world: "gordion",
    chash: "exampleChash",
    hs3: "exampleHs3",
    mchar_id: 1,
    user_id: 1
}).connect();
