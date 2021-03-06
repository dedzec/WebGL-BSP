import { CameraState } from "../Camera/CameraState";

export interface IRenderable {
	visibility: Visibility;
	draw(gl: WebGL2RenderingContext, cameraState?: CameraState, renderTypeOverride?: number): void;

	// update(); TODO: for updating game state
}

export enum Visibility {
	Visible,
	Hidden,
}