import { Facebook, Instagram, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Company Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Max Solutions"
                width={40}
                height={40}
                className="rounded-sm"
              />
              <span className="font-semibold text-lg">Max Solutions</span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Soluciones promocionales para empresas
            </p>
          </div>

          {/* Social Media and Contact */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/maxsolutionsmerchandising" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contacto.maxsolutions@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm font-medium">Ig: maxsolutionsmerchandising</p>
              <p className="text-sm font-medium">contacto.maxsolutions@gmail.com</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Max Solutions
          </p>
          <a 
            href="https://www.linkedin.com/in/lorenzodurante-" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Desarrollado por Lorenzo Durante
          </a>
        </div>
      </div>
    </footer>
  )
}

