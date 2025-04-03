import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-primary">NutriFit</h3>
            <p className="text-sm text-muted-foreground">
              Tu compañero para alcanzar tus metas fitness y mantener un estilo de vida saludable.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/alimentos" className="text-sm text-muted-foreground hover:text-foreground">
                  Alimentos
                </Link>
              </li>
              <li>
                <Link href="/ejercicios" className="text-sm text-muted-foreground hover:text-foreground">
                  Entrenos
                </Link>
              </li>
              <li>
                <Link href="/calculadora" className="text-sm text-muted-foreground hover:text-foreground">
                  Calculadora IMC
                </Link>
              </li>
              <li>
                <Link href="/historial" className="text-sm text-muted-foreground hover:text-foreground">
                  Historial
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Contacto</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Email: info@nutrifit.com</li>
              <li className="text-sm text-muted-foreground">Teléfono: +34 123 456 789</li>
              <li className="text-sm text-muted-foreground">Dirección: Calle Fitness 123, Madrid</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Síguenos</h3>
            <div className="flex space-x-4">
              <Link href="http://www.facebook.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="http://www.instagram.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="http://www.x.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="http://www.youtube.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NutriFit. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

