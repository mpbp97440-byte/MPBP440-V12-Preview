import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('CMS_ALLOWED_ORIGIN') ?? 'https://www.mpbp440.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) throw new Error('missing authorization');
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) throw new Error('invalid session');
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: role, error: roleError } = await admin.from('admin_users').select('role,is_active').eq('user_id', user.id).maybeSingle();
  if (roleError || !role || role.role !== 'admin' || role.is_active !== true) throw new Error('administrator access required');
  return { user, admin };
}

export function safeId(value: unknown, fallback = 'media') {
  const id = String(value ?? fallback).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return (id || fallback).slice(0, 100);
}

export function youtubeId(value: unknown) {
  const source = String(value ?? '').trim();
  const match = source.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}
