import { NextRequest, NextResponse } from 'next/server';

const CDO_API_BASE = 'http://api.argentina.cdopromocionales.com/v2';
const CDO_TOKEN = process.env.NEXT_PUBLIC_CDO_API_TOKEN || 'upsMlcOa12EV07IwbAvvlA';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Construir URL hacia CDO
  const params = new URLSearchParams();
  params.set('auth_token', CDO_TOKEN);
  
  // Pasar parámetros de filtrado
  const pageSize = searchParams.get('page_size');
  const pageNumber = searchParams.get('page_number');
  const categoryId = searchParams.get('category_id');
  const search = searchParams.get('search');
  
  if (pageSize) params.set('page_size', pageSize);
  if (pageNumber) params.set('page_number', pageNumber);
  if (categoryId) params.set('category_id', categoryId);
  if (search) params.set('search', search);
  
  const cdoUrl = `${CDO_API_BASE}/products?${params.toString()}`;
  
  try {
    const response = await fetch(cdoUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 14400 } // Cache 4 horas en el servidor
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'CDO API error', status: response.status }, { status: response.status });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('CDO proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from CDO' }, { status: 500 });
  }
}