"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, Apple, LogOut, Target, Database, Sun, Moon, Zap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isAuthenticated, getCurrentUser, logout, cleanAuthParams, type User as UserType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  // Verificar autenticación y obtener datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error("Error al obtener el usuario:", error)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    // Limpiar parámetros de autenticación de la URL
    cleanAuthParams()

    fetchUser()
  }, [pathname]) // Re-verificar cuando cambia la ruta

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/login")
  }

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Alimentos", href: "/alimentos" },
    { name: "Entrenos", href: "/ejercicios" },
    { name: "Calculadora IMC", href: "/calculadora" },
    { name: "Historial", href: "/historial" },
  ]

  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = (): string => {
    if (!user || !user.username) {
      return user?.email?.charAt(0).toUpperCase() || "U"
    }
    return user.username.charAt(0).toUpperCase()
  }

  // Determinar si el usuario inició sesión con Google
  const isGoogleUser = user?.provider === "google"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Apple className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">NutriFit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium transition-colors hover:text-primary">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Selector - Desktop */}
          <DropdownMenu>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Claro</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Oscuro</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("high-contrast")}>
                <Zap className="mr-2 h-4 w-4" />
                <span>Alto contraste</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Usuario autenticado - Versión escritorio */}
          {isLoading ? (
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {isGoogleUser && user.image ? (
                        <AvatarImage src={user.image} alt={user.username || "Usuario"} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>Hola, {user.username || user.email?.split("@")[0] || "Usuario"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/datos")}>
                    <Database className="mr-2 h-4 w-4" />
                    <span>Actualizar Datos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/objetivos")}>
                    <Target className="mr-2 h-4 w-4" />
                    <span>Mis Objetivos</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                      {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                      {theme === "high-contrast" && <Zap className="mr-2 h-4 w-4" />}
                      <span>Tema</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Claro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Oscuro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("high-contrast")}>
                          <Zap className="mr-2 h-4 w-4" />
                          <span>Alto contraste</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-sm font-medium">
                Hola, {user.username || user.email?.split("@")[0] || "Usuario"}
              </span>
            </div>
          ) : (
            <Button className="hidden md:flex" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          )}

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Apple className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">NutriFit</span>
                </Link>

                {/* Usuario autenticado - Versión móvil */}
                {isLoading ? (
                  <div className="flex items-center gap-2 py-2 border-b">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : user ? (
                  <div className="flex items-center gap-2 py-2 border-b">
                    <Avatar className="h-8 w-8">
                      {isGoogleUser && user.image ? (
                        <AvatarImage src={user.image} alt={user.username || "Usuario"} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Hola, {user.username || user.email?.split("@")[0] || "Usuario"}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                ) : null}

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Theme Selector - Mobile */}
                <div className="py-2 border-t border-b">
                  <h3 className="text-sm font-medium mb-2">Tema</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="w-full"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="w-full"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Oscuro
                    </Button>
                    <Button
                      variant={theme === "high-contrast" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("high-contrast")}
                      className="w-full"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Contraste
                    </Button>
                  </div>
                </div>

                {user ? (
                  <>
                    <Link
                      href="/perfil"
                      className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/datos"
                      className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      <span>Mis Datos</span>
                    </Link>
                    <Link
                      href="/objetivos"
                      className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      <span>Mis Objetivos</span>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Iniciar Sesión
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

