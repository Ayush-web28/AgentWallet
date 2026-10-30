import { NextResponse } from 'next/server';
import { getAllOrders, getLedgerStats } from '@/lib/store';

export async function GET() {
  const orders = getAllOrders();
  const stats = getLedgerStats();
  return NextResponse.json({
    orders,
    stats,
  });
}
