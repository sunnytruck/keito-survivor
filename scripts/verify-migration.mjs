// This audit compares the migration with the exact v1.2 shipped in this conversation.
// It is separate from normal CI so later intentional gameplay changes remain possible.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const original = JSON.parse(readFileSync(new URL('verification/v1.2-original-hashes.json', root)));
const files = [];
for (const [path, expected] of Object.entries(original.files)) {
  let value = readFileSync(new URL(path, root));
  if (path === 'src/art.mjs') value = value.toString().replace(
    "this.image.src=new URL('./assets/iwason-original.jpeg',import.meta.url).href",
    "this.image.src='assets/iwason-original.jpeg'");
  if (path === 'index.html') value = value.toString()
    .replace('href="/src/style.css"', 'href="style.css"')
    .replace('src="/src/app.mjs"', 'src="app.mjs"');
  assert.equal(createHash('sha256').update(value).digest('hex'), expected, `v1.2 preserved: ${path}`);
  files.push(path);
}
console.log(JSON.stringify({verifiedAt: new Date().toISOString(),
  sourceCommit: original.sourceCommit, sourceVersion: original.sourceVersion,
  allowedChanges: ['HTML entry paths', 'Canvas image URL resolved by Vite'],
  preserved: files}, null, 2));
