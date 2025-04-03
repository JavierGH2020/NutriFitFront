"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Save, Loader2, LineChart, Target, Calculator, Dumbbell, Utensils, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentUser,
  getDatosUsuario,
  getObjetivosUsuario,
  getHistorialIMC,
  getHistorialAlimentos,
  getHistorialEjercicios,
  updateUserProfile,
  isPremiumUser,
  type User as UserType,
  type DatoUsuario,
  type Objetivo,
} from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import { format, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [datos, setDatos] = useState<DatoUsuario | null>(null)
  const [objetivos, setObjetivos] = useState<Objetivo | null>(null)
  const [imcHistorial, setImcHistorial] = useState<any[]>([])
  const [alimentosRecientes, setAlimentosRecientes] = useState<any[]>([])
  const [ejerciciosRecientes, setEjerciciosRecientes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // Formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  })

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Verificar si el usuario es premium
        const premium = await isPremiumUser()
        setIsPremium(premium)

        // Obtener datos del usuario
        const userData = await getCurrentUser()
        setUser(userData)

        if (userData) {
          setFormData({
            ...formData,
            username: userData.username || "",
            email: userData.email || "",
          })
        }

        // Obtener datos personales
        const datosUsuario = await getDatosUsuario()
        setDatos(datosUsuario)

        // Obtener objetivos
        const objetivosUsuario = await getObjetivosUsuario()
        setObjetivos(objetivosUsuario)

        // Obtener historial de IMC (últimos 6 meses)
        const fechaInicio = format(subMonths(new Date(), 6), "yyyy-MM-dd")
        const fechaFin = format(new Date(), "yyyy-MM-dd")

        const imcParams = {
          "filters[fecha][$gte]": fechaInicio,
          "filters[fecha][$lte]": fechaFin,
          sort: "fecha:desc",
          "pagination[limit]": 10,
        }

        const imcResponse = await getHistorialIMC(imcParams)
        setImcHistorial(imcResponse.data || [])

        // Obtener alimentos recientes (últimos 5)
        const alimentosParams = {
          sort: "fecha:desc",
          "pagination[limit]": 5,
        }

        const alimentosResponse = await getHistorialAlimentos(alimentosParams)
        setAlimentosRecientes(alimentosResponse.data || [])

        // Obtener ejercicios recientes (últimos 5)
        const ejerciciosParams = {
          sort: "fecha:desc",
          "pagination[limit]": 5,
        }

        const ejerciciosResponse = await getHistorialEjercicios(ejerciciosParams)
        setEjerciciosRecientes(ejerciciosResponse.data || [])
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err)
        setError("No se pudieron cargar tus datos. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

    // Validar contraseñas si se está cambiando
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsSaving(false)
      return
    }

    try {
      // Preparar datos para actualizar
      const updateData: any = {
        username: formData.username,
        email: formData.email,
      }

      // Solo incluir contraseñas si se están cambiando
      if (formData.password && formData.currentPassword) {
        updateData.password = formData.password
        updateData.currentPassword = formData.currentPassword
      }

      await updateUserProfile(updateData)

      // Actualizar datos locales
      if (user) {
        setUser({
          ...user,
          username: formData.username,
          email: formData.email,
        })
      }

      setSuccess("Perfil actualizado correctamente")

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })

      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err)
      if (err.message && err.message.includes("password")) {
        setError("La contraseña actual es incorrecta")
      } else {
        setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = (): string => {
    if (!user || !user.username) {
      return user?.email?.charAt(0).toUpperCase() || "U"
    }
    return user.username.charAt(0).toUpperCase()
  }

  // Determinar si el usuario inició sesión con Google
  const isGoogleUser = user?.provider === "google" || user?.provider === undefined

  // Obtener el último IMC registrado
  const ultimoIMC = imcHistorial.length > 0 ? imcHistorial[0] : null

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Mi Perfil</h1>

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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Columna izquierda - Información del perfil */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      {isGoogleUser && user?.image ? (
                        <AvatarImage src={user.image} alt={user.username || "Usuario"} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <CardTitle className="text-center">{user?.username || "Usuario"}</CardTitle>
                    <CardDescription className="text-center">{user?.email}</CardDescription>

                    {/* Mostrar badge de tipo de cuenta */}
                    <Badge className={`mt-2 ${isPremium ? "bg-primary" : "bg-muted"}`}>
                      {isPremium ? "Cuenta Premium" : "Cuenta Básica"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {datos && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="font-medium">{datos.edad || "No especificada"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Género:</span>
                          <span className="font-medium capitalize">{datos.genero || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Peso actual:</span>
                          <span className="font-medium">{datos.peso ? `${datos.peso} kg` : "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Altura:</span>
                          <span className="font-medium">{datos.altura ? `${datos.altura} cm` : "No especificada"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nivel de actividad:</span>
                          <span className="font-medium capitalize">{datos.nivelActividad || "No especificado"}</span>
                        </div>
                      </>
                    )}

                    <Separator />

                    {objetivos && (
                      <>
                        <div className="pt-2">
                          <h3 className="font-semibold flex items-center mb-2">
                            <Target className="h-4 w-4 mr-2 text-primary" />
                            Objetivos actuales
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium capitalize">{objetivos.plan || "No especificado"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Peso deseado:</span>
                              <span className="font-medium">
                                {objetivos.pesoDeseado ? `${objetivos.pesoDeseado} kg` : "No especificado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Entrenamientos semanales:</span>
                              <span className="font-medium">
                                {objetivos.entrenamientosSemanales || "No especificado"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {ultimoIMC && (
                      <div className="pt-2">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Calculator className="h-4 w-4 mr-2 text-primary" />
                          Último IMC
                        </h3>
                        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-muted p-4 text-center">
                          <span className="text-3xl font-bold">{ultimoIMC.imc}</span>
                          <span className="text-sm font-semibold text-primary">{ultimoIMC.categoria}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(ultimoIMC.fecha), "PPP", { locale: es })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => router.push("/datos")}>
                      Editar datos
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/objetivos")}>
                      Editar objetivos
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Columna derecha - Tabs con formulario y resumen */}
            <div className="md:col-span-2">
              <Tabs defaultValue="cuenta">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cuenta">
                    <User className="h-4 w-4 mr-2" />
                    Cuenta
                  </TabsTrigger>
                  <TabsTrigger value="actividad">
                    <LineChart className="h-4 w-4 mr-2" />
                    Actividad reciente
                  </TabsTrigger>
                  <TabsTrigger value="progreso">
                    <Target className="h-4 w-4 mr-2" />
                    Progreso
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Cuenta */}
                <TabsContent value="cuenta">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de la cuenta</CardTitle>
                      <CardDescription>Actualiza tu información personal y contraseña</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Nombre de usuario</Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={isGoogleUser || isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isGoogleUser || isSaving}
                          />
                        </div>

                        {!isGoogleUser && (
                          <>
                            <Separator />
                            <div className="pt-2">
                              <h3 className="font-semibold mb-4">Cambiar contraseña</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                                  <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="password">Nueva contraseña</Label>
                                  <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                                  <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isSaving || isGoogleUser}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Guardar cambios
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                {/* Tab de Actividad Reciente */}
                <TabsContent value="actividad">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad reciente</CardTitle>
                      <CardDescription>Tus últimos registros de alimentos y ejercicios</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Alimentos recientes */}
                        <div>
                          <h3 className="font-semibold flex items-center mb-4">
                            <Utensils className="h-4 w-4 mr-2 text-primary" />
                            Últimos alimentos registrados
                          </h3>
                          {alimentosRecientes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              No hay alimentos registrados recientemente
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {alimentosRecientes.map((alimento) => (
                                <div
                                  key={alimento.id}
                                  className="flex justify-between items-center p-3 rounded-lg border"
                                >
                                  <div>
                                    <p className="font-medium">{alimento.nombre}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {alimento.fecha
                                        ? format(new Date(alimento.fecha), "PPP", { locale: es })
                                        : "Sin fecha"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{alimento.calorias} kcal</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {alimento.tipo || "Sin tipo"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Ejercicios recientes */}
                        <div>
                          <h3 className="font-semibold flex items-center mb-4">
                            <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                            Últimos ejercicios registrados
                          </h3>
                          {ejerciciosRecientes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              No hay ejercicios registrados recientemente
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {ejerciciosRecientes.map((ejercicio) => (
                                <div
                                  key={ejercicio.id}
                                  className="flex justify-between items-center p-3 rounded-lg border"
                                >
                                  <div>
                                    <p className="font-medium">{ejercicio.nombre}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {ejercicio.fecha
                                        ? format(new Date(ejercicio.fecha), "PPP", { locale: es })
                                        : "Sin fecha"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {ejercicio.series} x {ejercicio.repeticiones}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">{ejercicio.categoria}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full" onClick={() => router.push("/alimentos")}>
                          <Utensils className="mr-2 h-4 w-4" />
                          Ver alimentos
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/entrenos")}>
                          <Dumbbell className="mr-2 h-4 w-4" />
                          Ver ejercicios
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Tab de Progreso */}
                <TabsContent value="progreso">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tu progreso</CardTitle>
                      <CardDescription>Seguimiento de tu IMC y objetivos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Historial de IMC */}
                        <div>
                          <h3 className="font-semibold flex items-center mb-4">
                            <Calculator className="h-4 w-4 mr-2 text-primary" />
                            Historial de IMC
                          </h3>
                          {imcHistorial.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No hay registros de IMC</p>
                          ) : (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2">Fecha</th>
                                      <th className="text-center py-2">IMC</th>
                                      <th className="text-center py-2">Peso</th>
                                      <th className="text-right py-2">Categoría</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {imcHistorial.map((registro) => (
                                      <tr key={registro.id} className="border-b">
                                        <td className="py-2">{format(new Date(registro.fecha), "dd/MM/yyyy")}</td>
                                        <td className="text-center py-2 font-medium">{registro.imc}</td>
                                        <td className="text-center py-2">{registro.peso} kg</td>
                                        <td className="text-right py-2">
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
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Progreso hacia el objetivo */}
                              {objetivos && objetivos.pesoDeseado && datos && datos.peso && (
                                <div className="mt-6">
                                  <h4 className="text-sm font-medium mb-2">Progreso hacia tu peso objetivo</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Peso actual: {datos.peso} kg</span>
                                      <span>Objetivo: {objetivos.pesoDeseado} kg</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                      <div
                                        className="bg-primary h-2.5 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              datos.peso > objetivos.pesoDeseado
                                                ? 100 -
                                                    ((datos.peso - objetivos.pesoDeseado) / (datos.peso * 0.2)) * 100
                                                : 100 -
                                                    ((objetivos.pesoDeseado - datos.peso) /
                                                      (objetivos.pesoDeseado * 0.2)) *
                                                      100,
                                            ),
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {datos.peso > objetivos.pesoDeseado
                                        ? `Te faltan ${(datos.peso - objetivos.pesoDeseado).toFixed(1)} kg para alcanzar tu objetivo`
                                        : datos.peso < objetivos.pesoDeseado
                                          ? `Te faltan ${(objetivos.pesoDeseado - datos.peso).toFixed(1)} kg para alcanzar tu objetivo`
                                          : "¡Has alcanzado tu objetivo de peso!"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => router.push("/historial")}>
                        <LineChart className="mr-2 h-4 w-4" />
                        Ver historial completo
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

