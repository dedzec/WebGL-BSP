import {ShaderSource} from "./ShaderSource";

// export class ShaderProgram {
    
// }

export function CreateShaderProgram(gl: WebGL2RenderingContext, sourceShaders: ShaderSource[]): WebGLProgram | null {
    console.log("--Initializing Shaders--");
    console.log("   Number of shaders: " + sourceShaders.length);
    
    const compiledShaders: WebGLShader[] = [];

    // compile each shader and filter out those that failed
    sourceShaders.forEach((shader) => {
        const compiledShader = LoadShader(gl, shader);
        if (compiledShader != null) {
            compiledShaders.push(compiledShader);
        }
    });

    // attach shaders to the program
    const shaderProgram = gl.createProgram();
    compiledShaders.forEach((shader) => {
        // @ts-ignore
        gl.attachShader(shaderProgram, shader);
    });
// @ts-ignore
    gl.linkProgram(shaderProgram);

    // check for errors
    // @ts-ignore
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        // @ts-ignore
        console.log("Unable to initialize shader program: " + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    // cleanup
    // compiledShaders.forEach(shader => {
    //     gl.detachShader(shaderProgram, shader);
    // });

    return shaderProgram;
}

export function LoadShader(gl: WebGL2RenderingContext, shaderSource: ShaderSource): WebGLShader | null {
    const shader: WebGLShader | null = gl.createShader(shaderSource.type);

    // compile shader
    // @ts-ignore
    gl.shaderSource(shader, shaderSource.source);
    // @ts-ignore
    gl.compileShader(shader);

    // check for errors
    // @ts-ignore
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("----------Failed to compile shader----------\n" + shaderSource.source);
        // @ts-ignore
        console.log("Info log: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// function loadTextFile(url: string, callback: Function, gl: WebGLRenderingContext): void {
//     var request: XMLHttpRequest = new XMLHttpRequest();
//     request.open("GET", url, true);
//     request.addEventListener("load", function(): void {
//         callback(request.responseText, gl, urlToShaderType(url, gl));
//     });
//     request.send();
// }

// function urlToShaderType(url: string, gl: WebGLRenderingContext): GLenum | null {
//     // get extension
//     const extension: string | undefined = url.split(".").pop();

//     switch (extension) {
//         case "vert":
//             return gl.VERTEX_SHADER;

//         case "frag":
//             return gl.FRAGMENT_SHADER;

//         default:
//             return null;
//     }
// }