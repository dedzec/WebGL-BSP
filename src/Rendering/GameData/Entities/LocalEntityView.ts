import {EngineCore} from "../../EngineCore";
import {vec3} from "gl-matrix";
import {WebSocketService} from "../../../Socket/WebSocketService";

export class LocalEntityView {
  private viewAngles!: vec3;
  private position!: vec3;
  constructor(private coreEngine: EngineCore, private socketService: WebSocketService) {
    this.getLocalViewAndPosition();
  }


  private getLocalViewAndPosition() {
    this.socketService.addSocketReceiver((d) => {
      const json = JSON.parse(d);

      if(json && json.local) {

        this.viewAngles = vec3.fromValues(json.local.viewAngles.y*-1,json.local.viewAngles.x*-1, json.local.viewAngles.z);
        this.position = vec3.fromValues(json.local.position.x,json.local.position.z+=json.local.vecView.z, json.local.position.y*-1);

        this.coreEngine.activeCamera.position = this.position;
        this.coreEngine.activeCamera.horizontalAngle = this.viewAngles[0];
        this.coreEngine.activeCamera.verticalAngle = this.viewAngles[1];

      }
    });
  }
}