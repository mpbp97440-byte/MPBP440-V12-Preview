import { corsHeaders, requireAdmin, response, safeId, youtubeId } from '../_shared/admin.ts';

const githubApi = 'https://api.github.com';
const allowedFiles = new Set(['data.json', 'data/music-library.json', 'data/releases.json', 'data/countdowns.json', 'data/videos.json', 'data/gallery.json', 'data/events.json', 'data/news.json', 'data/notifications.json']);
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';

function asList(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function normalizeClip(item: any) {
  const id = safeId(item.id || item.title, 'clip');
  const source = String(item.source ?? item.url ?? item.youtube ?? '').trim();
  const video = { ...item, id };
  const yt = youtubeId(source);
  if (yt) { video.youtubeId = yt; video.url = `https://youtu.be/${yt}`; delete video.src; }
  if (!yt && !String(video.src ?? '').startsWith('https://')) throw new Error(`source vidéo invalide pour ${item.title || id}`);
  return video;
}
function validatePayload(payload: any) {
  if (!payload || typeof payload !== 'object' || !payload.files || typeof payload.files !== 'object') throw new Error('brouillon invalide');
  const files: Record<string, string> = {};
  for (const [path, document] of Object.entries(payload.files)) {
    if (!allowedFiles.has(path)) throw new Error(`fichier non autorisé : ${path}`);
    if (document === null || typeof document !== 'object') throw new Error(`contenu JSON invalide : ${path}`);
    files[path] = json(document);
  }
  if (!Object.keys(files).length) throw new Error('aucune modification à publier');
  const site = payload.files['data.json'] as any;
  const clips = asList(site?.videos).map(normalizeClip);
  if (site) { site.videos = clips; files['data.json'] = json(site); }
  return { files, clips };
}
async function github(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${githubApi}${path}`, { ...init, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.headers ?? {}) } });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return response({ error: 'method not allowed' }, 405, request);
  try {
    const { user, admin } = await requireAdmin(request);
    const { payload } = await request.json();
    const { files, clips } = validatePayload(payload);
    const token = Deno.env.get('GITHUB_ADMIN_TOKEN');
    const repository = Deno.env.get('GITHUB_ADMIN_REPOSITORY') ?? 'mpbp97440-byte/Sparetdee-Simon-site';
    if (!token) throw new Error('GitHub publishing is not configured');
    const ref = await github(token, `/repos/${repository}/git/ref/heads/main`);
    const parent = await github(token, `/repos/${repository}/git/commits/${ref.object.sha}`);
    const blobs = await Promise.all(Object.entries(files).map(async ([path, content]) => {
      const blob = await github(token, `/repos/${repository}/git/blobs`, { method: 'POST', body: JSON.stringify({ content, encoding: 'utf-8' }) });
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    }));
    const tree = await github(token, `/repos/${repository}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: blobs }) });
    const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const commit = await github(token, `/repos/${repository}/git/commits`, { method: 'POST', body: JSON.stringify({ message: `admin: publish site update ${stamp}`, tree: tree.sha, parents: [parent.sha] }) });
    await github(token, `/repos/${repository}/git/refs/heads/main`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
    const registry = clips.map((clip: any) => ({ content_type: 'clip', content_id: clip.id, status: clip.hidden ? 'hidden' : 'active' }));
    if (registry.length) await admin.from('content_registry').upsert(registry, { onConflict: 'content_type,content_id' });
    await admin.from('cms_publications').insert({ author_id: user.id, commit_sha: commit.sha, files: Object.keys(files), summary: { clips: clips.length } });
    await admin.from('cms_drafts').delete().eq('user_id', user.id);
    return response({ sha: commit.sha, files: Object.keys(files), publishedAt: new Date().toISOString(), deployment: 'GitHub Pages déclenché' }, 200, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'publication failed';
    return response({ error: message }, /admin|session|authorization/i.test(message) ? 401 : 400, request);
  }
});
