"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Lock, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isPremiumUser, isAuthenticated } from "@/lib/api"

interface PremiumGuardProps {
  children: React.ReactNode
  redirectTo?: string
  allowPublicAccess?: boolean // Si es true, permite acceso de solo lectura a usuarios públicos
}

export default function PremiumGuard({
  children,
  redirectTo = "/planes",
  allowPublicAccess = false,
}: PremiumGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Primero verificar si el usuario está autenticado
        const authenticated = isAuthenticated()
        setIsLoggedIn(authenticated)

        if (!authenticated) {
          setIsPremium(false)
          setIsLoading(false)
          return
        }

        // Luego verificar si es premium
        const premium = await isPremiumUser()
        setIsPremium(premium)
      } catch (error) {
        console.error("Error al verificar estado premium:", error)
        setError("No se pudo verificar tu nivel de suscripción. Por favor, intenta de nuevo más tarde.")
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Verificando suscripción...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()}>Intentar de nuevo</Button>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Acceso restringido</CardTitle>
            </div>
            <CardDescription>Debes iniciar sesión para acceder a esta funcionalidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Por favor, inicia sesión o regístrate para acceder a todas las funcionalidades de NutriFit.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Iniciar sesión
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
              Registrarse
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!isPremium) {
    if (allowPublicAccess) {
      // Mostrar banner de advertencia pero permitir acceso limitado
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Acceso limitado</p>
              <p className="text-sm">
                Estás viendo esta sección en modo de solo lectura. Actualiza a Premium para acceder a todas las
                funcionalidades.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={() => router.push(redirectTo)}
            >
              Ver planes
            </Button>
          </div>
          {children}
        </div>
      )
    }

    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Funcionalidad Premium</CardTitle>
            </div>
            <CardDescription>Esta funcionalidad está disponible exclusivamente para usuarios premium.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  Beneficios Premium
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Creación de rutinas personalizadas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Seguimiento detallado de progreso</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Estadísticas avanzadas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Acceso a todas las funcionalidades de la aplicación</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push(redirectTo)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Ver planes premium
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

