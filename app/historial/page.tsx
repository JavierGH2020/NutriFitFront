"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Utensils, Dumbbell, Loader2, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format, subDays, startOfMonth, endOfMonth, subMonths, subYears } from "date-fns"
import { isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getHistorialAlimentos,
  getHistorialEjercicios,
  getHistorialIMC,
  type Alimento,
  type Ejercicio,
} from "@/lib/api"
import AuthGuard from "@/components/auth-guard"

type AlimentoHistorial = {
  fecha: string
  alimentos: Alimento[]
}

type EjercicioHistorial = {
  fecha: string
  ejercicios: Ejercicio[]
}

type IMCHistorial = {
  id: number
  peso: number
  altura: number
  edad: number
  genero: string
  imc: number
  categoria: string
  fecha: string
}

// Función para agrupar alimentos por fecha
const agruparAlimentosPorFecha = (alimentos: Alimento[]): AlimentoHistorial[] => {
  const grupos: Record<string, Alimento[]> = {}

  alimentos.forEach((alimento) => {
    if (!alimento.fecha) return // Ignorar alimentos sin fecha

    const fecha = alimento.fecha
    if (!grupos[fecha]) {
      grupos[fecha] = []
    }
    grupos[fecha].push(alimento)
  })

  return Object.entries(grupos)
    .map(([fecha, alimentos]) => ({
      fecha,
      alimentos,
    }))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

// Función para agrupar ejercicios por fecha
const agruparEjerciciosPorFecha = (ejercicios: Ejercicio[]): EjercicioHistorial[] => {
  const grupos: Record<string, Ejercicio[]> = {}

  ejercicios.forEach((ejercicio) => {
    if (!ejercicio.fecha) return // Ignorar ejercicios sin fecha

    const fecha = ejercicio.fecha
    if (!grupos[fecha]) {
      grupos[fecha] = []
    }
    grupos[fecha].push(ejercicio)
  })

  return Object.entries(grupos)
    .map(([fecha, ejercicios]) => ({
      fecha,
      ejercicios,
    }))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export default function HistorialPage() {
  const [periodo, setPeriodo] = useState("semana")
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [añoActual, setAñoActual] = useState(new Date().getFullYear())
  const [alimentosHistorial, setAlimentosHistorial] = useState<AlimentoHistorial[]>([])
  const [ejerciciosHistorial, setEjerciciosHistorial] = useState<EjercicioHistorial[]>([])
  const [imcHistorial, setImcHistorial] = useState<IMCHistorial[]>([])
  const [isLoadingAlimentos, setIsLoadingAlimentos] = useState(true)
  const [isLoadingEjercicios, setIsLoadingEjercicios] = useState(true)
  const [isLoadingIMC, setIsLoadingIMC] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar historial al montar el componente o cambiar filtros
  useEffect(() => {
    fetchHistorial()
  }, [periodo, mesActual, añoActual])

  // Función para obtener el historial desde la API
  const fetchHistorial = async () => {
    setIsLoadingAlimentos(true)
    setIsLoadingEjercicios(true)
    setIsLoadingIMC(true)
    setError(null)

    // Calcular fechas para filtrar según el periodo seleccionado
    const fechaFin = format(endOfMonth(new Date(añoActual, mesActual, 1)), "yyyy-MM-dd")
    let fechaInicio

    switch (periodo) {
      case "semana":
        fechaInicio = format(subDays(new Date(), 7), "yyyy-MM-dd")
        break
      case "mes":
        fechaInicio = format(startOfMonth(new Date(añoActual, mesActual, 1)), "yyyy-MM-dd")
        break
      case "trimestre":
        fechaInicio = format(subMonths(new Date(añoActual, mesActual, 1), 3), "yyyy-MM-dd")
        break
      case "año":
        fechaInicio = format(subYears(new Date(añoActual, mesActual, 1), 1), "yyyy-MM-dd")
        break
      default:
        fechaInicio = format(startOfMonth(new Date(añoActual, mesActual, 1)), "yyyy-MM-dd")
    }

    try {
      // Obtener historial de alimentos
      const alimentosParams = {
        "filters[fecha][$gte]": fechaInicio,
        "filters[fecha][$lte]": fechaFin,
        sort: "fecha:desc",
      }

      const alimentosResponse = await getHistorialAlimentos(alimentosParams)
      const alimentosAgrupados = agruparAlimentosPorFecha(alimentosResponse.data || [])
      setAlimentosHistorial(alimentosAgrupados)
      setIsLoadingAlimentos(false)

      // Obtener historial de ejercicios
      const ejerciciosParams = {
        "filters[fecha][$gte]": fechaInicio,
        "filters[fecha][$lte]": fechaFin,
        sort: "fecha:desc",
      }

      const ejerciciosResponse = await getHistorialEjercicios(ejerciciosParams)
      const ejerciciosAgrupados = agruparEjerciciosPorFecha(ejerciciosResponse.data || [])
      setEjerciciosHistorial(ejerciciosAgrupados)
      setIsLoadingEjercicios(false)


      const imcResponse = await getHistorialIMC()
      setImcHistorial(imcResponse.data || [])
      setIsLoadingIMC(false)
    } catch (err) {
      setError("Error al cargar el historial. Por favor, inténtalo de nuevo.")
      console.error(err)
      setIsLoadingAlimentos(false)
      setIsLoadingEjercicios(false)
      setIsLoadingIMC(false)
    }
  }

  const formatearFecha = (fechaStr?: string): string => {
    if (!fechaStr) return 'Fecha no disponible'
  
    const fecha = new Date(fechaStr) // o parseISO(fechaStr) si estás seguro de que es ISO
    if (!isValid(fecha)) return 'Fecha inválida'
  
    return format(fecha, 'PPP', { locale: es })
  }
  

  // Función para calcular totales de alimentos por día
  const calcularTotalesDia = (alimentos: Alimento[]) => {
    return alimentos.reduce(
      (acc, alimento) => {
        // Convertir explícitamente a números para evitar concatenación de strings
        const calorias = Number(alimento.calorias || 0)
        const proteinas = Number(alimento.proteinas || 0)
        const carbohidratos = Number(alimento.carbohidratos || 0)
        const grasas = Number(alimento.grasas || 0)

        return {
          calorias: acc.calorias + calorias,
          proteinas: acc.proteinas + proteinas,
          carbohidratos: acc.carbohidratos + carbohidratos,
          grasas: acc.grasas + grasas,
        }
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
    )
  }

  // Función para navegar entre meses
  const cambiarMes = (direccion: number) => {
    let nuevoMes = mesActual + direccion
    let nuevoAño = añoActual

    if (nuevoMes > 11) {
      nuevoMes = 0
      nuevoAño += 1
    } else if (nuevoMes < 0) {
      nuevoMes = 11
      nuevoAño -= 1
    }

    setMesActual(nuevoMes)
    setAñoActual(nuevoAño)
  }

  // Nombre del mes actual
  const nombreMes = format(new Date(añoActual, mesActual, 1), "LLLL", { locale: es })

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-3 text-3xl font-bold">Historial</h1>
        <CardDescription className="mb-6 text-muted-foreground">
          El filtro del historial mostrará todos los elementos registrados dentro del periodo o rango de fechas seleccionado
        </CardDescription>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Tu progreso</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="año">Último año</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => cambiarMes(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium capitalize">
                {nombreMes} {añoActual}
              </span>
              <Button variant="outline" size="icon" onClick={() => cambiarMes(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="alimentos" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alimentos" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Alimentos
            </TabsTrigger>
            <TabsTrigger value="ejercicios" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Ejercicios
            </TabsTrigger>
            <TabsTrigger value="imc" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              IMC
            </TabsTrigger>
          </TabsList>

          {/* Historial de Alimentos */}
          <TabsContent value="alimentos">
            {isLoadingAlimentos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p>Cargando alimentos...</p>
              </div>
            ) : alimentosHistorial.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay registros de alimentos para este periodo.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {alimentosHistorial.map((dia) => {
                  const totales = calcularTotalesDia(dia.alimentos)

                  return (
                    <Card key={dia.fecha}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{formatearFecha(dia.fecha)}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="outline">{totales.calorias} kcal</Badge>
                            <Badge variant="outline" className="hidden sm:inline-flex">
                              {totales.proteinas}g proteínas
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{dia.alimentos.length} alimentos registrados</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead className="hidden md:table-cell">Calorías</TableHead>
                              <TableHead className="hidden md:table-cell">Proteínas</TableHead>
                              <TableHead className="hidden md:table-cell">Carbohidratos</TableHead>
                              <TableHead className="hidden md:table-cell">Grasas</TableHead>
                              <TableHead>Comida</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dia.alimentos.map((alimento) => (
                              <TableRow key={alimento.id}>
                                <TableCell className="font-medium">{alimento.nombre}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {alimento.calorias !== null ? `${alimento.calorias} kcal` : "N/A"}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {alimento.proteinas !== null ? `${alimento.proteinas}g` : "N/A"}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {alimento.carbohidratos !== null ? `${alimento.carbohidratos}g` : "N/A"}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {alimento.grasas !== null ? `${alimento.grasas}g` : "N/A"}
                                </TableCell>
                                <TableCell className="capitalize">{alimento.tipo || "Sin especificar"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Calorías</div>
                            <div className="text-lg font-semibold">{totales.calorias} kcal</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Proteínas</div>
                            <div className="text-lg font-semibold">{totales.proteinas}g</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Carbohidratos</div>
                            <div className="text-lg font-semibold">{totales.carbohidratos}g</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Grasas</div>
                            <div className="text-lg font-semibold">{totales.grasas}g</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Historial de Ejercicios */}
          <TabsContent value="ejercicios">
            {isLoadingEjercicios ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p>Cargando ejercicios...</p>
              </div>
            ) : ejerciciosHistorial.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay registros de ejercicios para este periodo.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {ejerciciosHistorial.map((dia) => (
                  <Card key={dia.fecha}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{formatearFecha(dia.fecha)}</CardTitle>
                        <Badge variant="outline">
                          {dia.ejercicios.reduce((acc, ejercicio) => acc + ejercicio.series, 0)} series totales
                        </Badge>
                      </div>
                      <CardDescription>{dia.ejercicios.length} ejercicios realizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden md:table-cell">Series</TableHead>
                            <TableHead className="hidden md:table-cell">Repeticiones</TableHead>
                            <TableHead className="hidden md:table-cell">Peso (kg)</TableHead>
                            <TableHead className="hidden md:table-cell">Intensidad</TableHead>
                            <TableHead>Categoría</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dia.ejercicios.map((ejercicio) => (
                            <TableRow key={ejercicio.id}>
                              <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                              <TableCell className="hidden md:table-cell">{ejercicio.series}</TableCell>
                              <TableCell className="hidden md:table-cell">{ejercicio.repeticiones}</TableCell>
                              <TableCell className="hidden md:table-cell">{ejercicio.peso}</TableCell>
                              <TableCell className="hidden md:table-cell">{ejercicio.intensidad}</TableCell>
                              <TableCell className="capitalize">{ejercicio.tipo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Array.from(new Set(dia.ejercicios.map((e) => e.tipo))).map((tipo) => {
                          const ejerciciosPorCategoria = dia.ejercicios.filter((e) => e.tipo === tipo).length
                          return (
                            <div key={tipo} className="rounded-lg border p-3">
                              <div className="text-sm text-muted-foreground capitalize">{tipo}</div>
                              <div className="text-lg font-semibold">{ejerciciosPorCategoria} ejercicios</div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Historial de IMC */}
          <TabsContent value="imc">
            {isLoadingIMC ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p>Cargando historial de IMC...</p>
              </div>
            ) : imcHistorial.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay registros de IMC para este periodo.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {imcHistorial.map((registro) => (
                  <Card key={registro.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>Registro de IMC</CardTitle>
                        <Badge
                          variant={
                            registro.categoria.includes("normal")
                              ? "outline"
                              : registro.categoria.includes("Bajo")
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {registro.categoria}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-muted p-6 text-center mb-4">
                        <span className="text-sm font-medium">Tu IMC fue</span>
                        <span className="text-4xl font-bold">{registro.imc}</span>
                        <span className="text-lg font-semibold text-primary">{registro.categoria}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Peso</div>
                          <div className="text-lg font-semibold">{registro.peso} kg</div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Altura</div>
                          <div className="text-lg font-semibold">{registro.altura} cm</div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Edad</div>
                          <div className="text-lg font-semibold">{registro.edad} años</div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Género</div>
                          <div className="text-lg font-semibold capitalize">{registro.genero}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

