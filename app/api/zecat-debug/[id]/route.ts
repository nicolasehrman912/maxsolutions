import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.zecat.com/v1';
const API_TOKEN = process.env.NEXT_PUBLIC_ZECAT_API_TOKEN || '';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE_URL}/generic_product/${params.id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const raw = await res.json();

  return NextResponse.json({
    status: res.status,
    topLevelKeys: Object.keys(raw),
    raw,
  });
}
