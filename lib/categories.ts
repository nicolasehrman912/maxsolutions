import { MainCategory, SubCategory } from "@/MODIFICAR";

export interface CategoryData {
  id: string | number;
  name: string;
  count?: number;
  subcategories?: SubcategoryData[];
  zecatIds?: (string | number)[];
  cdoIds?: number[];
}

export interface SubcategoryData {
  id: string | number;
  name: string;
  count?: number;
  source?: 'zecat' | 'cdo';
}

export function formatCategories(): CategoryData[] {
  return [
    {
      id: "apparel",
      name: "Apparel",
      zecatIds: ["127", "117", "128", "169", "99", "151"],
      cdoIds: [], // CDO no tiene indumentaria
      subcategories: [
        { id: "127", name: "Chombas" },
        { id: "117", name: "Remeras" },
        { id: "128", name: "Abrigos" },
        { id: "169", name: "Apparel Sols" },
        { id: "99",  name: "Indumentaria corporativa" },
        { id: "151", name: "Sale apparel" },
      ],
    },
    {
      id: "writing",
      name: "Escritura",
      zecatIds: ["101", "64", "40", "179"],
      cdoIds: [101, 599, 600],
      subcategories: [
        { id: "101", name: "Escritura" },
        { id: "64",  name: "Bolígrafos corporativos" },
        { id: "40",  name: "Artículos de oficina" },
        { id: "179", name: "Cuadernos" },
      ],
    },
    {
      id: "bolsos",
      name: "Bolsos y Mochilas",
      zecatIds: ["98", "221"],
      cdoIds: [221, 598],
      subcategories: [
        { id: "98",  name: "Bolsos y mochilas corporativos" },
        { id: "221", name: "Bolsas, Bolsos y Maletines" },
      ],
    },
    {
      id: "technology",
      name: "Tecnología",
      zecatIds: ["62", "161"],
      cdoIds: [161, 639],
      subcategories: [
        { id: "62",  name: "Regalos tecnológicos" },
        { id: "161", name: "Tech" },
      ],
    },
    {
      id: "drinkware",
      name: "Drinkware",
      zecatIds: ["96", "156", "165"],
      cdoIds: [749, 37277],
      subcategories: [
        { id: "96",  name: "Termos y drinkware" },
        { id: "156", name: "Mates, termos y materas" },
        { id: "165", name: "Hydra Go" },
      ],
    },
    {
      id: "hogar-tiempo-libre",
      name: "Hogar y tiempo libre",
      zecatIds: ["97", "149", "182", "129", "122"],
      cdoIds: [11, 41, 8239],
      subcategories: [
        { id: "97",  name: "Artículos de bazar" },
        { id: "149", name: "Logo 24 horas" },
        { id: "182", name: "Minería" },
        { id: "129", name: "Cocina" },
        { id: "122", name: "Coolers y luncheras" },
      ],
    },
    {
      id: "gorros",
      name: "Gorros",
      zecatIds: ["48"],
      cdoIds: [251],
      subcategories: [
        { id: "48", name: "Gorras y gorros corporativos" },
      ],
    },
    {
      id: "paraguas",
      name: "Paraguas",
      zecatIds: ["58"],
      cdoIds: [281],
      subcategories: [
        { id: "58", name: "Paraguas" },
      ],
    },
    {
      id: "llaveros",
      name: "Llaveros",
      zecatIds: ["43"],
      cdoIds: [511],
      subcategories: [
        { id: "43", name: "Llaveros corporativos" },
      ],
    },
    {
      id: "deportes",
      name: "Deportes",
      zecatIds: ["154"],
      cdoIds: [],
      subcategories: [
        { id: "154", name: "Deporte" },
      ],
    },
    {
      id: "agro",
      name: "Agro",
      zecatIds: ["162"],
      cdoIds: [38172, 24780],
      subcategories: [
        { id: "162", name: "Agro" },
      ],
    },
    {
      id: "packaging",
      name: "Packaging",
      zecatIds: ["181", "144"],
      cdoIds: [],
      subcategories: [
        { id: "181", name: "Packaging" },
        { id: "144", name: "Packaging premium" },
      ],
    },
    {
      id: "kits-y-sets",
      name: "Kits y Sets",
      zecatIds: [],
      cdoIds: [],
      subcategories: [],
    },
  ];
}

/**
 * Dado un array de categoryIds, devuelve los IDs correctos para cada proveedor.
 * hasCDOMapping = true significa que la categoría tiene IDs de CDO asignados
 * hasCDOMapping = false significa que CDO no tiene esa categoría → no mostrar nada de CDO
 */
export function getUnifiedIdsForCategories(
  categoryIds: (string | number)[],
  categories: CategoryData[]
): { zecatIds: string[], cdoIds: number[], hasCDOMapping: boolean } {
  const zecatIds = new Set<string>();
  const cdoIds = new Set<number>();
  let foundAnyCategory = false;
  let hasCDOMapping = false;

  for (const catId of categoryIds) {
    const catStr = catId.toString();

    // Buscar como categoría principal (slug como "drinkware", "bolsos", etc.)
    const mainCat = categories.find(c => c.id.toString() === catStr);
    if (mainCat) {
      foundAnyCategory = true;
      (mainCat.zecatIds || []).forEach(id => zecatIds.add(id.toString()));
      
      // Si cdoIds está definido (aunque sea vacío), es un mapeo explícito
      if (mainCat.cdoIds !== undefined) {
        if (mainCat.cdoIds.length > 0) {
          hasCDOMapping = true;
          mainCat.cdoIds.forEach(id => cdoIds.add(id));
        }
        // Si cdoIds es [] vacío, hasCDOMapping permanece false → no mostrar CDO
      }
      continue;
    }

    // Si no es un slug, es un ID numérico de subcategoría Zecat → usarlo directo
    // En este caso no tenemos info de CDO
    zecatIds.add(catStr);
  }

  return {
    zecatIds: Array.from(zecatIds),
    cdoIds: Array.from(cdoIds),
    hasCDOMapping
  };
}

// Legacy helpers
export function getAllSubcategoryIds(categoryId: string | number, categories: CategoryData[]): (string | number)[] {
  const category = categories.find(cat => cat.id.toString() === categoryId.toString());
  if (!category) return [categoryId];
  if (category.zecatIds?.length) return category.zecatIds;
  if (category.subcategories?.length) return category.subcategories.map(s => s.id);
  return [categoryId];
}

export function findMainCategoryBySubcategoryId(subcategoryId: string | number, categories: CategoryData[]): CategoryData | undefined {
  return categories.find(category =>
    category.subcategories?.some(sub => sub.id.toString() === subcategoryId.toString()) ||
    category.zecatIds?.some(id => id.toString() === subcategoryId.toString())
  );
}

export function getCategoryById(categoryId: string | number, categories: CategoryData[]): CategoryData | SubcategoryData | undefined {
  const mainCategory = categories.find(cat => cat.id.toString() === categoryId.toString());
  if (mainCategory) return mainCategory;
  for (const category of categories) {
    if (category.subcategories) {
      const sub = category.subcategories.find(s => s.id.toString() === categoryId.toString());
      if (sub) return sub;
    }
  }
  return undefined;
}