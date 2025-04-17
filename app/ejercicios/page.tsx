"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash, Loader2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getEjercicios, createEjercicio, updateEjercicio, deleteEjercicio, type Ejercicio } from "@/lib/api"
import AuthGuard from "@/components/auth-guard"

type EjercicioDTO = {
  nombre: string
  series: number
  repeticiones: number
  peso: number
  fecha: string
  tipo: "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "abdominales" | "cardio"
  intensidad: "pricipiante" | "intermedio" | "avanzado"
}

export default function EntrenosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [nuevoEjercicio, setNuevoEjercicio] = useState<EjercicioDTO>({
    nombre: "",
    series: 0,
    repeticiones: 0,
    peso: 0,
    fecha: new Date().toISOString().split("T")[0],
    tipo: "pecho",
    intensidad: "pricipiante",
  })
  const [ejercicioEditando, setEjercicioEditando] = useState<Ejercicio | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterTipo, setFilterTipo] = useState<string | null>(null)

  // Cargar ejercicios al montar el componente
  useEffect(() => {
    fetchEjercicios()
  }, [])

  // Función para obtener ejercicios desde la API
  const fetchEjercicios = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {}

      if (filterTipo) {
        params["filters[tipo][$eq]"] = filterTipo
      }

      const response = await getEjercicios(params)
      setEjercicios(response.data || [])
    } catch (err) {
      setError("Error al cargar los ejercicios. Por favor, inténtalo de nuevo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoEjercicio({
      ...nuevoEjercicio,
      [name]: name === "nombre" || name === "fecha" || name === "tipo" ? value : Number(value),
    })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!ejercicioEditando) return

    const { name, value } = e.target
    setEjercicioEditando({
      ...ejercicioEditando,
      [name]: name === "nombre" || name === "fecha" || name === "tipo" ? value : Number(value),
    })
  }

  const handleSubmit = async () => {
    try {
      const response = await createEjercicio(nuevoEjercicio)
      setEjercicios([...ejercicios, response.data])
      setNuevoEjercicio({
        nombre: "",
        series: 0,
        repeticiones: 0,
        peso: 0,
        tipo: "pecho",
        fecha: new Date().toISOString().split("T")[0],
        intensidad: "pricipiante",
      })
      setIsDialogOpen(false)
    } catch (err) {
      setError("Error al crear el ejercicio. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleEdit = (documentId: number) => {
    const ejercicioToEdit = ejercicios.find((ejercicio) => ejercicio.documentId === documentId.toString())
    //alert(documentId)
    if (ejercicioToEdit) {
      setEjercicioEditando(ejercicioToEdit)
      console.log("Ejercicio ene edicion", ejercicioToEdit)
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!ejercicioEditando) return

    try {
      // Extraer solo los campos necesarios para la actualización
      const dataToUpdate = {
        nombre: ejercicioEditando.nombre || "",
        series: ejercicioEditando.series,
        repeticiones: ejercicioEditando.repeticiones,
        peso: ejercicioEditando.peso,
        tipo: ejercicioEditando.tipo || "pecho",
        intensidad: ejercicioEditando.intensidad || "pricipiante",
        fecha: ejercicioEditando.fecha || new Date().toISOString().split("T")[0],
      }

      const response = await updateEjercicio(ejercicioEditando.documentId, dataToUpdate)
      setEjercicios(ejercicios.map((ejercicio) => (ejercicio.documentId === ejercicioEditando.documentId ? response.data : ejercicio)))
      setEjercicioEditando(null)
      setIsEditDialogOpen(false)
    } catch (err) {
      setError("Error al actualizar el ejercicio. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleDelete = async (documentId: number) => {
    try {
      const result = await deleteEjercicio(documentId)
      if (result.success) {
        setEjercicios(ejercicios.filter((ejercicio) => ejercicio.documentId !== documentId.toString()))
      } else {
        throw new Error("No se pudo eliminar el ejercicio")
      }
    } catch (err) {
      setError("Error al eliminar el ejercicio. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setNuevoEjercicio({
        ...nuevoEjercicio,
        fecha: format(date, "yyyy-MM-dd"),
      })
      setDate(date)
    }
  }

  const handleEditDateSelect = (date: Date | undefined) => {
    if (date && ejercicioEditando) {
      setEjercicioEditando({
        ...ejercicioEditando,
        fecha: format(date, "yyyy-MM-dd"),
      })
    }
  }

  const handleFilterApply = () => {
    fetchEjercicios()
    setIsFilterOpen(false)
  }

  const handleFilterClear = () => {
    setFilterTipo(null)
    setIsFilterOpen(false)
    // Llamar a fetchEjercicios sin filtros para cargar todos los ejercicios
    const fetchAllEjericicos = async () => {
      setIsLoading(true)
      try {
        const response = await getEjercicios({})
        setEjercicios(response.data || [])
      } catch (err) {
        setError("Error al cargar los ejericios. Por favor, inténtalo de nuevo.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllEjericicos()
  }

  const filteredEjercicios = ejercicios.filter((ejercicio) =>
    ejercicio && ejercicio.nombre ? ejercicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false,
  )

  const tipos = ["pecho", "espalda", "piernas", "hombros", "brazos", "abdominales", "cardio"]
  const intensidad = ["pricipiante", "intermedio", "avanzado"]

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Registro de Ejercicios</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar ejercicios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {filterTipo && <span className="ml-1 rounded-full bg-primary w-2 h-2"></span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Filtrar por tipo</h4>
                    <Select value={filterTipo || "todos"} onValueChange={setFilterTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="pecho">Pecho</SelectItem>
                        <SelectItem value="espalda">Espalda</SelectItem>
                        <SelectItem value="piernas">Piernas</SelectItem>
                        <SelectItem value="hombros">Hombros</SelectItem>
                        <SelectItem value="brazos">Brazos</SelectItem>
                        <SelectItem value="abdominales">Abdominales</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                      </SelectContent>

                    </Select>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleFilterClear}>
                      Limpiar
                    </Button>
                    <Button onClick={handleFilterApply}>Aplicar filtros</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Ejercicio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir nuevo ejercicio</DialogTitle>
                <DialogDescription>Completa los detalles del ejercicio que has realizado.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del ejercicio</Label>
                  <Input id="nombre" name="nombre" value={nuevoEjercicio.nombre} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="series">Series</Label>
                    <Input
                      id="series"
                      name="series"
                      type="number"
                      value={nuevoEjercicio.series}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeticiones">Repeticiones</Label>
                    <Input
                      id="repeticiones"
                      name="repeticiones"
                      type="number"
                      value={nuevoEjercicio.repeticiones}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      value={nuevoEjercicio.peso}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Categoría</Label>
                    <Select
                      value={nuevoEjercicio.tipo}
                      onValueChange={(value) => setNuevoEjercicio({ ...nuevoEjercicio, tipo: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label htmlFor="tipo">Intensidad</Label>
                    <Select
                      value={nuevoEjercicio.intensidad}
                      onValueChange={(value) => setNuevoEjercicio({ ...nuevoEjercicio, intensidad: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar intensidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {intensidad.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="border rounded-md">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            locale={es}
                            className="p-0"
                            initialFocus
                            fixedWeeks
                            ISOWeek
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo de edición */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar ejercicio</DialogTitle>
                <DialogDescription>Modifica los detalles del ejercicio seleccionado.</DialogDescription>
              </DialogHeader>
              {ejercicioEditando && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nombre">Nombre del ejercicio</Label>
                    <Input
                      id="edit-nombre"
                      name="nombre"
                      value={ejercicioEditando.nombre}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-series">Series</Label>
                      <Input
                        id="edit-series"
                        name="series"
                        type="number"
                        value={ejercicioEditando.series}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-repeticiones">Repeticiones</Label>
                      <Input
                        id="edit-repeticiones"
                        name="repeticiones"
                        type="number"
                        value={ejercicioEditando.repeticiones}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-peso">Peso (kg)</Label>
                      <Input
                        id="edit-peso"
                        name="peso"
                        type="number"
                        value={ejercicioEditando.peso}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tipo">Categoría</Label>
                    <Select
                      value={ejercicioEditando.tipo}
                      onValueChange={(value) =>
                        setEjercicioEditando({
                          ...ejercicioEditando,
                          tipo: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipo">Intensidad</Label>
                    <Select
                      value={ejercicioEditando.intensidad}
                      onValueChange={(value) => setEjercicioEditando({ ...ejercicioEditando, intensidad: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar intensidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {intensidad.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="border rounded-md">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleEditDateSelect}
                            locale={es}
                            className="p-0"
                            autoFocus
                            fixedWeeks
                            ISOWeek
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleSaveEdit}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Cargando ejercicios...</p>
          </div>
        ) : (
          <Tabs defaultValue="todos" className="mt-6">
            <TabsList className="grid grid-cols-4 md:grid-cols-8">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pecho">Pecho</TabsTrigger>
              <TabsTrigger value="espalda">Espalda</TabsTrigger>
              <TabsTrigger value="piernas">Piernas</TabsTrigger>
              <TabsTrigger value="hombros">Hombros</TabsTrigger>
              <TabsTrigger value="brazos">Brazos</TabsTrigger>
              <TabsTrigger value="abdominales">Abdominales</TabsTrigger>
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
            </TabsList>
            <TabsContent value="todos">
              <Card>
                <CardContent className="p-0">
                  {filteredEjercicios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">No hay ejercicios registrados</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir ejercicio
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="hidden md:table-cell">Series</TableHead>
                          <TableHead className="hidden md:table-cell">Repeticiones</TableHead>
                          <TableHead className="hidden md:table-cell">Peso (kg)</TableHead>
                          <TableHead className="hidden md:table-cell">Intensidad</TableHead>
                          <TableHead className="hidden md:table-cell">Tipo</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEjercicios.map((ejercicio) => (
                          <TableRow key={ejercicio.id}>
                            <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {ejercicio.series !== null ? `${ejercicio.series}` : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {ejercicio.repeticiones !== null ? `${ejercicio.repeticiones}` : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {ejercicio.peso !== null ? `${ejercicio.peso}` : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {ejercicio.intensidad !== null ? `${ejercicio.intensidad}` : "-"}
                            </TableCell>
                            <TableCell className="capitalize">
                              {ejercicio.tipo ? ejercicio.tipo : "Sin especificar"}
                            </TableCell>
                            <TableCell>
                              {ejercicio.fecha ? new Date(ejercicio.fecha).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(ejercicio.documentId)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(ejercicio.documentId)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {["pecho", "espalda", "piernas", "hombros", "brazos", "abdominales", "cardio"].map((tipo) => (
              <TabsContent key={tipo} value={tipo}>
                <Card>
                  <CardContent className="p-0">
                    {filteredEjercicios.filter((ejercicio) => ejercicio.tipo === tipo).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">No hay ejercicios registrados para {tipo}</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir ejercicio
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden md:table-cell">Series</TableHead>
                            <TableHead className="hidden md:table-cell">Repeticiones</TableHead>
                            <TableHead className="hidden md:table-cell">Peso (kg)</TableHead>
                            <TableHead className="hidden md:table-cell">Intensidad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEjercicios
                            .filter((ejercicio) => ejercicio.tipo && ejercicio.tipo === tipo)
                            .map((ejercicio) => (<TableRow key={ejercicio.id}>
                              <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {ejercicio.series !== null ? `${ejercicio.series}` : "-"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {ejercicio.repeticiones !== null ? `${ejercicio.repeticiones}` : "-"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {ejercicio.peso !== null ? `${ejercicio.peso}` : "-"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {ejercicio.intensidad !== null ? `${ejercicio.intensidad}` : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(ejercicio.documentId)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ejercicio.documentId)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AuthGuard >
  )
}

