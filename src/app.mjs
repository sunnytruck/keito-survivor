import { Game, ABILITIES, ATTACKS, PASSIVES, EVOLUTIONS, describe, threatAt } from './engine.mjs';
import { Renderer } from './art.mjs';
const $=id=>document.getElementById(id),icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const clock=time=>`${String(Math.floor(time/60)).padStart(2,'0')}:${String(Math.floor(time%60)).padStart(2,'0')}`;
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
const settings=load('iwason-settings-v1',{volume:.32,mute:false,shake:!matchMedia('(prefers-reduced-motion: reduce)').matches,numbers:true});
let overlay=null,panelResume=false,portraitURL=null,portraitData=null,toastTimer=0,shakeTime=0;
let cutinTimer=0,cutinPriority=0,lastSkillNotice=-10,impactSlowdown=0;
const skillNotices=new Map();
const keys=new Set(),touch={x:0,y:0,id:null,startX:0,startY:0};

class Sound{
  constructor(){this.ctx=null;this.master=null;this.pickupLock=0;this.attackLock=0;this.killLock=0;this.musicTimer=0;this.noteIndex=0;}
  unlock(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.mix();}catch{}}if(this.ctx?.state==='suspended')this.ctx.resume();}
  mix(){if(this.master)this.master.gain.setTargetAtTime(settings.mute?0:settings.volume,this.ctx.currentTime,.015);}
  tone(freq,duration=.12,type='sine',volume=.09,delay=0,end=null){if(!this.ctx||settings.mute||settings.volume<=0)return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),gain=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+duration);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.002,volume),now+.008);gain.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(gain);gain.connect(this.master);o.start(now);o.stop(now+duration+.02);}
  play(event){const now=performance.now();if(event==='pickup'){if(now-this.pickupLock<70)return;this.pickupLock=now;this.tone(880,.08,'sine',.13,0,1320);}else if(event==='attack'){if(now-this.attackLock<130)return;this.attackLock=now;this.tone(260,.09,'triangle',.08,0,520);}else if(event==='kills'){if(now-this.killLock<85)return;this.killLock=now;this.tone(145,.09,'triangle',.11,0,68);this.tone(660,.035,'square',.025);}else if(event==='hurt')this.tone(180,.16,'sawtooth',.1,0,65);else if(['choice','evolution','start','level','heal','magnet'].includes(event)){[392,494,587,784].forEach((n,i)=>this.tone(n,.24,'triangle',.13,i*.055));}else if(event==='boss'){this.tone(55,.7,'triangle',.19);this.tone(82,.7,'sawtooth',.045,.15);}else if(['fever','rampage','combo'].includes(event)){[523,659,784,1047,1319].forEach((n,i)=>this.tone(n,.2,'triangle',.14,i*.06));this.tone(98,.3,'triangle',.16,0,42);}else if(event==='finish'||event==='bossDefeated'){[392,494,587,784,988].forEach((n,i)=>this.tone(n,.45,'triangle',.15,i*.1));}else if(event==='impact')this.tone(120,.25,'triangle',.16,0,40);}
  update(dt){if(game.state!=='playing')return;this.musicTimer-=dt;if(this.musicTimer<=0){this.musicTimer=.526;const notes=[196,294,392,330,220,330,440,392,174,261,349,294,196,294,392,494],i=this.noteIndex++,note=notes[i%notes.length];this.tone(note,.30,'triangle',.038);if(i%2===0)this.tone([98,110,87,98][Math.floor(i/4)%4],.38,'sine',.07);this.tone(76,.09,'sine',.065,0,38);}}
}
const sound=new Sound();
const game=new Game({onEvent:event=>{
  sound.play(event.type);
  renderer.present(event);
  if(event.type==='start'){skillNotices.clear();lastSkillNotice=-10;impactSlowdown=0;cutinTimer=0;showCutin('岩尊、しぶしぶ降臨。','まずは信仰を拾いながら、まとめて倒そう。','start',2.3,3);}
  if(event.type==='attack'&&game.time-lastSkillNotice>2.8&&game.time-(skillNotices.get(event.id)??-30)>10){const a=game.abilities[event.id];showCutin(a?.evolved?EVOLUTIONS[event.id].name:ABILITIES[event.id].name,ABILITIES[event.id].quote,'skill',1.45,1);skillNotices.set(event.id,game.time);lastSkillNotice=game.time;}
  if(event.type==='upgrade'){const a=game.abilities[event.id];showCutin(ABILITIES[event.id].name,`Lv.${a.level} · ${a.level===1?'新たな御業を獲得！':'さらに強くなった！'}`,'upgrade',1.8,3);}
  if(event.type==='evolution')showCutin(EVOLUTIONS[event.id].name,'神化達成 · 次元の違う御業へ。','evolution',3,6);
  if(event.type==='boss')showCutin(event.name,event.boss==='final'?'最後の試練。「八時かねんねやな」':'中ボス降臨 · 倒して神宝を手に入れよう。','boss',2.5,5);
  if(event.type==='bossDefeated'){showCutin('神の、圧勝。','ボス撃破！ HP回復 ＋ 敵弾消去','victory',2.6,5);impactSlowdown=.16;}
  if(event.type==='rampage'){showCutin('神威解放！','周囲を一掃！ 6秒間、威力＋35%・待ち時間−25%','rampage',2.4,5);impactSlowdown=.13;if(settings.shake)renderer.shake=.28;}
  if(event.type==='combo')showCutin(`${event.count}連撃！`,event.count>=50?'信者「これが、岩尊の御力…！」':'うきき、止まらん。','combo',1.4,2);
  if(event.type==='wave')showCutin('信仰、押し寄せる。','時計の大群が接近。包囲される前に進路を作ろう。','wave',2,2);
  if(event.type==='escalation')showCutin(`敵勢力 Lv.${event.tier} · ${event.name}`,event.tier>=5?'強化された敵と精鋭が接近。立ち位置を変えて包囲を崩そう。':'同じ敵も、さらに硬く。強くなった御業で迎え撃とう。','escalation',2.5,4);
  if(event.type==='fever')showCutin('岩尊フィーバー！','７７７ · 神の気まぐれで攻撃力アップ','rampage',2,4);
  if(event.type==='wakeWarning')showCutin('赤い予告は、起きてよけよう。','少し動いて、また昼寝。','warning',2.2,3);
  if(event.type==='kills'&&event.count>=5){impactSlowdown=.06;if(settings.shake)renderer.shake=Math.max(renderer.shake,.10);}
  if(event.type==='choice'){keys.clear();touch.x=touch.y=0;showChoices();}
  if(event.type==='finish'){keys.clear();touch.x=touch.y=0;showResult(event.won);}
  if(event.type==='hurt'&&settings.shake)renderer.shake=.19;
  if(event.type==='impact'&&settings.shake)renderer.shake=.12;
  if(event.type==='evolution')toast(`進化：${EVOLUTIONS[event.id].name}`,3.5);
  if(event.type==='boss')toast(`${event.boss==='final'?'最終ボス':'中ボス'} · ${event.name}`,3);
  if(event.type==='upgrade'||event.type==='evolution')renderLoadout();
}});
const renderer=new Renderer($('game'),game);renderer.reduced=!settings.shake;
const originalImage=renderer.image;
const oldPortrait=load('iwason-face-v1',null);
if(oldPortrait){const img=new Image();img.onload=()=>{renderer.setImage(img,true);Object.assign(renderer.face,oldPortrait.crop);portraitData=oldPortrait.data;updateProfileImage(oldPortrait.data);};img.src=oldPortrait.data;}

