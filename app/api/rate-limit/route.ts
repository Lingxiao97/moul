import { NextRequest, NextResponse } from 'next/server';
import { getTopRequesters, getViolationPatterns, getOverallStats } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    
    const data: Record<string, unknown> = {};
    
    if (type === 'all' || type === 'stats') {
      data.stats = getOverallStats();
    }
    
    if (type === 'all' || type === 'top-requesters') {
      const limit = parseInt(searchParams.get('limit') || '20');
      data.topRequesters = getTopRequesters(limit);
    }
    
    if (type === 'all' || type === 'violations') {
      data.violations = getViolationPatterns();
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[RateLimit Dashboard] Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit data' },
      { status: 500 }
    );
  }
}
