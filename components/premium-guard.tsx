"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isPremiumUser } from "@/lib/api"

interface PremiumGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function PremiumGuard({ children, redirectTo = "/planes" }: PremiumGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      setIsLoading(true)
      try {
        const premium = await isPremiumUser()
        setIsPremium(premium)
      } catch (error) {
        console.error("Error al verificar estado premium:", error)
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

  if (!isPremium) {
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

