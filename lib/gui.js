import {GUI} from './dat.gui.module.min.js';

function initGui(pgm, btn=false){
    let g = pgm.gui;
    if(!g?.fields) return;
    let dat = new GUI();
    if(!btn)dat.__closeButton.style.visibility = "hidden";
    if(g.name === null) g._gui = dat;
    else g._gui = dat.addFolder(g.name||'');
    if(g.open) g._gui.open(); 
    addGuiObj(g._gui, g); 
}

function initGuiArr(arr, cb=(i)=>{}){
    if(!(arr.length)) return;
    let dat = new GUI();
    dat.__closeButton.style.visibility = "hidden";
    let d = dat.add({pgm: 0}, 'pgm', 0, arr.length-1, 1)
        .onChange((idx)=>{
            for(let o of arr)
                o.gui?._gui?.hide();           
            cb(idx);
            arr[idx].gui?._gui?.show();
        });
    for(let i = 0; i < arr.length; i++){
        let o = arr[i];
        if(o.gui){
            o.gui._gui = guiSubFolder(dat, o.gui);
            if(i > 0) o.gui?._gui?.hide();
        }
    }
}

function guiSubFolder(gui, obj){
    let g = gui.addFolder(obj.name||'');
    if(obj.open) g.open();
    addGuiObj(g, obj);
    g.title = g.__ul.firstChild;
    return g;
}

function addGuiObj(gui, obj){
    for(let o of obj.fields||[]){
        if(o.fields){guiSubFolder(gui, o); continue;}
        let f;
        if(f = o.onChange) delete o.onChange;
        o = getArrayParams(o);
        let params = [o, Object.keys(o)[0],
            ...Object.values(o).slice(1)];
        let g = gui.add(...params);
        if(f) g.onChange(f);
    }    
}

function getArrayParams(o){
    let e = Object.entries(o)[0];
    if(e[1] instanceof Array){
        o[e[0]]= e[1][0];
        o.min = e[1][1];
        o.max = e[1][2];
        o.step = e[1][3];
    }return o;
}

export {initGui as default, initGui, initGuiArr};
