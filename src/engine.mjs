export const TAU = Math.PI * 2;
export const WORLD = { w: 2240, h: 1600 };
export const ATTACKS = ['voice', 'rock', 'share', 'halo', 'sleep', 'face'];
export const PASSIVES = ['chill', 'magnet', 'early', 'fever'];
// Each minute introduces a stronger generation. Existing enemies keep their spawn-time stats.
export const THREAT_STAGES = [
  { name: '気配', hp: 1, count: 1, interval: .70, cap: 180, wave: 24, elite: 0, knock: 1, xp: 1, damage: 1, speed: 0 },
  { name: '侵入', hp: 2.5, count: 3, interval: .58, cap: 240, wave: 36, elite: 0, knock: .95, xp: .70, damage: 1, speed: 0 },
  { name: '増援', hp: 6, count: 5, interval: .48, cap: 300, wave: 50, elite: .04, knock: .85, xp: .55, damage: 1.1, speed: 4 },
  { name: '包囲', hp: 16, count: 7, interval: .40, cap: 360, wave: 64, elite: .06, knock: .70, xp: .45, damage: 1.25, speed: 8 },
  { name: '強襲', hp: 45, count: 9, interval: .34, cap: 400, wave: 80, elite: .08, knock: .55, xp: .40, damage: 1.4, speed: 14 },
  { name: '狂信', hp: 110, count: 11, interval: .30, cap: 440, wave: 96, elite: .10, knock: .42, xp: .36, damage: 1.55, speed: 22 },
  { name: '猛攻', hp: 240, count: 13, interval: .27, cap: 480, wave: 112, elite: .12, knock: .32, xp: .33, damage: 1.7, speed: 30 },
  { name: '終末', hp: 420, count: 15, interval: .24, cap: 520, wave: 132, elite: .14, knock: .26, xp: .30, damage: 1.85, speed: 40 },
  { name: '夜更かし', hp: 650, count: 16, interval: .23, cap: 520, wave: 148, elite: .16, knock: .22, xp: .30, damage: 2, speed: 50 },
];
export function threatAt(time) { return THREAT_STAGES[Math.max(0,Math.min(THREAT_STAGES.length-1,Math.floor(time/60)))]; }
export const EVOLUTIONS = {
  sleep: { passive: 'early', name: '八時かねんねやな', description: '睡眠結界 半径240 / 寝息威力120 / 毎秒6回復', quote: '世界を救うより、睡眠時間。' },
  share: { passive: 'chill', name: '共有して。見てないけど。', description: '共有率60% / マーク中35%減速 / 2秒ごと全員に50ダメージ', quote: '画面の向こうで、奇跡だけが連鎖する。' },
  rock: { passive: 'fever', name: '確変・岩尊降臨', description: '岩威力125 / 無限貫通・跳弾 / 4.8秒ごと巨岩260ダメージ', quote: '神はサイコロを振らない。岩を投げる。' },
};
export const ABILITIES = {
  voice: { name: '神託・うきき', short: 'うきき', icon: 'voice', kind: 'attack', color: '#ebc96e', quote: '本人「うきき」 信者「ありがたきお言葉…！」' },
  rock: { name: '御神岩', short: '御神岩', icon: 'rock', kind: 'attack', color: '#b4a1e4', quote: 'ありがたみも、質量も、ある。' },
  share: { name: '強制画面共有', short: '画面共有', icon: 'share', kind: 'attack', color: '#6fd5ca', quote: '「画面共有して」…本人は見ていない。' },
  halo: { name: '朝活の後光', short: '朝活の後光', icon: 'halo', kind: 'attack', color: '#f4d979', quote: '朝活しよ。移動するほど後光が育つ。' },
  sleep: { name: '御神睡', short: '御神睡', icon: 'sleep', kind: 'attack', color: '#92abf3', quote: 'ちょっと寝る。世界はよろしく。' },
  face: { name: '御尊顔', short: '御尊顔', icon: 'face', kind: 'attack', color: '#f2a786', quote: '顔の大きさは、器の大きさ。たぶん。' },
  chill: { name: '冷ややかな眼差し', short: '眼差し', icon: 'chill', kind: 'passive', color: '#91c6e1', quote: 'ジト目が、敵の足まで止める。' },
  magnet: { name: '信者の献身', short: '信者の献身', icon: 'magnet', kind: 'passive', color: '#79c7a3', quote: '信仰のほうから、集まってくる。' },
  early: { name: '早寝早起き', short: '早寝早起き', icon: 'early', kind: 'passive', color: '#eab17a', quote: '健康的な生活。破壊的な回転率。' },
  fever: { name: '岩尊フィーバー', short: 'フィーバー', icon: 'fever', kind: 'passive', color: '#f1bf60', quote: '当たっても外れても、神の気まぐれ。' },
};
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function stats(id, level = 1, evolved = false) {
  const l = clamp(level, 1, 5);
  if (id === 'voice') return { damage: 20 + l * 8, cooldown: .80 - l * .08, range: 300 + l * 30, count: l === 5 ? 16 : 1 + l * 2, spread: l === 5 ? TAU : .30 + l * .20 };
  if (id === 'rock') return { damage: evolved ? 125 : 42 + l * 12, cooldown: 1.80 - l * .14, count: 1 + Math.floor(l / 2), pierce: evolved ? 999 : 2 + l, size: 12 + l * 2, range: 800, splash: 42 + l * 8 };
  if (id === 'share') return { damage: 12 + l * 4, cooldown: 4.8 - l * .35, range: 310 + l * 20, count: 5 + l * 3, ratio: evolved ? .6 : .22 + l * .05, duration: 8, pulse: evolved ? 50 : 0 };
  if (id === 'halo') return { damage: 14 + l * 7, cooldown: .45, range: 95 + l * 15, movingBonus: 75 + l * 15 };
  if (id === 'sleep') return { damage: evolved ? 120 : 26 + l * 12, cooldown: evolved ? .75 : 1, range: evolved ? 240 : 110 + l * 16, heal: evolved ? 6 : 1 + l * .6, delay: evolved ? .65 : .9 };
  if (id === 'face') return { damage: 95 + l * 30, cooldown: 6.1 - l * .5, range: 165 + l * 20, knockback: 150 + l * 25 };
  if (id === 'chill') return { range: 150 + l * 18, slow: .10 + l * .05 };
  if (id === 'magnet') return { range: 130 + l * 55 };
  if (id === 'early') return { reduction: l * .07 };
  return { interval: 18 - l, chance: .60 + l * .06, bonus: .3 + l * .12, duration: 5 + l };
}
export function describe(id, level = 1, evolved = false) {
  const s = stats(id, level, evolved);
  if (id === 'voice') return `威力${s.damage} / ${s.cooldown.toFixed(2)}秒 / ${s.count}方向${level === 5 ? '・全方位' : ''} / 射程${s.range}`;
  if (id === 'rock') return `威力${s.damage} / ${s.count}発 / ${s.pierce === 999 ? '無限' : s.pierce}体貫通 / 着弾半径${s.splash}`;
  if (id === 'share') return `最大${s.count}体 / ${Math.round(s.ratio * 100)}%共有 / 初撃${s.damage} / 半径${s.range}`;
  if (id === 'halo') return `威力${s.damage} / ${s.cooldown}秒 / 半径${s.range}〜${s.range + s.movingBonus}`;
  if (id === 'sleep') return `停止${s.delay}秒で発動 / 威力${s.damage} / 毎秒${s.heal.toFixed(2)}回復`;
  if (id === 'face') return `威力${s.damage} / 半径${s.range} / 押し戻し${s.knockback} / ${s.cooldown.toFixed(2)}秒`;
  if (id === 'chill') return `半径${s.range}の敵を${Math.round(s.slow * 100)}%減速`;
  if (id === 'magnet') return `信仰の回収半径 ${s.range}（基本130）`;
  if (id === 'early') return `すべての攻撃の待ち時間 −${Math.round(s.reduction * 100)}%`;
  return `${s.interval}秒ごと${Math.round(s.chance * 100)}%抽選 / 威力+${Math.round(s.bonus * 100)}%・${s.duration}秒`;
}
export class Game {
  constructor({ seed = Date.now(), onEvent = null } = {}) {
    this.seed = seed >>> 0; this.onEvent = onEvent; this.viewport = { w: 1100, h: 740 }; this.reset();
  }
  random() { let x = this.seed; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.seed = x >>> 0; return this.seed / 4294967296; }
  emit(type, data = {}) { if (this.onEvent) this.onEvent({ type, ...data }); }
  reset() {
    this.state = 'title'; this.time = 0; this.kills = 0; this.level = 1; this.xp = 0; this.xpNeed = 16;
    this.player = { x: WORLD.w / 2, y: WORLD.h / 2, hp: 150, maxHp: 150, r: 10, speed: 215, facing: 0, walk: 0, invincible: 0, stationary: 0, moving: false, moveCharge: 0, attackAnim: 0, lastHurt: -10 };
    this.abilities = { voice: { level: 1, evolved: false, timer: .2 } };
    this.enemies = []; this.projectiles = []; this.enemyBullets = []; this.gems = []; this.effects = []; this.hazards = []; this.texts = []; this.rewards = []; this.pickups = [];
    this.ids = 1; this.spawnTimer = .3; this.spawnedBosses = new Set(); this.finalDefeated = false; this.pendingRewards = 0; this.pendingLevels = 0; this.choiceMode = null; this.choices = [];
    this.feverTime = 0; this.feverTimer = 5; this.sharePulseTimer = 2; this.giantTimer = 4; this.sleeping = false; this.haloTimer = 0; this.sleepTimer = 0;
    this.dialogue = { text: 'ドラクエやろ。', sub: '信者「神、いざご降臨を！」', time: 5 }; this.dialogueTimer = 23;
    this.damageDealt = 0; this.bossesKilled = 0; this.peakEnemies = 0; this.startedAt = null;
    this.combo = 0; this.comboTime = 0; this.bestCombo = 0; this.fervor = 0; this.rampageTime = 0; this.rampages = 0; this.nextWave = 35; this.sleepWarning = 3.5;
    this.threatTier = 0; this.nextHealDrop = 0;
  }
  start() { this.reset(); this.state = 'playing'; this.startedAt = Date.now(); this.emit('start'); }
  pause() { if (this.state === 'playing') { this.state = 'paused'; this.emit('pause'); } else if (this.state === 'paused') { this.state = 'playing'; this.emit('resume'); } }
  get camera() { return { x: clamp(this.player.x, this.viewport.w / 2 - 50, WORLD.w - this.viewport.w / 2 + 50), y: clamp(this.player.y, this.viewport.h / 2 - 50, WORLD.h - this.viewport.h / 2 + 50) }; }
  say(text, sub = '', seconds = 4) { this.dialogue = { text, sub, time: seconds }; this.emit('dialogue', { text, sub }); }
  addEffect(type, x, y, radius, color, life = .4, extra = {}) { if (this.effects.length < 140) this.effects.push({ type, x, y, radius, color, life, maxLife: life, ...extra }); }
  addText(text, x, y, color = '#fff3c4', size = 14) { if (this.texts.length < 80) this.texts.push({ text, x, y, color, size, life: .75 }); }
  multiplier() { return (this.feverTime > 0 && this.abilities.fever ? 1 + stats('fever', this.abilities.fever.level).bonus : 1) * (this.rampageTime > 0 ? 1.35 : 1); }
  cooldown() { return (this.abilities.early ? 1 - stats('early', this.abilities.early.level).reduction : 1) * (this.rampageTime > 0 ? .75 : 1); }
  gainXP(value) {
    this.xp += value;
    while (this.xp >= this.xpNeed) { this.xp -= this.xpNeed; this.level++; this.pendingLevels++; this.xpNeed = Math.floor(12 + Math.pow(this.level, 1.16) * 2.8); this.player.hp = Math.min(this.player.maxHp, this.player.hp + 12); this.emit('level', { level: this.level }); }
  }
  eligibleEvolutions() { return Object.entries(EVOLUTIONS).filter(([id, e]) => this.abilities[id]?.level === 5 && !this.abilities[id].evolved && this.abilities[e.passive]).map(([id]) => id); }
  upgradePool() {
    const count = kind => Object.keys(this.abilities).filter(id => ABILITIES[id].kind === kind).length;
    return Object.keys(ABILITIES).filter(id => {
      const a = this.abilities[id]; if (a) return a.level < 5 && !a.evolved;
      return count(ABILITIES[id].kind) < (ABILITIES[id].kind === 'attack' ? 6 : 4);
    });
  }
  makeChoices(mode = 'level') {
    this.choiceMode = mode;
    const evolutions = mode === 'boss' ? this.eligibleEvolutions() : [];
    if (evolutions.length) this.choices = evolutions.map(id => ({ type: 'evolve', id }));
    else {
      const pool = this.upgradePool();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      this.choices = pool.slice(0, 3).map(id => ({ type: 'upgrade', id }));
      // Early choices always offer an owned attack upgrade and a new direct attack when available.
      if (mode === 'level') {
        const owned = pool.filter(id => ABILITIES[id].kind === 'attack' && this.abilities[id]);
        if (owned.length && !this.choices.some(c => owned.includes(c.id))) this.choices[0] = { type: 'upgrade', id: owned[Math.floor(this.random() * owned.length)] };
        const newAttacks = pool.filter(id => ['rock','halo','face'].includes(id) && !this.abilities[id]);
        if (this.level <= 8 && newAttacks.length && !this.choices.some(c => newAttacks.includes(c.id))) { const slot = this.choices.findIndex(c => !owned.includes(c.id)); this.choices[slot >= 0 ? slot : 2] = { type: 'upgrade', id: newAttacks[Math.floor(this.random() * newAttacks.length)] }; }
      }
      if (this.choices.length < 3) this.choices.push({ type: 'heal', id: 'heal' });
      if (this.choices.length < 3) this.choices.push({ type: 'vigor', id: 'vigor' });
      if (this.choices.length < 3) this.choices.push({ type: 'faith', id: 'faith' });
    }
    this.state = 'choice'; this.emit('choice', { mode });
  }
  choose(index) {
    if (this.state !== 'choice' || !this.choices[index]) return false;
    const c = this.choices[index];
    if (c.type === 'evolve') { this.abilities[c.id].evolved = true; this.emit('evolution', { id: c.id }); this.say(EVOLUTIONS[c.id].name, '信者「これこそ、神の御業…！」', 5); }
    else if (c.type === 'upgrade') {
      const a = this.abilities[c.id]; if (a) a.level++; else this.abilities[c.id] = { level: 1, evolved: false, timer: .25 };
      this.emit('upgrade', { id: c.id });
    } else if (c.type === 'heal') this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
    else if (c.type === 'vigor') { this.player.maxHp += 10; this.player.hp = Math.min(this.player.maxHp, this.player.hp + 10); }
    else this.gainXP(Math.ceil(this.xpNeed * .25));
    if (this.choiceMode === 'boss') this.pendingRewards--; else this.pendingLevels--;
    this.choices = []; this.choiceMode = null; this.state = 'playing';
    this.player.invincible = Math.max(this.player.invincible, 1.2);
    for (const g of this.gems) g.attract = true;
    this.addEffect('levelRing', this.player.x, this.player.y, 260, '#fff0a0', .7);
    return true;
  }
  spawnEnemy(type, x = null, y = null) {
    if (x === null || y === null) {
      const camera = this.camera;
      for (let tries = 0; tries < 40; tries++) {
        const a = this.random() * TAU; const dx = Math.cos(a), dy = Math.sin(a);
        const radius = Math.min((this.viewport.w / 2 + 65) / Math.max(.01, Math.abs(dx)), (this.viewport.h / 2 + 65) / Math.max(.01, Math.abs(dy)));
        x = clamp(camera.x + dx * radius, 50, WORLD.w - 50); y = clamp(camera.y + dy * radius, 50, WORLD.h - 50);
        if (Math.hypot(x - this.player.x, y - this.player.y) > 390) break;
      }
      if (Math.hypot(x - this.player.x, y - this.player.y) <= 390) {
        x = this.player.x < WORLD.w / 2 ? WORLD.w - 50 : 50;
        y = this.player.y < WORLD.h / 2 ? WORLD.h - 50 : 50;
      }
    }
    const progress = Math.min(1, this.time / 480), threat = threatAt(this.time), hpScale = threat.hp;
    const data = {
      clock: { hp: 20, speed: 38, r: 16, damage: 6, xp: 1 },
      rock: { hp: 54, speed: 32, r: 22, damage: 9, xp: 3 },
      monitor: { hp: 32, speed: 27, r: 19, damage: 6, xp: 3 },
      cult: { hp: 138, speed: 25, r: 24, damage: 9, xp: 5 },
      boss1: { hp: 6000, speed: 28, r: 48, damage: 18, xp: 60 },
      boss2: { hp: 14000, speed: 30, r: 50, damage: 22, xp: 90 },
      final: { hp: 36000, speed: 28, r: 62, damage: 24, xp: 160 },
    }[type];
    const boss = ['boss1','boss2','final'].includes(type);
    const elite = !boss && threat.elite > 0 && this.random() < threat.elite;
    const health = data.hp * (boss ? 1 : hpScale * (elite ? 2.4 : 1));
    const enemy = { id: this.ids++, type, x, y, hp: health, maxHp: health, speed: data.speed + (boss ? 0 : progress * 30 + threat.speed), r: data.r * (elite ? 1.12 : 1), damage: Math.round(data.damage * threat.damage), damageScale: threat.damage, xp: data.xp * (boss ? 1 : threat.xp), boss, elite, tier: Math.min(8,Math.floor(this.time/60)), knockFactor: boss ? .18 : threat.knock * (elite ? .45 : 1), spawn: boss ? 1.5 : .7, age: 0, fire: 2 + this.random() * 3, special: boss ? 4 : 2 + this.random() * 5, dash: 0, warn: 0, dirX: 0, dirY: 0, marked: 0, flash: 0, knockX: 0, knockY: 0 };
    this.enemies.push(enemy); this.peakEnemies = Math.max(this.peakEnemies, this.enemies.length); return enemy;
  }
  spawnBoss(type) {
    if (this.spawnedBosses.has(type)) return;
    this.spawnedBosses.add(type); const enemy = this.spawnEnemy(type);
    const names = { boss1: '大目覚まし・鳴門', boss2: '通知大司教', final: '夜更かしの化身' };
    this.say(type === 'final' ? '八時かねんねやな' : type === 'boss1' ? 'まだ寝てていい？' : '画面共有して。', `${type === 'final' ? '最終' : '中'}ボス「${names[type]}」降臨`, 5);
    this.enemyBullets.length = 0; this.player.invincible = Math.max(this.player.invincible, 2.5);
    this.emit('boss', { boss: type, name: names[type] }); return enemy;
  }
  hurt(enemy, amount, canShare = true, knockback = 0) {
    if (enemy.hp <= 0 || enemy.spawn > 0) return;
    amount *= this.multiplier(); enemy.hp -= amount; enemy.flash = .12; this.damageDealt += amount;
    if (canShare && this.effects.length < 105) this.addEffect('hit', enemy.x, enemy.y, 18 + Math.min(12, amount / 15), enemy.marked > 0 ? '#9effe2' : '#fff1ba', .18, { seed: enemy.id });
    if (this.random() < .6 || enemy.boss) this.addText(String(Math.round(amount)), enemy.x + (this.random() - .5) * 18, enemy.y - enemy.r - 5, canShare ? '#f8e5ae' : '#7ce3da', enemy.boss ? 17 : 13);
    if (knockback) { const d = Math.max(1, distance(enemy, this.player)); const k = enemy.knockFactor ?? (enemy.boss ? .18 : 1); enemy.knockX += (enemy.x - this.player.x) / d * knockback * k; enemy.knockY += (enemy.y - this.player.y) / d * knockback * k; }
    if (canShare && enemy.marked > 0 && this.abilities.share) {
      const ratio = stats('share', this.abilities.share.level, this.abilities.share.evolved).ratio;
      for (const target of this.enemies) if (target.id !== enemy.id && target.marked > 0 && target.hp > 0) {
        // Direct subtraction is deliberate: shared damage never calls hurt(), so it cannot recurse or reapply bonuses.
        const shared = amount * ratio; target.hp -= shared; target.flash = .06; this.damageDealt += shared;
      }
      if (this.effects.filter(e => e.type === 'link').length < 9) {
        const target = this.enemies.find(e => e.id !== enemy.id && e.marked > 0 && e.hp > 0);
        if (target) this.addEffect('link', enemy.x, enemy.y, 0, '#68d6ca', .15, { tx: target.x, ty: target.y });
      }
    }
  }
  damagePlayer(amount) {
    if (this.player.invincible > 0 || this.state !== 'playing') return;
    this.player.hp -= amount; this.player.invincible = 1.25; this.player.lastHurt = this.time;
    this.addText(`−${amount}`, this.player.x, this.player.y - 155, '#ff877b', 23); this.emit('hurt');
    if (this.player.hp <= 0) { this.player.hp = 0; this.finish(false); }
  }
  finish(won) {
    this.state = won ? 'won' : 'over'; this.sleeping = won; this.player.moving = false;
    this.emit('finish', { won, time: this.time, kills: this.kills, level: this.level });
  }
  nearest(range = 1000) {
    let nearest = null, best = range;
    for (const e of this.enemies) if (e.hp > 0 && e.spawn <= 0) { const d = distance(e, this.player); if (d < best) { nearest = e; best = d; } }
    return nearest;
  }
  attack(id, ability) {
    const s = stats(id, ability.level, ability.evolved), p = this.player;
    if (id === 'voice' || id === 'rock') {
      const target = this.nearest(); if (!target) return false;
      const angle = Math.atan2(target.y - p.y, target.x - p.x);
      for (let i = 0; i < s.count; i++) {
        const a = angle + (id === 'voice' ? (ability.level === 5 ? i * TAU / s.count : (i - (s.count - 1) / 2) * s.spread / Math.max(1, s.count - 1)) : (i - (s.count - 1) / 2) * .17);
        if (this.projectiles.length < 190) this.projectiles.push({ id: this.ids++, type: id, x: p.x, y: p.y - 10, vx: Math.cos(a) * (id === 'voice' ? 500 : 400), vy: Math.sin(a) * (id === 'voice' ? 500 : 400), damage: s.damage, r: id === 'voice' ? 20 : s.size, life: s.range / (id === 'voice' ? 500 : 400), hit: new Set(), pierce: id === 'voice' ? 3 + Math.floor(ability.level / 2) : s.pierce, splash: s.splash || 0, evolved: ability.evolved, angle: a });
      }
      this.addEffect(id === 'voice' ? 'voiceCast' : 'rockCast', p.x, p.y - 10, id === 'voice' ? 95 : 60, ABILITIES[id].color, .28, { angle, spread: id === 'voice' ? s.spread : .8 });
      p.attackAnim = .16; this.emit('attack', { id }); return true;
    }
    if (id === 'share') {
      const targets = this.enemies.filter(e => e.hp > 0 && e.spawn <= 0 && distance(e, p) < s.range).sort((a,b) => distance(a,p)-distance(b,p)).slice(0,s.count);
      if (!targets.length) return false;
      for (const e of targets) { e.marked = s.duration; this.hurt(e, s.damage, false); }
      this.addEffect('share', p.x, p.y, s.range, '#79dad3', .65, { targets: targets.map(e => ({ x: e.x, y: e.y })) }); this.emit('attack', { id });
      this.addText('共有中 · 本人は離席', p.x, p.y - 150, '#9fffe1', 16); return true;
    }
    if (id === 'face') {
      this.addEffect('face', p.x, p.y, s.range, '#edbc91', .65);
      for (const e of this.enemies) if (distance(e, p) < s.range + e.r) this.hurt(e, s.damage, true, s.knockback);
      p.attackAnim = .25; this.emit('attack', { id }); return true;
    }
    return true;
  }
  fireBullet(enemy, angle, speed = 120, size = 7, color = 'red') {
    if (this.enemyBullets.length < 180) this.enemyBullets.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: size, life: 6, damage: Math.round((enemy.boss ? 12 : 6) * (enemy.damageScale || 1)), color });
  }
  hazard(x, y, radius = 65, delay = 1.25, damage = 22, type = 'burst') {
    this.hazards.push({ x, y, radius, delay, total: delay, damage, type, fired: false, life: .28 });
  }
  releaseFervor() {
    const p = this.player; this.fervor = 0; this.rampageTime = 6; this.rampages++;
    for (const e of this.enemies) if (distance(e, p) < 500 + e.r && e.spawn <= 0) {
      e.burstHit = true; this.hurt(e, 240, false, 100);
    }
    this.enemyBullets = this.enemyBullets.filter(b => distance(b, p) > 650);
    for (const gem of this.gems) gem.attract = true;
    p.hp = Math.min(p.maxHp, p.hp + 12); p.invincible = Math.max(p.invincible, 1.4);
    this.addEffect('divineBurst', p.x, p.y, 520, '#ffe398', 1.1);
    this.emit('rampage', { x: p.x, y: p.y, count: this.rampages });
  }
  update(dt, input = {}) {
    if (this.state !== 'playing') return;
    dt = Math.min(.05, Math.max(0, dt)); this.time += dt;
    const tier = Math.min(8,Math.floor(this.time/60)), threat = threatAt(this.time);
    if (tier !== this.threatTier) { this.threatTier = tier; this.emit('escalation',{tier:tier+1,name:threat.name,hp:threat.hp,cap:threat.cap}); }
    const p = this.player;
    let dx = Number(input.x) || 0, dy = Number(input.y) || 0, length = Math.hypot(dx, dy);
    if (length > 1) { dx /= length; dy /= length; }
    p.moving = length > .05; p.walk += p.moving ? dt * 12 : dt * 1.5;
    if (p.moving) { p.x = clamp(p.x + dx * p.speed * dt, 36, WORLD.w - 36); p.y = clamp(p.y + dy * p.speed * dt, 46, WORLD.h - 36); p.facing = Math.atan2(dy, dx); p.stationary = 0; p.moveCharge = Math.min(1, p.moveCharge + dt / 3.5); }
    else { p.stationary += dt; p.moveCharge = Math.max(0, p.moveCharge - dt / 2.5); }
    p.invincible = Math.max(0, p.invincible - dt); p.attackAnim = Math.max(0, p.attackAnim - dt);
    this.rampageTime = Math.max(0, this.rampageTime - dt);
    this.comboTime = Math.max(0, this.comboTime - dt); if (this.comboTime <= 0) this.combo = 0;
    if (this.time - p.lastHurt > 6) p.hp = Math.min(p.maxHp, p.hp + 1.6 * dt);
    if (this.time > 160 && p.stationary > 4) {
      this.sleepWarning -= dt;
      if (this.sleepWarning <= 0) { this.sleepWarning = 4.5; this.hazard(p.x, p.y, 68, 1.8, Math.ceil(p.maxHp*.32), 'wake'); this.emit('wakeWarning'); }
    } else this.sleepWarning = 3.5;
    this.feverTime = Math.max(0, this.feverTime - dt);
    if (this.abilities.fever) {
      this.feverTimer -= dt;
      if (this.feverTimer <= 0) { const s = stats('fever',this.abilities.fever.level); this.feverTimer = s.interval;
        if (this.random() < s.chance) { this.feverTime = s.duration; this.say('うきき！', `岩尊フィーバー · 威力 +${Math.round(s.bonus*100)}%`, 3); this.emit('fever'); }
        else this.addText('抽選：次に期待。',p.x,p.y-75,'#ddd2b0');
      }
    }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < threat.cap) {
      this.spawnTimer = threat.interval * (this.enemies.some(e => e.boss) ? 1.35 : 1);
      const count = threat.count;
      for (let i=0;i<count && this.enemies.length<threat.cap;i++) {
        const r=this.random(); let type='clock';
        if (this.time>45 && r>.78) type='rock'; if (this.time>90 && r>.94) type='monitor'; if (this.time>150 && r<.05) type='cult';
        if (this.time>240 && r>.66 && r<.86) type='rock';
        if (this.time>300 && r<.13) type='cult';
        if (type === 'monitor' && this.enemies.filter(e => e.type === 'monitor').length >= (tier >= 5 ? 18 : 14)) type = 'clock';
        this.spawnEnemy(type);
      }
    }
    if (this.time >= this.nextWave) {
      this.nextWave += Math.max(24,36-tier*1.5);
      const count = threat.wave;
      for (let i=0;i<count && this.enemies.length<threat.cap;i++) { const e = this.spawnEnemy('clock'); e.hp *= .75; e.maxHp = e.hp; }
      this.emit('wave', { count });
    }
    if (this.time>=180) this.spawnBoss('boss1'); if (this.time>=360) this.spawnBoss('boss2'); if (this.time>=480) this.spawnBoss('final');
    this.dialogue.time = Math.max(0,this.dialogue.time-dt); this.dialogueTimer-=dt;
    if (this.dialogueTimer<=0) {
      this.dialogueTimer=28+this.random()*18;
      const lines=[['ドラクエやろ。','信者「異世界への救済を望まれている！」'],['朝活しよ。','信者「新しい時代の幕開けだ！」'],['画面共有して。','信者「すべてを見通す御方…」'],['うきき。','信者「深い。あまりにも深い。」'],['モンハンやろ。','信者「神は大いなる獣を討たれる！」']];
      const l=lines[Math.floor(this.random()*lines.length)]; this.say(l[0],l[1]);
    }
    // Timers use simulation time. Pausing, choices and hidden tabs do not advance combat.
    for (const [id,a] of Object.entries(this.abilities)) if (ABILITIES[id].kind==='attack' && id!=='halo' && id!=='sleep') {
      a.timer-=dt; if(a.timer<=0) { const fired=this.attack(id,a); a.timer=fired?stats(id,a.level,a.evolved).cooldown*this.cooldown():.13; }
    }
    const halo=this.abilities.halo;
    if(halo) { this.haloTimer-=dt; if(this.haloTimer<=0) { const s=stats('halo',halo.level); const radius=s.range+p.moveCharge*s.movingBonus; this.haloTimer=s.cooldown*this.cooldown();
      for(const e of this.enemies) if(distance(e,p)<radius+e.r) this.hurt(e,s.damage);
      this.addEffect('haloPulse',p.x,p.y,radius,'#e6cd77',.25);
    } }
    const sleep=this.abilities.sleep; this.sleeping=!!sleep && p.stationary>=stats('sleep',sleep.level,sleep.evolved).delay;
    if(this.sleeping) { const s=stats('sleep',sleep.level,sleep.evolved); p.hp=Math.min(p.maxHp,p.hp+s.heal*dt); this.sleepTimer-=dt;
      if(this.sleepTimer<=0) { this.sleepTimer=s.cooldown*this.cooldown(); for(const e of this.enemies) if(distance(e,p)<s.range+e.r) this.hurt(e,s.damage,true,sleep.evolved?24:8); this.addEffect('sleepPulse',p.x,p.y,s.range,'#96aef1',.7); this.emit('sleepPulse'); }
    } else this.sleepTimer=Math.min(this.sleepTimer,.1);
    if(this.abilities.share?.evolved) { this.sharePulseTimer-=dt; if(this.sharePulseTimer<=0){this.sharePulseTimer=2;for(const e of this.enemies) if(e.marked>0)this.hurt(e,50,false);} }
    if(this.abilities.rock?.evolved) { this.giantTimer-=dt; if(this.giantTimer<=0) { this.giantTimer=4.8*this.cooldown();const e=this.nearest(900);if(e)this.hazard(e.x,e.y,110,.85,260,'giant'); } }
    this.updateEnemies(dt);
    if(this.state!=='playing') return;
    this.updateProjectiles(dt);
    for(const b of this.enemyBullets) { b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.hypot(b.x-p.x,b.y-p.y)<p.r+b.r){this.damagePlayer(b.damage);b.life=0;} }
    this.enemyBullets=this.enemyBullets.filter(b=>b.life>0 && b.x>-100 && b.y>-100 && b.x<WORLD.w+100 && b.y<WORLD.h+100);
    for(const h of this.hazards) { h.delay-=dt;if(h.delay<=0 && !h.fired) {h.fired=true;if(h.type==='giant'){for(const e of this.enemies) if(distance(e,h)<h.radius+e.r)this.hurt(e,h.damage,true,90);this.addEffect('impact',h.x,h.y,h.radius,'#c9a6f2',.5);this.emit('impact');}else{if(distance(h,p)<h.radius+p.r)this.damagePlayer(h.damage);this.addEffect('danger',h.x,h.y,h.radius,'#e47861',.3);}}if(h.fired)h.life-=dt;}
    this.hazards=this.hazards.filter(h=>!h.fired||h.life>0);
    this.cleanDead();
    if (this.fervor >= 60 && this.rampageTime <= 0 && this.state === 'playing') this.releaseFervor();
    const radius=this.abilities.magnet?stats('magnet',this.abilities.magnet.level).range:130;
    let collected=false;
    for(const g of this.gems) { const d=distance(g,p); if(d<radius)g.attract=true;if(g.attract){const speed=320+(radius-d)*3;g.x+=(p.x-g.x)/Math.max(1,d)*speed*dt;g.y+=(p.y-g.y)/Math.max(1,d)*speed*dt;}
      if(d<17 || (g.attract && d<15+600*dt)){this.gainXP(g.value);g.dead=true;collected=true;}
    }
    if(collected)this.emit('pickup');this.gems=this.gems.filter(g=>!g.dead);
    // A bounded number of gems; merge value rather than discard XP.
    if(this.gems.length>350){const removed=this.gems.splice(0,150);const g=removed[0];g.value=removed.reduce((s,x)=>s+x.value,0);g.attract=false;this.gems.push(g);}
    for (const item of this.pickups) {
      item.life -= dt; const d = distance(item,p);
      if (d < 110) { const step = Math.min(d,300*dt); item.x += (p.x-item.x)/Math.max(1,d)*step; item.y += (p.y-item.y)/Math.max(1,d)*step; }
      if (d < 24) {
        item.life = 0;
        if (item.type === 'heal') { p.hp = Math.min(p.maxHp,p.hp+24); this.addText('+24 回復',p.x,p.y-150,'#b5ffc5',20); this.emit('heal'); }
        else { for (const gem of this.gems) gem.attract = true; this.emit('magnet'); }
        this.addEffect('pickupRing',p.x,p.y,120,item.type==='heal'?'#aaffbe':'#9af1ff',.55);
      }
    }
    this.pickups = this.pickups.filter(item => item.life > 0);
    for(const reward of this.rewards) if(distance(reward,p)<70){reward.dead=true;this.pendingRewards++;this.emit('reward');}
    this.rewards=this.rewards.filter(r=>!r.dead);
    for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
    for(const t of this.texts){t.life-=dt;t.y-=dt*35;}this.texts=this.texts.filter(t=>t.life>0);
    if(this.state==='playing'){if(this.finalDefeated)this.finish(true);else if(this.pendingRewards>0)this.makeChoices('boss');else if(this.pendingLevels>0)this.makeChoices('level');}
  }
  updateEnemies(dt) {
    const p=this.player,chill=this.abilities.chill?stats('chill',this.abilities.chill.level):null;
    for(const e of this.enemies){
      e.age+=dt;e.flash=Math.max(0,e.flash-dt);e.marked=Math.max(0,e.marked-dt);if(e.spawn>0){e.spawn-=dt;continue;}if(e.hp<=0)continue;
      let dx=p.x-e.x,dy=p.y-e.y,d=Math.max(1,Math.hypot(dx,dy));dx/=d;dy/=d;
      let slow=chill&&d<chill.range?1-chill.slow:1;if(e.marked>0&&this.abilities.share?.evolved)slow=Math.min(slow,.65);
      let speed=e.speed*slow;
      if(e.warn>0){e.warn-=dt;speed=0;if(e.warn<=0){e.dash=.6;this.addEffect('dash',e.x,e.y,40,'#e99a65',.2);}}
      if(e.dash>0){e.dash-=dt;e.x+=e.dirX*(e.boss?245:240)*dt;e.y+=e.dirY*(e.boss?245:240)*dt;}
      else {
        if(e.type==='monitor'&&d<260)speed=-e.speed*.35;
        if(e.boss&&d<110)speed*=.5;
        e.x+=dx*speed*dt;e.y+=dy*speed*dt;
        e.special-=dt;if((e.type==='rock'||e.boss)&&e.special<=0){e.special=e.boss?7:8;e.warn=1.4;e.dirX=dx;e.dirY=dy;}
      }
      e.x=clamp(e.x+e.knockX*dt*8,20,WORLD.w-20);e.y=clamp(e.y+e.knockY*dt*8,20,WORLD.h-20);e.knockX*=Math.exp(-dt*10);e.knockY*=Math.exp(-dt*10);
      if(e.type==='monitor'||e.boss){e.fire-=dt;if(e.fire<=0){e.fire=e.boss?3.5:4.6;const a=Math.atan2(dy,dx);
        if(e.type==='final'){for(let i=0;i<8;i++)this.fireBullet(e,a+i*TAU/8,95,7);this.hazard(p.x,p.y,64,1.8,Math.round(18*(e.damageScale||1)));}
        else if(e.boss){for(let i=-1;i<=1;i++)this.fireBullet(e,a+i*.30,95,7);if(e.type==='boss2')this.hazard(p.x,p.y,58,1.8,Math.round(16*(e.damageScale||1)));}
        else {this.fireBullet(e,a,105,6);this.addEffect('shot',e.x,e.y,25,'#e77f68',.15);}
      }}
      if(d<p.r+e.r*.82)this.damagePlayer(e.damage);
    }
    // Cheap spatial separation: local grid, no all-pairs crowd physics.
    const grid=new Map(),cell=58;
    for(const e of this.enemies)if(e.hp>0&&e.spawn<=0){const gx=Math.floor(e.x/cell),gy=Math.floor(e.y/cell);for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++){const near=grid.get(x+','+y);if(!near)continue;for(const other of near){let dx=e.x-other.x,dy=e.y-other.y,d=Math.hypot(dx,dy),limit=(e.r+other.r)*.8;if(d<limit&&d>.01){const push=(limit-d)*.18;e.x+=dx/d*push;e.y+=dy/d*push;other.x-=dx/d*push;other.y-=dy/d*push;}}}const key=gx+','+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);}
    const camera=this.camera;
    for(const e of this.enemies)if(!e.boss&&distance(e,p)>Math.max(this.viewport.w,this.viewport.h)*1.65){e.hp=-1;e.despawn=true;}
  }
  updateProjectiles(dt) {
    // Broad phase is shared across all friendly projectiles.
    const grid=new Map(),cell=80;
    for(const e of this.enemies)if(e.hp>0&&e.spawn<=0){const key=Math.floor(e.x/cell)+','+Math.floor(e.y/cell);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);}
    for(const b of this.projectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.evolved){if(b.x<25||b.x>WORLD.w-25)b.vx*=-1;if(b.y<25||b.y>WORLD.h-25)b.vy*=-1;}
      const gx=Math.floor(b.x/cell),gy=Math.floor(b.y/cell);
      for(let x=gx-1;x<=gx+1&&b.life>0;x++)for(let y=gy-1;y<=gy+1&&b.life>0;y++){const near=grid.get(x+','+y);if(!near)continue;for(const e of near){if(e.hp<=0||b.hit.has(e.id))continue;if(distance(b,e)<b.r+e.r){b.hit.add(e.id);this.hurt(e,b.damage,true,b.type==='rock'?45:10);
          if(b.type==='rock'){
            this.addEffect('rockImpact',e.x,e.y,b.splash,'#d7b4ff',.4,{seed:b.id});
            for(const other of this.enemies) if(other.id!==e.id && other.hp>0 && other.spawn<=0 && distance(other,e)<b.splash+other.r) this.hurt(other,b.damage*.35,true,18);
          }
          b.pierce--;if(b.evolved){const t=this.enemies.find(t=>t.hp>0&&t.spawn<=0&&!b.hit.has(t.id)&&distance(t,b)<350);if(t){const a=Math.atan2(t.y-b.y,t.x-b.x);b.vx=Math.cos(a)*370;b.vy=Math.sin(a)*370;}b.life=Math.max(b.life,.8);}if(b.pierce<=0){b.life=0;break;}}}}
    }
    this.projectiles=this.projectiles.filter(b=>b.life>0&&b.x>-100&&b.x<WORLD.w+100&&b.y>-100&&b.y<WORLD.h+100);
  }
  cleanDead() {
    let count = 0, bosses = false;
    for(const e of this.enemies)if(e.hp<=0&&!e.despawn){
      this.kills++; count++; this.combo++; this.comboTime=3.2; this.bestCombo=Math.max(this.bestCombo,this.combo);
      if(!e.burstHit)this.fervor=Math.min(60,this.fervor+1);
      if([10,25,50,100].includes(this.combo)||(this.combo>100&&this.combo%100===0))this.emit('combo',{count:this.combo});
      this.addEffect('death',e.x,e.y,e.r,e.marked>0?'#8cffe2':e.type==='clock'?'#ffd096':'#d4b8ff',.52,{seed:e.id});
      this.gems.push({x:e.x,y:e.y,value:e.xp,attract:e.boss||this.rampageTime>0,dead:false});
      if(this.pickups.length<10 && this.kills%30===0 && this.time>=this.nextHealDrop){this.pickups.push({x:e.x,y:e.y,type:'heal',life:45});this.nextHealDrop=this.time+10;}
      if(this.pickups.length<10 && this.kills%90===0)this.pickups.push({x:e.x+18,y:e.y,type:'magnet',life:45});
      if(e.boss){
        bosses=true;this.bossesKilled++;this.emit('bossDefeated',{boss:e.type});
        this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);this.player.invincible=Math.max(this.player.invincible,2);
        if(e.type==='final')this.finalDefeated=true;
        else{this.rewards.push({x:e.x,y:e.y});this.say('なんか出た。','神宝を拾って、進化・強化を選ぼう！',4);}
      }
    }
    if(bosses)this.enemyBullets.length=0;
    if(count)this.emit('kills',{count,combo:this.combo});
    this.enemies=this.enemies.filter(e=>e.hp>0);
  }
  snapshot() { return {state:this.state,time:this.time,level:this.level,kills:this.kills,hp:this.player.hp,xp:this.xp,position:{x:this.player.x,y:this.player.y},abilities:Object.fromEntries(Object.entries(this.abilities).map(([id,a])=>[id,{level:a.level,evolved:a.evolved}])),enemies:this.enemies.length,bullets:this.enemyBullets.length,gems:this.gems.length,bosses:[...this.spawnedBosses],rewards:this.rewards.length,combo:this.combo,bestCombo:this.bestCombo,fervor:this.fervor,rampages:this.rampages,pickups:this.pickups.length}; }
}
