import * as mgl from "./minigl.js";
import {initGui, initGuiArr} from './lib/gui.js';
import feedback from './programs/feedback.js'
import ring from './programs/ring.js'
import trail from './programs/trail.js'
import pirene from './programs/pirene.js'

var gl, res = [800, 800], mouse = [0, 0], idx = 0;
trail.sub.push(ring);
const pgm = [pirene, feedback, trail];

const msg = document.createElement("p");
msg.innerHTML = "press c to toggle camera";
document.body.appendChild(msg);

function initPgm(p) {
    p.res = res;
    p.uniforms.resolution = res;
    p.uniforms.mouse = mouse;
    p.setup ??= ()=>{};
    p.draw ??= ()=>{};
    p.setup(gl, p);
    mgl.createShaderProgram(gl, p);
    mgl.setBuffers(gl, p);
    mgl.loadTextures(gl, p);
    mgl.setTargets(gl, p);
    mgl.setSubPgms(gl, p);
}

function init(canvas, res, arr){
    canvas.width = res[0];
    canvas.height = res[1];
    canvas.onmousemove = (e) => {
        mouse[0] = (e.offsetX/res[0])*2 - 1;
        mouse[1] = (e.offsetY/res[1])*2 - 1;
    };
    gl = canvas.getContext("webgl2", { antialias: true });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.viewport(0, 0, res[0], res[1]);
    for (let p of arr) initPgm(p);
    
    // initGui(pgm[0]);
    initGuiArr(pgm, (i)=>{
        idx = i;
        msg.style.visibility = (i === 0) ? 'visible' : 'hidden';
    });

    const f = (time) => {
        let pgm = arr[idx];
        pgm.draw(gl, pgm, time);
        requestAnimationFrame(f);
    };
    f(0);
}

init(document.querySelector("canvas"), res, pgm);
