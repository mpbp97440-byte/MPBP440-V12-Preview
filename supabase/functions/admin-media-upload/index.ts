import { corsHeaders, requireAdmin, response, safeId } from '../_shared/admin.ts';

const folders = new Set(['covers', 'clips', 'gallery', 'events', 'artists']);
const mediaTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'video/mp4']);
const maxBytes = 524288000;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response({ error: 'method not allowed' }, 405);
  try {
    const { admin } = await requireAdmin(request);
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') ?? '');
    if (!(file instanceof File) || !folders.has(folder) || !mediaTypes.has(file.type) || file.size < 1 || file.size > maxBytes) {
      return response({ error: 'invalid media upload' }, 400);
    }
    const extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' } as Record<string, string>)[file.type];
    const name = `${folder}/${crypto.randomUUID()}-${safeId(file.name.replace(/\.[^.]+$/, 'file'))}.${extension}`;
    const { error } = await admin.storage.from('mpbp440-media').upload(name, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });
    if (error) throw error;
    const { data } = admin.storage.from('mpbp440-media').getPublicUrl(name);
    return response({ path: name, url: data.publicUrl, type: file.type, size: file.size });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'upload failed' }, /admin|session|authorization/i.test(String(error)) ? 401 : 500);
  }
});
