/**
 * MODIFICAR.ts
 * 
 * ARCHIVO DE CONFIGURACIÓN PRINCIPAL
 * 
 * Este archivo contiene todas las configuraciones que puede modificar sin necesidad
 * de conocimientos de programación. Simplemente cambie los valores siguiendo las instrucciones.
 */
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
  id: number;
  name: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  order: number;
}

interface FeaturedProduct {
  id: number;
  description?: string;
  order: number;
}

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
export const BANNERS: Banner[] = [
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
 * - ID de la categoría (debe coincidir con la API)
 * - Nombre y orden de aparición
 */
export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 101, // Este ID debe coincidir con el de la API
    name: 'Escritura',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzibr.Rojojpg-1649434185.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzibr.Rojojpg-1649434185.jpeg',
    order: 1 // Menor número = mayor prioridad
  },
  {
    id: 161,
    name: 'Tecnología',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUz9a0.Botella-Jim-Black-1.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUz9a0.Botella-Jim-Black-1.jpeg',
    order: 2
  },
  {
    id: 131,
    name: 'Próximos ingresos',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUzjAT.Gorra-Ruffino-Bordeaux-Beige-2.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUzjAT.Gorra-Ruffino-Bordeaux-Beige-2.jpeg',
    order: 3
  },
  {
    id: 221,
    name: 'Bolsas, Bolsos, Maletines y Mochilas',
    desktopImageUrl: 'https://i.im.ge/2025/03/22/pUz0BW.Chomba-Tilcara-negro-4.jpeg',
    mobileImageUrl: 'https://i.im.ge/2025/03/22/pUz0BW.Chomba-Tilcara-negro-4.jpeg',
    order: 4
  }
];

/**
 * PRODUCTOS DESTACADOS
 * 
 * Modifique esta sección para cambiar los productos destacados que aparecen en la página principal.
 * Para cada producto, especifique:
 * - ID del producto (debe coincidir con la API)
 * - Descripción (opcional, solo para referencia)
 * - Orden de aparición
 */
export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  { 
    id: 3587, 
    description: "Producto destacado 1", // Opcional: solo para su referencia
    order: 1 // Menor número = mayor prioridad
  },
  { id: 3627, description: "Producto destacado 2", order: 2 },
  { id: 3589, description: "Producto destacado 3", order: 3 },
  { id: 3590, description: "Producto destacado 4", order: 4 },
  { id: 3591, description: "Producto destacado 5", order: 5 },
  { id: 3592, description: "Producto destacado 6", order: 6 },
  { id: 3593, description: "Producto destacado 7", order: 7 },
  { id: 3594, description: "Producto destacado 8", order: 8 }
];

/**
 * CATEGORÍAS OCULTAS
 * 
 * Modifique esta lista para ocultar categorías específicas en la interfaz.
 * Añada IDs de categorías que no desea que aparezcan en el sitio.
 */
export const CATEGORIAS_OCULTAS: Array<string | {id: string, source: 'zecat' | 'cdo'}> = [
  '164', '110','123','146','177','145','135','153','115','171','138','173','118','168','130','113','133','174','170', '147', '180','172','111'
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
    producto: 'Hola, estoy interesado en el producto "[NOMBRE]" (ID: [ID]). ¿Podrías proporcionarme más información?',
    
    // Mensaje para consulta sobre un pedido
    pedido: 'Hola, quisiera realizar un pedido. Me interesan los siguientes productos:',
  }
};

// ==================================================================================
// ⬇️ DEFINICIONES TÉCNICAS - NO MODIFICAR ⬇️
// ==================================================================================

// Exportaciones de interfaces para uso en el resto de la aplicación
export type { Banner, FeaturedCategory, FeaturedProduct };

// ==================================================================================
// ⬇️ FUNCIONES AUXILIARES - NO MODIFICAR ⬇️
// ==================================================================================

/**
 * Obtiene todos los banners activos
 */
