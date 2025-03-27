/**
 * MODIFICAR.ts
 * 
 * ARCHIVO DE CONFIGURACIÓN PRINCIPAL
 * 
 * Este archivo contiene todas las configuraciones que puede modificar sin necesidad
 * de conocimientos de programación. Simplemente cambie los valores siguiendo las instrucciones.
 */

// ==================================================================================
// ⬇️ ÁREA DE CONFIGURACIÓN - MODIFIQUE ESTOS VALORES ⬇️
// ==================================================================================

/**
 * BANNERS PROMOCIONALES
 * 
 * Modifique esta sección para cambiar los banners que aparecen en el sitio.
 * Para cada banner, puede configurar:
 * - Imágenes separadas para móvil y escritorio
 * - Enlaces al hacer clic
 * - Prioridad de aparición (número más bajo aparece primero)
 * - Estado (activo/inactivo)
 */
export const BANNERS = [
  {
    id: 'banner-nuevos-productos',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzrW8.Banner-Web-Nuevos-Productos-Pampero-1580x700px.webp',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzXO9.Banner-Mobile-Nuevos-Productos-Pampero-400x480px.webp',
    linkUrl: '/products',
    priority: 0, // Menor número = mayor prioridad
    active: true // true = se muestra, false = no se muestra
  },
  {
    id: 'banner-sale-mochilas',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzOhM.Banners-Sale-mochilas-Banner-Web-1920x700px.png',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzFoh.Banners-Sale-mochilas-Banner-Mobile-400x600px.png',
    linkUrl: '/products',
    priority: 1,
    active: true
  }
];

/**
 * CATEGORÍAS DESTACADAS
 * 
 * Modifique esta sección para cambiar las categorías destacadas que aparecen en la página principal.
 * Para cada categoría, puede configurar:
 * - Imágenes separadas para móvil y escritorio
 * - ID de la categoría general (string descriptivo)
 * - Array de subcategorías (IDs que coinciden con la API)
 * - Nombre y orden de aparición
 */
export const FEATURED_CATEGORIES = [
  {
    id: "apparel",
    name: 'Apparel',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUz0BW.Chomba-Tilcara-negro-4.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUz0BW.Chomba-Tilcara-negro-4.jpeg',
    order: 1, // Menor número = mayor prioridad
    subcategories: [127, 117, 128, 169, 99, 151, 131, 221] // Chombas, Remeras, Abrigos, etc.
  },
  {
    id: "writing", 
    name: 'Escritura',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzibr.Rojojpg-1649434185.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzibr.Rojojpg-1649434185.jpeg',
    order: 2,
    subcategories: [101, 64, 40, 179] // Escritura, Bolígrafos, Artículos de oficina, Cuadernos
  },
  {
    id: "technology",
    name: 'Tecnología',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUz9a0.Botella-Jim-Black-1.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUz9a0.Botella-Jim-Black-1.jpeg',
    order: 3,
    subcategories: [62, 161] // Regalos tecnológicos, Tech
  },
  {
    id: "drinkware",
    name: 'Drinkware',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzjAT.Gorra-Ruffino-Bordeaux-Beige-2.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzjAT.Gorra-Ruffino-Bordeaux-Beige-2.jpeg',
    order: 4,
    subcategories: [96, 156, 165] // Termos corporativos, Mates/termos, Hydra go
  }
];

/**
 * PRODUCTOS DESTACADOS
 * 
 * Modifique esta sección para cambiar los productos destacados que aparecen en la página principal.
 * Para cada producto, especifique:
 * - ID del producto (debe coincidir con la API)
 * - Source: 'zecat' o 'cdo' (según el origen del producto)
 * - Descripción (opcional, solo para referencia)
 * - Orden de aparición
 */
export const FEATURED_PRODUCTS = [
  { 
    id: 1727, 
    source: 'cdo',
    order: 1 
  },
  { 
    id: 3898, 
    source: 'zecat',
    order: 2 
  },
  // Añada más productos aquí según necesite
];

/**
 * CATEGORÍAS OCULTAS
 * 
 * Modifique esta lista para ocultar categorías específicas en la interfaz.
 * Añada IDs de categorías que no desea que aparezcan en el sitio.
 */
export const CATEGORIAS_OCULTAS: Array<string | {id: string, source?: 'zecat' | 'cdo'}> = [
  '164', '110','123','146','177','145','135','153','115',
  '171','138','173','118','168','130','113','133','174',
  '170', '147', '180','172','111'
];

/**
 * CONFIGURACIÓN DE WHATSAPP
 * 
 * Modifique esta sección para cambiar el número de WhatsApp y los mensajes predeterminados.
 */
export const WHATSAPP = {
  // Número de teléfono con código de país (sin espacios ni caracteres especiales)
  numeroTelefono: '5491124779637',
  
  // Mensajes predeterminados para diferentes situaciones
  mensajes: {
    // Mensaje general para el botón de contacto
    general: 'Hola, me gustaría solicitar información sobre sus productos.',
    
    // Mensaje para consulta sobre un producto específico (se concatenará con el nombre e ID)
    producto: 'Hola, estoy interesado en el producto "[NOMBRE]" (Ref: [ID]). ¿Podrías proporcionarme más información?',
    
    // Mensaje para consulta sobre un pedido
    pedido: 'Hola, quisiera realizar un pedido. Me interesan los siguientes productos:',
  }
};

