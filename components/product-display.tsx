"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Phone } from "lucide-react"
import { GenericProduct, CDOProduct, CDOVariant, CDOIcon, ProductVariant } from "@/lib/api/types"
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { parseCompositeId } from "@/lib/api/unified"
import { UnifiedProduct } from "@/lib/types"
import { useExchangeRate } from "@/hooks/use-exchange-rate"

interface ProductDisplayProps {
  product: UnifiedProduct
  productId: string
}

// ─── Precio Zecat ──────────────────────────────────────────────────────────────
function PriceSection({ price }: { price?: number | string | null }) {
  if (!price || Number(price) <= 0) return null
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price))
  return (
    <div className="bg-muted/40 border rounded-xl p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        Precio sin personalización
      </p>
      <p className="text-3xl font-bold">{formatted}</p>
      <p className="text-xs text-muted-foreground">
        * El precio final varía según cantidad, tipo de impresión y diseño.
      </p>
    </div>
  )
}

// ─── Precio CDO (USD → ARS) ────────────────────────────────────────────────────
function CDOPriceSection({ listPrice }: { listPrice?: string }) {
  const { convertUSDtoARS, loading } = useExchangeRate()
  if (!listPrice) return null
  const arsPrice = convertUSDtoARS(listPrice)
  if (loading) {
    return (
      <div className="bg-muted/40 border rounded-xl p-4 space-y-2 animate-pulse">
        <div className="h-3 bg-muted rounded w-32" />
        <div className="h-8 bg-muted rounded w-40" />
      </div>
    )
  }
  if (!arsPrice || arsPrice <= 0) return null
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(arsPrice)
  return (
    <div className="bg-muted/40 border rounded-xl p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        Precio sin personalización
      </p>
      <p className="text-3xl font-bold">{formatted}</p>
      <p className="text-xs text-muted-foreground">
        * El precio final varía según cantidad, tipo de impresión y diseño.
      </p>
    </div>
  )
}

