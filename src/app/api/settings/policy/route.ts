import { NextRequest, NextResponse } from 'next/server';
import { getPolicy, updatePolicy } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    policy: getPolicy(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updatePolicy(body);
    return NextResponse.json({
      success: true,
      message: 'Financial policy guardrails updated successfully.',
      policy: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update policy' },
      { status: 500 }
    );
  }
}
