'use server';

import { createClient } from '@/lib/supabase/server';
import { updatePost, updatePostStatus } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/admin');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/admin/login?signup_error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/admin');
  }

  redirect(
    '/admin/login?success=' +
      encodeURIComponent('Account created. Check your email to confirm, then sign in above.')
  );
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

  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/post/${id}`);
  redirect('/admin');
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

  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/post/${id}`);
}

export async function rejectDraft(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await updatePostStatus(id, 'rejected');
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
}

export async function unpublishPost(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await updatePostStatus(id, 'draft');
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/post/${id}`);
}
