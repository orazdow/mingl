import * as mgl from "../minigl.js";

const buff_fs = /*glsl*/`#version 300 es 
    precision highp float;
    uniform float time;
    uniform vec2 resolution;
    out vec4 fragColor;
    uniform sampler2D backbuffer;
    uniform float ble;

    float ll(vec2 uv, vec2 c0, vec2 c1, float t, float f, float a){
        return log(.001+(cos(t+length(uv-c0)*f)+1.)*(cos(t+length(uv-c1)*f)+1.))*0.01*a;
    }

    float bnc(float t){
        return abs(fract(t)-0.5)*2.;
    }

    void main(){
        vec2 uv = gl_FragCoord.xy/resolution.xy*3.33;
        vec3 col = 0.5 + 0.5*cos(time + uv.xyx*.33 + vec3(0., 2., 4.));
        float t = 18.+time*.8;

        float diff= .5+sin(t)*8.;
        vec2 b0 = vec2(bnc(t*0.04), ble*4.*bnc(t*.011));
        vec2 b1 = vec2(bnc(2.+t*.013), bnc(2.+t*.09));

        float a = ll(uv, b0, b1, t, 1., 1.2);
        float a2 = ll(uv+.4, b0, b1, t, 10., 1.);
        float a3 = ll(uv-.24, b0, b1, t, 11., 1.);
     
        float f = (a2- diff*a +a3)/.4;
        float c = (.3-(5.*f));
        vec3 cc = vec3(1.-c*c);
        vec3 h = (1.3+cos(.001*uv.xyx*time));
        cc /= mix(cc, 2./texture(backbuffer, .99*gl_FragCoord.xy/resolution.xy).xyz, .3)*h;
        fragColor = vec4((1.-cc)*col*.88,1.0); 
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
    shader: {
        vs: def_vs,
        fs: buff_fs
    },
    uniforms: {
        backbuffer: 0,
        ble: 0.2
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
    // gui: {
    //     name: 'buffer',
    //     open: true,
    // }
};

// pgm.gui.fields =  [
//     {
//         ble: [0.2, 0, 2, 0.1],
//         onChange: (val)=>{
//             pgm.uniforms.ble = val;
//         }
//     }
// ];

function draw(gl, pgm, time){     
    const targets = [pgm.targets.texture, pgm.sub[0].targets.texture];
    pgm.uniforms.backbuffer = targets[pgm.read].texindex;
    pgm.uniforms.time = time * 0.001;

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
}

export default pgm;
