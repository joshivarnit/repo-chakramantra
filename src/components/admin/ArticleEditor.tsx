'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useState, useTransition } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Save,
} from 'lucide-react';
import LinkNext from 'next/link';
import EditorToolbar from './EditorToolbar';
import { saveArticle } from '@/app/admin/actions';
import type { Post } from '@/lib/db';

interface ArticleEditorProps {
  post: Post;
}

export default function ArticleEditor({ post }: ArticleEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Placeholder.configure({
        placeholder: 'Write your article body here…',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: post.content,
    editorProps: {
      attributes: {
        class:
          'wysiwyg-editor prose prose-zinc dark:prose-invert max-w-none min-h-[420px] px-6 py-5 focus:outline-none',
      },
    },
  });

  const submit = useCallback(
    (intent: 'draft' | 'publish') => {
      if (!editor || !title.trim() || !summary.trim()) return;

      const formData = new FormData();
      formData.set('id', post.id);
      formData.set('title', title.trim());
      formData.set('summary', summary.trim());
      formData.set('content', editor.getHTML());
      formData.set('intent', intent);

      startTransition(() => saveArticle(formData));
    },
    [editor, post.id, summary, title]
  );

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <LinkNext
              href="/admin"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </LinkNext>
            <div className="hidden sm:block h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {post.status === 'published' ? 'Published' : 'Draft'} · {post.genre}
              </p>
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {title || 'Untitled article'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {post.status === 'published' && (
              <LinkNext
                href={`/post/${post.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </LinkNext>
            )}
            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Source</span>
              </a>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit('draft')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save draft
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit('publish')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {post.status === 'published' ? 'Update live' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-100 px-6 py-5 space-y-4 dark:border-zinc-800">
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article headline"
                className="w-full bg-transparent text-2xl sm:text-3xl font-heading font-bold tracking-tight text-zinc-900 dark:text-white placeholder:text-zinc-300 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="summary"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Summary / deck
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="A short summary shown on the homepage and article header"
                className="w-full resize-none bg-transparent text-base text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
              />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">{post.source}</span>
              <span>{post.author}</span>
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>

          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />

          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 text-xs text-zinc-400 dark:border-zinc-800">
            <span>{typeof wordCount === 'number' ? wordCount : 0} words</span>
            <span>All articles stay in draft until you publish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
