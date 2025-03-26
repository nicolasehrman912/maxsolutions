"use client"

import Image from "next/image"
import Link from "next/link"
import { obtenerBannersPorUbicacion } from "@/MODIFICAR"
import { useEffect, useState, useCallback } from "react"

export function HeroSection() {
  // Estado para almacenar los banners
  const [banners, setBanners] = useState<ReturnType<typeof obtenerBannersPorUbicacion>>([]);
  // Estado para detectar si estamos en un dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  // Estado para rastrear si el componente está montado en el cliente
  const [isMounted, setIsMounted] = useState(false);
  // Estado para controlar qué banner se muestra actualmente
  const [currentIndex, setCurrentIndex] = useState(0);
  // Estado para controlar si las imágenes están cargadas
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Marcar el componente como montado en el cliente
  useEffect(() => {
    setIsMounted(true);
    
    // Obtener banners de la ubicación 'home'
    const heroBanners = obtenerBannersPorUbicacion('home');
    setBanners(heroBanners);
    
    // Inicializar el estado de carga de imágenes
    const initialLoadState: Record<string, boolean> = {};
    heroBanners.forEach(banner => {
      initialLoadState[banner.id] = false;
    });
    setImagesLoaded(initialLoadState);
    
    // Detectar si estamos en móvil
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Considerar móvil en menos de 768px
    };
    
    // Verificar inicialmente
    checkIfMobile();
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar listener al desmontar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Función para actualizar el estado cuando una imagen termina de cargar
  const handleImageLoad = useCallback((bannerId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [bannerId]: true
    }));
  }, []);

  // Efecto para cambiar automáticamente los banners cada 5 segundos
  useEffect(() => {
    if (!isMounted || banners.length <= 1) return; // No hay necesidad de rotar si hay uno o ningún banner
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length, isMounted]);

  // Si no hay banners configurados, no mostrar nada
  if (banners.length === 0) {
    return null;
  }

  // Renderización del banner - igual en servidor y cliente
  const renderBanner = (banner: ReturnType<typeof obtenerBannersPorUbicacion>[0], index: number) => {
    const imageUrl = isMounted && isMobile ? banner.mobileImageUrl : banner.desktopImageUrl;
    return (
      <Link 
        key={banner.id}
        href={banner.linkUrl}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      >
        {banner.title && (
          <div className="absolute z-20 top-1/2 left-12 transform -translate-y-1/2 max-w-lg">
            <h2 className="text-4xl font-bold text-black drop-shadow-lg mb-4">{banner.title}</h2>
          </div>
        )}
        
        <Image
          src={imageUrl}
          alt={banner.title || "Banner promocional"}
          fill
          className="object-cover"
          priority={index === currentIndex || index === (currentIndex + 1) % banners.length}
          sizes="100vw"
          onLoad={() => handleImageLoad(banner.id)}
        />
      </Link>
    );
  };

  // Para múltiples banners, implementar carrusel
  return (
    <div className="w-full relative h-[500px] overflow-hidden">
      {/* Renderizar todos los banners pero solo mostrar el actual */}
      {banners.map((banner, index) => renderBanner(banner, index))}
      
      {/* Indicadores de posición */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Ver banner ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Controles de navegación - solo mostrar si hay más de un banner */}
      {banners.length > 1 && isMounted && (
        <>
          <button 
            onClick={() => setCurrentIndex((currentIndex - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 z-20"
            aria-label="Banner anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button 
            onClick={() => setCurrentIndex((currentIndex + 1) % banners.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 z-20"
            aria-label="Banner siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

