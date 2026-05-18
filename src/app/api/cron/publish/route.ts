import { publishOldestDrafts } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Phase 1: Publish exactly 3 of the oldest drafts
    const POSTS_TO_PUBLISH = 3;
    const publishedCount = await publishOldestDrafts(POSTS_TO_PUBLISH);
    console.log(`Phase 1: Published ${publishedCount} drafts.`);

    return NextResponse.json({ 
      success: true, 
      message: "Daily publish pipeline executed successfully.",
      publishedCount,
    });
  } catch (error: any) {
    console.error("Cron Job Publish Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
