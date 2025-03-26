import { NextResponse } from 'next/server';
import { formatCategories } from '@/lib/categories';

// API handler for getting the formatted categories data
export async function GET() {
  try {
    // Get formatted categories data
    const categories = formatCategories();
    
    // Return categories as JSON
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Error getting categories' },
      { status: 500 }
    );
  }
} 