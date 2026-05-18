import { analyzeContent } from "@/lib/ai";
import { insertDraft, hasArticleBeenProcessed } from "@/lib/db";
import { NextResponse } from "next/server";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { Resend } from 'resend';
import twilio from 'twilio';

const FEEDS = [
  { url: "https://hnrss.org/frontpage", name: "Hacker News", category: "Technology" },
  { url: "https://www.nature.com/nature.rss", name: "Nature", category: "Science" },
  { url: "https://export.arxiv.org/rss/astro-ph", name: "ArXiv Astrophysics", category: "Science" },
  { url: "https://export.arxiv.org/rss/cs", name: "ArXiv Computer Science", category: "Technology" },
  { url: "https://news.google.com/rss/search?q=DD+News+India&hl=en-IN&gl=IN&ceid=IN:en", name: "DD News", category: "Geopolitics" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World", category: "Geopolitics" },
  { url: "https://news.google.com/rss/search?q=Nvidia+OR+TSMC+OR+ASML+hardware&hl=en-US&gl=US&ceid=US:en", name: "Global Hardware", category: "Technology" },
  { url: "https://www.espn.com/espn/rss/news", name: "ESPN", category: "Sports" }
];

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

async function sendNotifications(draftCount: number) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;

    // Send Email via Resend
    if (process.env.RESEND_API_KEY && adminEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Chakramantra <onboarding@resend.dev>', // Resend testing domain
        to: adminEmail,
        subject: `[Chakramantra] ${draftCount} new drafts ready for review`,
        html: `<p><strong>${draftCount}</strong> new articles have been drafted and are queued for publishing at 4:00 PM IST.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Log in to the Admin Dashboard</a> to review them.</p>`
      });
      console.log('Email notification sent.');
    } else {
      console.log('Resend API key or Admin Email not configured, skipping email notification.');
    }

    // Send SMS via Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && adminPhone) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Chakramantra: ${draftCount} new drafts have been created. They will be published in 1 hour.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: adminPhone
      });
      console.log('SMS notification sent.');
    } else {
      console.log('Twilio credentials not configured, skipping SMS notification.');
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Phase 2: Source new articles to maintain the queue
    const shuffledFeeds = shuffle([...FEEDS]);
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
            author: item.creator || item.author || feed.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: `${Math.ceil(rawText.split(' ').length / 200)} min read`,
            sourceUrl: item.link,
            status: 'draft'
          });

          draftsCreated++;
          break; 
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feed.name}:`, feedError);
      }
    }

    // Trigger Notifications
    if (draftsCreated > 0) {
      await sendNotifications(draftsCreated);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Daily drafting pipeline executed successfully.",
      draftsCreated 
    });
  } catch (error: any) {
    console.error("Cron Job Draft Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
