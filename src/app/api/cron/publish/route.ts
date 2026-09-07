import { NextResponse } from "next/server";
import { publishOldestDrafts } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publishedCount = await publishOldestDrafts(3);
    
    if (publishedCount > 0) {
      revalidatePath('/');
      revalidatePath('/articles');
    }

    return NextResponse.json({
      success: true,
      message: `Published ${publishedCount} drafts successfully.`,
      publishedCount,
    });
  } catch (error) {
    console.error("Cron Job Publish Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
