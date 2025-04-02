"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Apple, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el código de restablecimiento de la URL
    const codeParam = searchParams.get("code")
    if (codeParam) {
      setCode(codeParam)
    } else {
      setError("Código de restablecimiento no válido o expirado. Por favor, solicita un nuevo enlace.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!code) {
      setError("Código de restablecimiento no válido o expirado. Por favor, solicita un nuevo enlace.")
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(code, password, passwordConfirmation)
      setSuccess(
        "Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
      )

      // Limpiar los campos
      setPassword("")
      setPasswordConfirmation("")

      // Redirigir después de unos segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err)

      if (err && typeof err === "object") {
        if (err.error && err.error.message) {
          setError(err.error.message)
        } else if (err.message) {
          setError(err.message)
        } else {
          setError("Error al restablecer la contraseña. Por favor, inténtalo de nuevo.")
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
          <CardTitle className="text-2xl text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">Crea una nueva contraseña para tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !code}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="passwordConfirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={isLoading || !code}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !code}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Restablecer contraseña
                </>
              )}
            </Button>
          </form>
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

