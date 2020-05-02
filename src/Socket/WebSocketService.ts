import {IEngineComponent} from "../Rendering/IEngineComponent";
import {Message} from "../Rendering/Messaging/Message";
import {EngineCore} from "../Rendering/EngineCore";
type socketReceiver = (d: string) => void;
export class WebSocketService implements IEngineComponent  {
  componentName: string = 'WebSocketService';

  socketMessageReceiver: socketReceiver[] = [];
  onMessage(message: Message) {
  }

  constructor(private coreEngine: EngineCore) {
    this.setup();
  }
  setup() {
    const url: string = 'ws://192.168.8.125:8080';
    const connection: WebSocket = new WebSocket(url);
    console.log('connecting..');

    connection.onerror = error => {
      const l = document.createElement('h1');
      l.innerText = 'ERROR CONNECTING!';
      document.body.appendChild(l);
      console.log(`WebSocket error: ${error}`);
    };

    connection.onopen = () => {
      connection.send('frontend connected');
    };
    connection.onmessage = (e: MessageEvent) => {
      this.handleSocketMessage(e.data);
    }
  }
  handleSocketMessage = (d: any) => {
    for(let receiver of this.socketMessageReceiver) {
      if(receiver) {
        receiver(d);
      }
    }
  }

  addSocketReceiver(receiver: socketReceiver) {
    this.socketMessageReceiver.push(receiver);
  }
}