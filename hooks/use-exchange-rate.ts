import { useState, useEffect } from 'react';

interface ExchangeRate {
  oficial: number | null;
  blue: number | null;
  updated: string | null;
  fallback?: boolean;
}

let cachedRate: ExchangeRate | null = null;
let cacheTime: number | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hora en cliente

export function useExchangeRate() {
  const [rate, setRate] = useState<ExchangeRate | null>(cachedRate);
  const [loading, setLoading] = useState(!cachedRate);

  useEffect(() => {
    // Si el cache es reciente, no volvemos a pedir
    if (cachedRate && cacheTime && Date.now() - cacheTime < CACHE_MS) {
      setRate(cachedRate);
      setLoading(false);
      return;
    }

    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(data => {
        cachedRate = data;
        cacheTime = Date.now();
        setRate(data);
      })
      .catch(() => {
        // Fallback si falla
        const fallback = { oficial: 1200, blue: null, updated: null, fallback: true };
        cachedRate = fallback;
        setRate(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Convierte USD a ARS usando el dólar oficial
   */
  function convertUSDtoARS(usdPrice: number | string): number | null {
    const usd = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(usd) || !rate?.oficial) return null;
    return Math.round(usd * rate.oficial);
  }

  return { rate, loading, convertUSDtoARS };
}