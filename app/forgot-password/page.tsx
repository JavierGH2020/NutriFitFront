"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Apple, AlertCircle, Loader2, ArrowLeft, Mail, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { forgotPassword } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [serverError, setServerError] = useState<boolean>(false)

  // Modificar el handleSubmit para manejar específicamente el error 500
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setServerError(false)
    setIsLoading(true)

    try {
      console.log("Enviando solicitud de recuperación para:", email)

      const result = await forgotPassword(email)
      console.log("Respuesta recibida:", result)

      // Siempre mostrar un mensaje de éxito, incluso si el correo no existe
      // (por seguridad, no revelamos si un correo existe o no)
      setSuccess(
        "Si tu correo electrónico está registrado, recibirás instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada y la carpeta de spam.",
      )
      setEmail("")
    } catch (err: any) {
      console.error("Error detallado:", err)

      // Detectar específicamente el error 500 (Internal Server Error)
      if (err.message && (err.message.includes("Internal Server Error") || err.message.includes("SMTP"))) {
        setServerError(true)
        setError("Error en el servidor: No se pudo enviar el correo electrónico. Por favor, contacta al administrador.")
      } else if (err && typeof err === "object") {
        if (err.error.message) {
          setError(err.error.message)
        } else if (err.message) {
          setError(err.message)
        } else {
          setError("Error al procesar la solicitud. Por favor, inténtalo de nuevo.")
        }
      } else {
        setError("Error al conectar con el servidor. Verifica tu conexión a internet.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-12 md:py-24">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Apple className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">NutriFit</span>
          </div>
          <CardTitle className="text-2xl text-center">Recuperar contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Servicio temporalmente no disponible</p>
                <p className="text-sm mt-1">
                  El servicio de recuperación de contraseña no está disponible en este momento. Por favor, contacta al
                  administrador en <strong>admin@nutrifit.com</strong> para restablecer tu contraseña manualmente.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar instrucciones
                </>
              )}
            </Button>
          </form>

          {/* Solución alternativa mientras se arregla el servidor de correo */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md border text-sm">
            <h4 className="font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Método alternativo
            </h4>
            <p>
              Si no recibes el correo de recuperación, puedes contactar directamente con soporte en{" "}
              <strong>soporte@nutrifit.com</strong> proporcionando tu dirección de correo electrónico registrada.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

