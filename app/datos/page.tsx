"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, Save, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getDatosUsuario, saveDatosUsuario, type DatoUsuario } from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function DatosPage() {

  const [datos, setDatos] = useState<DatoUsuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    edad: 0,
    genero: "hombre",
    peso: 0,
    altura: 0,
    nivelActividad: "medio",
  })

  // Cargar datos del usuario
  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const datosUsuario = await getDatosUsuario()
        setDatos(datosUsuario)

        if (datosUsuario) {
          setFormData({
            edad: datosUsuario.edad || 0,
            genero: datosUsuario.genero || "hombre",
            peso: datosUsuario.peso || 0,
            altura: datosUsuario.altura || 0,
            nivelActividad: datosUsuario.nivelActividad || "medio",
          })
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err)
        setError("No se pudieron cargar tus datos. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatos()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "genero" || name === "nivelActividad" ? value : Number(value),
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      // Validar datos
      if (formData.edad < 0 || formData.peso <= 0 || formData.altura <= 0) {
        throw new Error("Por favor, introduce valores válidos para edad, peso y altura.")
      }

      // Guardar datos
      const response = await saveDatosUsuario(formData)

      // Actualizar datos locales
      setDatos({
        ...datos,
        ...formData,
        id: datos?.id || response.data.id,
      } as DatoUsuario)

      setSuccess("Datos guardados correctamente")
    } catch (err: any) {
      console.error("Error al guardar datos:", err)
      setError(err.message || "No se pudieron guardar tus datos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Mis Datos Personales</h1>

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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Cargando tus datos personales...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Información Personal</CardTitle>
              </div>
              <CardDescription>
                Estos datos nos ayudan a personalizar tus recomendaciones y calcular tus necesidades nutricionales.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edad">Edad</Label>
                    <Input
                      id="edad"
                      name="edad"
                      type="number"
                      value={formData.edad}
                      onChange={handleInputChange}
                      min={0}
                      max={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <RadioGroup
                      value={formData.genero}
                      onValueChange={(value) => handleSelectChange("genero", value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hombre" id="hombre" />
                        <Label htmlFor="hombre">Hombre</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mujer" id="mujer" />
                        <Label htmlFor="mujer">Mujer</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      value={formData.peso}
                      onChange={handleInputChange}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input
                      id="altura"
                      name="altura"
                      type="number"
                      value={formData.altura}
                      onChange={handleInputChange}
                      min={0}
                      max={300}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivelActividad">Nivel de Actividad Física</Label>
                  <Select
                    value={formData.nivelActividad}
                    onValueChange={(value) => handleSelectChange("nivelActividad", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel de actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bajo">Bajo (poco o ningún ejercicio)</SelectItem>
                      <SelectItem value="medio">Medio (ejercicio 1-3 veces por semana)</SelectItem>
                      <SelectItem value="alto">Alto (ejercicio intenso 4+ veces por semana)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Datos
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

