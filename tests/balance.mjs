import {Game,ATTACKS,PASSIVES} from '../src/engine.mjs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const Before=process.argv[2]?(await import(pathToFileURL(resolve(process.argv[2])).href)).Game:null;
function choose(g){
  const priority={voice:100,halo:96,rock:87,magnet:72,early:80,face:78,share:75,sleep:62,chill:50,fever:65};
  let best=0,score=-1;
  g.choices.forEach((c,i)=>{const a=g.abilities[c.id];let value=c.type==='evolve'?1000:c.type==='heal'?(g.player.hp<g.player.maxHp*.65?140:1):c.type==='vigor'?58:c.type==='faith'?0:priority[c.id]+(a?a.level*3:0);if(c.id==='magnet'&&!a)value+=55;if(value>score){score=value;best=i;}});
  g.choose(best);
}
export function play(Type,seed,avoid=false,maxed=false,lazy=false){
  const g=new Type({seed});g.start();if(maxed)for(const id of [...ATTACKS,...PASSIVES])g.abilities[id]={level:5,evolved:['rock','share','sleep'].includes(id),timer:0};
  let steps=0,first=null;const checkpoints=[];
  while(++steps<40000&&g.time<620){
    if(g.state==='choice'){if(first===null)first=g.time;choose(g);continue;}
    if(g.state!=='playing')break;
    let dx=0,dy=0;
    if(!maxed){
      const p=g.player,targets=[...g.rewards,...g.gems,...(g.pickups||[]).filter(i=>i.type!=='heal'||p.hp<p.maxHp*.8)];
      let target=null,best=Infinity;
      for(const t of targets){const d=Math.hypot(t.x-p.x,t.y-p.y)*(g.rewards.includes(t)?.25:1);if(d<best){target=t;best=d;}}
      target??={x:1120+Math.cos(g.time*.04)*350,y:800+Math.sin(g.time*.04)*280};
      const d=Math.max(1,Math.hypot(target.x-p.x,target.y-p.y));dx=(target.x-p.x)/d;dy=(target.y-p.y)/d;
      if(avoid){for(const e of g.enemies){const x=p.x-e.x,y=p.y-e.y,r=Math.hypot(x,y),safe=e.r+58;if(r<safe&&e.spawn<=0){dx+=x/Math.max(1,r)*(safe-r)/safe*2.5;dy+=y/Math.max(1,r)*(safe-r)/safe*2.5;}}for(const b of g.enemyBullets){const x=p.x-b.x,y=p.y-b.y,r=Math.hypot(x,y);if(r<48){dx+=x/Math.max(1,r)*(48-r)/48*3;dy+=y/Math.max(1,r)*(48-r)/48*3;}}}
    }
    if(lazy&&g.time>75&&g.time%3.5<2.9){dx=0;dy=0;}
    g.update(.025,{x:dx,y:dy});
    if(g.time>=(checkpoints.length+1)*60)checkpoints.push({t:Math.floor(g.time),hp:Math.round(g.player.hp),kills:g.kills,level:g.level});
  }
  return {seed,avoid,maxed,lazy,first,checkpoints,result:g.snapshot()};
}
const reports=[];
for(const seed of [7,24,101]){if(Before)reports.push({version:'before',...play(Before,seed,false)});reports.push({version:'after',...play(Game,seed,false)});}
for(const seed of [7,24])reports.push({version:'after-with-simple-avoidance',...play(Game,seed,true)});
for(const seed of [7,24]){if(Before)reports.push({version:'before-mostly-stationary',...play(Before,seed,true,false,true)});reports.push({version:'after-mostly-stationary',...play(Game,seed,true,false,true)});}
reports.push({version:'after-stationary-maxed',...play(Game,24,false,true)});
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),note:'Synthetic input, no invincibility, no health injection, no time skips. This is not a human playtest.',reports},null,2));