function toast(text,seconds=2.5){$('toast').textContent=text;$('toast').classList.remove('hidden');toastTimer=seconds;}
function setModal(html,wide=false,result=false){$('modal').className=`modal${wide?' wide':''}${result?' result':''}`;$('modal').innerHTML=html;$('modalLayer').classList.remove('hidden');requestAnimationFrame(()=>$('modal').querySelector('button')?.focus({preventScroll:true}));}
function hideModal(){overlay=null;$('modalLayer').classList.add('hidden');$('modal').innerHTML='';}
function showCutin(title,sub,kind='skill',seconds=1.8,priority=1){if(cutinTimer>0&&priority<cutinPriority)return;$('cutinTitle').textContent=title;$('cutinSub').textContent=sub;$('cutinLabel').textContent={start:'DIVINE ARRIVAL',skill:'御業発動',upgrade:'POWER UP',evolution:'DIVINE EVOLUTION',boss:'WARNING · BOSS APPROACHING',victory:'BOSS DEFEATED',rampage:'DIVINE RAMPAGE',combo:'KEEP IT GOING',wave:'BONUS WAVE',warning:'DANGER',escalation:'THREAT LEVEL UP'}[kind]||'神の御業';$('battleCutin').className='battle-cutin';void $('battleCutin').offsetWidth;$('battleCutin').className=`battle-cutin active ${kind}`;cutinTimer=seconds;cutinPriority=priority;}
function start(){sound.unlock();hideModal();keys.clear();touch.x=touch.y=0;game.start();renderer.shake=0;sound.musicTimer=0;sound.noteIndex=0;$('titleScreen').classList.add('hidden');$('arena').classList.add('playing');['hud','xpHud','fervorHud'].forEach(id=>$(id).classList.remove('hidden'));renderLoadout();updateHUD();}
function goHome(){hideModal();game.reset();keys.clear();touch.x=touch.y=0;renderer.celebrations=[];cutinTimer=0;$('battleCutin').className='battle-cutin';$('titleScreen').classList.remove('hidden');$('arena').classList.remove('playing');['hud','xpHud','bossHud','dialogue','comboHud','fervorHud'].forEach(id=>$(id).classList.add('hidden'));renderLoadout();updateHUD();}
function renderLoadout(){
  const attacks=ATTACKS.filter(id=>game.abilities[id]),passives=PASSIVES.filter(id=>game.abilities[id]);
  $('attackCount').textContent=`${attacks.length} / 6`;$('passiveCount').textContent=`${passives.length} / 4`;
  $('attackSlots').innerHTML=attacks.map(id=>{const a=game.abilities[id],d=ABILITIES[id],name=a.evolved?EVOLUTIONS[id].name:d.name;return `<div class="ability-slot${a.evolved?' evolved':''}" title="${name}：${describe(id,a.level,a.evolved)}">${icon(d.icon)}<div><div class="ability-name">${name}</div><div class="level-dots">${Array.from({length:5},(_,i)=>`<i class="${i<a.level?'filled':''}"></i>`).join('')}</div></div><span class="level-label">${a.evolved?'神化':a.level===5?'MAX':`Lv.${a.level}`}</span></div>`;}).join('')+Array.from({length:6-attacks.length},()=>'<div class="ability-slot empty">＋</div>').join('');
  $('passiveSlots').innerHTML=passives.map(id=>{const a=game.abilities[id];return `<div class="passive-slot" title="${ABILITIES[id].name} Lv.${a.level}：${describe(id,a.level)}">${icon(ABILITIES[id].icon)}<b class="passive-name">${ABILITIES[id].name}</b><span>${a.level}</span></div>`;}).join('')+Array.from({length:4-passives.length},()=>'<div class="passive-slot empty">＋</div>').join('');
}
function updateHUD(){
  const p=game.player;$('hpText').textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;$('hpBar').style.width=`${p.hp/p.maxHp*100}%`;$('hpBar').style.background=p.hp<30?'#e48b74':'#abc58b';$('timeText').textContent=clock(game.time);$('killsText').textContent=game.kills.toLocaleString('ja-JP');$('levelText').textContent=`LV. ${String(game.level).padStart(2,'0')}`;$('xpBar').style.width=`${game.xp/game.xpNeed*100}%`;$('xpText').textContent=`${Math.floor(game.xp)} / ${game.xpNeed}`;
  const tier=game.level>=27?3:game.level>=16?2:game.level>=7?1:0;
  $('chapterLabel').textContent=['第一幕：けいとの部屋','第二幕：部屋に集う信仰','第三幕：じっと教の神殿','最終幕：ねむれる岩尊'][tier];
  const pressure=threatAt(game.time);$('chapterSub').textContent=`敵勢力 Lv.${game.threatTier+1} · ${pressure.name}`;$('pressureLabel').textContent=`敵勢力 Lv.${game.threatTier+1}：${pressure.name}`;
  $('roomStatus').textContent=['いつもの、だらだらした午後。','なんか祭壇が増えている。','信者が家具を神具にした。','もはや家賃では済まない。'][tier];
  $('profileTitle').textContent=['無気力な現人神','不本意な教祖','部屋に宿る神','就寝を司る主神'][tier];$('profileState').textContent=game.sleeping?'現在：御神睡のまっさいちゅう':game.feverTime>0?'現在：岩尊フィーバー発動中':'睡眠欲：とても高い';
  const boss=game.enemies.find(e=>e.type==='final')||game.enemies.find(e=>e.boss);
  $('bossHud').classList.toggle('hidden',!boss);if(boss){$('bossName').textContent={boss1:'大目覚まし・鳴門',boss2:'通知大司教',final:'夜更かしの化身'}[boss.type];$('bossHpText').textContent=`${Math.ceil(boss.hp)} / ${Math.round(boss.maxHp)}`;$('bossHpBar').style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;}
  $('arena').classList.toggle('has-boss',!!boss);$('arena').classList.toggle('divine-active',game.rampageTime>0);
  $('comboHud').classList.toggle('hidden',game.combo<2||game.state==='title');$('comboText').textContent=game.combo;
  $('fervorText').textContent=game.rampageTime>0?`${game.rampageTime.toFixed(1)}秒`:`${game.fervor} / 60`;$('fervorLabel').textContent=game.rampageTime>0?'神威解放中！':'熱狂 → 神威解放';$('fervorBar').style.width=`${game.rampageTime>0?game.rampageTime/6*100:game.fervor/60*100}%`;
  const dialogue=game.dialogue.time>0&&game.state!=='title';$('dialogue').classList.toggle('hidden',!dialogue);if(dialogue){$('dialogueMain').textContent=game.dialogue.text;$('dialogueSub').textContent=game.dialogue.sub;}
  const next=game.time<180?['最初の試練',180,'大目覚まし・鳴門が降臨']:game.time<360?['ふたたびの試練',360,'通知大司教が降臨']:game.time<480?['最後の夜更かし',480,'夜更かしの化身が降臨']:['ご就寝への最終戦',480,'夜更かしの化身を倒そう'];
  $('nextEventName').textContent=next[0];$('nextEventTime').textContent=clock(Math.max(0,next[1]-game.time));$('nextEventDesc').textContent=next[2];$('timelineBar').style.width=`${Math.min(100,game.time/480*100)}%`;
  $('muteButton').style.opacity=settings.mute?.45:1;$('muteButton').ariaLabel=settings.mute?'ミュート解除':'ミュートにする';$('muteButton').title=`${settings.mute?'音を出す':'ミュート'} [M]`;
  if(settings.numbers===false)game.texts.length=0;
}
function showChoices(){
  overlay='choice';
  const boss=game.choiceMode==='boss',evolved=game.choices[0]?.type==='evolve';
  const cards=game.choices.map((c,i)=>{
    if(c.type==='evolve'){const d=ABILITIES[c.id],e=EVOLUTIONS[c.id];return `<button class="upgrade-card evolution" data-choice="${i}"><div class="card-top"><span>DIVINE EVOLUTION · 神化</span><span>[${i+1}]</span></div><div class="card-icon">${icon(d.icon)}</div><h3>${e.name}</h3><p>${e.description}</p><p class="before">${d.name} Lv.5 → 神化<br>枠を消費せず置き換え</p><em>${e.quote}</em></button>`;}
    if(c.type==='upgrade'){const d=ABILITIES[c.id],a=game.abilities[c.id],level=(a?.level||0)+1;return `<button class="upgrade-card" data-choice="${i}"><div class="card-top"><span>${a?'POWER UP · 強化':d.kind==='attack'?'NEW · 攻撃能力':'NEW · 補助能力'}</span><span>[${i+1}]</span></div><div class="card-icon">${icon(d.icon)}</div><h3>${d.name}</h3><p>${describe(c.id,level)}</p><p class="before">${a?`Lv.${a.level} → Lv.${level}${level===5?' MAX':''}<br>現在：${describe(c.id,a.level)}`:'新たな御業を獲得 · Lv.1'}</p><em>${d.quote}</em></button>`;}
    const d={heal:['御慈悲のおやつ','HPを35回復。','ちょっと休憩。神も人の子。'],vigor:['よく寝る体','最大HP +10、HPを10回復。','神にも、体力は必要だ。'],faith:['小さな信仰','次のレベルに必要な信仰の25%を獲得。','小さなことから、こつこつと。']}[c.type];
    return `<button class="upgrade-card" data-choice="${i}"><div class="card-top"><span>BLESSING · 祝福</span><span>[${i+1}]</span></div><div class="card-icon">${icon('halo')}</div><h3>${d[0]}</h3><p>${d[1]}</p><em>${d[2]}</em></button>`;
  }).join('');
  setModal(`<div class="modal-eyebrow">${boss?'BOSS REWARD':'LEVEL UP'} · LV.${String(game.level).padStart(2,'0')}</div><h2 id="modalTitle">${evolved?'神の御業が、進化する。':boss?'神宝から、新たな加護を。':'神は、また少し強くなる。'}</h2><p class="modal-sub">${evolved?'条件を満たした御業をひとつ選んで神化。能力枠はそのまま。':boss?'ボスを討ったご褒美。対応する攻撃Lv.5＋補助をそろえると神化できます。':'信者「新たな奇跡を！」　けいと「んー、これで。」'}</p><div class="choice-grid">${cards}</div><div class="choice-footer">時間は止まっています。クリック、または数字キー ${game.choices.map((_,i)=>i+1).join(' / ')} で選択</div>`,true);
  $('modal').querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.choice))));
}
function choose(i){sound.unlock();if(game.choose(i)){hideModal();renderLoadout();}}
function showPause(){overlay='pause';setModal(`<div class="modal-eyebrow">A MOMENT OF DIVINE REST</div><h2 id="modalTitle">神、ちょっと休憩。</h2><p class="modal-sub">神殿も敵も、今は待ってくれています。<br>経過 ${clock(game.time)} · Lv.${game.level} · ${game.kills}体撃破</p><div class="modal-buttons"><button class="primary-button" id="resumeButton">戦いに戻る ${icon('arrow')}</button><button class="secondary-button" id="pauseSettings">設定</button><button class="secondary-button" id="pauseRestart">再挑戦</button></div><div class="modal-buttons"><button class="secondary-button" id="pauseHome">タイトルに戻る</button></div>`);$('resumeButton').onclick=()=>{hideModal();game.pause();};$('pauseSettings').onclick=()=>openPanel('settings');$('pauseRestart').onclick=start;$('pauseHome').onclick=goHome;}
function togglePause(){
  if(overlay==='choice'||overlay==='result')return;
  if(overlay&&overlay!=='pause'){closePanel();return;}
  if(game.state==='playing'){keys.clear();touch.x=touch.y=0;game.pause();showPause();}
  else if(game.state==='paused'){hideModal();game.pause();}
}
function openPanel(kind){
  if(overlay==='result')return;
  panelResume=game.state==='playing';if(panelResume)game.pause();keys.clear();touch.x=touch.y=0;
  overlay=kind;if(kind==='settings')showSettings();else if(kind==='how')showHow();else showCodex();
}
function closePanel(){
  if(game.state==='choice'){showChoices();return;}
  if(game.state==='paused'&&!panelResume){showPause();return;}
  hideModal();if(game.state==='paused')game.pause();
}
function closeButton(){return '<button class="close-modal" id="closePanel" aria-label="閉じる">×</button>';}
function bindClose(){$('closePanel').onclick=closePanel;}
function showHow(){setModal(`${closeButton()}<div class="modal-eyebrow">HOW TO PLAY</div><h2 id="modalTitle">移動するだけで、神になれる。</h2><p class="modal-sub">8分間を生き延び、最後に現れる「夜更かしの化身」を倒そう。<br>顔が大きくても大丈夫。当たり判定は、足元の小さな円だけ。</p><div class="control-grid"><div class="instruction"><b>01　よける</b><p><kbd>WASD</kbd> / <kbd>矢印キー</kbd> で移動。スマホは画面をドラッグ。攻撃は自動。赤い弾と予告範囲に注意。</p></div><div class="instruction"><b>02　育てる</b><p>緑のひし形「信仰」を拾ってレベルアップ。3つの強化から選ぼう。選択中は時間が止まる。強化後は落ちている信仰も自動回収。</p></div><div class="instruction"><b>03　組み合わせる</b><p>攻撃6枠・補助4枠、各Lv.5まで。60体倒すと神威解放！大爆発・敵弾消去・6秒間の強化で一気に押し返す。</p></div><div class="instruction"><b>04　神化する</b><p>3分・6分の中ボスを倒して神宝を拾う。攻撃Lv.5＋対応補助があれば、進化を選べる。</p></div></div><p class="modal-sub">ポーズ <kbd>ESC / P</kbd>　ミュート <kbd>M</kbd>　強化選択 <kbd>1 / 2 / 3</kbd><br>立ち止まる御神睡は、習得後に発動。緑の＋はHP24回復。6秒間被弾しないと自然回復します。長い昼寝に出る赤い予告は移動でよけよう。</p><div class="modal-buttons"><button class="primary-button" id="howDone">${game.state==='title'?'わかった、降臨する':'部屋に戻る'} ${icon('arrow')}</button></div>`);bindClose();$('howDone').onclick=()=>game.state==='title'?start():closePanel();}
function showSettings(){setModal(`${closeButton()}<div class="modal-eyebrow">SETTINGS</div><h2 id="modalTitle">神さまの生活環境</h2><div class="settings-row"><label for="volume">音量<small>オリジナルの合成音・静かな音楽</small></label><input type="range" min="0" max="100" value="${Math.round(settings.volume*100)}" id="volume" aria-label="音量"></div><div class="settings-row"><label for="mute">ミュート</label><input type="checkbox" id="mute" ${settings.mute?'checked':''}></div><div class="settings-row"><label for="shake">弱い画面揺れ<small>被弾・巨岩落下時だけ、控えめに揺れます</small></label><input type="checkbox" id="shake" ${settings.shake?'checked':''}></div><div class="settings-row"><label for="numbers">ダメージ数字を表示</label><input type="checkbox" id="numbers" ${settings.numbers?'checked':''}></div><div class="face-settings"><b>主人公の顔を差し替える</b><br>現在は添付の「じっと教」イラストの顔を使っています。<br>本人の写真を選ぶと、大きな実写の顔＋小さな体になります。<small>写真はこのブラウザ内だけで処理・保存します。</small><button id="uploadFace">写真を選ぶ</button><button id="resetFace">添付イラストに戻す</button>${renderer.face.custom?`<div class="face-controls"><label>横位置<input id="cropX" type="range" min="0" max="100" value="${renderer.face.x/renderer.image.naturalWidth*100}"></label><label>縦位置<input id="cropY" type="range" min="0" max="100" value="${renderer.face.y/renderer.image.naturalHeight*100}"></label><label>顔の拡大<input id="cropZoom" type="range" min="1" max="4" step=".05" value="${renderer.face.zoom}"></label></div>`:''}</div><p class="settings-note">装飾の家具・祭壇・神像は通り抜けできます。<br>戦闘を優先し、背景の変化で移動経路が塞がることはありません。</p><div class="modal-buttons"><button class="primary-button" id="settingsDone">設定を閉じる</button></div>`);bindClose();
  ['volume','mute','shake','numbers'].forEach(id=>$(id).addEventListener('input',()=>{settings[id]=id==='volume'?Number($(id).value)/100:$(id).checked;save('iwason-settings-v1',settings);renderer.reduced=!settings.shake;sound.unlock();sound.mix();updateHUD();}));
  $('settingsDone').onclick=closePanel;$('uploadFace').onclick=()=>$('faceUpload').click();$('resetFace').onclick=()=>{renderer.image=originalImage;renderer.face={custom:false,x:510,y:455,zoom:1};portraitData=null;save('iwason-face-v1',null);$('profileFace').removeAttribute('style');showSettings();};
  ['cropX','cropY','cropZoom'].forEach(id=>{if($(id))$(id).oninput=()=>{renderer.face.x=Number($('cropX').value)/100*renderer.image.naturalWidth;renderer.face.y=Number($('cropY').value)/100*renderer.image.naturalHeight;renderer.face.zoom=Number($('cropZoom').value);save('iwason-face-v1',{data:portraitData,crop:renderer.face});updateProfileImage(portraitData);};});
}
function updateProfileImage(data){if(!data)return;$('profileFace').style.backgroundImage=`url("${data}")`;$('profileFace').style.backgroundSize=`${renderer.face.zoom*130}%`;$('profileFace').style.backgroundPosition=`${renderer.face.x/renderer.image.naturalWidth*100}% ${renderer.face.y/renderer.image.naturalHeight*100}%`;}
$('faceUpload').onchange=event=>{const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){toast('画像ファイルを選んでください。');return;}const url=URL.createObjectURL(file),image=new Image();image.onload=()=>{const max=1000,ratio=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=image.naturalWidth*ratio;canvas.height=image.naturalHeight*ratio;canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.86),portrait=new Image();portrait.onload=()=>{renderer.setImage(portrait,true);portraitData=data;save('iwason-face-v1',{data,crop:renderer.face});updateProfileImage(data);showSettings();toast('写真を設定しました。位置と拡大率を調整できます。');};portrait.src=data;URL.revokeObjectURL(url);};image.onerror=()=>{URL.revokeObjectURL(url);toast('この画像を読み込めませんでした。JPEGかPNGを選んでください。');};image.src=url;event.target.value='';};
function showCodex(){
  const items=Object.entries(ABILITIES).map(([id,d])=>`<div class="codex-item"><h3>${icon(d.icon)}${d.name} <small>(${d.kind==='attack'?'攻撃':'補助'})</small></h3><p>Lv.1：${describe(id,1)}<br>Lv.5：${describe(id,5)}<br>${d.quote}</p></div>`).join('');
  setModal(`${closeButton()}<div class="modal-eyebrow">THE BOOK OF JITTO</div><h2 id="modalTitle">御業・進化の手引き</h2><p class="modal-sub">攻撃は最大6枠、補助は最大4枠。各Lv.5まで。<br>御業の重ね方で、けいとの一日は変わります。</p><div class="codex-list">${items}</div><h3 class="codex-section">ボスの神宝で、神化する。</h3><p class="modal-sub">元の攻撃をLv.5にして、対応する補助を1つ以上習得。<br>3分・6分の中ボスが落とす神宝を拾って選択します。枠の追加消費はありません。</p>${Object.entries(EVOLUTIONS).map(([id,e])=>`<div class="evolution-line">${ABILITIES[id].name} Lv.5 ＋ ${ABILITIES[e.passive].name}<br>→ <b>${e.name}</b><br>${e.description}</div>`).join('')}<h3 class="codex-section">きょうは、どう過ごす？</h3><div class="control-grid"><div class="instruction"><b>朝活型</b><p>朝活の後光＋早寝早起き。動き続けて後光を広げ、大群をすり抜ける。</p></div><div class="instruction"><b>昼寝型</b><p>御神睡＋御尊顔＋冷ややかな眼差し。敵を押し返して寝床を作る。赤い弾には起きて回避。</p></div><div class="instruction"><b>共有型</b><p>強制画面共有＋御神岩。群れの一体を貫き、共有ダメージでまとめて崩す。</p></div><div class="instruction"><b>岩尊型</b><p>御神岩＋岩尊フィーバー。ボス報酬で神化し、跳ね回る岩と巨岩で圧倒。</p></div></div>`,true);bindClose();}
