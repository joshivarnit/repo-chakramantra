import { getPostById } from '@/lib/db';
import { notFound } from 'next/navigation';
import ArticleEditor from '@/components/admin/ArticleEditor';

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <ArticleEditor post={post} />;
}
