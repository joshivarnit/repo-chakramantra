import { analyzeContent } from "@/lib/ai";
import { insertDraft, hasArticleBeenProcessed } from "@/lib/db";
import { NextResponse } from "next/server";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

const FEEDS = [
  { url: "https://hnrss.org/frontpage", name: "Hacker News", category: "Technology" },
  { url: "https://techcrunch.com/feed/", name: "TechCrunch", category: "Technology" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World", category: "Geopolitics" },
  { url: "https://www.nature.com/nature.rss", name: "Nature", category: "Science" },
  { url: "https://www.espn.com/espn/rss/news", name: "ESPN", category: "Sports" },
  { url: "https://www.theverge.com/rss/index.xml", name: "The Verge", category: "Technology" }
];

const parser = new Parser();

// Shuffle array helper to ensure we pull from different niches each run
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export async function GET(request: Request) {
  try {
    // Check for a secret key to prevent unauthorized triggering of the cron job
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shuffledFeeds = shuffle([...FEEDS]);
    let draftsCreated = 0;
    const MAX_DRAFTS = 5;

    for (const feed of shuffledFeeds) {
      if (draftsCreated >= MAX_DRAFTS) break;

      try {
        const parsedFeed = await parser.parseURL(feed.url);
        
        // Take the latest 3 items from each feed to find an unprocessed one
        for (const item of parsedFeed.items.slice(0, 3)) {
          if (draftsCreated >= MAX_DRAFTS) break;
          
          if (!item.link) continue;

          const isProcessed = await hasArticleBeenProcessed(item.link);
          if (isProcessed) continue;

          // Fetch the actual article HTML
          const response = await fetch(item.link);
          const html = await response.text();
          const $ = cheerio.load(html);
          
          // Basic text extraction - remove scripts, styles, navs to save Gemini tokens
          $('script, style, nav, header, footer, iframe, aside').remove();
          const rawText = $('body').text().replace(/\s+/g, ' ').trim();
          
          // Avoid tiny articles or paywall blocks that yield no text
          if (rawText.length < 500) continue;

          const analyzed = await analyzeContent(rawText, item.link);
          
          await insertDraft({
            title: analyzed.title,
            genre: analyzed.genre || feed.category,
            summary: analyzed.summary,
            content: analyzed.contentHtml,
            source: feed.name,
            author: item.creator || item.author || feed.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: `${Math.ceil(rawText.split(' ').length / 200)} min read`, // dynamic based on 200 wpm
            sourceUrl: item.link,
            status: 'draft'
          });

          draftsCreated++;
          break; // Move to the next feed to ensure diversity of niches, don't just take 5 from one feed
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feed.name}:`, feedError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Daily report generated successfully.",
      draftsCreated 
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