function showResult(won){
  overlay='result';const best=load('iwason-best-v1',{wins:0,kills:0});best.kills=Math.max(best.kills,game.kills);if(won)best.wins++;save('iwason-best-v1',best);
  const build=Object.entries(game.abilities).filter(([id])=>ABILITIES[id].kind==='attack').map(([id,a])=>`<span title="${a.evolved?EVOLUTIONS[id].name:ABILITIES[id].name} Lv.${a.level}">${icon(ABILITIES[id].icon)}</span>`).join('');
  setModal(`<div class="result-seal">${won?'寝':'無'}</div><div class="modal-eyebrow">${won?'DIVINE VICTORY · 神、就寝。':'THE GOD NEEDS ANOTHER NAP'}</div><h2 id="modalTitle">${won?'おやすみ、けいと。':'神にも、そんな日がある。'}</h2><p class="modal-sub">${won?'信者たちは、奇跡の勝利を盛大に祝った。<br>その横で、神はもう眠っていた。<br>けいと「八時かねんねやな… zzz」':'けいと「…もう一回だけやるか。」<br>信仰を拾って強くなろう。足元の小さな円で敵弾をかわそう。'}</p><div class="result-stats"><div><span>生存時間</span><b>${clock(game.time)}</b></div><div><span>撃破数</span><b>${game.kills.toLocaleString('ja-JP')}</b></div><div><span>到達レベル</span><b>${game.level}</b></div></div><div class="result-build">${build}</div><p class="result-caption">最大連続撃破 ${game.bestCombo}　·　神威解放 ${game.rampages}回<br>中ボス討伐 ${game.bossesKilled-(won?1:0)} / 2　·　自己ベスト ${best.kills.toLocaleString('ja-JP')}体</p><div class="modal-buttons"><button class="primary-button" id="retryButton">もう一度、降臨する ${icon('arrow')}</button><button class="secondary-button" id="resultHome">タイトルへ</button></div>`,false,true);$('retryButton').onclick=start;$('resultHome').onclick=goHome;
}