export function obtenerBannersActivos(): Banner[] {
  return BANNERS.filter(banner => banner.active).sort((a, b) => a.priority - b.priority);
}

/**
 * Obtiene banners para la página principal
 * @returns Array con los banners activos ordenados por prioridad
 */
export function obtenerBannersPorUbicacion(): Banner[] {
  return obtenerBannersActivos();
}

/**
 * Obtiene un banner por su ID
 */
export function obtenerBannerPorId(id: string): Banner | undefined {
  return BANNERS.find(banner => banner.id === id);
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
 * Añade una categoría a la lista de categorías ocultas
 */
export function ocultarCategoria(id: string, source?: 'zecat' | 'cdo'): void {
  // Si ya existe, no añadir de nuevo
  if (estaCategoriaOculta(id, source)) {
    return;
  }
  
  // Si no se especifica source, añadir solo el ID
  if (!source) {
    CATEGORIAS_OCULTAS.push(id);
  } else {
    CATEGORIAS_OCULTAS.push({ id, source });
  }
}

/**
 * Elimina una categoría de la lista de categorías ocultas
 */
export function mostrarCategoria(id: string, source?: 'zecat' | 'cdo'): void {
  if (!source) {
    // Eliminar todas las ocurrencias que coincidan con este ID
    for (let i = CATEGORIAS_OCULTAS.length - 1; i >= 0; i--) {
      const cat = CATEGORIAS_OCULTAS[i];
      if (typeof cat === 'string' && cat === id) {
        CATEGORIAS_OCULTAS.splice(i, 1);
      } else if (typeof cat === 'object' && cat.id === id) {
        CATEGORIAS_OCULTAS.splice(i, 1);
      }
    }
  } else {
    // Eliminar solo la ocurrencia específica
    const index = CATEGORIAS_OCULTAS.findIndex(
      cat => typeof cat === 'object' && cat.id === id && cat.source === source
    );
    if (index !== -1) {
      CATEGORIAS_OCULTAS.splice(index, 1);
    }
  }
}

/**
 * Verifica si una categoría está oculta
 */
export function estaCategoriaOculta(id: string, source?: 'zecat' | 'cdo'): boolean {
  return CATEGORIAS_OCULTAS.some(cat => {
    if (typeof cat === 'string') {
      // Si es un string, comparar solo con el ID
      return cat === id;
    } else {
      // Si es un objeto, verificar ID y source si se proporciona
      return cat.id === id && (!source || cat.source === source);
    }
  });
}

/**
 * Filtra un array de categorías para eliminar las categorías ocultas
 */
export function filtrarCategoriasOcultas<T extends { id: string | number, source: 'zecat' | 'cdo' }>(
  categorias: T[]
): T[] {
  return categorias.filter(cat => 
    !estaCategoriaOculta(cat.id.toString()) && !estaCategoriaOculta(cat.id.toString(), cat.source)
  );
}

/**
 * Obtiene todas las categorías ocultas
 */
export function obtenerCategoriasOcultas(): Array<string | {id: string, source: 'zecat' | 'cdo'}> {
  return [...CATEGORIAS_OCULTAS];
}

/**
 * Genera una URL de WhatsApp con un mensaje predefinido
 */
export function generarUrlWhatsApp(
  tipo: keyof typeof WHATSAPP.mensajes = 'general',
  datos?: { nombre?: string, id?: string | number }
): string {
  let mensaje = WHATSAPP.mensajes[tipo] || WHATSAPP.mensajes.general;
  
  // Reemplazar variables en el mensaje si es necesario
  if (datos) {
    mensaje = mensaje
      .replace('[NOMBRE]', datos.nombre || 'Producto')
      .replace('[ID]', datos.id?.toString() || 'N/A');
  }
  
  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  // Formato correcto con código de país
  return `https://wa.me/${WHATSAPP.numeroTelefono}?text=${mensajeCodificado}`;
} 