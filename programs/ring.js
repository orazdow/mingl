import * as mgl from "../minigl.js";

const fs = /*glsl*/`#version 300 es 
    precision highp float;
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 resolution;
    uniform float a;
    out vec4 fragColor;
    // uniform sampler2D bufferA;

    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        float f = 0.;
        for(float i = 0.1; i < .7; i += .1){
            f = f-mix(f, log(1.1+pow(cos(a*2./length(i*(uv-(.2+.5*i))*i)+time*.5),3.))/i, .4);
        }
        vec3 c = vec3(f);
        fragColor = vec4(c*.2,f);
    }
`;

const vs =/*glsl*/`#version 300 es
    in vec3 position;
    in vec2 texcoord;
    in vec3 color;
    out vec2 vtex;
    out vec3 vcolor;

    void main() {
        vcolor = color;
        vtex = texcoord;
        gl_Position = vec4(position, 1.);
    }
`;


function draw(gl, pgm, time){
    pgm.uniforms.time = time * .01;

    // gl.clear(gl.COLOR_BUFFER_BIT);
    mgl.useProgram(gl, pgm);
    // mgl.enableAttributes(gl, pgm);
    mgl.setUniforms(gl, pgm);
    mgl.drawObj(gl, pgm);
}

const prog = {
    shaders: [{
        fs: fs,
        vs: vs,
    }],
    uniforms: {
        a: .6
    },
    setup: (gl, pgm)=>{
        pgm.uniforms.resolution = pgm.res;
        pgm.uniforms.time = 0;
    },
    draw: draw,

}

export default prog;