$('startButton').onclick=start;$('howButton').onclick=()=>openPanel('how');$('settingsButton').onclick=()=>openPanel('settings');$('codexButton').onclick=()=>openPanel('codex');$('pauseButton').onclick=togglePause;$('brandHome').onclick=e=>{e.preventDefault();if(game.state==='title')return;togglePause();};
function toggleMute(){settings.mute=!settings.mute;save('iwason-settings-v1',settings);sound.unlock();sound.mix();updateHUD();}
$('muteButton').onclick=toggleMute;
window.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement)return;
  const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(k))e.preventDefault();
  if(e.repeat&&['escape','p','m','1','2','3'].includes(k))return;
  if(k==='escape'||k==='p'){e.preventDefault();togglePause();return;}if(k==='m'){toggleMute();return;}
  if(overlay==='choice'&&game.state==='choice'&&['1','2','3'].includes(k)){choose(Number(k)-1);return;}
  if(game.state==='playing')keys.add(k);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();touch.x=touch.y=0;if(game.state==='playing'){game.pause();showPause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state==='playing'){keys.clear();game.pause();showPause();}});
$('modalLayer').addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=[...$('modal').querySelectorAll('button,input')];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
$('game').addEventListener('pointerdown',e=>{if(game.state!=='playing')return;sound.unlock();touch.id=e.pointerId;touch.startX=e.clientX;touch.startY=e.clientY;touch.x=touch.y=0;$('game').setPointerCapture(e.pointerId);});
$('game').addEventListener('pointermove',e=>{if(touch.id!==e.pointerId)return;const dx=e.clientX-touch.startX,dy=e.clientY-touch.startY,d=Math.hypot(dx,dy),m=Math.min(1,d/35);touch.x=dx/Math.max(1,d)*m;touch.y=dy/Math.max(1,d)*m;$('touchKnob').style.transform=`translate(${touch.x*26}px,${touch.y*26}px)`;});
const release=e=>{if(touch.id===e.pointerId){touch.id=null;touch.x=touch.y=0;$('touchKnob').style.transform='';}};$('game').addEventListener('pointerup',release);$('game').addEventListener('pointercancel',release);
let hudTime=0,last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+touch.x,y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+touch.y;const simDt=impactSlowdown>0?dt*.35:dt;impactSlowdown=Math.max(0,impactSlowdown-dt);game.update(simDt,{x,y});renderer.render(dt);sound.update(dt);hudTime+=dt;if(hudTime>.08){hudTime=0;updateHUD();}if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.add('hidden');}if(cutinTimer>0){cutinTimer-=dt;if(cutinTimer<=0)$('battleCutin').className='battle-cutin';}requestAnimationFrame(frame);}
new ResizeObserver(()=>renderer.resize()).observe($('arena'));renderLoadout();updateHUD();requestAnimationFrame(frame);

// Read-only diagnostics make regression checks possible without changing gameplay or exposing cheat controls.
Object.defineProperty(window,'iwason',{value:{snapshot:()=>game.snapshot(),version:'1.2.0',ready:true},writable:false});
