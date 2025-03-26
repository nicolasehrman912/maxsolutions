import { MainCategory, SubCategory } from "@/MODIFICAR";

// Define types for our category structure
export interface CategoryData {
  id: string | number;
  name: string;
  count?: number;
  subcategories?: SubcategoryData[];
}

export interface SubcategoryData {
  id: string | number;
  name: string;
  count?: number;
}

// Format the categories and subcategories as required
export function formatCategories(): CategoryData[] {
  // Define the categories structure according to the requirements
  const categories: CategoryData[] = [
    {
      id: "apparel",
      name: "Apparel",
      subcategories: [
        { id: "127", name: "Chombas", count: 127 },
        { id: "117", name: "Remeras", count: 117 },
        { id: "128", name: "Abrigos", count: 128 },
        { id: "169", name: "Apparel sols", count: 169 },
        { id: "99", name: "Indumentaria corporativa con logo", count: 99 },
        { id: "151", name: "Sale apparel", count: 151 },
        { id: "131", name: "Próximos ingresos", count: 131 },
        { id: "221", name: "Bolsas, Bolsos, Maletines y Mochilas", count: 221 },
      ],
    },
    {
      id: "writing",
      name: "Escritura",
      subcategories: [
        { id: "101", name: "Escritura", count: 101 },
        { id: "64", name: "Bolígrafos corporativos con logo", count: 64 },
        { id: "40", name: "Artículos de oficina corporativos con logo", count: 40 },
        { id: "179", name: "Cuadernos", count: 179 },
      ],
    },
    {
      id: "technology",
      name: "Tecnología",
      subcategories: [
        { id: "62", name: "Regalos corporativos tecnológicos con logo", count: 62 },
        { id: "161", name: "Tech", count: 161 },
      ],
    },
    {
      id: "drinkware",
      name: "Drinkware",
      subcategories: [
        { id: "96", name: "Termos corporativos y drinkware con logo", count: 96 },
        { id: "156", name: "Mates, termos y materas", count: 156 },
        { id: "165", name: "Hydra go", count: 165 },
      ],
    },
    {
      id: "hogar-tiempo-libre",
      name: "Hogar y tiempo libre",
      subcategories: [
        { id: "97", name: "Artículos de bazar corporativos con logo", count: 97 },
        { id: "149", name: "Logo 24 horas", count: 149 },
        { id: "182", name: "Minería", count: 182 },
        { id: "129", name: "Cocina", count: 129 },
        { id: "122", name: "Coolers y luncheras", count: 122 },
      ],
    },
    {
      id: "gorros",
      name: "Gorros",
      subcategories: [
        { id: "48", name: "Gorras y gorros corporativos con logo", count: 48 },
      ],
    },
    {
      id: "paraguas",
      name: "Paraguas",
      subcategories: [
        { id: "58", name: "Paraguas", count: 58 },
      ],
    },
    {
      id: "llaveros",
      name: "Llaveros",
      subcategories: [
        { id: "43", name: "Llaveros corporativos con logo", count: 43 },
      ],
    },
    {
      id: "154",
      name: "Deporte",
      count: 154,
    },
    {
      id: "162",
      name: "Agro",
      count: 162,
    },
    {
      id: "181",
      name: "Día del Trabajador",
      count: 181,
    },
    {
      id: "125",
      name: "Back to School",
      count: 125,
    },
    {
      id: "packaging",
      name: "Packaging",
    },
  ];

  return categories;
}

// Get all subcategory IDs for a main category
export function getAllSubcategoryIds(categoryId: string | number, categories: CategoryData[]): (string | number)[] {
  const category = categories.find(cat => cat.id.toString() === categoryId.toString());
  
  if (!category || !category.subcategories) {
    return [categoryId];
  }
  
  return category.subcategories.map(sub => sub.id);
}

// Find main category by subcategory ID
export function findMainCategoryBySubcategoryId(subcategoryId: string | number, categories: CategoryData[]): CategoryData | undefined {
  return categories.find(category => 
    category.subcategories?.some(subcategory => 
      subcategory.id.toString() === subcategoryId.toString()
    )
  );
}

// Get category by ID (can be main category or subcategory)
export function getCategoryById(categoryId: string | number, categories: CategoryData[]): CategoryData | SubcategoryData | undefined {
  // First, check if it's a main category
  const mainCategory = categories.find(cat => cat.id.toString() === categoryId.toString());
  if (mainCategory) return mainCategory;
  
  // If not, look for a subcategory
  for (const category of categories) {
    if (category.subcategories) {
      const subcategory = category.subcategories.find(
        sub => sub.id.toString() === categoryId.toString()
      );
      if (subcategory) return subcategory;
    }
  }
  
  return undefined;
} 