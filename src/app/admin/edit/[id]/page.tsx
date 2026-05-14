import { getPostById, updatePost } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function saveChanges(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;

  if (id) {
    await updatePost(id, { title, summary, content });
    revalidatePath("/admin");
    revalidatePath(`/post/${id}`);
    redirect("/admin");
  }
}

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Edit Draft</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
        <form action={saveChanges} className="space-y-6">
          <input type="hidden" name="id" value={post.id} />
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold">Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              defaultValue={post.title}
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-bold">Summary / AI Analysis</label>
            <textarea 
              id="summary" 
              name="summary" 
              defaultValue={post.summary}
              rows={3}
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-bold">HTML Content</label>
            <textarea 
              id="content" 
              name="content" 
              defaultValue={post.content}
              rows={15}
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition-colors">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
