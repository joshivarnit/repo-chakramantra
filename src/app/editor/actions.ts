'use server';

import { createClient } from '@/lib/supabase/server';
import { updatePost, updatePostStatus } from '@/lib/db';
import { isEditorAllowed } from '@/lib/editor-allowlist';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const EDITOR_PATHS = ['/', '/editor', '/editor/posts'] as const;

function revalidateEditor() {
  for (const path of EDITOR_PATHS) {
    revalidatePath(path);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/editor/login');
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const allowedBeforeLogin = await isEditorAllowed(email);
  if (!allowedBeforeLogin) {
    redirect(
      `/editor/login?error=${encodeURIComponent('This email is not authorized for editorial access.')}`
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/editor/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/editor');
}

export async function saveArticle(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const intent = formData.get('intent') as string;

  if (!id) return;

  await updatePost(id, { title, summary, content });

  if (intent === 'publish') {
    const todayDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const supabase = await createClient();
    const { error } = await supabase
      .from('posts')
      .update({ status: 'published', date: todayDate })
      .eq('id', id);

    if (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  revalidateEditor();
  revalidatePath(`/post/${id}`);
  redirect('/editor');
}

export async function publishDraft(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({ status: 'published', date: todayDate })
    .eq('id', id);

  if (error) throw error;

  revalidateEditor();
  revalidatePath(`/post/${id}`);
}

export async function rejectDraft(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await updatePostStatus(id, 'rejected');
  revalidateEditor();
}

export async function unpublishPost(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await updatePostStatus(id, 'draft');
  revalidateEditor();
  revalidatePath(`/post/${id}`);
}
