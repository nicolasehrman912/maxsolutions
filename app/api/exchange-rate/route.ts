import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      next: { revalidate: 3600 } // Cache 1 hora
    });

    if (!response.ok) {
      throw new Error(`Bluelytics API error: ${response.status}`);
    }

    const data = await response.json();

    // Devolvemos los tres tipos de cambio más usados
    return NextResponse.json({
      oficial: data.oficial?.value_sell || null,
      blue: data.blue?.value_sell || null,
      mep: data.oficial_euro?.value_sell || null,
      updated: data.last_update || null
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (error) {
    console.error('[exchange-rate] Error:', error);
    // Fallback con valor aproximado si la API falla
    return NextResponse.json({
      oficial: 1200,
      blue: null,
      mep: null,
      updated: null,
      fallback: true
    });
  }
}