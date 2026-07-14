import { analyzeContent } from "@/lib/ai";
import { insertDraft, hasArticleBeenProcessed } from "@/lib/db";
import { getActiveFeedSources, seedDefaultFeedSourcesIfEmpty } from "@/lib/feed-sources";
import { PUBLICATION_NAME } from "@/lib/public-display";
import { NextResponse } from "next/server";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

const parser = new Parser();

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Notifications removed for automated publishing

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await seedDefaultFeedSourcesIfEmpty();
    const feeds = await getActiveFeedSources();

    if (feeds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No enabled feed sources. Add feeds in /editor/sources.',
      }, { status: 400 });
    }

    const shuffledFeeds = shuffle([...feeds]);
    let draftsCreated = 0;
    const MAX_DRAFTS = 3;

    for (const feed of shuffledFeeds) {
      if (draftsCreated >= MAX_DRAFTS) break;

      try {
        const parsedFeed = await parser.parseURL(feed.url);

        for (const item of parsedFeed.items.slice(0, 3)) {
          if (draftsCreated >= MAX_DRAFTS) break;
          if (!item.link) continue;

          const isProcessed = await hasArticleBeenProcessed(item.link);
          if (isProcessed) continue;

          const response = await fetch(item.link);
          const html = await response.text();
          const $ = cheerio.load(html);

          $('script, style, nav, header, footer, iframe, aside, svg, path, button, form, input, noscript, img, video, audio, canvas').remove();

          let rawText = $('body').text().replace(/\s+/g, ' ').trim();
          rawText = rawText.substring(0, 6000);

          if (rawText.length < 500) continue;

          const analyzed = await analyzeContent(rawText, item.link);

          await insertDraft({
            title: analyzed.title,
            genre: analyzed.genre || feed.category,
            summary: analyzed.summary,
            content: analyzed.contentHtml,
            source: feed.name,
            author: PUBLICATION_NAME,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: `${Math.ceil(rawText.split(' ').length / 200)} min read`,
            sourceUrl: item.link,
            status: 'published'
          });

          draftsCreated++;
          break;
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feed.name}:`, feedError);
      }
    }

    if (draftsCreated > 0) {
      console.log(`Successfully published ${draftsCreated} articles.`);
    }

    return NextResponse.json({
      success: true,
      message: "Daily drafting pipeline executed successfully.",
      draftsCreated,
      feedsChecked: shuffledFeeds.length,
    });
  } catch (error: unknown) {
    console.error("Cron Job Draft Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
