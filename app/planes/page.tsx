"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateUserRole, getCurrentUser, isPremiumUser } from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function PlanesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  // Verificar el plan actual del usuario
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsCheckingStatus(true)
      try {
        const isPremium = await isPremiumUser()
        setCurrentPlan(isPremium ? "premium" : "basico")
      } catch (err) {
        console.error("Error al verificar el plan del usuario:", err)
        setError("No se pudo verificar tu plan actual. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkUserPlan()
  }, [])

  const handleUpgrade = async (plan: string) => {
    if (plan === "basico" || currentPlan === plan) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Obtener el usuario actual
      const user = await getCurrentUser()
      if (!user) {
        throw new Error("No se pudo obtener la información del usuario")
      }

      // Actualizar el rol del usuario a premium
      await updateUserRole(user.id, "premium")

      setSuccess(
        `¡Felicidades! Tu cuenta ha sido actualizada al plan ${plan === "premium" ? "Premium" : "Premium Anual"}.`,
      )
      setCurrentPlan("premium")

      // Mostrar toast de éxito
      toast({
        title: "Plan actualizado",
        description: `Tu cuenta ha sido actualizada al plan ${plan === "premium" ? "Premium" : "Premium Anual"}.`,
      })

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Error al actualizar plan:", err)
      setError("No se pudo procesar la actualización. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const planes = [
    {
      id: "basico",
      nombre: "Básico",
      precio: "Gratis",
      descripcion: "Funcionalidades básicas para comenzar tu viaje fitness",
      caracteristicas: ["Registro de alimentos", "Registro de ejercicios", "Calculadora de IMC", "Historial básico"],
      esPremium: false,
      botonTexto: "Plan Actual",
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: "9.99€/mes",
      descripcion: "Todas las funcionalidades para maximizar tus resultados",
      caracteristicas: [
        "Todas las funcionalidades del plan Básico",
        "Creación de rutinas personalizadas",
        "Seguimiento detallado de progreso",
        "Estadísticas avanzadas",
        "Soporte prioritario",
      ],
      esPremium: true,
      botonTexto: "Actualizar a Premium",
    },
    {
      id: "premium-anual",
      nombre: "Premium Anual",
      precio: "99.99€/año",
      descripcion: "Ahorra con nuestro plan anual",
      caracteristicas: [
        "Todas las funcionalidades Premium",
        "2 meses gratis",
        "Acceso a contenido exclusivo",
        "Consulta nutricional personalizada",
      ],
      esPremium: true,
      botonTexto: "Actualizar a Premium Anual",
    },
  ]

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-2 text-3xl font-bold">Planes de Suscripción</h1>
        <p className="mb-6 text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades</p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isCheckingStatus ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Verificando tu plan actual...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {planes.map((plan) => (
              <Card
                key={plan.id}
                className={`${plan.esPremium ? "border-primary/50" : ""} ${currentPlan === plan.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.nombre}</CardTitle>
                      <CardDescription>{plan.descripcion}</CardDescription>
                    </div>
                    {plan.esPremium && (
                      <div className="rounded-full bg-primary/10 p-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.precio}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.esPremium ? "default" : "outline"}
                    disabled={isLoading || plan.id === "basico" || currentPlan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {plan.esPremium && currentPlan !== plan.id && <Sparkles className="mr-2 h-4 w-4" />}
                        {currentPlan === plan.id ? "Plan Actual" : plan.botonTexto}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

