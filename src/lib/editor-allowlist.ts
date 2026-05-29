import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getEnvAllowlist(): Set<string> {
  const raw = process.env.EDITOR_ALLOWLIST_EMAILS ?? process.env.ADMIN_EMAIL ?? '';
  return new Set(
    raw
      .split(',')
      .map((e) => normalizeEmail(e))
      .filter(Boolean)
  );
}

/** Emails allowed to use /editor (env list + Supabase `editor_allowlist` table). */
export async function isEditorAllowed(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;

  const normalized = normalizeEmail(email);
  if (getEnvAllowlist().has(normalized)) return true;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return false;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('editor_allowlist')
    .select('email')
    .eq('email', normalized)
    .maybeSingle();

  if (error) {
    console.error('Error checking editor allowlist:', error);
    return false;
  }

  return Boolean(data);
}