// ─── Selector de colores CDO (círculos con hex real) ──────────────────────────
function CDOColorSelector({
  variants,
  selectedIndex,
  onSelect,
}: {
  variants: CDOVariant[]
  selectedIndex: number
  onSelect: (i: number) => void
}) {
  if (!variants.length) return null
  const selectedColor = variants[selectedIndex]?.color

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Color:{" "}
        <span className="font-normal text-muted-foreground">
          {selectedColor?.name || ""}
        </span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((v, i) => {
          const raw = v.color?.hex_code ?? ""
          const bg = raw
            ? raw.startsWith("#")
              ? raw
              : `#${raw}`
            : "#d1d5db"
          return (
            <button
              key={v.id ?? i}
              title={v.color?.name || `Variante ${i + 1}`}
              onClick={() => onSelect(i)}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all duration-150",
                "hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                i === selectedIndex
                  ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
                  : "border-white shadow hover:border-gray-300"
              )}
              style={{ backgroundColor: bg }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Métodos de personalización CDO (icons) ────────────────────────────────────
function PersonalizationMethods({ icons }: { icons: CDOIcon[] }) {
  if (!icons?.length) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        Métodos de personalización
      </p>
      <div className="flex flex-wrap gap-2">
        {icons.map((icon) => (
          <div
            key={icon.id}
            title={icon.label}
            className="flex items-center gap-1.5 bg-muted/60 border rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {icon.picture && (
              <img
                src={icon.picture}
                alt={icon.label}
                className="w-4 h-4 object-contain shrink-0"
              />
            )}
            <span>{icon.short_name || icon.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Selector de colores Zecat (círculos hex reales) ──────────────────────────
function ZecatColorSelector({
  variants,
  selectedIndex,
  onSelect,
}: {
  variants: ProductVariant[]
  selectedIndex: number
  onSelect: (i: number) => void
}) {
  if (!variants?.length) return null

  // Deduplicate by primary_color so we don't show duplicate color circles
  const seen = new Set<string>()
  const uniqueVariants: { variant: ProductVariant; originalIndex: number }[] = []
  variants.forEach((v, i) => {
    const hex = (v as any).primary_color || ""
    const key = hex || `variant-${i}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueVariants.push({ variant: v, originalIndex: i })
    }
  })

  // Check if there's any real color data — skip if all are empty
  const hasColors = uniqueVariants.some(({ variant: v }) => (v as any).primary_color)
  if (!hasColors) return null

  const selectedVariant = variants[selectedIndex]
  const colorName = (selectedVariant as any)?.element_description_2 || ""

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Color:{" "}
        <span className="font-normal text-muted-foreground">{colorName}</span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {uniqueVariants.map(({ variant: v, originalIndex: i }) => {
          const hex = (v as any).primary_color ?? ""
          const bg = hex ? (hex.startsWith("#") ? hex : `#${hex}`) : "#d1d5db"
          const label = (v as any).element_description_2 || `Variante ${i + 1}`
          return (
            <button
              key={i}
              title={label}
              onClick={() => onSelect(i)}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all duration-150",
                "hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                i === selectedIndex
                  ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
                  : "border-white shadow hover:border-gray-300"
              )}
              style={{ backgroundColor: bg }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Métodos de personalización Zecat (printing_types) ────────────────────────
function ZecatPrintingTypes({ printingTypes }: { printingTypes?: { name: string }[] }) {
  if (!printingTypes?.length) return null
  // Deduplicate by name
  const unique = [...new Map(printingTypes.map((pt) => [pt.name, pt])).values()]
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Métodos de personalización</p>
      <div className="flex flex-wrap gap-2">
        {unique.map((pt) => (
          <div
            key={pt.name}
            className="flex items-center gap-1.5 bg-muted/60 border rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <span>{pt.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ProductDisplay({ product, productId }: ProductDisplayProps) {
  const [whatsappUrl, setWhatsappUrl] = useState("#")
  const [source, setSource] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const { source: s } = parseCompositeId(productId)
    setSource(s)
    setWhatsappUrl(
      generarUrlWhatsApp("producto", { nombre: product.name, id: productId })
    )
  }, [product.name, productId])

  const contactButton = isMounted ? (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
      <Button className="w-full" size="lg">
        <Phone className="mr-2 h-4 w-4" />
        Contactar por WhatsApp
      </Button>
    </a>
  ) : (
    <Button className="w-full" size="lg" disabled>
      <Phone className="mr-2 h-4 w-4" />
      Contactar por WhatsApp
    </Button>
  )

  // ── CDO ──────────────────────────────────────────────────────────────────────
  if (source === "cdo") {
    const p = product as unknown as CDOProduct
    const variants = p.variants ?? []
    const selected = variants[selectedIndex] ?? variants[0] ?? null
    const mainImage =
      selected?.picture?.original ||
      selected?.picture?.medium ||
      "/placeholder.svg"
    const listPrice = variants[0]?.list_price ?? null

    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* ── Galería ── */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/20">
              <Image
                src={mainImage}
                alt={p.name || "Producto"}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {selected?.novedad && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Novedad
                </span>
              )}
            </div>

            {/* Thumbnails por variante */}
            {variants.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {variants.slice(0, 6).map((v, i) => (
                  <button
                    key={v.id ?? i}
                    onClick={() => setSelectedIndex(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl border-2 transition-all bg-muted/20",
                      i === selectedIndex
                        ? "border-primary ring-1 ring-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    <Image
                      src={v.picture?.small || v.picture?.original || "/placeholder.svg"}
                      alt={v.color?.name || `Variante ${i + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="space-y-6">
            {/* Categorías + nombre */}
            <div className="space-y-2">
              {p.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.categories.slice(0, 3).map((cat) => (
                    <span key={cat.id} className={badgeVariants({ variant: "outline" })}>
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-3xl font-bold leading-tight">{p.name || "Producto"}</h1>
              {p.code && (
                <p className="text-sm text-muted-foreground">Código: {p.code}</p>
              )}
            </div>

            {/* Precio */}
            <CDOPriceSection listPrice={listPrice} />

            {/* Selector de colores */}
            {variants.length > 0 && (
              <CDOColorSelector
                variants={variants}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            )}

            {/* Métodos de personalización */}
            {p.icons?.length > 0 && (
              <PersonalizationMethods icons={p.icons} />
            )}

            {/* CTA */}
            <div className="pt-1">{contactButton}</div>

            {/* Tabs */}
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description || "No hay descripción disponible."}
                </p>
              </TabsContent>
              <TabsContent value="details" className="pt-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="font-medium">Referencia</dt>
                  <dd className="text-muted-foreground">C-{p.id}</dd>
                  <dt className="font-medium">Código</dt>
                  <dd className="text-muted-foreground">{p.code || "N/A"}</dd>
                  {p.packing?.weight && (
                    <>
                      <dt className="font-medium">Peso</dt>
                      <dd className="text-muted-foreground">{p.packing.weight} kg</dd>
                    </>
                  )}
                  {p.packing?.width && (
                    <>
                      <dt className="font-medium">Dimensiones</dt>
                      <dd className="text-muted-foreground">
                        {p.packing.width} × {p.packing.height} × {p.packing.depth} cm
                      </dd>
                    </>
                  )}
                  {p.packing?.quantity && (
                    <>
                      <dt className="font-medium">Unidades por caja</dt>
                      <dd className="text-muted-foreground">{p.packing.quantity}</dd>
                    </>
                  )}
                  <dt className="font-medium">Stock disponible</dt>
                  <dd className="text-muted-foreground">
                    {selected?.stock_available ?? 0} unidades
                  </dd>
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  // ── Zecat ─────────────────────────────────────────────────────────────────────
  const p = product as unknown as GenericProduct & { source: "zecat" }
  const variants = p.products ?? []
  const productImages = p.images ?? []
  const price = (p as any).price ?? (p as any).unit_price ?? null

  // Main image: prefer selected variant's image, fall back to product-level images
  const selectedVariant = variants[selectedIndex]
  const variantImage = (selectedVariant as any)?.images?.[0]?.image_url
  const mainImage = variantImage || productImages[0]?.image_url || "/placeholder.svg"

  // Thumbnails: use variant images if they have them, otherwise product images
  const variantHasImages = variants.some((v) => (v as any).images?.[0]?.image_url)
  const thumbnailItems: { src: string; label: string }[] = variantHasImages
    ? variants.slice(0, 6).map((v, i) => ({
        src: (v as any).images?.[0]?.image_url || "/placeholder.svg",
        label: (v as any).element_description_2 || `Variante ${i + 1}`,
      }))
    : productImages.slice(0, 6).map((img, i) => ({
        src: img.image_url || "/placeholder.svg",
        label: `${p.name} ${i + 1}`,
      }))

  const printingTypes: { name: string }[] | undefined = (p as any).printing_types

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* ── Galería ── */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/20">
            <Image
              src={mainImage}
              alt={p.name || "Producto"}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {thumbnailItems.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {thumbnailItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 transition-all bg-muted/20",
                    i === selectedIndex
                      ? "border-primary ring-1 ring-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="space-y-6">
          {/* Categorías + nombre */}
          <div className="space-y-2">
            {p.families?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.families.map((f) => (
                  <a
                    key={f.id}
                    href={`/products?category=${f.id}`}
                    className={badgeVariants({ variant: "outline" })}
                  >
                    {f.title || f.description || "Categoría"}
                  </a>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-bold leading-tight">{p.name || "Producto"}</h1>
          </div>

          {/* Precio */}
          <PriceSection price={price} />

          {/* Selector de colores */}
          {variants.length > 0 && (
            <ZecatColorSelector
              variants={variants}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
          )}

          {/* Métodos de personalización */}
          {printingTypes && printingTypes.length > 0 && (
            <ZecatPrintingTypes printingTypes={printingTypes} />
          )}

          {/* CTA */}
          <div className="pt-1">{contactButton}</div>

          {/* Tabs */}
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description || "No hay descripción disponible."}
              </p>
            </TabsContent>
            <TabsContent value="details" className="pt-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="font-medium">Referencia</dt>
                <dd className="text-muted-foreground">Z-{p.id}</dd>
                {(p as any).minimum_order_quantity && (
                  <>
                    <dt className="font-medium">Cantidad mínima</dt>
                    <dd className="text-muted-foreground">
                      {(p as any).minimum_order_quantity} unidades
                    </dd>
                  </>
                )}
                <dt className="font-medium">Categorías</dt>
                <dd className="text-muted-foreground">
                  {p.families?.length
                    ? p.families.map((f) => f.description || f.title).join(", ")
                    : "Sin categoría"}
                </dd>
                {variants.length > 0 && (
                  <>
                    <dt className="font-medium">Variantes</dt>
                    <dd className="text-muted-foreground">{variants.length} opciones</dd>
                  </>
                )}
              </dl>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
