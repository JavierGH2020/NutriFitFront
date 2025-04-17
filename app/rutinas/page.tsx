"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Edit,
  Trash,
  Loader2,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  getRutinas,
  createRutina,
  updateRutina,
  deleteRutina,
  getEjercicios,
  addEjercicioToRutina,
  removeEjercicioFromRutina,
  isPremiumUser,
  type Rutina,
  type Ejercicio,
} from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import PremiumGuard from "@/components/premium-guard"

// Mapeo para los días de la semana
const diasSemanaMap = {
  uno: "Una vez por semana",
  dos: "Dos veces por semana",
  tres: "Tres veces por semana",
}

export default function RutinasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [nuevaRutina, setNuevaRutina] = useState({
    nombre: "",
    descripcion: "",
    diasSemana: undefined as "uno" | "dos" | "tres" | undefined,
  })
  const [rutinaEditando, setRutinaEditando] = useState<Rutina | null>(null)
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<Rutina | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddEjercicioDialogOpen, setIsAddEjercicioDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // Datos para añadir ejercicio a rutina
  const [nuevoEjercicioRutina, setNuevoEjercicioRutina] = useState({
    ejercicioId: 0,
    series: 3,
    repeticiones: 10,
    peso: 0,
    descanso: 60, // segundos
  })

  // Verificar si el usuario es premium
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const premium = await isPremiumUser()
        setIsPremium(premium)
      } catch (error) {
        console.error("Error al verificar estado premium:", error)
        setIsPremium(false)
      }
    }

    checkUserStatus()
  }, [])

  // Cargar rutinas al montar el componente
  const fetchRutinas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getRutinas()
      console.log("Rutinas cargadas:", response)
      setRutinas(response.data || [])
    } catch (err) {
      console.error("Error al cargar rutinas:", err)
      setError("Error al cargar las rutinas. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para obtener ejercicios desde la API
  const fetchEjercicios = useCallback(async () => {
    try {
      const response = await getEjercicios()
      console.log("Ejercicios cargados:", response)
      setEjercicios(response.data || [])
    } catch (err) {
      console.error("Error al cargar ejercicios:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los ejercicios. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchRutinas()
    fetchEjercicios()
  }, [fetchRutinas, fetchEjercicios])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNuevaRutina({
      ...nuevaRutina,
      [name]: value,
    })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!rutinaEditando) return

    const { name, value } = e.target
    setRutinaEditando({
      ...rutinaEditando,
      [name]: value,
    } as Rutina)
  }

  const handleDiasSemanaChange = (value: string) => {
    setNuevaRutina({
      ...nuevaRutina,
      diasSemana: value as "uno" | "dos" | "tres",
    })
  }

  const handleEditDiasSemanaChange = (value: string) => {
    if (!rutinaEditando) return

    setRutinaEditando({
      ...rutinaEditando,
      diasSemana: value as "uno" | "dos" | "tres",
    } as Rutina)
  }

  const handleSubmit = async () => {
    if (!nuevaRutina.nombre) {
      setError("El nombre de la rutina es obligatorio")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      console.log("Preparando datos para crear rutina:", nuevaRutina)

      // Crear un objeto limpio para enviar
      const rutinaData = {
        nombre: nuevaRutina.nombre,
        descripcion: nuevaRutina.descripcion || "",
        diasSemana: nuevaRutina.diasSemana,
        ejercicios: [],
      }

      //console.log("Enviando datos para crear rutina:", rutinaData)

      const response = await createRutina(rutinaData)

      //console.log("Respuesta completa de creación:", response)

      if (response && response.data) {
        // Actualizar el estado con la nueva rutina
        setRutinas((prevRutinas) => [...prevRutinas, response.data])

        // Limpiar el formulario
        setNuevaRutina({
          nombre: "",
          descripcion: "",
          diasSemana: undefined,
        })

        // Cerrar el diálogo
        setIsDialogOpen(false)

        // Mostrar notificación de éxito
        toast({
          title: "Rutina creada",
          description: "La rutina se ha creado correctamente.",
        })
      } else {
        throw new Error("No se recibió una respuesta válida del servidor")
      }
    } catch (err: any) {
      console.error("Error al crear rutina:", err)
      // Mostrar un mensaje de error más descriptivo
      setError(`Error al crear la rutina: ${err.message || "Por favor, inténtalo de nuevo."}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (documentId: string) => {
    const rutinaToEdit = rutinas.find((rutina) => rutina.documentId === documentId)
    if (rutinaToEdit) {
      setRutinaEditando(rutinaToEdit)
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!rutinaEditando) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await updateRutina(rutinaEditando.documentId, {
        nombre: rutinaEditando.nombre,
        descripcion: rutinaEditando.descripcion,
        diasSemana: rutinaEditando.diasSemana,
      })

      setRutinas(rutinas.map((rutina) => (rutina.documentId === rutinaEditando.documentId ? response.data : rutina)))
      setRutinaEditando(null)
      setIsEditDialogOpen(false)
      setRutinaSeleccionada(response.data)
      

      toast({
        title: "Rutina actualizada",
        description: "La rutina se ha actualizado correctamente.",
      })
    } catch (err) {
      setError("Error al actualizar la rutina. Por favor, inténtalo de nuevo.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      await deleteRutina(documentId)
      setRutinas(rutinas.filter((rutina) => rutina.documentId !== documentId))

      // Si la rutina que se está eliminando es la seleccionada, deseleccionarla
      if (rutinaSeleccionada && rutinaSeleccionada.documentId === documentId) {
        setRutinaSeleccionada(null)
      }

      toast({
        title: "Rutina eliminada",
        description: "La rutina se ha eliminado correctamente.",
      })
    } catch (err) {
      setError("Error al eliminar la rutina. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleSelectRutina = (rutina: Rutina) => {
    setRutinaSeleccionada(rutina)
  }

  const handleAddEjercicio = () => {
    if (!rutinaSeleccionada) return

    setNuevoEjercicioRutina({
      ejercicioId: 0,
      series: 3,
      repeticiones: 10,
      peso: 0,
      descanso: 60,
    })

    setIsAddEjercicioDialogOpen(true)
  }

  // Modificar la función handleSaveEjercicio para usar documentId en lugar de id
  const handleSaveEjercicio = async () => {
    if (!rutinaSeleccionada || nuevoEjercicioRutina.ejercicioId === 0) return

    setIsSaving(true)
    setError(null)

    try {
      // Usar documentId en lugar de id
      const response = await addEjercicioToRutina(
        rutinaSeleccionada.documentId,
        nuevoEjercicioRutina.ejercicioId.toString(),
        nuevoEjercicioRutina.series,
        nuevoEjercicioRutina.repeticiones,
        nuevoEjercicioRutina.peso,
        nuevoEjercicioRutina.descanso,
      )

      // Actualizar la rutina seleccionada con los nuevos datos
      setRutinaSeleccionada(response.data)

      // Actualizar la lista de rutinas usando documentId para la comparación
      setRutinas(
        rutinas.map((rutina) => (rutina.documentId === rutinaSeleccionada.documentId ? response.data : rutina)),
      )

      setIsAddEjercicioDialogOpen(false)

      toast({
        title: "Ejercicio añadido",
        description: "El ejercicio se ha añadido correctamente a la rutina.",
      })
    } catch (err) {
      setError("Error al añadir el ejercicio a la rutina. Por favor, inténtalo de nuevo.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Modificar la función handleRemoveEjercicio para usar documentId
  const handleRemoveEjercicio = async (index: number) => {
    if (!rutinaSeleccionada) return

    if (!confirm("¿Estás seguro de que deseas eliminar este ejercicio de la rutina?")) {
      return
    }

    try {
      // Usar documentId en lugar de id
      const response = await removeEjercicioFromRutina(rutinaSeleccionada.documentId, index)

      // Actualizar la rutina seleccionada con los nuevos datos
      setRutinaSeleccionada(response.data)

      // Actualizar la lista de rutinas usando documentId para la comparación
      setRutinas(
        rutinas.map((rutina) => (rutina.documentId === rutinaSeleccionada.documentId ? response.data : rutina)),
      )

      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio se ha eliminado correctamente de la rutina.",
      })
    } catch (err) {
      setError("Error al eliminar el ejercicio de la rutina. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleMoveEjercicio = async (index: number, direction: "up" | "down") => {
    if (!rutinaSeleccionada || !rutinaSeleccionada.ejercicios) return

    // No se puede mover hacia arriba si es el primer elemento
    if (direction === "up" && index === 0) return

    // No se puede mover hacia abajo si es el último elemento
    if (direction === "down" && index === rutinaSeleccionada.ejercicios.length - 1) return

    // Con la nueva estructura de relación, no podemos reordenar directamente
    // Necesitamos usar el endpoint de Strapi para actualizar el orden

    // Por ahora, mostramos un mensaje de que esta funcionalidad no está disponible
    toast({
      title: "Funcionalidad no disponible",
      description: "La funcionalidad de reordenar ejercicios no está disponible con la nueva estructura de datos.",
      variant: "destructive",
    })
  }

  const filteredRutinas = rutinas.filter((rutina) => rutina.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <AuthGuard>
      <PremiumGuard>
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">Mis Rutinas de Entrenamiento</h1>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar rutinas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Rutina
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Crear nueva rutina</DialogTitle>
                  <DialogDescription>Completa los detalles de tu nueva rutina de entrenamiento.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre de la rutina</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={nuevaRutina.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Rutina de fuerza"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={nuevaRutina.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente el objetivo de esta rutina"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label>Frecuencia semanal</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Selecciona cuántas veces por semana realizarás esta rutina</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <RadioGroup value={nuevaRutina.diasSemana} onValueChange={handleDiasSemanaChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="uno" id="r1" />
                        <Label htmlFor="r1">Una vez por semana</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dos" id="r2" />
                        <Label htmlFor="r2">Dos veces por semana</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tres" id="r3" />
                        <Label htmlFor="r3">Tres veces por semana</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Crear Rutina"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Diálogo de edición */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Editar rutina</DialogTitle>
                  <DialogDescription>Modifica los detalles de tu rutina de entrenamiento.</DialogDescription>
                </DialogHeader>
                {rutinaEditando && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nombre">Nombre de la rutina</Label>
                      <Input
                        id="edit-nombre"
                        name="nombre"
                        value={rutinaEditando.nombre}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-descripcion">Descripción</Label>
                      <Textarea
                        id="edit-descripcion"
                        name="descripcion"
                        value={rutinaEditando.descripcion || ""}
                        onChange={handleEditInputChange}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Label>Frecuencia semanal</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Selecciona cuántas veces por semana realizarás esta rutina</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <RadioGroup value={rutinaEditando.diasSemana} onValueChange={handleEditDiasSemanaChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="uno" id="edit-r1" />
                          <Label htmlFor="edit-r1">Una vez por semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dos" id="edit-r2" />
                          <Label htmlFor="edit-r2">Dos veces por semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tres" id="edit-r3" />
                          <Label htmlFor="edit-r3">Tres veces por semana</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Diálogo para añadir ejercicio a rutina */}
            <Dialog open={isAddEjercicioDialogOpen} onOpenChange={setIsAddEjercicioDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Añadir ejercicio a la rutina</DialogTitle>
                  <DialogDescription>Selecciona un ejercicio y configura sus detalles.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ejercicio">Ejercicio</Label>
                    <Select
                      value={nuevoEjercicioRutina.ejercicioId.toString()}
                      onValueChange={(value) =>
                        setNuevoEjercicioRutina({
                          ...nuevoEjercicioRutina,
                          ejercicioId: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ejercicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ejercicios.map((ejercicio) => (
                          <SelectItem key={ejercicio.documentId || ejercicio.id} value={ejercicio.id.toString()}>
                            {ejercicio.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="series">Series</Label>
                      <Input
                        id="series"
                        type="number"
                        value={nuevoEjercicioRutina.series}
                        onChange={(e) =>
                          setNuevoEjercicioRutina({
                            ...nuevoEjercicioRutina,
                            series: Number.parseInt(e.target.value),
                          })
                        }
                        min={1}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="repeticiones">Repeticiones</Label>
                      <Input
                        id="repeticiones"
                        type="number"
                        value={nuevoEjercicioRutina.repeticiones}
                        onChange={(e) =>
                          setNuevoEjercicioRutina({
                            ...nuevoEjercicioRutina,
                            repeticiones: Number.parseInt(e.target.value),
                          })
                        }
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        value={nuevoEjercicioRutina.peso}
                        onChange={(e) =>
                          setNuevoEjercicioRutina({
                            ...nuevoEjercicioRutina,
                            peso: Number.parseFloat(e.target.value),
                          })
                        }
                        min={0}
                        step={0.5}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="descanso">Descanso (segundos)</Label>
                      <Input
                        id="descanso"
                        type="number"
                        value={nuevoEjercicioRutina.descanso}
                        onChange={(e) =>
                          setNuevoEjercicioRutina({
                            ...nuevoEjercicioRutina,
                            descanso: Number.parseInt(e.target.value),
                          })
                        }
                        min={0}
                        step={5}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveEjercicio} disabled={isSaving || nuevoEjercicioRutina.ejercicioId === 0}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Añadir Ejercicio"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Cargando rutinas...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Lista de rutinas */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Rutinas</CardTitle>
                    <CardDescription>Selecciona una rutina para ver sus detalles</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredRutinas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">No hay rutinas registradas</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Rutina
                        </Button>
                      </div>
                    ) : (
                      // Modificar el mapeo de rutinas para usar documentId como key y en la comparación
                      <div className="divide-y">
                        {filteredRutinas.map((rutina) => (
                          <div
                            key={rutina.documentId || `rutina-${rutina.id}`}
                            className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                              rutinaSeleccionada?.documentId === rutina.documentId ? "bg-muted" : ""
                            }`}
                            onClick={() => handleSelectRutina(rutina)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{rutina.nombre}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {rutina.descripcion || "Sin descripción"}
                                </p>
                                {rutina.diasSemana && (
                                  <Badge variant="outline" className="mt-2">
                                    {diasSemanaMap[rutina.diasSemana] || rutina.diasSemana}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit(rutina.documentId)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(rutina.documentId)
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detalle de la rutina seleccionada */}
              <div className="md:col-span-2">
                {rutinaSeleccionada ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{rutinaSeleccionada.nombre}</CardTitle>
                          <CardDescription>{rutinaSeleccionada.descripcion || "Sin descripción"}</CardDescription>
                          {rutinaSeleccionada.diasSemana && (
                            <Badge variant="outline" className="mt-2">
                              {diasSemanaMap[rutinaSeleccionada.diasSemana] || rutinaSeleccionada.diasSemana}
                            </Badge>
                          )}
                        </div>
                        <Button onClick={handleAddEjercicio}>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir Ejercicio
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!rutinaSeleccionada.ejercicios || rutinaSeleccionada.ejercicios.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Esta rutina no tiene ejercicios</p>
                          <Button onClick={handleAddEjercicio}>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Ejercicio
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">Orden</TableHead>
                              <TableHead>Ejercicio</TableHead>
                              <TableHead className="text-center">Series</TableHead>
                              <TableHead className="text-center">Reps</TableHead>
                              <TableHead className="text-center">Peso</TableHead>
                              <TableHead className="text-center">Descanso</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rutinaSeleccionada.ejercicios &&
                              rutinaSeleccionada.ejercicios.map((ejercicio, index) => {
                                return (
                                  <TableRow key={ejercicio.documentId || `ejercicio-${index}`}>
                                    <TableCell className="font-medium">
                                      <div className="flex flex-col items-center">
                                        <span>{index + 1}</span>
                                        <div className="flex flex-col mt-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => handleMoveEjercicio(index, "up")}
                                            disabled={index === 0}
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => handleMoveEjercicio(index, "down")}
                                            disabled={index === rutinaSeleccionada.ejercicios.length - 1}
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <span className="font-medium">{ejercicio.nombre || "Ejercicio"}</span>
                                        <p className="text-xs text-muted-foreground capitalize">
                                          {ejercicio.tipo || "Sin categoría"}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">{ejercicio.series || 3}</TableCell>
                                    <TableCell className="text-center">{ejercicio.repeticiones || 10}</TableCell>
                                    <TableCell className="text-center">{ejercicio.peso || 0} kg</TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span>{ejercicio.descanso || 60}s</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" onClick={() => handleRemoveEjercicio(index)}>
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Selecciona una rutina</h3>
                      <p className="text-muted-foreground mb-4">
                        Selecciona una rutina de la lista para ver sus detalles o crea una nueva
                      </p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Rutina
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </PremiumGuard>
    </AuthGuard>
  )
}
