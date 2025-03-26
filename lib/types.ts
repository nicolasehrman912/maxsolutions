export interface UnifiedProduct {
  id: string | number;
  name: string;
  description?: string;
  image: string;
  source: 'zecat' | 'cdo';
  price?: number;
  category?: string;
  subcategory?: string;
} 