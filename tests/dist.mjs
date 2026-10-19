import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const html = read('dist/index.html').toString();
const base = '/keito-survivor/';
const entries = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match => match[1]).filter(path => !path.startsWith('#') && !path.startsWith('data:'));
assert.ok(entries.some(path => path.endsWith('.js')), 'production entry module is present');
assert.ok(entries.some(path => path.endsWith('.css')), 'production stylesheet is present');
for (const path of entries) {
  assert.ok(path.startsWith(base + 'assets/'), `expected Pages asset prefix: ${path}`);
  assert.ok(statSync(new URL('dist/' + path.slice(base.length), root)).size > 0);
}
const names = readdirSync(new URL('dist/assets/', root));
const image = names.find(name => /^iwason-original-.*\.jpeg$/.test(name));
assert.ok(image, 'portrait is bundled locally');
const sha = value => createHash('sha256').update(value).digest('hex');
assert.equal(sha(read('src/assets/iwason-original.jpeg')), sha(read('dist/assets/' + image)));
const js = names.filter(name => name.endsWith('.js')).map(name => read('dist/assets/' + name).toString()).join('\n');
const css = names.filter(name => name.endsWith('.css')).map(name => read('dist/assets/' + name).toString()).join('\n');
assert.ok(js.includes(base + 'assets/' + image), 'Canvas portrait uses the Pages subdirectory');
assert.ok(css.includes(base + 'assets/' + image), 'profile portrait uses the Pages subdirectory');
assert.ok(!html.includes('/src/') && !js.includes('/workspace/'), 'no development-only paths');
const sourceIds = [...read('index.html').toString().matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
for (const id of sourceIds) assert.ok(html.includes(`id="${id}"`), `UI element preserved: ${id}`);
console.log(JSON.stringify({verifiedAt: new Date().toISOString(), base, htmlAssets: entries.length,
  portraitBytes: read('dist/assets/' + image).length, uiElements: sourceIds.length,
  checks: ['entry and CSS exist', 'Pages subdirectory paths', 'unchanged bundled portrait',
    'Canvas and CSS image paths', 'all original UI elements', 'no local paths']}, null, 2));
