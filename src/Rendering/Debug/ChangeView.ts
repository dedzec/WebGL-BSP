import { ICamera, MoveDirection } from "../Camera/ICamera";
import { EngineCore } from "../EngineCore";
import { IEngineComponent } from "../IEngineComponent";
import { Message, MessageType, MessagePriority } from "../Messaging/Message";
import { MessageQueue } from "../Messaging/MessageQueue";
import {vec2, vec3} from "gl-matrix";


export class ChangeView implements IEngineComponent {
    public componentName = "ChangeView";
    public listen = true;

    constructor(coreEngine: EngineCore) {
        window['setPos'] = (x: number, y: number, z: number) => {
            coreEngine.messageQueue.add(new Message(coreEngine, this, MessageType.SetPos, vec3.fromValues(x, y,z)));
        };

        window['setAng'] = (x: number, y: number, z: number) => {
            coreEngine.messageQueue.add(new Message(coreEngine, this, MessageType.SetAng, vec3.fromValues(x, y,z)));
        };

    }


    public onMessage(message: Message) {

    }
}