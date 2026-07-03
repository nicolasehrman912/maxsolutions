import { NextResponse, type NextRequest } from "next/server"

const KNOWN_CATEGORY_SLUGS = new Set([
  "apparel", "writing", "bolsos", "technology", "drinkware",
  "hogar-tiempo-libre", "gorros", "paraguas", "llaveros",
  "deportes", "agro", "packaging", "kits-y-sets",
])

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Solo redirige si ?category= es el ÚNICO parámetro (evita romper paginación y filtros)
  if (pathname === "/products" && searchParams.has("category") && searchParams.size === 1) {
    const slug = searchParams.get("category")!
    if (KNOWN_CATEGORY_SLUGS.has(slug)) {
      return NextResponse.redirect(
        new URL(`/products/categoria/${slug}`, req.url),
        301
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/products"],
}
