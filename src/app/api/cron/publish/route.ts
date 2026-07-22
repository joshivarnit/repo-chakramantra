import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-publish is disabled — articles must be published manually from the admin dashboard.
    return NextResponse.json({
      success: true,
      message:
        'Auto-publish is disabled. Publish articles manually from the admin editor.',
      publishedCount: 0,
    });
  } catch (error) {
    console.error("Cron Job Publish Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
