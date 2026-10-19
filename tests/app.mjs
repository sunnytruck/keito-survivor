// Boots the real application module with a small DOM fixture and native Canvas2D.
// This verifies event wiring and render execution; it is not browser layout QA.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, Image } from '@napi-rs/canvas';
const built=process.argv.includes('--built');
const imageLoads=[];
class LocalImage extends Image {
  set src(value){
    let path=String(value);
    if(path.startsWith('file:'))path=fileURLToPath(path);
    if(path.startsWith('/keito-survivor/assets/'))path=fileURLToPath(new URL('../dist/'+path.slice('/keito-survivor/'.length),import.meta.url));
    imageLoads.push(new Promise((resolve,reject)=>{this.onload=resolve;this.onerror=reject;super.src=path;}));
  }
  get src(){return super.src;}
}
const map=new Map(),windowListeners=new Map(),documentListeners=new Map(),frames=[];
class Element{
  constructor(id='',tag='div',attrs=''){this.id=id;this.tagName=tag.toUpperCase();this.attrs=attrs;this.style={};this.dataset={};this.listeners=new Map();this.classList={add:()=>{},remove:()=>{},toggle:()=>{}};this.children=[];this.value='';this.checked=false;const choice=attrs.match(/data-choice="(\d+)"/);if(choice)this.dataset.choice=choice[1];}
  set innerHTML(value){this._html=value;this.children=[];for(const m of value.matchAll(/<(button|input)\b([^>]*)>/g)){const id=m[2].match(/id="([^"]+)"/)?.[1]||'',e=m[1]==='input'?new Input(id,m[1],m[2]):new Element(id,m[1],m[2]);const v=m[2].match(/value="([^"]*)"/);if(v)e.value=v[1];e.checked=/\bchecked\b/.test(m[2]);this.children.push(e);if(id)map.set(id,e);}}
  get innerHTML(){return this._html||'';}
  addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,[]);this.listeners.get(name).push(fn);}
  querySelectorAll(selector){return this.children.filter(e=>selector==='[data-choice]'?e.dataset.choice!==undefined:selector.split(',').includes(e.tagName.toLowerCase()));}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  focus(){document.activeElement=this;}
  removeAttribute(){}
  click(){this.onclick?.({target:this,preventDefault(){}});for(const f of this.listeners.get('click')||[])f({target:this});}
  getBoundingClientRect(){return {width:1100,height:740};}
}
class Input extends Element{}
globalThis.HTMLInputElement=Input;
const html=readFileSync(new URL(built?'../dist/index.html':'../index.html',import.meta.url),'utf8');
for(const m of html.matchAll(/<([a-z]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){const e=m[1]==='input'?new Input(m[2],m[1]):new Element(m[2],m[1]);map.set(m[2],e);}
const canvas=createCanvas(1100,740);canvas.getBoundingClientRect=()=>({width:1100,height:740});canvas.listeners=new Map();canvas.addEventListener=Element.prototype.addEventListener;canvas.setPointerCapture=()=>{};map.set('game',canvas);
globalThis.Image=LocalImage;
globalThis.window={devicePixelRatio:1,addEventListener(name,fn){if(!windowListeners.has(name))windowListeners.set(name,[]);windowListeners.get(name).push(fn);}};
globalThis.document={hidden:false,activeElement:null,getElementById:id=>map.get(id)||null,createElement:tag=>tag==='canvas'?createCanvas(1,1):new Element('',tag),addEventListener(name,fn){documentListeners.set(name,fn);}};
globalThis.matchMedia=()=>({matches:false});
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn();}};
globalThis.requestAnimationFrame=fn=>{frames.push(fn);return frames.length;};
const entry=built?html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)?.[1]:null;
if(built)assert.ok(entry?.startsWith('/keito-survivor/assets/'));
await import(new URL(built?'../dist/'+entry.slice('/keito-survivor/'.length):'../src/app.mjs',import.meta.url));
await Promise.all(imageLoads);
assert.ok(imageLoads.length>0,'bundled portrait must load successfully');
let time=performance.now();
function step(count=1){for(let i=0;i<count;i++){const queue=frames.splice(0);time+=16.6667;for(const f of queue)f(time);}}
function key(type,key){const e={key,repeat:false,target:map.get('game'),preventDefault(){}};for(const f of windowListeners.get(type)||[])f(e);}
assert.equal(window.iwason.snapshot().state,'title');step(2);
map.get('startButton').click();step(1);assert.equal(window.iwason.snapshot().state,'playing');
assert.ok(map.get('cutinTitle').textContent.includes('岩尊'));assert.equal(map.get('fervorText').textContent,'0 / 60');
const initial=window.iwason.snapshot().position;key('keydown','d');step(30);key('keyup','d');assert.ok(window.iwason.snapshot().position.x>initial.x+90);
key('keydown','Escape');const paused=window.iwason.snapshot();assert.equal(paused.state,'paused');step(20);assert.equal(window.iwason.snapshot().time,paused.time);
map.get('pauseSettings').click();assert.ok(map.get('modal').innerHTML.includes('神さまの生活環境'));map.get('settingsDone').click();assert.ok(map.get('modal').innerHTML.includes('神、ちょっと休憩。'));map.get('resumeButton').click();step(2);assert.equal(window.iwason.snapshot().state,'playing');
map.get('codexButton').click();assert.ok(map.get('modal').innerHTML.includes('共有して。見てないけど。'));map.get('closePanel').click();assert.equal(window.iwason.snapshot().state,'playing');
key('keydown','m');assert.equal(JSON.parse(storage.get('iwason-settings-v1')).mute,true);
key('keydown','Escape');map.get('pauseRestart').click();assert.equal(window.iwason.snapshot().time,0);assert.equal(window.iwason.snapshot().enemies,0);
key('keydown','Escape');map.get('pauseHome').click();assert.equal(window.iwason.snapshot().state,'title');
map.get('howButton').click();assert.ok(map.get('modal').innerHTML.includes('移動するだけで、神になれる。'));map.get('howDone').click();assert.equal(window.iwason.snapshot().state,'playing');
document.hidden=true;documentListeners.get('visibilitychange')();assert.equal(window.iwason.snapshot().state,'paused');

console.log(JSON.stringify({verifiedAt:new Date().toISOString(),applicationBoot:true,productionBuild:built,portraitLoaded:true,nativeCanvasRender:true,checks:['title to start','arrival cutin','fervor HUD','WASD event movement','pause and resume','settings round trip','codex round trip','mute persistence','retry cleanup','return to title','help to start','hidden-tab pause'],browserLayoutChecked:false},null,2));
