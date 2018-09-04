import { RenderObject } from "./RenderObject";
import { Face } from "../../BSP/Structs/Face";
import { BSP } from "../../BSP/BSP";
import { IRenderable, Visibility } from "./IRenderable";
import { LumpType } from "../../BSP/Lumps/LumpType";
import { VertexLump } from "../../BSP/Lumps/VertexLump";
import { POSITION_ATTRIB_LOCATION, NORMAL_ATTRIB_LOCATION, COLOR_ATTRIB_LOCATION } from "./UniformLocs";
import { FaceLump } from "../../BSP/Lumps/FaceLump";
import { ModelLump } from "../../BSP/Lumps/ModelLump";
import { EdgeLump } from "../../BSP/Lumps/EdgeLump";
import { SurfEdgeLump } from "../../BSP/Lumps/SurfEdgeLump";
import { vec3, vec4 } from "gl-matrix";
import { PlaneLump } from "../../BSP/Lumps/PlaneLump";
import { Edge } from "../../BSP/Structs/Edge";
import { addRange } from "../../Utils/AddRange";
import { BSPFace } from "./BSPFace";
import { zip } from "../../Utils/ZipArray";
import { Vertex } from "../../Structs/Vertex";
import { TexInfoLump } from "../../BSP/Lumps/TexInfoLump";
import { TexDataLump } from "../../BSP/Lumps/TexDataLump";

export class BSPRenderObject implements IRenderable {
	public visibility = Visibility.Visible;
	public VAO!: WebGLVertexArrayObject;
	public VBO!: WebGLBuffer;
	public EAO!: WebGLBuffer; // index buffer
	private modelCount!: number;
	private initialized = false;
	private renderMode = WebGL2RenderingContext.TRIANGLES;
	private bsp: BSP;
	private vertexCount = 0;

	private vertices: number[];
	private faces: BSPFace[];
	private indices: number[];

	// private dispVertices: number[];
	// private dispIndices: number[];

	constructor(gl: WebGL2RenderingContext, bsp: BSP) {
		this.bsp = bsp;
		
		const faceLump = bsp.readLump(LumpType.Faces) as FaceLump;

		this.vertices = [];
		this.faces = [];
		this.indices = [];

		let currentIndex = 0;
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < faceLump.faces.length; i++) {
			const face = faceLump.faces[i];
			const bspFace = new BSPFace(face, bsp);
			this.faces.push(bspFace);
			
			// add vertices to mesh
			bspFace.calcIndices(currentIndex);
			addRange(this.vertices, bspFace.getMesh());

			// dont add hidden faces to the indices
			if (bspFace.visibility === Visibility.Visible) {
				addRange(this.indices, bspFace.indices);
			}

			if (bspFace.dispInfo != null) {
				// highest index of element will be it's second to last index
				currentIndex = bspFace.indices[bspFace.indices.length - 2] + 1;
			} else {
				// highest index of element will be it's last index
				currentIndex = bspFace.indices[bspFace.indices.length - 1] + 1;
			}
		}

		this.vertexCount = this.indices.length;
		// console.log(this.indices);
		// console.log(this.vertices);
			
		// create buffers
		const _vbo = gl.createBuffer();
		const _vao = gl.createVertexArray();
		const _eao = gl.createBuffer();

		// check buffer creation was successful
		if (_vbo == null) {
			console.log("Failed to generate VBO");
			return;
		}
		
		if (_vao == null) {
			console.log("Failed to generate VAO");
			return;
		}
		
		if (_eao == null) {
			console.log("Failed to generate EAO");
			return;
		}
		this.VBO = _vbo;
		this.VAO = _vao;
		this.EAO = _eao;

		// bind buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);

		// buffer vertex data
		gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(this.vertices), gl.STATIC_DRAW);

		// create vertex position VAO
		gl.bindVertexArray(this.VAO);
		gl.vertexAttribPointer(
			POSITION_ATTRIB_LOCATION, // attribute location
			3,					      // size of attribute (vec3)
			gl.FLOAT,				  // type of attribute is float
			false,					  // does not need to be normalized
			40,						  // 0 = move forward size * sizeof(type) each iteration to get the next position
			0						  // offset (start at beginnng of buffer)
		);
		gl.enableVertexAttribArray(POSITION_ATTRIB_LOCATION);

		// define normal VAO
		gl.vertexAttribPointer(
			NORMAL_ATTRIB_LOCATION,   // attribute location
			3,					      // size of attribute (vec3)
			gl.FLOAT,				  // type of attribute is float
			true,					  // does need to be normalized
			40,						  // 0 = move forward size * sizeof(type) each iteration to get the next position
			12						  // offset (start at beginnng of buffer)
		);
		gl.enableVertexAttribArray(NORMAL_ATTRIB_LOCATION);

		// define color VAO
		gl.vertexAttribPointer(
			COLOR_ATTRIB_LOCATION,   // attribute location
			4,					      // size of attribute (vec4)
			gl.FLOAT,				  // type of attribute is float
			false,					  // does not need to be normalized
			40,						  // 0 = move forward size * sizeof(type) each iteration to get the next position
			24						  // offset (start at beginnng of buffer)
		);
		gl.enableVertexAttribArray(COLOR_ATTRIB_LOCATION);

		// create EAO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EAO);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint32Array(this.indices),
			gl.STATIC_DRAW
		);

		this.initialized = true;

		console.log("BSP Loaded");
	}

	public draw(gl: WebGL2RenderingContext, renderModeOverride?: number) {
		if (!this.initialized) {
			console.log("Cannot render object, not initialized");
			return;
		}
		if (this.visibility === Visibility.Hidden) {
			return;
		}

		gl.bindVertexArray(this.VAO);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EAO);

		if (renderModeOverride == null) {
			gl.drawElements(this.renderMode, this.vertexCount, gl.UNSIGNED_INT, 0);
		} else {
			gl.drawElements(renderModeOverride, this.vertexCount, gl.UNSIGNED_INT, 0);
		}
	}
}