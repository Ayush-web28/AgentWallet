import { NextRequest, NextResponse } from 'next/server';
import { executeProcurementLoop } from '@/lib/agent/loop';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required for autonomous agent procurement.' },
        { status: 400 }
      );
    }

    const result = await executeProcurementLoop(prompt.trim());
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/agent/run error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal Agent Runtime Error',
      },
      { status: 500 }
    );
  }
}
