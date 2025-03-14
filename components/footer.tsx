import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-muted-foreground">
            © 2025 Max Solutions
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

