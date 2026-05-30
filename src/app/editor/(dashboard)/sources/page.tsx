import { getAllFeedSources, seedDefaultFeedSourcesIfEmpty } from "@/lib/feed-sources";
import SourcesManager from "@/components/editor/SourcesManager";

export default async function EditorSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await seedDefaultFeedSourcesIfEmpty();
  const sources = await getAllFeedSources();

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Feed sources</h1>
        <p className="text-zinc-500">
          Manage the RSS feeds the daily cron pulls from. Disabled sources are skipped; removed
          sources are deleted permanently.
        </p>
      </div>

      <SourcesManager sources={sources} error={params.error} />
    </div>
  );
}
