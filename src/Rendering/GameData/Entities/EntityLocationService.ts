import {WebSocketService} from "../../../Socket/WebSocketService";
import {EngineCore} from "../../EngineCore";
import {vec3} from "gl-matrix";
import {BSP} from "../../../BSP/BSP";
import {BSPResourceManager} from "../../RenderObjects/BSPResourceManager";
import {BSPFace} from "../../RenderObjects/BSP/BSPFace";


export class EntityLocationService {
  private _entityPositions: vec3[] = [];
  private resourceManager: BSPResourceManager;

  constructor(private coreEngine: EngineCore, private socketService: WebSocketService, private bsp: BSP) {
    this.mapPlayerData();
    this.resourceManager = new BSPResourceManager(this.coreEngine.gl, this.bsp);
  }

  private mapPlayerData() {
    this.socketService.addSocketReceiver((d) => {
      const json = JSON.parse(d);
      if(json && json.entities) {
        this._entityPositions = json.entities.map((data: {x: number; y: number; z: number;}) => vec3.fromValues(data.x,data.y,data.z));
      }
    });
  }

  public getEntityPositions = (): vec3[] => this._entityPositions;

}