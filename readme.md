# Mingl

#### mini webgl library 
[demo]()

Mingl is a webgl library contained in [minigl.js](minigl.js)

It operates on thea model of program objects with geometry and shaders. These are specified by the properies `arrays`, `shaders` and `uniforms`. The specification is similar to [twgl](https://twgljs.org/).

It's intended for use with [dat.gui](https://github.com/dataarts/dat.gui) and provides a wapper to simplify the specification of gui controls. This along with an OBJ loader are in `/lib`.

The primary functions are:
    `createShaderProgram` 
    `setBuffers` 
    `enableAttributes` 
    `useProgram`
    `setUniforms` 
    `drawObj` 
    `loadTextures` 
    `setSubPgms`
    `setTargets`

---

#### Example:

```js
import * as mgl from "./minigl.js";
import {initGui} from './lib/gui.js';

const vs =`#version 300 es
    in vec3 position;
    void main() {
        gl_Position = vec4(position, 1.);
    }
`;

const fs = `#version 300 es
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform float scale;
    out vec4 fragColor;
    
    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy*3.33;
        vec3 col = 0.5 + 0.5*cos(time + uv.xyx*scale + vec3(0., 2., 3.));
        fragColor = vec4(col, 1);
    }
`;

const pgm = {
    arrays: {
        position: {
            components: 3,
            data: [-1,-1,1, 1,1,1, -1,1,1, -1,-1,1, 1,-1,1, 1,1,1],
        }
    },
    shader: {
        vs: vs,
        fs: fs
    },
    uniforms: {
        scale: .5
    },
    setup: (gl, pgm) => {},
};

pgm.gui = {
    name: 'demo',
    open: true,
    fields: [
        {
            scale: [0.5, 0.1, 2, 0.01],
            onChange: (val)=>{ pgm.uniforms.scale = val;}
        }
    ]
};

function draw(gl, pgm, time){     
    pgm.uniforms.time = time * 0.001;
    mgl.useProgram(gl, pgm);
    mgl.enableAttributes(gl, pgm);
    mgl.setUniforms(gl, pgm);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mgl.drawObj(gl, pgm);
}

function init(canvas, res, pgm){
    canvas.width = res[0];
    canvas.height = res[1];
    const gl = canvas.getContext("webgl2", { antialias: true });
    gl.viewport(0, 0, res[0], res[1]);
    pgm.uniforms.resolution = res;
    pgm.setup(gl, pgm);
    mgl.createShaderProgram(gl, pgm);
    mgl.setBuffers(gl, pgm);
    initGui(pgm);

    const f = (time) => {
        draw(gl, pgm, time);
        requestAnimationFrame(f);
    };
    f(0);
}

init(document.querySelector("canvas"), [600, 600], pgm);
```