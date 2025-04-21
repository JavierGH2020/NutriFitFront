"use client"

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
} from "@/lib/api"
import AuthGuard from "@/components/auth-guard"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados para los datos del usuario
  const [userData, setUserData] = useState({
    user: null,
    datos: null,
    objetivos: null,
    imcHistorial: [],
    alimentosRecientes: [],
    ejerciciosRecientes: [],
    isPremium: false,
  })

  // Estado para el formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  })

  // Función para cargar todos los datos del usuario
  const loadUserData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Cargar datos en paralelo para mejorar el rendimiento
      const [isPremium, user, datos, objetivos, imcResponse, alimentosResponse, ejerciciosResponse] = await Promise.all(
        [
          isPremiumUser(),
          getCurrentUser(),
          getDatosUsuario(),
          getObjetivosUsuario(),
          getHistorialIMC(),
          getHistorialAlimentos({ sort: "fecha:desc", "pagination[limit]": 5 }),
          getHistorialEjercicios({ sort: "fecha:desc", "pagination[limit]": 5 }),
        ],
      )

      // Actualizar el estado con todos los datos
      setUserData({
        user,
        datos,
        objetivos,
        imcHistorial: imcResponse.data || [],
        alimentosRecientes: alimentosResponse.data || [],
        ejerciciosRecientes: ejerciciosResponse.data || [],
        isPremium,
      })

      // Actualizar el formulario con los datos del usuario
      if (user) {
        setFormData({
          ...formData,
          username: user.username || "",
          email: user.email || "",
        })
      }
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err)
      setError("No se pudieron cargar tus datos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUserData()
  }, [])

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = () => {
    const { user } = userData
    if (!user || !user.username) {
      return user?.email?.charAt(0).toUpperCase() || "U"
    }
    return user.username.charAt(0).toUpperCase()
  }

  // Determinar si el usuario inició sesión con Google
  const isGoogleUser = userData.user?.provider === "google" || userData.user?.provider === undefined

  // Obtener el último IMC registrado
  const ultimoIMC = userData.imcHistorial.length > 0 ? userData.imcHistorial[0] : null

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
                      {isGoogleUser && userData.user?.image ? (
                        <AvatarImage src={userData.user.image} alt={userData.user.username || "Usuario"} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <CardTitle className="text-center">{userData.user?.username || "Usuario"}</CardTitle>
                    <CardDescription className="text-center">{userData.user?.email}</CardDescription>

                    {/* Mostrar badge de tipo de cuenta */}
                    <Badge className={`mt-2 ${userData.isPremium ? "bg-primary" : ""}`}>
                      {userData.isPremium ? "Cuenta Premium" : "Cuenta Básica"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.datos && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="font-medium">{userData.datos.edad || "No especificada"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Género:</span>
                          <span className="font-medium capitalize">{userData.datos.genero || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Peso actual:</span>
                          <span className="font-medium">
                            {userData.datos.peso ? `${userData.datos.peso} kg` : "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Altura:</span>
                          <span className="font-medium">
                            {userData.datos.altura ? `${userData.datos.altura} cm` : "No especificada"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nivel de actividad:</span>
                          <span className="font-medium capitalize">
                            {userData.datos.nivelActividad || "No especificado"}
                          </span>
                        </div>
                      </>
                    )}

                    <Separator />

                    {userData.objetivos && (
                      <>
                        <div className="pt-2">
                          <h3 className="font-semibold flex items-center mb-2">
                            <Target className="h-4 w-4 mr-2 text-primary" />
                            Objetivos actuales
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Plan:</span>
                              <span className="font-medium capitalize">
                                {userData.objetivos.plan || "No especificado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Peso deseado:</span>
                              <span className="font-medium">
                                {userData.objetivos.pesoDeseado
                                  ? `${userData.objetivos.pesoDeseado} kg`
                                  : "No especificado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Entrenamientos semanales:</span>
                              <span className="font-medium">
                                {userData.objetivos.entrenamientosSemanales || "No especificado"}
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
              <Tabs defaultValue="actividad">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="actividad">
                    <LineChart className="h-4 w-4 mr-2" />
                    Actividad reciente
                  </TabsTrigger>
                  <TabsTrigger value="progreso">
                    <Target className="h-4 w-4 mr-2" />
                    Progreso
                  </TabsTrigger>
                </TabsList>

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
                          {userData.alimentosRecientes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              No hay alimentos registrados recientemente
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userData.alimentosRecientes.map((alimento) => (
                                <div
                                  key={alimento.id || alimento.documentId}
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
                          {userData.ejerciciosRecientes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              No hay ejercicios registrados recientemente
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userData.ejerciciosRecientes.map((ejercicio) => (
                                <div
                                  key={ejercicio.id || ejercicio.documentId}
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
                                    <p className="text-xs text-muted-foreground capitalize">{ejercicio.tipo}</p>
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
                          {userData.imcHistorial.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No hay registros de IMC</p>
                          ) : (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-center py-2">IMC</th>
                                      <th className="text-center py-2">Peso</th>
                                      <th className="text-right py-2">Categoría</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userData.imcHistorial.map((registro) => (
                                      <tr key={registro.id || registro.documentId} className="border-b">
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
                              {userData.objetivos &&
                                userData.objetivos.pesoDeseado &&
                                userData.datos &&
                                userData.datos.peso && (
                                  <div className="mt-6">
                                    <h4 className="text-sm font-medium mb-2">Progreso hacia tu peso objetivo</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Peso actual: {userData.datos.peso} kg</span>
                                        <span>Objetivo: {userData.objetivos.pesoDeseado} kg</span>
                                      </div>
                                      <div className="w-full bg-muted rounded-full h-2.5">
                                        <div
                                          className="bg-primary h-2.5 rounded-full"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              Math.max(
                                                0,
                                                userData.datos.peso > userData.objetivos.pesoDeseado
                                                  ? 100 -
                                                  ((userData.datos.peso - userData.objetivos.pesoDeseado) /
                                                    (userData.datos.peso * 0.2)) *
                                                  100
                                                  : 100 -
                                                  ((userData.objetivos.pesoDeseado - userData.datos.peso) /
                                                    (userData.objetivos.pesoDeseado * 0.2)) *
                                                  100,
                                              ),
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {userData.datos.peso > userData.objetivos.pesoDeseado
                                          ? `Te faltan ${(userData.datos.peso - userData.objetivos.pesoDeseado).toFixed(1)} kg para alcanzar tu objetivo`
                                          : userData.datos.peso < userData.objetivos.pesoDeseado
                                            ? `Te faltan ${(userData.objetivos.pesoDeseado - userData.datos.peso).toFixed(1)} kg para alcanzar tu objetivo`
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
