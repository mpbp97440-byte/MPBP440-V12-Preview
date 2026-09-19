const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
  if (entry.name === '.git' || entry.name === 'node_modules') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html') && !path.basename(file).startsWith('SNIPPET_'));
const failures = [];
const idsByFile = new Map();
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const ids = new Set([...source.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]));
  if (path.relative(root, file).replace(/\\/g,'/') === 'mpbp-tv/index.html') {
    for (const match of source.matchAll(/data-v12-clip=["']([^"']+)["']/g)) ids.add(match[1]);
    const tvJs = fs.readFileSync(path.join(root, 'assets/js/v12-mpbp-tv.js'), 'utf8');
    assert.match(tvJs, /card\.id = card\.dataset\.v12Clip/);
    for (const match of tvJs.matchAll(/^\s*['"]([^'"]+)['"]:\s*\{/gm)) ids.add(match[1]);
  }
  idsByFile.set(file, ids);
}
const attrs = /\b(?:href|src|poster)=["']([^"']+)["']/g;
const ignored = /^(?:https?:|mailto:|tel:|data:|javascript:|blob:|#?$)/i;
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(attrs)) {
    const raw = match[1].trim();
    if (!raw || ignored.test(raw) || raw.includes('$' + '{')) continue;
    const [withoutHash, fragment = ''] = raw.split('#');
    const pathname = withoutHash.split('?')[0];
    let target = pathname ? (pathname.startsWith('/') ? path.join(root, pathname) : path.resolve(path.dirname(file), pathname)) : file;
    if (pathname.endsWith('/')) target = path.join(target, 'index.html');
    if (!path.extname(target) && pathname) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { failures.push(`${path.relative(root,file)} -> fichier absent: ${raw}`); continue; }
    if (fragment && target.endsWith('.html')) {
      const decoded = decodeURIComponent(fragment);
      if (!idsByFile.get(target)?.has(decoded)) failures.push(`${path.relative(root,file)} -> fragment absent: ${raw}`);
    }
  }
}
for (const file of ['data.json', ...files.filter(file => file.includes(path.join(root,'data')) && file.endsWith('.json')).map(file => path.relative(root,file))]) JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
assert.deepStrictEqual(data.upcoming.map(item => item.id).sort(), ['brainrot-society-remix','legalize-la-kalite-remix']);
assert.ok(data.upcoming.every(item => item.date.startsWith('2026-09-26') && item.status === 'À venir' && Object.keys(item.links || {}).length === 0));
assert.ok(!('countdown' in data));
assert.ok(data.events.every(item => item.archive && item.status === 'Passé'));
const homepage = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(!homepage.includes('La prochaine sortie officielle de Sparetdee Simon arrive le 8 août 2026'));
for (const stale of ['avant la sortie officielle du morceau le 13 août 2026','avant la sortie officielle du morceau le 11 août 2026','en attendant la sortie officielle du morceau le 8 août 2026']) {
  for (const file of files.filter(file => /\.(?:html|js|json)$/.test(file) && !file.includes(path.join(root,'tests')))) assert.ok(!fs.readFileSync(file,'utf8').includes(stale), `texte périmé dans ${path.relative(root,file)}`);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Site integrity: ${htmlFiles.length} pages HTML, liens locaux, fragments, assets et JSON validés.`);
