"use client"

import { useState, useEffect } from "react"
import { Calculator, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  calcularIMC,
  obtenerCategoriaIMC,
  obtenerRecomendacionesIMC,
  guardarCalculadoraIMC,
  isAuthenticated,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CalculadoraIMCPage() {
  const [peso, setPeso] = useState("")
  const [altura, setAltura] = useState("")
  const [genero, setGenero] = useState("hombre")
  const [edad, setEdad] = useState("")
  const [imc, setIMC] = useState<number | null>(null)
  const [categoria, setCategoria] = useState<string | null>(null)
  const [recomendaciones, setRecomendaciones] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)

  useEffect(() => {
    setIsUserLoggedIn(isAuthenticated())
  }, [])

  const handleCalcularIMC = () => {
    if (!peso || !altura) return

    const pesoNum = Number.parseFloat(peso)
    const alturaNum = Number.parseFloat(altura)

    if (pesoNum <= 0 || alturaNum <= 0) return

    const imcCalculado = calcularIMC(pesoNum, alturaNum)
    setIMC(imcCalculado)

    // Determinar categoría y recomendaciones
    const categoriaIMC = obtenerCategoriaIMC(imcCalculado)
    const recomendacionesIMC = obtenerRecomendacionesIMC(imcCalculado)

    setCategoria(categoriaIMC)
    setRecomendaciones(recomendacionesIMC)
  }

  const handleGuardarResultado = async () => {
    if (!imc || !categoria || !isUserLoggedIn) return

    setIsSaving(true)
    setError(null)

    try {
      const pesoNum = Number.parseFloat(peso)
      const alturaNum = Number.parseFloat(altura)
      const edadNum = edad ? Number.parseInt(edad) : 0

      // Asegurarse de que todos los valores son números válidos
      if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(edadNum) || isNaN(imc)) {
        throw new Error("Valores inválidos. Por favor, verifica los datos ingresados.")
      }

      await guardarCalculadoraIMC({
        peso: pesoNum,
        altura: alturaNum,
        edad: edadNum,
        genero,
        imc,
        categoria,
        fecha: new Date().toISOString().split("T")[0],
      })

      toast({
        title: "Resultado guardado",
        description: "Tu IMC ha sido guardado correctamente en tu historial.",
      })
    } catch (err) {
      console.error("Error al guardar IMC:", err)
      setError("No se pudo guardar el resultado. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const limpiarFormulario = () => {
    setPeso("")
    setAltura("")
    setEdad("")
    setIMC(null)
    setCategoria(null)
    setRecomendaciones(null)
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Calculadora de IMC</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresa tus datos</CardTitle>
            <CardDescription>Completa el formulario para calcular tu Índice de Masa Corporal (IMC)</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  placeholder="Ej: 70"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  placeholder="Ej: 170"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  placeholder="Ej: 30"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Género</Label>
                <RadioGroup value={genero} onValueChange={setGenero} className="flex gap-4">
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
              <div className="flex gap-2 pt-4">
                <Button type="button" onClick={handleCalcularIMC} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular IMC
                </Button>
                <Button type="button" variant="outline" onClick={limpiarFormulario}>
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Tu Índice de Masa Corporal y recomendaciones personalizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {imc === null ? (
              <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                <p>Completa el formulario y haz clic en "Calcular IMC" para ver tus resultados</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-muted p-6 text-center">
                  <span className="text-sm font-medium">Tu IMC es</span>
                  <span className="text-4xl font-bold">{imc}</span>
                  <span className="text-lg font-semibold text-primary">{categoria}</span>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">¿Qué significa esto?</h3>
                  <p className="text-sm text-muted-foreground">
                    El Índice de Masa Corporal (IMC) es una medida que relaciona el peso y la altura para evaluar si una
                    persona tiene un peso saludable.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Recomendaciones</h3>
                  <p className="text-sm text-muted-foreground">{recomendaciones}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Categorías de IMC</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Bajo peso</span>
                      <span>&lt; 18.5</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Peso normal</span>
                      <span>18.5 - 24.9</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sobrepeso</span>
                      <span>25 - 29.9</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Obesidad grado 1</span>
                      <span>30 - 34.9</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Obesidad grado 2</span>
                      <span>35 - 39.9</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Obesidad grado 3</span>
                      <span>&gt;= 40</span>
                    </li>
                  </ul>
                </div>

                {isUserLoggedIn && (
                  <Button onClick={handleGuardarResultado} disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar resultado
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}