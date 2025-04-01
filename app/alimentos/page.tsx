"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash, Save, Loader2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getAlimentos, createAlimento, updateAlimento, deleteAlimento, type Alimento } from "@/lib/api"
import AuthGuard from "@/components/auth-guard"

type AlimentoFormData = {
  nombre: string
  calorias: number
  proteinas: number
  carbohidratos: number
  grasas: number
  fecha: string
  tipo: "desayuno" | "almuerzo" | "cena" | "snack"
}

export default function AlimentosPage() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [nuevoAlimento, setNuevoAlimento] = useState<AlimentoFormData>({
    nombre: "",
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    fecha: new Date().toISOString().split("T")[0],
    tipo: "desayuno",
  })
  const [alimentoEditando, setAlimentoEditando] = useState<Alimento | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterDate, setFilterDate] = useState<Date | null>(null)
  const [filterTipo, setFilterTipo] = useState<string | null>(null)
  const [totalCalorias, setTotalCalorias] = useState(0)
  const [totalProteinas, setTotalProteinas] = useState(0)
  const [totalCarbohidratos, setTotalCarbohidratos] = useState(0)
  const [totalGrasas, setTotalGrasas] = useState(0)

  // Cargar alimentos al montar el componente
  useEffect(() => {
    fetchAlimentos()
  }, [])

  // Calcular totales cuando cambian los alimentos
  useEffect(() => {
    if (alimentos && alimentos.length > 0) {
      // Calcular totales
      const calorias = alimentos.reduce((sum, alimento) => sum + (alimento.calorias || 0), 0)
      const proteinas = alimentos.reduce((sum, alimento) => sum + (alimento.proteinas || 0), 0)
      const carbohidratos = alimentos.reduce((sum, alimento) => sum + (alimento.carbohidratos || 0), 0)
      const grasas = alimentos.reduce((sum, alimento) => sum + (alimento.grasas || 0), 0)

      setTotalCalorias(calorias)
      setTotalProteinas(proteinas)
      setTotalCarbohidratos(carbohidratos)
      setTotalGrasas(grasas)
    } else {
      // Reiniciar totales si no hay alimentos
      setTotalCalorias(0)
      setTotalProteinas(0)
      setTotalCarbohidratos(0)
      setTotalGrasas(0)
    }
  }, [alimentos])

  // Función para obtener alimentos desde la API
  const fetchAlimentos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {}

      // Aplicar filtros SOLO si existen valores seleccionados
      if (filterDate) {
        const formattedDate = format(filterDate, "yyyy-MM-dd")
        params["filters[fecha][$eq]"] = formattedDate
      }

      if (filterTipo && filterTipo !== "") {
        params["filters[tipo][$eq]"] = filterTipo
      }

      const response = await getAlimentos(params)
      setAlimentos(response.data)
    } catch (err) {
      setError("Error al cargar los alimentos. Por favor, inténtalo de nuevo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoAlimento({
      ...nuevoAlimento,
      [name]: name === "nombre" || name === "fecha" || name === "tipo" ? value : Number(value),
    })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!alimentoEditando) return

    const { name, value } = e.target
    setAlimentoEditando({
      ...alimentoEditando,
      [name]: name === "nombre" || name === "fecha" || name === "tipo" ? value : Number(value),
    })
  }

  const handleSubmit = async () => {
    try {
      const response = await createAlimento(nuevoAlimento)
      setAlimentos([...alimentos, response.data])
      setNuevoAlimento({
        nombre: "",
        calorias: 0,
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
        fecha: new Date().toISOString().split("T")[0],
        tipo: "desayuno",
      })
      setIsDialogOpen(false)
    } catch (err) {
      setError("Error al crear el alimento. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleEdit = (id: number) => {
    const alimentoToEdit = alimentos.find((alimento) => alimento.id === id)
    if (alimentoToEdit) {
      setAlimentoEditando(alimentoToEdit)
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!alimentoEditando) return

    try {
      const response = await updateAlimento(alimentoEditando.id, alimentoEditando)
      setAlimentos(alimentos.map((alimento) => (alimento.id === alimentoEditando.id ? response.data : alimento)))
      setAlimentoEditando(null)
      setIsEditDialogOpen(false)
    } catch (err) {
      setError("Error al actualizar el alimento. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAlimento(id)
      setAlimentos(alimentos.filter((alimento) => alimento.id !== id))
    } catch (err) {
      setError("Error al eliminar el alimento. Por favor, inténtalo de nuevo.")
      console.error(err)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setNuevoAlimento({
        ...nuevoAlimento,
        fecha: format(date, "yyyy-MM-dd"),
      })
      setDate(date)
    }
  }

  const handleEditDateSelect = (date: Date | undefined) => {
    if (date && alimentoEditando) {
      setAlimentoEditando({
        ...alimentoEditando,
        fecha: format(date, "yyyy-MM-dd"),
      })
    }
  }

  const handleFilterApply = () => {
    fetchAlimentos()
    setIsFilterOpen(false)
  }

  const handleFilterClear = () => {
    setFilterDate(null)
    setFilterTipo(null)
    setIsFilterOpen(false)
    fetchAlimentos()
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Registro de Alimentos</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {(filterDate || filterTipo) && <span className="ml-1 rounded-full bg-primary w-2 h-2"></span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Filtrar por fecha</h4>
                    <Calendar
                      mode="single"
                      selected={filterDate || undefined}
                      onSelect={(date) => setFilterDate(date)}
                      locale={es}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Filtrar por tipo</h4>
                    <Select value={filterTipo || ""} onValueChange={setFilterTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="desayuno">Desayuno</SelectItem>
                        <SelectItem value="almuerzo">Almuerzo</SelectItem>
                        <SelectItem value="cena">Cena</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
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
                Añadir Alimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir nuevo alimento</DialogTitle>
                <DialogDescription>Completa los detalles del alimento que has consumido.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" value={nuevoAlimento.nombre} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calorias">Calorías</Label>
                    <Input
                      id="calorias"
                      name="calorias"
                      type="number"
                      value={nuevoAlimento.calorias}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proteinas">Proteínas (g)</Label>
                    <Input
                      id="proteinas"
                      name="proteinas"
                      type="number"
                      value={nuevoAlimento.proteinas}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="carbohidratos">Carbohidratos (g)</Label>
                    <Input
                      id="carbohidratos"
                      name="carbohidratos"
                      type="number"
                      value={nuevoAlimento.carbohidratos}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="grasas">Grasas (g)</Label>
                    <Input
                      id="grasas"
                      name="grasas"
                      type="number"
                      value={nuevoAlimento.grasas}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={handleDateSelect} locale={es} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={nuevoAlimento.tipo}
                      onValueChange={(value) => setNuevoAlimento({ ...nuevoAlimento, tipo: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desayuno">Desayuno</SelectItem>
                        <SelectItem value="almuerzo">Almuerzo</SelectItem>
                        <SelectItem value="cena">Cena</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
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
                <DialogTitle>Editar alimento</DialogTitle>
                <DialogDescription>Modifica los detalles del alimento seleccionado.</DialogDescription>
              </DialogHeader>
              {alimentoEditando && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                      id="edit-nombre"
                      name="nombre"
                      value={alimentoEditando.nombre}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-calorias">Calorías</Label>
                      <Input
                        id="edit-calorias"
                        name="calorias"
                        type="number"
                        value={alimentoEditando.calorias}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-proteinas">Proteínas (g)</Label>
                      <Input
                        id="edit-proteinas"
                        name="proteinas"
                        type="number"
                        value={alimentoEditando.proteinas}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-carbohidratos">Carbohidratos (g)</Label>
                      <Input
                        id="edit-carbohidratos"
                        name="carbohidratos"
                        type="number"
                        value={alimentoEditando.carbohidratos}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-grasas">Grasas (g)</Label>
                      <Input
                        id="edit-grasas"
                        name="grasas"
                        type="number"
                        value={alimentoEditando.grasas}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-fecha">Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {alimentoEditando.fecha ? (
                              format(new Date(alimentoEditando.fecha), "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(alimentoEditando.fecha)}
                            onSelect={handleEditDateSelect}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tipo">Tipo</Label>
                      <Select
                        value={alimentoEditando.tipo}
                        onValueChange={(value) =>
                          setAlimentoEditando({
                            ...alimentoEditando,
                            tipo: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desayuno">Desayuno</SelectItem>
                          <SelectItem value="almuerzo">Almuerzo</SelectItem>
                          <SelectItem value="cena">Cena</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Cargando alimentos...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Calorías Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCalorias} kcal</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Proteínas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProteinas}g</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Carbohidratos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCarbohidratos}g</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Grasas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGrasas}g</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="todos" className="mt-6">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="desayuno">Desayuno</TabsTrigger>
                <TabsTrigger value="almuerzo">Almuerzo</TabsTrigger>
                <TabsTrigger value="cena">Cena</TabsTrigger>
                <TabsTrigger value="snack">Snack</TabsTrigger>
              </TabsList>
              <TabsContent value="todos">
                <Card>
                  <CardContent className="p-0">
                    {alimentos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">No hay alimentos registrados</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir alimento
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden md:table-cell">Calorías</TableHead>
                            <TableHead className="hidden md:table-cell">Proteínas</TableHead>
                            <TableHead className="hidden md:table-cell">Carbohidratos</TableHead>
                            <TableHead className="hidden md:table-cell">Grasas</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alimentos.map((alimento) => (
                            <TableRow key={alimento.id}>
                              <TableCell className="font-medium">{alimento.nombre}</TableCell>
                              <TableCell className="hidden md:table-cell">{alimento.calorias} kcal</TableCell>
                              <TableCell className="hidden md:table-cell">{alimento.proteinas}g</TableCell>
                              <TableCell className="hidden md:table-cell">{alimento.carbohidratos}g</TableCell>
                              <TableCell className="hidden md:table-cell">{alimento.grasas}g</TableCell>
                              <TableCell className="capitalize">{alimento.tipo}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(alimento.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(alimento.id)}>
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
              {["desayuno", "almuerzo", "cena", "snack"].map((tipo) => (
                <TabsContent key={tipo} value={tipo}>
                  <Card>
                    <CardContent className="p-0">
                      {alimentos.filter((alimento) => alimento.tipo === tipo).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-muted-foreground mb-4">No hay alimentos registrados para {tipo}</p>
                          <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir alimento
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead className="hidden md:table-cell">Calorías</TableHead>
                              <TableHead className="hidden md:table-cell">Proteínas</TableHead>
                              <TableHead className="hidden md:table-cell">Carbohidratos</TableHead>
                              <TableHead className="hidden md:table-cell">Grasas</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alimentos
                              .filter((alimento) => alimento.tipo === tipo)
                              .map((alimento) => (
                                <TableRow key={alimento.id}>
                                  <TableCell className="font-medium">{alimento.nombre}</TableCell>
                                  <TableCell className="hidden md:table-cell">{alimento.calorias} kcal</TableCell>
                                  <TableCell className="hidden md:table-cell">{alimento.proteinas}g</TableCell>
                                  <TableCell className="hidden md:table-cell">{alimento.carbohidratos}g</TableCell>
                                  <TableCell className="hidden md:table-cell">{alimento.grasas}g</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(alimento.id)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(alimento.id)}>
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
          </>
        )}
      </div>
    </AuthGuard>
  )
}

