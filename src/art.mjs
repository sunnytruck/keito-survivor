import { WORLD, TAU, stats } from './engine.mjs';
const C={floor:'#343d30',grid:'#45503b',line:'#1d2d24',gold:'#dcbf72',cream:'#ede4bf',sage:'#80916a',danger:'#f17c6b',faith:'#8ed4a6'};
const circle=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,TAU);};
function round(c,x,y,w,h,r=5){c.beginPath();c.roundRect(x,y,w,h,r);}
function line(c,x1,y1,x2,y2,color,width=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();}
function text(c,s,x,y,size=11,color=C.cream,font='sans-serif'){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign='center';c.fillText(s,x,y);}
function polygon(c,points,fill,stroke=null,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}

export class Renderer{
  constructor(canvas,game){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.game=game;this.image=new Image();this.image.src=new URL('./assets/iwason-original.jpeg',import.meta.url).href;this.face={x:510,y:455,zoom:1,custom:false};this.width=1;this.height=1;this.scale=1;this.wallTime=0;this.shake=0;this.reduced=false;this.sprites=new Map();this.celebrations=[];this.resize();}
  present(event){
    if(event.type==='start')this.celebrations=[];
    if(event.type==='finish'&&!event.won)return;
    const types={start:['arrival',280,'#ffdf86',1.2],level:['levelRing',300,'#fff0b0',.8],evolution:['divineBurst',450,'#d4b1ff',1.3],bossDefeated:['divineBurst',550,'#ffe4a0',1.1],finish:['victory',500,'#ffe5a1',2]};
    const e=types[event.type];
    if(e&&this.celebrations.length<12)this.celebrations.push({type:e[0],x:this.game.player.x,y:this.game.player.y,radius:e[1],color:e[2],life:e[3],maxLife:e[3],seed:this.game.level});
  }
  resize(){const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;const dpr=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.dpr=dpr;this.scale=Math.max(.68,Math.min(1.12,r.width/1000,r.height/700));this.game.viewport={w:r.width/this.scale,h:r.height/this.scale};}
  setImage(image,custom=false){this.image=image;this.face={x:image.naturalWidth/2,y:image.naturalHeight*.43,zoom:1,custom};}
  drawFace(c,x,y,w,h,alpha=1){
    c.save();c.globalAlpha*=alpha;c.translate(x,y);
    c.beginPath();
    if(!this.face.custom){
      const outline=[[480,304],[505,300],[527,307],[547,302],[566,313],[593,325],[611,343],[621,369],[628,414],[624,429],[636,430],[644,444],[644,471],[638,497],[629,511],[616,517],[614,541],[601,566],[576,585],[541,599],[513,606],[478,598],[450,582],[425,560],[414,538],[411,513],[399,510],[390,499],[383,471],[384,447],[392,432],[401,427],[400,407],[410,371],[429,344],[447,326],[469,320]];
      outline.forEach(([px,py],i)=>{const xx=(px-515)/270*w,yy=(py-457.5)/315*h;i?c.lineTo(xx,yy):c.moveTo(xx,yy);});
    }else{c.moveTo(-w*.27,-h*.49);c.bezierCurveTo(-w*.65,-h*.35,-w*.48,h*.22,-w*.3,h*.37);c.quadraticCurveTo(0,h*.62,w*.3,h*.37);c.bezierCurveTo(w*.5,h*.2,w*.6,-h*.4,w*.26,-h*.49);c.quadraticCurveTo(0,-h*.6,-w*.27,-h*.49);}
    c.closePath();c.clip();
    if(this.image.complete&&this.image.naturalWidth){let sw,sh,sx,sy;if(!this.face.custom){sw=270;sh=315;sx=380;sy=300;}else{sh=Math.min(this.image.naturalHeight,this.image.naturalWidth*1.25)/this.face.zoom;sw=sh/1.16;sx=this.face.x-sw/2;sy=this.face.y-sh/2;}
      c.drawImage(this.image,sx,sy,sw,sh,-w/2,-h/2,w,h);
    }else{c.fillStyle='#aaa28b';c.fillRect(-w/2,-h/2,w,h);text(c,'顔',0,5,w*.3,'#48513f');}
    c.restore();
  }
  character(c,x,y,size=1,{title=false,sleep=false,ghost=false}={}){
    const p=this.game.player,t=this.wallTime,moving=p.moving&&!title&&!sleep;
    const stride=moving?Math.sin(p.walk):0,bob=moving?Math.abs(Math.sin(p.walk))*1.8:Math.sin(t*1.7)*.7;
    const sway=moving?Math.sin(p.walk)*.045:Math.sin(t*1.3)*.012;
    const recoil=!title&&!sleep&&p.attackAnim>0?Math.sin(p.attackAnim*65)*1.7:0;
    c.save();c.translate(x,y);c.scale(size,size);
    if(ghost){c.globalAlpha*=.20;this.drawFace(c,0,-52,72,85);c.restore();return;}
    ellipse(c,0,4,29,9,'#101b174f');ellipse(c,0,2,21,6,'#101b1738');
    if(sleep)ellipse(c,0,1,42,15,'#8495cf22');
    // A little cape on top of comfortable room clothes: the followers added the ceremony.
    c.save();c.translate(0,bob);c.rotate(sway);
    const cape=c.createLinearGradient(-30,-63,32,-6);cape.addColorStop(0,'#8e789b');cape.addColorStop(.45,'#625571');cape.addColorStop(1,'#3d3b55');
    c.beginPath();c.moveTo(-20,-64);c.quadraticCurveTo(-29,-46,-29-stride*3,-17);c.quadraticCurveTo(-15,-6,0,-14);c.quadraticCurveTo(15,-5,30-stride*3,-15);c.quadraticCurveTo(25,-47,19,-64);c.closePath();c.fillStyle=cape;c.fill();c.strokeStyle='#222d36';c.lineWidth=1.8;c.stroke();
    c.beginPath();c.moveTo(-25,-19);c.quadraticCurveTo(-13,-10,0,-17);c.quadraticCurveTo(14,-9,26,-17);c.strokeStyle='#e1b465';c.lineWidth=2.4;c.stroke();
    line(c,-16,-53,-20,-22,'#a28b9c65',1);line(c,16,-53,21,-21,'#2d314d80',1.5);
    c.restore();
    const drawLeg=(side,phase)=>{
      const lift=Math.max(0,phase)*2,footX=side*11+phase*3;
      c.save();c.translate(side*9,-27);c.rotate(-phase*.15);
      const trouser=c.createLinearGradient(-5,0,7,24);trouser.addColorStop(0,side<0?'#526274':'#414e63');trouser.addColorStop(1,'#273346');
      round(c,-6,-1,12,24-lift,4);c.fillStyle=trouser;c.fill();c.strokeStyle='#1e2d3c';c.lineWidth=1.2;c.stroke();
      line(c,side<0?-2:2,4,side<0?-2:2,17-lift,'#8b91a055',1);line(c,-4,17-lift,4,17-lift,'#9b9c9a',1.4);
      c.restore();
      c.save();c.translate(footX,-4-lift);c.rotate(phase*.055);
      round(c,-9,-6,18,10,4);c.fillStyle='#e1ddc8';c.fill();c.strokeStyle='#24333e';c.lineWidth=1.3;c.stroke();
      round(c,-10,1,20,4,2);c.fillStyle='#3c4a50';c.fill();line(c,-5,-3,3,-3,'#9c9c8d',1);line(c,-4,-.5,4,-.5,'#aba997',1);
      c.restore();
    };
    drawLeg(-1,stride);drawLeg(1,-stride);
    c.save();c.translate(recoil,bob);c.rotate(sleep?-.04:sway);
    // Soft shadows, shoulder volume, cuffs and the hood replace the old flat trapezoid.
    const arm=(side)=>{
      const swing=stride*side*2.5,handY=-29+swing+(sleep?2:0),handX=side*(27+(p.attackAnim>0&&!title?2:0));
      c.save();c.translate(side*17,-59);c.rotate(side*-.18+stride*-.10);
      const sleeve=c.createLinearGradient(-8,0,8,28);sleeve.addColorStop(0,'#f1ebd3');sleeve.addColorStop(.48,'#d7d8c3');sleeve.addColorStop(1,'#a8b4a3');
      c.beginPath();c.moveTo(-7,0);c.quadraticCurveTo(0,-4,7,0);c.lineTo(8,22+swing);c.quadraticCurveTo(1,28+swing,-7,23+swing);c.closePath();c.fillStyle=sleeve;c.fill();c.strokeStyle='#3b4e45';c.lineWidth=1.3;c.stroke();
      line(c,-5,18+swing,6,18+swing,'#bd9c5f',2.5);line(c,-4,9,3,13,'#99aa9a70',1);c.restore();
      const skin=c.createRadialGradient(handX-2,handY-2,1,handX,handY,7);skin.addColorStop(0,'#d5b68b');skin.addColorStop(1,'#917d60');
      ellipse(c,handX,handY,5.6,7.1,skin);c.strokeStyle='#594e3c';c.lineWidth=.9;c.stroke();
      ellipse(c,handX-side*4,handY-1,2.4,3.4,'#b89a74');line(c,handX-side*2,handY+2,handX+side*1.5,handY+3,'#826e5466',.8);
    };
    arm(-1);arm(1);
    const fabric=c.createLinearGradient(-18,-65,20,-25);fabric.addColorStop(0,'#f3edd6');fabric.addColorStop(.36,'#e2e1cd');fabric.addColorStop(.72,'#c3cebb');fabric.addColorStop(1,'#98ac9b');
    c.beginPath();c.moveTo(-12,-64);c.quadraticCurveTo(-21,-63,-20,-53);c.lineTo(-18,-29);c.quadraticCurveTo(0,-23,18,-29);c.lineTo(20,-53);c.quadraticCurveTo(21,-63,12,-64);c.closePath();c.fillStyle=fabric;c.fill();c.strokeStyle='#364c43';c.lineWidth=1.6;c.stroke();
    c.beginPath();c.moveTo(-19,-53);c.quadraticCurveTo(-12,-59,-7,-60);c.quadraticCurveTo(0,-55,7,-60);c.quadraticCurveTo(14,-58,19,-53);c.strokeStyle='#ffffff5c';c.lineWidth=1.2;c.stroke();
    c.beginPath();c.ellipse(0,-63,17,7,0,0,TAU);c.fillStyle='#9bad9b';c.fill();c.strokeStyle='#d8d9c0';c.lineWidth=2;c.stroke();
    c.beginPath();c.moveTo(-12,-64);c.quadraticCurveTo(0,-52,12,-64);c.strokeStyle='#faf0d8';c.lineWidth=3;c.stroke();
    line(c,-4,-56,-5,-43,'#677e6c',1.1);line(c,4,-56,5,-45,'#677e6c',1.1);ellipse(c,-5,-42,1.1,1.9,'#d9b362');ellipse(c,5,-44,1.1,1.9,'#d9b362');
    // Gold ceremonial sash, stone clasp and stitched kangaroo pocket.
    polygon(c,[[-17,-58],[-11,-61],[15,-29],[7,-27]],'#d9b268','#9d7f4d',.7);
    line(c,-14,-59,12,-29,'#fff0b48c',1);
    c.beginPath();c.moveTo(-10,-39);c.quadraticCurveTo(0,-35,10,-39);c.lineTo(9,-30);c.quadraticCurveTo(0,-27,-9,-30);c.closePath();c.fillStyle='#b8c7b2';c.fill();c.strokeStyle='#7c9683';c.lineWidth=.9;c.stroke();
    line(c,-8,-35,-5,-32,'#e0e5cc',1);line(c,8,-35,5,-32,'#e0e5cc',1);
    polygon(c,[[-4,-51],[1,-54],[6,-50],[4,-44],[-2,-43]],'#7f8390','#e7c87b',1.5);line(c,-1,-50,2,-47,'#b1b6bf',1);
    round(c,-18,-29,36,5,2);c.fillStyle='#829b88';c.fill();line(c,-15,-27,14,-27,'#c1ceaf',.9);
    if(title||this.game.level>=7){
      polygon(c,[[-25,-61],[-17,-66],[-12,-61],[-17,-55],[-25,-55]],'#c3b28a','#e3cd92',1);
      polygon(c,[[25,-61],[17,-66],[12,-61],[17,-55],[25,-55]],'#aa9c80','#e3cd92',1);
      line(c,-20,-57,-16,-60,'#f3dfaa',1);line(c,20,-57,16,-60,'#e3d0a0',1);
    }
    // The attached face remains untouched; only its position follows the fuller body.
    c.save();c.translate(recoil*.6,sleep?4:0);c.rotate(sleep?-.18:sway*.45);
    c.shadowColor='#111a1770';c.shadowBlur=4;c.shadowOffsetY=3;this.drawFace(c,0,-94,64,75);c.shadowBlur=0;
    if(sleep){text(c,'z',33,-113,13,'#c4d3ff');text(c,'Z',47,-130+Math.sin(t*2)*3,18,'#d2dcff');}
    c.restore();
    if(!sleep){c.strokeStyle='#eed18a';c.lineWidth=1.7;c.beginPath();c.ellipse(0,-140,23,6,0,0,TAU);c.stroke();}
    c.restore();
    // Draw the small damage indicator last so the larger costume never hides it.
    c.strokeStyle=title?'#ddc27ea0':'#f8e8bfe6';c.lineWidth=title?1:1.7;circle(c,0,0,10);c.stroke();circle(c,0,0,2);c.fillStyle='#fff0c6';c.fill();
    if(p.invincible>0&&!title){circle(c,0,-38,49);c.strokeStyle=`rgba(231,177,116,${.3+Math.sin(t*30)*.2})`;c.lineWidth=2;c.stroke();}
    c.restore();
  }
  floor(c){
    const {game:g,width:w,height:h,scale:s}=this;const cam=g.camera;
    c.fillStyle='#263329';c.fillRect(-150,-150,WORLD.w+300,WORLD.h+300);
    c.fillStyle='#374130';c.fillRect(0,0,WORLD.w,WORLD.h);
    // Floorboards are deliberately quiet so bullets and pickups remain legible.
    const minX=Math.max(0,Math.floor((cam.x-g.viewport.w/2)/100)*100),maxX=Math.min(WORLD.w,cam.x+g.viewport.w/2+100);
    const minY=Math.max(0,Math.floor((cam.y-g.viewport.h/2)/72)*72),maxY=Math.min(WORLD.h,cam.y+g.viewport.h/2+100);
    for(let y=minY;y<maxY;y+=72)for(let x=minX;x<maxX;x+=100){c.fillStyle=((x/100+y/72)%3===0)?'#394431':'#35402f';c.fillRect(x+1,y+1,98,70);line(c,x+(y%144?30:70),y,x+(y%144?30:70),y+72,'#2e3b2c70');}
    c.strokeStyle='#67704a50';c.lineWidth=2;c.strokeRect(22,22,WORLD.w-44,WORLD.h-44);c.strokeStyle='#243827';c.lineWidth=14;c.strokeRect(-1,-1,WORLD.w+2,WORLD.h+2);
    const x=WORLD.w/2,y=WORLD.h/2;
    // Low rug and furniture are visual only. No decoration blocks movement.
    c.fillStyle='#474c32';round(c,x-265,y-230,530,460,10);c.fill();c.strokeStyle='#7a795049';c.lineWidth=2;round(c,x-250,y-215,500,430,6);c.stroke();
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const xx=x+i*86,yy=y+j*78;polygon(c,[[xx,yy-12],[xx+12,yy],[xx,yy+12],[xx-12,yy]],'#77734713');}
    this.bed(c,x-395,y-135);this.desk(c,x+350,y-170);
    this.plant(c,x-435,y+290);this.plant(c,x+450,y+280);
    round(c,x-180,y+345,360,22,4);c.fillStyle='#293b2b';c.fill();round(c,x-171,y+330,342,25,4);c.fillStyle='#5e6648';c.fill();
    for(let i=0;i<8;i++){round(c,x-143+i*39,y+310,25,35,2);c.fillStyle=['#7d7950','#6a785e','#9c8e61','#7e6f4b'][i%4];c.fill();line(c,x-135+i*39,y+318,x-125+i*39,y+318,'#aaa58270',2);}
    const tier=g.level>=27?3:g.level>=16?2:g.level>=7?1:0;
    if(tier){c.save();c.globalAlpha=Math.min(1,.28+tier*.22);
      c.strokeStyle='#c3a65a38';c.lineWidth=1.5;circle(c,x,y,310);c.stroke();circle(c,x,y,328);c.stroke();
      for(let i=0;i<12;i++){const a=i*TAU/12;line(c,x+Math.cos(a)*305,y+Math.sin(a)*305,x+Math.cos(a)*335,y+Math.sin(a)*335,'#c5a85675');}
      this.altar(c,x,y-350);this.banner(c,x-290,y-350);this.banner(c,x+290,y-350);
      if(tier>=2){for(const xx of [-300,300])for(const yy of [-220,220])this.candle(c,x+xx,y+yy);this.statue(c,x-615,y-340);this.statue(c,x+615,y-340);}
      if(tier>=3){for(let i=0;i<6;i++){this.candle(c,x-650+i*260,y+485);this.banner(c,x-650+i*260,y-580);}c.strokeStyle='#c2a35725';c.lineWidth=2;circle(c,x,y,540);c.stroke();}
      c.restore();
    }
  }
  bed(c,x,y){c.save();c.translate(x,y);ellipse(c,0,15,82,125,'#16291d50');round(c,-71,-130,142,245,12);c.fillStyle='#252f25';c.fill();round(c,-64,-129,128,235,10);c.fillStyle='#667154';c.fill();round(c,-56,-120,112,58,9);c.fillStyle='#bac0a0';c.fill();round(c,-61,-54,122,156,5);c.fillStyle='#7c8b67';c.fill();line(c,-49,-46,49,-46,'#a7b38b',3);for(let i=0;i<5;i++)line(c,-48+i*23,-30,-48+i*23,84,'#87987450');text(c,'御神床',0,53,13,'#c4c5a280','serif');c.restore();}
  desk(c,x,y){c.save();c.translate(x,y);round(c,-110,-98,220,155,9);c.fillStyle='#222e2390';c.fill();round(c,-106,-110,212,144,8);c.fillStyle='#73734f';c.fill();line(c,-98,-101,98,-101,'#8b885f',2);round(c,-68,-97,133,75,4);c.fillStyle='#1d2d25';c.fill();round(c,-60,-89,117,58,3);c.fillStyle='#415e50';c.fill();line(c,-50,-78,45,-78,'#7eaa83',2);for(let i=0;i<3;i++)line(c,-50,-65+i*9,-20+i*12,-65+i*9,'#72977b',2);line(c,-4,-22,-4,-8,'#26392d',6);line(c,-27,-7,18,-7,'#304130',4);round(c,-63,1,101,24,3);c.fillStyle='#354634';c.fill();for(let i=0;i<9;i++)for(let j=0;j<2;j++){c.fillStyle='#779070';c.fillRect(-56+i*10,6+j*7,7,4);}ellipse(c,67,10,10,14,'#354634');round(c,80,-54,20,28,4);c.fillStyle='#aaa17a';c.fill();c.strokeStyle='#aaa17a';c.lineWidth=3;round(c,97,-49,9,15,3);c.stroke();ellipse(c,-6,95,42,35,'#233829');round(c,-44,68,76,49,9);c.fillStyle='#586b4c';c.fill();line(c,-20,110,-25,130,'#243627',5);line(c,19,110,24,130,'#243627',5);c.restore();}
  plant(c,x,y){c.save();c.translate(x,y);ellipse(c,0,10,24,9,'#20352477');round(c,-14,-5,28,29,4);c.fillStyle='#948464';c.fill();for(let i=0;i<6;i++){const a=i*TAU/6;c.save();c.translate(Math.cos(a)*11,Math.sin(a)*9-15);c.rotate(a);ellipse(c,0,0,9,22,['#6e8a5b','#7c965c','#526f4d'][i%3]);c.restore();}c.restore();}
  altar(c,x,y){c.save();c.translate(x,y);polygon(c,[[-66,22],[66,22],[82,40],[-82,40]],'#3c4730');round(c,-61,-30,122,55,4);c.fillStyle='#69704e';c.fill();round(c,-75,-42,150,20,3);c.fillStyle='#93916a';c.fill();polygon(c,[[-22,-45],[-35,-75],[-17,-100],[12,-105],[35,-75],[22,-45]],'#8d8b60','#c2ad67',1);text(c,'岩',0,-63,24,'#cfb56c','serif');c.restore();}
  banner(c,x,y){c.save();c.translate(x,y);line(c,0,-100,0,90,'#959164',4);line(c,-42,-100,42,-100,'#a09a6d',4);polygon(c,[[-36,-95],[36,-95],[36,30],[0,50],[-36,30]],'#5a6041','#a89d61',1);text(c,'じ',0,-40,25,'#c7b570','serif');text(c,'と',0,-10,25,'#c7b570','serif');ellipse(c,0,91,18,6,'#273727');c.restore();}
  candle(c,x,y){c.save();c.translate(x,y);ellipse(c,0,0,13,5,'#263b2677');line(c,0,-45,0,0,'#ac9d63',4);line(c,-16,-45,16,-45,'#9f945e',2);for(let i=-1;i<=1;i++){c.fillStyle='#d0c395';c.fillRect(i*16-3,-58,6,15);ellipse(c,i*16,-66,3.5,7+Math.sin(this.wallTime*6+i),'#e4b45d');}c.restore();}
  statue(c,x,y){c.save();c.translate(x,y);round(c,-60,0,120,30,3);c.fillStyle='#566246';c.fill();round(c,-45,-90,90,90,6);c.fillStyle='#697351';c.fill();this.drawFace(c,0,-137,93,110,.56);circle(c,0,-150,80);c.strokeStyle='#b5a15e50';c.lineWidth=2;c.stroke();text(c,'じっと教',0,-35,15,'#b5a36a','serif');c.restore();}
  enemySprite(type){
    if(this.sprites.has(type))return this.sprites.get(type);
    const size=type==='final'?180:type.startsWith('boss')?140:90,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const c=canvas.getContext('2d');c.translate(size/2,size/2);
    const boss=type.startsWith('boss')||type==='final';
    if(type==='clock'||type==='boss1'){
      const r=boss?41:16;line(c,-r*.65,r*.6,-r*.9,r*1.1,'#d99b7b',boss?8:4);line(c,r*.65,r*.6,r*.9,r*1.1,'#d99b7b',boss?8:4);ellipse(c,-r*.7,-r*.8,r*.5,r*.23,'#c0836c');ellipse(c,r*.7,-r*.8,r*.5,r*.23,'#c0836c');circle(c,0,0,r);c.fillStyle='#b86f5c';c.fill();c.strokeStyle='#ebaa86';c.lineWidth=boss?3:1.8;c.stroke();circle(c,0,0,r*.77);c.fillStyle='#e0bd91';c.fill();line(c,0,0,-r*.33,-r*.43,'#674a43',boss?5:2);line(c,0,0,r*.45,-r*.15,'#674a43',boss?5:2);line(c,-r*.5,r*.2,-r*.18,r*.25,'#66423b',boss?4:2);line(c,r*.2,r*.25,r*.5,r*.2,'#66423b',boss?4:2);
      if(boss){polygon(c,[[-30,-42],[-38,-58],[-12,-51],[0,-67],[13,-51],[36,-58],[29,-42]],'#c9ad64','#e5ca83',2);}
    }else if(type==='monitor'||type==='boss2'){
      const s=boss?2.15:1;c.scale(s,s);line(c,-10,15,-13,23,'#789b99',4);line(c,10,15,13,23,'#789b99',4);round(c,-23,-20,46,34,4);c.fillStyle='#55817d';c.fill();c.strokeStyle='#94bbb0';c.lineWidth=1.5;c.stroke();round(c,-18,-15,36,23,2);c.fillStyle='#1f4241';c.fill();line(c,-12,-5,-4,-5,'#80dbbd',2);line(c,5,-5,13,-5,'#80dbbd',2);line(c,-8,1,8,1,'#719d85',1);c.fillStyle='#d98165';circle(c,17,-17,6);c.fill();text(c,'!',17,-14,8,'#ffe2a4');if(boss){polygon(c,[[-10,-24],[-18,-42],[0,-53],[18,-42],[10,-24]],'#7da6a0','#c4c2a2');}
    }else if(type==='rock'){
      polygon(c,[[-17,15],[-24,-4],[-10,-23],[9,-26],[25,-7],[20,16],[2,24]],'#8a7e96','#b2a0b8',2);polygon(c,[[-24,-4],[-8,-3],[2,24],[-17,15]],'#655f76');polygon(c,[[-10,-23],[9,-26],[8,-6],[-8,-3]],'#a298ae');line(c,-12,-1,-3,1,'#f6bb7e',3);line(c,6,1,15,-2,'#f6bb7e',3);line(c,-4,11,7,11,'#493f59',2);
    }else if(type==='cult'){
      polygon(c,[[-23,24],[-17,-8],[0,-32],[17,-8],[23,24]],'#6c6d4c','#a5a06a',2);c.beginPath();c.ellipse(0,-4,12,15,0,0,TAU);c.fillStyle='#2c3b30';c.fill();line(c,-8,-7,-3,-7,'#d1cc8c',3);line(c,3,-7,8,-7,'#d1cc8c',3);line(c,-14,5,-6,13,'#a29d69',4);line(c,14,5,6,13,'#a29d69',4);line(c,-6,13,6,13,'#c3b67c',3);
    }else if(type==='final'){
      const grd=c.createRadialGradient(0,0,20,0,0,80);grd.addColorStop(0,'#715b85');grd.addColorStop(1,'#54416500');c.fillStyle=grd;c.fillRect(-85,-85,170,170);
      polygon(c,[[-53,46],[-43,-5],[-33,-43],[0,-65],[33,-43],[44,-6],[55,47],[23,35],[0,53],[-24,36]],'#514660','#a993af',2);c.beginPath();c.ellipse(0,-12,34,38,0,0,TAU);c.fillStyle='#252e35';c.fill();line(c,-25,-16,-7,-13,'#f4a38e',6);line(c,7,-13,25,-16,'#f4a38e',6);circle(c,0,5,10);c.strokeStyle='#b1a7c1';c.lineWidth=3;c.stroke();polygon(c,[[-23,-51],[-39,-77],[-9,-65],[0,-83],[9,-65],[39,-77],[23,-51]],'#a498ad','#e0c2a6',2);for(let i=-1;i<=1;i++)circle(c,i*43,25+Math.abs(i)*7,6),c.fillStyle='#e8b68a',c.fill();
    }
    this.sprites.set(type,canvas);return canvas;
  }
  enemies(c){for(const e of this.game.enemies){if(!this.visible(e,100))continue;c.save();c.translate(e.x,e.y);if(e.spawn>0){c.globalAlpha=.2+Math.sin(e.spawn*10)*.1;circle(c,0,0,e.r+10);c.strokeStyle='#d9b67f';c.lineWidth=2;c.stroke();c.globalAlpha=.45;}ellipse(c,0,e.r*.7,e.r*1.05,e.r*.35,'#17271a66');if(e.warn>0){c.save();c.rotate(Math.atan2(e.dirY,e.dirX));c.globalAlpha=.35+Math.sin(this.wallTime*20)*.15;c.fillStyle='#ec9a6755';c.fillRect(0,-e.r*.8,e.boss?220:185,e.r*1.6);line(c,20,0,170,0,'#eeb17b',2);polygon(c,[[180,0],[164,-9],[164,9]],'#efbb83');c.restore();circle(c,0,0,e.r+8);c.strokeStyle='#f4af7f';c.lineWidth=2;c.stroke();}
      const sprite=this.enemySprite(e.type),bob=Math.sin(e.age*5+e.id)*1.5,bodyScale=e.elite?1.12:1;
      c.drawImage(sprite,-sprite.width*bodyScale/2,-sprite.height*bodyScale/2+bob,sprite.width*bodyScale,sprite.height*bodyScale);
      if(e.elite){c.globalAlpha=.85;circle(c,0,0,e.r+6);c.strokeStyle='#ffcc79';c.lineWidth=1.7;c.stroke();polygon(c,[[0,-e.r-20],[5,-e.r-13],[0,-e.r-6],[-5,-e.r-13]],'#ffe2a0','#65422c',1);c.globalAlpha=1;}
      if(e.flash>0){c.globalAlpha=.3;circle(c,0,0,e.r);c.fillStyle='#fff1c0';c.fill();}
      if(e.marked>0){c.globalAlpha=1;c.strokeStyle='#80d6c6';c.lineWidth=1.5;c.setLineDash([5,3]);round(c,-e.r-5,-e.r-10,e.r*2+10,e.r*2+10,5);c.stroke();c.setLineDash([]);round(c,-13,-e.r-21,26,10,2);c.fillStyle='#76cabb';c.fill();text(c,'共有',0,-e.r-13,7,'#244536');}
      if(!e.boss&&e.hp<e.maxHp){c.fillStyle='#17291fcc';c.fillRect(-18,e.r+7,36,3);c.fillStyle=e.elite?'#ffcd80':'#bda76b';c.fillRect(-18,e.r+7,36*e.hp/e.maxHp,3);}c.restore();}}
  visible(o,r=70){const cam=this.game.camera;return Math.abs(o.x-cam.x)<this.game.viewport.w/2+r&&Math.abs(o.y-cam.y)<this.game.viewport.h/2+r;}
  render(dt){
    this.wallTime+=dt;for(const e of this.celebrations)e.life-=dt;this.celebrations=this.celebrations.filter(e=>e.life>0);const c=this.ctx,g=this.game,w=this.width,h=this.height;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#29372b';c.fillRect(0,0,w,h);
    const title=g.state==='title';const camera=title?{x:WORLD.w/2,y:WORLD.h/2}:g.camera;
    c.save();c.translate(w/2,h/2);c.scale(this.scale,this.scale);c.translate(-camera.x,-camera.y);
    if(this.shake>0&&!this.reduced){this.shake-=dt;c.translate(Math.sin(this.wallTime*75)*this.shake*9,Math.cos(this.wallTime*60)*this.shake*7);}
    this.floor(c);
    if(!title){
      // Aura drawings sit underneath actors, enemy bullets always render last.
      if(g.abilities.chill){const s=stats('chill',g.abilities.chill.level);circle(c,g.player.x,g.player.y,s.range);c.fillStyle='#7cbbcc08';c.fill();c.setLineDash([3,12]);c.strokeStyle='#8cbacb30';c.lineWidth=1;c.stroke();c.setLineDash([]);}
      if(g.abilities.halo){const s=stats('halo',g.abilities.halo.level),r=s.range+g.player.moveCharge*s.movingBonus;c.save();c.translate(g.player.x,g.player.y);c.rotate(this.wallTime*.3);circle(c,0,0,r);c.fillStyle='#ffe89b0d';c.fill();c.strokeStyle='#ffe295b0';c.lineWidth=3.5;c.stroke();circle(c,0,0,r-10);c.strokeStyle='#ffe69a50';c.lineWidth=1.5;c.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;polygon(c,[[Math.cos(a)*(r-4),Math.sin(a)*(r-4)],[Math.cos(a+.025)*(r+14),Math.sin(a+.025)*(r+14)],[Math.cos(a-.025)*(r+14),Math.sin(a-.025)*(r+14)]],'#ffe8a3b5');}c.restore();}
      if(g.sleeping&&g.abilities.sleep){const s=stats('sleep',g.abilities.sleep.level,g.abilities.sleep.evolved);circle(c,g.player.x,g.player.y,s.range);c.fillStyle='#8298d710';c.fill();c.strokeStyle='#9aace55f';c.lineWidth=2;c.stroke();}
      for(const gem of g.gems){if(!this.visible(gem))continue;const size=gem.value>20?10:gem.value>3?7:5.5;if(gem.attract){const a=Math.atan2(g.player.y-gem.y,g.player.x-gem.x);line(c,gem.x-Math.cos(a)*18,gem.y-Math.sin(a)*18,gem.x,gem.y,'#baffbe70',2);}ellipse(c,gem.x,gem.y+2,size+3,2,'#152d2166');polygon(c,[[gem.x,gem.y-size],[gem.x+size,gem.y],[gem.x,gem.y+size],[gem.x-size,gem.y]],gem.value>20?'#ffe49e':'#b1efac','#ecffd0',1);}
      for(const item of g.pickups){if(!this.visible(item))continue;const yy=item.y+Math.sin(this.wallTime*4)*3;circle(c,item.x,yy,17);c.fillStyle=item.type==='heal'?'#244d3b':'#284951';c.fill();c.strokeStyle=item.type==='heal'?'#b5ffca':'#a7f4ff';c.lineWidth=2;c.stroke();if(item.type==='heal'){line(c,item.x-7,yy,item.x+7,yy,'#c9ffd2',4);line(c,item.x,yy-7,item.x,yy+7,'#c9ffd2',4);}else{text(c,'磁',item.x,yy+5,13,'#d3fcff');}text(c,item.type==='heal'?'回復':'回収',item.x,yy-25,12,'#dcffd3');}
      if(g.rampageTime>0){circle(c,g.player.x,g.player.y,48+Math.sin(this.wallTime*8)*4);c.strokeStyle='#ffe69bc0';c.lineWidth=4;c.stroke();for(let i=0;i<8;i++){const a=this.wallTime+i*TAU/8;line(c,g.player.x+Math.cos(a)*38,g.player.y+Math.sin(a)*38,g.player.x+Math.cos(a)*64,g.player.y+Math.sin(a)*64,'#ffdc8c80',2);}}
      for(const r of g.rewards){ellipse(c,r.x,r.y,30,13,'#dfc66b20');circle(c,r.x,r.y,30+Math.sin(this.wallTime*3)*3);c.strokeStyle='#dbbd64a0';c.lineWidth=1;c.stroke();round(c,r.x-13,r.y-13+Math.sin(this.wallTime*3)*3,26,21,4);c.fillStyle='#dbbe76';c.fill();line(c,r.x-13,r.y-6,r.x+13,r.y-6,'#6c683b',2);text(c,'神宝',r.x,r.y-24,10,'#e5d8a4');}
      for(const hazard of g.hazards){circle(c,hazard.x,hazard.y,hazard.radius);c.fillStyle=hazard.type==='giant'?'#ba9bdd13':'#ec7f6530';c.fill();c.strokeStyle=hazard.type==='giant'?'#c4a6e7':'#ee9676';c.lineWidth=2;c.setLineDash([6,4]);c.stroke();c.setLineDash([]);c.beginPath();c.arc(hazard.x,hazard.y,hazard.radius*(1-Math.max(0,hazard.delay)/hazard.total),0,TAU);c.stroke();text(c,hazard.type==='giant'?'岩':'!',hazard.x,hazard.y+6,21,hazard.type==='giant'?'#d6bce9':'#f2b991');}
      this.enemies(c);
      for(const b of g.projectiles){if(!this.visible(b))continue;
        if(b.type==='rock'){line(c,b.x-b.vx*.10,b.y-b.vy*.10,b.x,b.y,b.evolved?'#d3a9ff60':'#c5badc40',b.r*1.1);}
        c.save();c.translate(b.x,b.y);
        if(b.type==='voice'){c.rotate(b.angle);for(let j=0;j<3;j++){c.strokeStyle=j===0?'#fff7cc':j===1?'#ffe39db0':'#e6bd6650';c.lineWidth=j===0?4.5:2.5;c.beginPath();c.arc(-10-j*12,0,23+j*3,-.85,.85);c.stroke();}}
        else{c.rotate(this.wallTime*6+b.id);const r=b.r;polygon(c,[[-r,-r*.3],[-r*.3,-r],[r*.7,-r*.8],[r,r*.3],[0,r]],b.evolved?'#d5adff':'#b6a1ca',b.evolved?'#fff1ff':'#f3dfff',2);polygon(c,[[-r*.3,-r],[r*.7,-r*.8],[r*.25,0],[-r*.5,r*.1]],b.evolved?'#efd3ff':'#d7c4e5');line(c,r*.25,0,0,r,'#7b6596',1.5);}c.restore();}
      for(const e of g.effects)this.effect(c,e);
      for(const e of this.celebrations)this.effect(c,e);
      this.character(c,g.player.x,g.player.y,1,{sleep:g.sleeping});
      if(g.feverTime>0){text(c,'FEVER',g.player.x,g.player.y-162,15,'#f5d77c');circle(c,g.player.x,g.player.y,35);c.strokeStyle='#e4b75b70';c.lineWidth=2;c.stroke();}
      // Bright red enemy bullets remain above all auras, faces and room decorations.
      for(const b of g.enemyBullets){if(!this.visible(b))continue;circle(c,b.x,b.y,b.r+3);c.fillStyle='#351e23';c.fill();circle(c,b.x,b.y,b.r);c.fillStyle='#f38370';c.fill();circle(c,b.x-1,b.y-1,b.r*.42);c.fillStyle='#ffe2b9';c.fill();}
      for(const t of g.texts){c.save();c.globalAlpha=Math.min(1,t.life*3);const screenSize=Math.max(15,t.size+2);c.font=`800 ${screenSize/this.scale}px sans-serif`;c.textAlign='center';c.strokeStyle='#101c15';c.lineWidth=4/this.scale;c.lineJoin='round';c.strokeText(t.text,t.x,t.y);c.fillStyle=t.color;c.fillText(t.text,t.x,t.y);c.restore();}
      if(g.state==='won'){for(let i=0;i<14;i++){const a=i*TAU/14,t=this.wallTime;const x=g.player.x+Math.cos(a)*140,y=g.player.y+Math.sin(a)*95+Math.sin(t*5+i)*5;this.celebrant(c,x,y,i);}text(c,'信者「けいと様、ばんざい！」',g.player.x,g.player.y-175,18,'#ead68b');}
    }
    c.restore();
    if(title)this.titleArt(c,w,h);
    const v=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.7);v.addColorStop(0,'#10261b00');v.addColorStop(1,'#10211777');c.fillStyle=v;c.fillRect(0,0,w,h);
  }
  effect(c,e){const a=Math.max(0,e.life/e.maxLife);c.save();c.globalAlpha=a;c.strokeStyle=e.color;c.fillStyle=e.color;c.lineWidth=2;
    if(e.type==='face'){c.globalAlpha=a*.19;this.drawFace(c,e.x,e.y-20,e.radius*1.6,e.radius*1.85);c.globalAlpha=a*.8;circle(c,e.x,e.y,e.radius*(1-a*.25));c.lineWidth=5*a;c.stroke();for(let i=0;i<12;i++){const an=i*TAU/12;line(c,e.x+Math.cos(an)*e.radius*.7,e.y+Math.sin(an)*e.radius*.7,e.x+Math.cos(an)*e.radius,e.y+Math.sin(an)*e.radius,'#ffd8a3',3*a);}}
    else if(e.type==='death'){const travel=(1-a)*e.radius*2.5;circle(c,e.x,e.y,e.radius*(1.3-a*.3));c.globalAlpha=a*.16;c.fill();c.globalAlpha=a;for(let i=0;i<8;i++){const ang=i*TAU/8+e.seed;line(c,e.x+Math.cos(ang)*travel*.6,e.y+Math.sin(ang)*travel*.6,e.x+Math.cos(ang)*travel,e.y+Math.sin(ang)*travel,e.color,2+a*2);if(i%2===0){c.save();c.translate(e.x+Math.cos(ang)*travel,e.y+Math.sin(ang)*travel);c.rotate(ang+a);c.fillRect(-2,-2,4+a*2,4+a*2);c.restore();}}}
    else if(e.type==='hit'){const r=e.radius*(.6+(1-a)*.8);c.lineWidth=2.5*a;for(let i=0;i<4;i++){const an=i*Math.PI/2+.3;line(c,e.x+Math.cos(an)*r*.25,e.y+Math.sin(an)*r*.25,e.x+Math.cos(an)*r,e.y+Math.sin(an)*r,e.color,2.5*a);}circle(c,e.x,e.y,4*a);c.fillStyle='#fff9e9';c.fill();}
    else if(e.type==='link'){line(c,e.x,e.y,e.tx,e.ty,'#a0ffda',2.7);circle(c,(e.x+e.tx)/2,(e.y+e.ty)/2,3);c.fill();}
    else if(e.type==='voiceCast'||e.type==='rockCast'){c.save();c.translate(e.x,e.y);c.rotate(e.angle||0);for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,Math.max(1,e.radius*(1-a*.7)-i*10),-Math.min(1.4,e.spread||.8),Math.min(1.4,e.spread||.8));c.lineWidth=3-i*.6;c.stroke();}c.restore();}
    else if(e.type==='rockImpact'){const r=e.radius*(1-a*.65);circle(c,e.x,e.y,r);c.lineWidth=4*a;c.stroke();for(let i=0;i<7;i++){const an=i*TAU/7+e.seed;const rr=r*1.25;polygon(c,[[e.x+Math.cos(an)*rr,e.y+Math.sin(an)*rr],[e.x+Math.cos(an+.1)*rr*.7,e.y+Math.sin(an+.1)*rr*.7],[e.x+Math.cos(an-.1)*rr*.65,e.y+Math.sin(an-.1)*rr*.65]],e.color);}}
    else if(['divineBurst','arrival','levelRing','victory','pickupRing'].includes(e.type)){const progress=1-a,r=e.radius*(.12+progress);c.lineWidth=(e.type==='divineBurst'?9:5)*a;circle(c,e.x,e.y,r);c.stroke();circle(c,e.x,e.y,r*.84);c.lineWidth=1.5;c.stroke();for(let i=0;i<18;i++){const an=i*TAU/18+(e.seed||0);const rr=e.radius*(.25+progress*.85);line(c,e.x+Math.cos(an)*rr*.8,e.y+Math.sin(an)*rr*.8,e.x+Math.cos(an)*rr,e.y+Math.sin(an)*rr,e.color,2.5*a);}}
    else if(e.type==='share'){circle(c,e.x,e.y,e.radius*(1-a*.8));c.strokeStyle='#a4ffe5';c.lineWidth=3;c.stroke();for(const point of e.targets||[]){line(c,e.x,e.y,point.x,point.y,'#8dffdd85',1.7);round(c,point.x-14,point.y-22,28,18,3);c.fillStyle='#8df3dba0';c.fill();line(c,point.x-8,point.y-14,point.x+8,point.y-14,'#1b6359',2);}}
    else if(e.type==='sleepPulse'){const r=e.radius*(.4+(1-a)*.6);circle(c,e.x,e.y,r);c.lineWidth=3*a;c.stroke();for(let i=0;i<5;i++){const an=i*TAU/5+this.wallTime*.4;const xx=e.x+Math.cos(an)*r*.8,yy=e.y+Math.sin(an)*r*.8;text(c,'Z',xx,yy,16,'#b7ceff');}}
    else if(e.type==='impact'){circle(c,e.x,e.y,e.radius*(1-a));c.lineWidth=5*a;c.stroke();for(let i=0;i<7;i++){const an=i*TAU/7;line(c,e.x+Math.cos(an)*20,e.y+Math.sin(an)*20,e.x+Math.cos(an)*e.radius*(1-a),e.y+Math.sin(an)*e.radius*(1-a),e.color,2);}}
    else {circle(c,e.x,e.y,e.radius*(1-a*.6));c.globalAlpha=a*.4;c.stroke();if(e.type==='sleepPulse'||e.type==='share'){c.globalAlpha=a*.03;c.fill();}}
    c.restore();}
  celebrant(c,x,y,i){c.save();c.translate(x,y);polygon(c,[[-12,18],[-10,-7],[0,-21],[10,-7],[12,18]],'#798161','#c4b170',1);line(c,-8,0,-17,-12,'#c3b386',4);line(c,8,0,17,-12,'#c3b386',4);text(c,i%3===0?'祝':'',0,-29,11,'#e3c877');c.restore();}
  titleArt(c,w,h){
    const mobile=w<600,x=mobile?w*.58:w*.70,y=mobile?h*.40:h*.66,s=mobile?Math.min(2.1,h/370,w/195):Math.min(3.3,h/235,w/310);const t=this.wallTime;
    c.save();c.translate(x,y);const glow=c.createRadialGradient(0,-s*50,10,0,-s*50,s*112);glow.addColorStop(0,'#cba45238');glow.addColorStop(.5,'#b49c5015');glow.addColorStop(1,'#e0bb6000');c.fillStyle=glow;c.fillRect(-s*170,-s*210,s*340,s*250);
    c.save();c.translate(0,-s*88);c.rotate(t*.012);for(let i=0;i<36;i++){const a=i*TAU/36;const r=s*(i%3===0?85:90);line(c,Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*s*119,Math.sin(a)*s*119,'#d3b86624',i%3===0?1.5:1);}
    for(const r of [84,88,110]){circle(c,0,0,s*r);c.strokeStyle=r===88?'#d7b96b75':'#bdac6b2a';c.lineWidth=r===88?1.3:1;c.stroke();}
    for(let i=0;i<12;i++){const a=i*TAU/12;circle(c,Math.cos(a)*s*110,Math.sin(a)*s*110,2);c.fillStyle='#cbb87590';c.fill();}c.restore();
    c.strokeStyle='#a5945750';c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,s*3,s*(68+i*13),s*(21+i*4),0,0,TAU);c.stroke();}
    for(let i=0;i<13;i++){const xx=Math.sin(i*11.2)*s*96,yy=-((t*9+i*29)%(s*130));circle(c,xx,yy,1+i%2*.5);c.fillStyle=`rgba(211,186,113,${.2+Math.sin(t+i)*.15})`;c.fill();}
    this.character(c,0,0,s,{title:true});c.restore();
  }
}
