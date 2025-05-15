"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Target, Save, Loader2, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import { getObjetivosUsuario, saveObjetivosUsuario, type Objetivo } from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function ObjetivosPage() {
  const { toast } = useToast()
  const [objetivos, setObjetivos] = useState<Objetivo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(addMonths(new Date(), 3)) // Por defecto, 3 meses en el futuro

  // Formulario
  const [formData, setFormData] = useState({
    entrenamientosSemanales: 3,
    intensidad: "media",
    pesoDeseado: 0,
    fechaLimite: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
    plan: "perdida",
  })

  // Cargar objetivos del usuario
  useEffect(() => {
    const fetchObjetivos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const objetivosUsuario = await getObjetivosUsuario()
        setObjetivos(objetivosUsuario)

        if (objetivosUsuario) {
          setFormData({
            entrenamientosSemanales: objetivosUsuario.entrenamientosSemanales || 3,
            intensidad: objetivosUsuario.intensidad || "media",
            pesoDeseado: objetivosUsuario.pesoDeseado || 0,
            fechaLimite: objetivosUsuario.fechaLimite || format(addMonths(new Date(), 3), "yyyy-MM-dd"),
            plan: objetivosUsuario.plan || "perdida",
          })

          if (objetivosUsuario.fechaLimite) {
            setDate(new Date(objetivosUsuario.fechaLimite))
          }
        }
      } catch (err) {
        console.error("Error al cargar objetivos del usuario:", err)
        setError("No se pudieron cargar tus objetivos. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchObjetivos()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "intensidad" || name === "plan" ? value : Number(value),
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData({
        ...formData,
        fechaLimite: format(date, "yyyy-MM-dd"),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      // Validar datos
      if (formData.entrenamientosSemanales < 0 || formData.entrenamientosSemanales > 7) {
        throw new Error("El número de entrenamientos semanales debe estar entre 0 y 7.")
      }

      if (formData.pesoDeseado <= 0) {
        throw new Error("Por favor, introduce un peso deseado válido.")
      }

      // Guardar objetivos
      const response = await saveObjetivosUsuario(formData)

      // Actualizar objetivos locales
      setObjetivos({
        ...objetivos,
        ...formData,
        id: objetivos?.id ?? response.data.id,
      } as Objetivo)

      setSuccess("Objetivos guardados correctamente")

      toast({
        title: "Objetivos guardados",
        description: "Tus objetivos se han guardado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al guardar objetivos:", err)
      setError(err.message ?? "No se pudieron guardar tus objetivos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Mis Objetivos</h1>

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
            <p>Cargando tus objetivos...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Objetivos Fitness</CardTitle>
              </div>
              <CardDescription>
                Define tus metas para personalizar tu plan de entrenamiento y nutrición.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entrenamientosSemanales">Entrenamientos por semana</Label>
                    <Input
                      id="entrenamientosSemanales"
                      name="entrenamientosSemanales"
                      type="number"
                      value={formData.entrenamientosSemanales}
                      onChange={handleInputChange}
                      min={0}
                      max={7}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intensidad">Intensidad deseada</Label>
                    <Select
                      value={formData.intensidad}
                      onValueChange={(value) => handleSelectChange("intensidad", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la intensidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pesoDeseado">Peso deseado (kg)</Label>
                    <Input
                      id="pesoDeseado"
                      name="pesoDeseado"
                      type="number"
                      value={formData.pesoDeseado}
                      onChange={handleInputChange}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaLimite">Fecha límite</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect}
                          locale={es}
                          disabled={(date) => date < new Date()} // No permitir fechas pasadas
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Tipo de plan</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perdida">Pérdida de peso</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="ganancia">Ganancia de masa muscular</SelectItem>
                      <SelectItem value="rendimiento">Mejora de rendimiento</SelectItem>
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
                      Guardar Objetivos
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

