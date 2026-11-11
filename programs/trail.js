import * as mgl from "../minigl.js";

const trail_fs = /*glsl*/`#version 300 es 
    precision mediump float;
    in vec3 vcolor;
    out vec4 fragColor;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform float time;
    uniform sampler2D backbuffer;
    #define res resolution

    void main(){
        vec2 uv = (2.*gl_FragCoord.xy-res)/res.y;
        vec2 tuv = gl_FragCoord.xy/res;
        float t = time*2.;
        vec3 c = vec3(.2/length(.8*vec2(cos(t*.7),sin(t))-uv*1.5));
        vec3 b = texture(backbuffer, tuv).xyz;
        c = mix(c*vec3(.3,.6, 1),b, .93);
        fragColor = vec4(c, 1);
    }
`;


const def_vs =/*glsl*/`#version 300 es
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

const pgm = {
    arrays: {
        position: {
            components: 3,
            data: [-1,-1,1, 1,1,1, -1,1,1, -1,-1,1, 1,-1,1, 1,1,1],
        }
    },
    shaders: [{
        vs: def_vs,
        fs: trail_fs
    }],
    uniforms: {
        backbuffer: 0,
    },
    targets: {
        texture: true,
    },
    setup: (gl, pgm) => {
        pgm.uniforms.resolution = pgm.res;
        pgm.uniforms.time = 0;
    },
    res:  [600, 600],
    sub: [{targets: {texture: true}}],
    draw :draw,
    read: 0,
    write: 1,
    gui: {
        name: 'trail',
        open: true,
        fields: [{
            a: [.6, .1, 1, .1],
            onChange: (v)=>{
                pgm.sub[1].uniforms.a = v;
            }
        }]
    }
};

function draw(gl, pgm, time){     
    const targets = [pgm.targets.texture, pgm.sub[0].targets.texture];
    pgm.uniforms.backbuffer = targets[pgm.read].texindex;
    pgm.uniforms.time = time * 0.001;

    let sub = pgm.sub[1]

    mgl.useProgram(gl, pgm);
    mgl.enableAttributes(gl, pgm);
    mgl.setUniforms(gl, pgm);

    gl.bindFramebuffer(gl.FRAMEBUFFER, targets[pgm.write].framebuffer);
    mgl.drawObj(gl, pgm);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mgl.drawObj(gl, pgm);

    pgm.read ^= 1;
    pgm.write ^= 1;

    sub.draw(gl, sub, time);
}

export default pgm;