/**
 * CATEGORÍAS JERÁRQUICAS
 * 
 * Esta sección permite definir categorías principales y sus subcategorías.
 * Cada categoría principal puede contener múltiples subcategorías.
 * Las subcategorías deben existir en la API con el ID especificado.
 */
export const CATEGORIAS_JERARQUICAS = [
  {
    id: "botellas",
    name: "Botellas",
    description: "Todo tipo de botellas promocionales",
    subcategories: [
      { id: "161", name: "Tecnología" },
      { id: "101", name: "Escritura" }
      // Añada más subcategorías según necesite
    ]
  },
  {
    id: "textil",
    name: "Textil",
    description: "Productos textiles promocionales",
    subcategories: [
      { id: "221", name: "Bolsas, Bolsos, Maletines y Mochilas" },
      { id: "131", name: "Próximos ingresos" }
      // Añada más subcategorías según necesite
    ]
  }
  // Añada más categorías principales según necesite
];

// ==================================================================================
// ⬇️ NO MODIFICAR DESDE AQUÍ HACIA ABAJO ⬇️
// ==================================================================================

// Definiciones de tipos para asegurar compatibilidad (NO MODIFICAR)
interface Banner {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  title?: string;
  priority: number;
  active: boolean;
}

interface FeaturedCategory {
  id: string | number;
  name: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  order: number;
  subcategories?: (string | number)[];
}

interface FeaturedProduct {
  id: number;
  description?: string;
  order: number;
  source?: 'zecat' | 'cdo';
}

interface MainCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: SubCategory[];
}

interface SubCategory {
  id: string | number;
  name: string;
  source?: 'zecat' | 'cdo';
}

// Exportaciones de interfaces para uso en el resto de la aplicación
export type { Banner, FeaturedCategory, FeaturedProduct, MainCategory, SubCategory };

/**
 * Obtiene todas las categorías principales
 */
export function obtenerCategoriasJerarquicas(): MainCategory[] {
  return CATEGORIAS_JERARQUICAS;
}

/**
 * Obtiene una categoría principal por su ID
 */
export function obtenerCategoriaPrincipalPorId(id: string): MainCategory | undefined {
  return CATEGORIAS_JERARQUICAS.find(cat => cat.id === id);
}

/**
 * Obtiene todas las subcategorías (aplanadas en un solo array)
 */
export function obtenerTodasLasSubcategorias(): SubCategory[] {
  return CATEGORIAS_JERARQUICAS.flatMap(cat => cat.subcategories);
}

/**
 * Encuentra la categoría principal a la que pertenece una subcategoría
 */
export function encontrarCategoriaPrincipal(subcategoryId: string | number): MainCategory | undefined {
  return CATEGORIAS_JERARQUICAS.find(mainCat => 
    mainCat.subcategories.some(subCat => subCat.id.toString() === subcategoryId.toString())
  );
}

/**
 * Obtiene banners activos por ubicación
 * @returns Array con los banners activos ordenados por prioridad
 */
export function obtenerBannersPorUbicacion(): Banner[] {
  return BANNERS.filter(banner => banner.active).sort((a, b) => a.priority - b.priority);
}

/**
 * Obtiene los IDs de los productos destacados ordenados por prioridad
 */
export function obtenerIdsProductosDestacados(): number[] {
  return FEATURED_PRODUCTS
    .sort((a, b) => a.order - b.order)
    .map(product => product.id);
}

/**
 * Verifica si una categoría está oculta
 */
export function estaCategoriaOculta(id: string, source?: 'zecat' | 'cdo'): boolean {
  return CATEGORIAS_OCULTAS.some(cat => {
    if (typeof cat === 'string') {
      return cat === id;
    } else if (typeof cat === 'object' && cat !== null) {
      return 'id' in cat && cat.id === id && (!source || ('source' in cat && cat.source === source));
    }
    return false;
  });
}

/**
 * Genera una URL de WhatsApp con el mensaje apropiado según el tipo de consulta
 */
export function generarUrlWhatsApp(
  tipo: keyof typeof WHATSAPP.mensajes = 'general',
  datos?: { nombre?: string, id?: string | number }
): string {
  // Comprobamos si estamos en el servidor
  if (typeof window === 'undefined') {
    // En el servidor, devolvemos un marcador de posición que será reemplazado en el cliente
    return "#";
  }
  
  // Base URL para WhatsApp
  const baseUrl = "https://api.whatsapp.com/send";
  
  // Obtener el mensaje según el tipo
  let mensaje = WHATSAPP.mensajes[tipo] || WHATSAPP.mensajes.general;
  
  // Reemplazar placeholders con datos reales si se proporcionan
  if (datos) {
    if (datos.nombre) {
      mensaje = mensaje.replace('[NOMBRE]', datos.nombre);
    }
    if (datos.id) {
      // Ocultar información del proveedor en el ID
      let maskedId = datos.id.toString();
      if (maskedId.includes('zecat_')) {
        maskedId = maskedId.replace('zecat_', 'Z-');
      } else if (maskedId.includes('cdo_')) {
        maskedId = maskedId.replace('cdo_', 'C-');
      }
      mensaje = mensaje.replace('[ID]', maskedId);
    }
  }
  
  // Construir la URL con el número de teléfono y el mensaje
  const url = `${baseUrl}?phone=${WHATSAPP.numeroTelefono}&text=${encodeURIComponent(mensaje)}`;
  
  return url;
} 
