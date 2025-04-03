// Constantes para la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

// Tipos para los datos de la API
export type User = {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  image?: string // Para la URL de la imagen de perfil de Google
}

export type DatoUsuario = {
  id: number
  edad: number
  genero: "hombre" | "mujer"
  peso: number
  altura: number
  nivelActividad: "bajo" | "medio" | "alto"
  user?: User
}

export type Objetivo = {
  id: number
  entrenamientosSemanales: number
  intensidad: string
  pesoDeseado: number
  fechaLimite: string
  plan: string
  user?: User
}

export type Alimento = {
  id: number
  nombre: string
  calorias: number | null
  proteinas: number | null
  carbohidratos: number | null
  grasas: number | null
  tipo: "desayuno" | "almuerzo" | "cena" | "snack" | null
  fecha: string | null
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export type Ejercicio = {
  id: number
  nombre: string
  series: number
  repeticiones: number
  peso: number
  fecha: string
  categoria: "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "abdominales" | "cardio"
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export type EjercicioRutina = {
  id: number
  ejercicio: Ejercicio
  series: number
  repeticiones: number
  peso: number
  descanso: number
  orden: number
}

export type Rutina = {
  id: number
  nombre: string
  descripcion: string
  diasSemana: string[] // ["lunes", "miercoles", "viernes"]
  ejercicios: EjercicioRutina[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  user?: User
}

// Función para limpiar la URL de parámetros de autenticación
export const cleanAuthParams = (): void => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href)

    // Verificar si hay parámetros de autenticación
    if (url.searchParams.has("access_token") || url.searchParams.has("error")) {
      // Eliminar los parámetros de la URL
      url.searchParams.delete("access_token")
      url.searchParams.delete("error")
      url.searchParams.delete("code")
      url.searchParams.delete("state")

      // Reemplazar la URL actual sin recargar la página
      window.history.replaceState({}, document.title, url.toString())
    }
  }
}

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Función para guardar el token de autenticación
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Función para eliminar el token de autenticación
export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Función para obtener el usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) {
    return null
  }

  try {
    const response = await fetchAPI("/api/users/me")
    return response
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
    return null
  }
}

// Función para obtener los datos del usuario
export const getDatosUsuario = async (): Promise<DatoUsuario | null> => {
  if (!isAuthenticated()) {
    return null
  }

  try {
    const response = await fetchAPI("/api/dato-usuarios/me")
    return response.data
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error)
    return null
  }
}

// Función para obtener los objetivos del usuario
export const getObjetivosUsuario = async (): Promise<Objetivo | null> => {
  if (!isAuthenticated()) {
    return null
  }

  try {
    const response = await fetchAPI("/api/objetivos/me")
    return response.data
  } catch (error) {
    console.error("Error al obtener los objetivos del usuario:", error)
    return null
  }
}

// Función para realizar peticiones a la API
export const fetchAPI = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken()

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions)

    if (!response.ok) {
      // Si la respuesta es 401 (No autorizado), eliminamos el token
      if (response.status === 401) {
        removeAuthToken()
      }

      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorData.message || errorMessage
      } catch (e) {
        // Si no podemos parsear la respuesta como JSON, usamos el mensaje por defecto
      }

      throw new Error(errorMessage)
    }

    // Si la respuesta tiene un cuerpo, parsear como JSON
    let data = {}
    if (response.status !== 204) {
      // Código HTTP 204 significa sin contenido
      data = await response.json()
    }

    // Si la respuesta incluye un token JWT, lo guardamos
    if (data && data.jwt) {
      setAuthToken(data.jwt)
    }

    return data
  } catch (error) {
    console.error("Error al realizar la petición:", error)
    throw error
  }
}

// Función para iniciar sesión
export const login = async (identifier: string, password: string): Promise<any> => {
  try {
    const response = await fetchAPI("/api/auth/local", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    })

    return response
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }
}

// Función para iniciar sesión con Google
export const loginWithGoogle = async (): Promise<void> => {
  try {
    // Redirigir al usuario a la URL de autenticación de Google en Strapi
    window.location.href = `${API_URL}/api/connect/google`
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error)
    throw error
  }
}

// Función para manejar la redirección después del login con Google
export const handleOAuthCallback = async (queryParams: URLSearchParams): Promise<any> => {
  try {
    // Verificar si hay un token en los parámetros de la URL
    const accessToken = queryParams.get("access_token")

    if (accessToken) {
      // Guardar el token
      setAuthToken(accessToken)

      // Limpiar la URL de parámetros de autenticación
      cleanAuthParams()

      return { success: true }
    }

    // Si no hay token, verificar si hay un código de error
    const error = queryParams.get("error")
    if (error) {
      throw new Error(error)
    }

    return { success: false, message: "No se recibió un token de acceso" }
  } catch (error) {
    console.error("Error al procesar la redirección OAuth:", error)
    throw error
  }
}

// Función para registrar un nuevo usuario
export const register = async (username: string, email: string, password: string): Promise<any> => {
  try {
    const response = await fetchAPI("/api/auth/local/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    })

    return response
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    throw error
  }
}

// Modificar la función forgotPassword para manejar mejor las respuestas
export const forgotPassword = async (email: string): Promise<any> => {
  try {
    const url = `${API_URL}/api/auth/forgot-password`
    console.log("URL de recuperación:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    console.log("Código de estado:", response.status)

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`

      // Manejar específicamente el error 500
      if (response.status === 500) {
        console.error("Error 500 del servidor. Posible problema con la configuración del correo en Strapi.")
        throw new Error("Internal Server Error - El servidor no pudo procesar la solicitud")
      }

      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch (e) {
        // Si no podemos parsear la respuesta como JSON, usamos el mensaje por defecto
      }

      throw new Error(errorMessage)
    }

    // Si la respuesta es exitosa pero no tiene cuerpo (204 No Content)
    if (response.status === 204) {
      return { ok: true }
    }

    // Si hay un cuerpo en la respuesta, devolverlo
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error)
    throw error
  }
}

// Función para restablecer la contraseña
export const resetPassword = async (code: string, password: string, passwordConfirmation: string): Promise<any> => {
  try {
    const response = await fetchAPI("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    })

    return response
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
    throw error
  }
}

// Función para cerrar sesión
export const logout = (): void => {
  removeAuthToken()
  // Redirigir a la página de inicio o login si es necesario
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
}

// Función para obtener alimentos
export const getAlimentos = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/alimentos${queryString}`)
}

// Función para obtener un alimento por ID
export const getAlimento = async (id: number): Promise<any> => {
  return fetchAPI(`/api/alimentos/${id}`)
}

// Función para crear un alimento
export const createAlimento = async (data: any): Promise<any> => {
  return fetchAPI("/api/alimentos", {
    method: "POST",
    body: JSON.stringify({ data }),
  })
}

// Función para actualizar un alimento
export const updateAlimento = async (id: number, data: any): Promise<any> => {
  try {
    // Asegurarse de que estamos enviando solo los datos necesarios
    const { nombre, calorias, proteinas, carbohidratos, grasas, fecha, tipo } = data

    const updateData = {
      nombre,
      calorias,
      proteinas,
      carbohidratos,
      grasas,
      fecha,
      tipo,
    }

    const response = await fetchAPI(`/api/alimentos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: updateData }),
    })

    // Verificar que la actualización fue exitosa
    if (!response || !response.data) {
      throw new Error("No se pudo actualizar el alimento")
    }

    return response
  } catch (error) {
    console.error("Error al actualizar alimento:", error)
    throw error
  }
}

// Función para eliminar un alimento
export const deleteAlimento = async (id: number): Promise<any> => {
  try {
    await fetchAPI(`/api/alimentos/${id}`, {
      method: "DELETE",
    })

    // En Strapi, una eliminación exitosa generalmente devuelve un 200 OK
    // Si llegamos aquí, consideramos que la eliminación fue exitosa
    return { success: true, id }
  } catch (error) {
    console.error("Error al eliminar alimento:", error)
    throw error
  }
}

// Función para obtener ejercicios
export const getEjercicios = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/ejercicios${queryString}`)
}

// Función para obtener un ejercicio por ID
export const getEjercicio = async (id: number): Promise<any> => {
  return fetchAPI(`/api/ejercicios/${id}`)
}

// Función para crear un ejercicio
export const createEjercicio = async (data: any): Promise<any> => {
  return fetchAPI("/api/ejercicios", {
    method: "POST",
    body: JSON.stringify({ data }),
  })
}

// Función para actualizar un ejercicio
export const updateEjercicio = async (id: number, data: any): Promise<any> => {
  try {
    // Asegurarse de que estamos enviando solo los datos necesarios
    const { nombre, series, repeticiones, peso, fecha, categoria } = data

    const updateData = {
      nombre,
      series,
      repeticiones,
      peso,
      fecha,
      categoria,
    }

    const response = await fetchAPI(`/api/ejercicios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: updateData }),
    })

    // Verificar que la actualización fue exitosa
    if (!response || !response.data) {
      throw new Error("No se pudo actualizar el ejercicio")
    }

    return response
  } catch (error) {
    console.error("Error al actualizar ejercicio:", error)
    throw error
  }
}

// Función para eliminar un ejercicio
export const deleteEjercicio = async (id: number): Promise<any> => {
  try {
    await fetchAPI(`/api/ejercicios/${id}`, {
      method: "DELETE",
    })

    // En Strapi, una eliminación exitosa generalmente devuelve un 200 OK
    // Si llegamos aquí, consideramos que la eliminación fue exitosa
    return { success: true, id }
  } catch (error) {
    console.error("Error al eliminar ejercicio:", error)
    throw error
  }
}

// Función para obtener el historial de alimentos
export const getHistorialAlimentos = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  // Añadir parámetros de ordenación y agrupación
  if (!params.sort) {
    queryParams.append("sort", "fecha:desc")
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/alimentos${queryString}`)
}

// Función para obtener el historial de ejercicios
export const getHistorialEjercicios = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  // Añadir parámetros de ordenación y agrupación
  if (!params.sort) {
    queryParams.append("sort", "fecha:desc")
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/ejercicios${queryString}`)
}

// Función para verificar la conexión con la API
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    // Intentar acceder a un endpoint público de Strapi
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    return response.ok
  } catch (error) {
    console.error("Error al verificar la conexión con la API:", error)
    return false
  }
}

// Función para calcular el IMC
export const calcularIMC = (peso: number, altura: number): number => {
  if (peso <= 0 || altura <= 0) return 0
  // Altura en metros (si viene en cm)
  const alturaEnMetros = altura < 3 ? altura : altura / 100
  return Number((peso / (alturaEnMetros * alturaEnMetros)).toFixed(2))
}

// Función para obtener la categoría de IMC
export const obtenerCategoriaIMC = (imc: number): string => {
  if (imc < 18.5) return "Bajo peso"
  if (imc < 25) return "Peso normal"
  if (imc < 30) return "Sobrepeso"
  if (imc < 35) return "Obesidad grado 1"
  if (imc < 40) return "Obesidad grado 2"
  return "Obesidad grado 3"
}

// Función para obtener recomendaciones según IMC
export const obtenerRecomendacionesIMC = (imc: number): string => {
  if (imc < 18.5) {
    return "Considera aumentar tu ingesta calórica con alimentos nutritivos y consulta con un nutricionista para un plan personalizado."
  } else if (imc < 25) {
    return "Mantén tus hábitos saludables con una dieta equilibrada y ejercicio regular."
  } else if (imc < 30) {
    return "Considera reducir ligeramente tu ingesta calórica y aumentar la actividad física. Consulta con un profesional para un plan adecuado."
  } else if (imc < 35) {
    return "Es recomendable consultar con un médico y un nutricionista para establecer un plan de alimentación y ejercicio adecuado."
  } else if (imc < 40) {
    return "Consulta con profesionales de la salud para un seguimiento médico y un plan integral de pérdida de peso."
  } else {
    return "Es importante buscar atención médica especializada para un tratamiento adecuado y supervisado."
  }
}

// Función para guardar los datos de la calculadora IMC
export const guardarCalculadoraIMC = async (datos: {
  peso: number
  altura: number
  edad: number
  genero: string
  imc: number
  categoria: string
  fecha: string
}): Promise<any> => {
  try {
    const response = await fetchAPI("/api/calculadora-imcs", {
      method: "POST",
      body: JSON.stringify({ data: datos }),
    })

    return response
  } catch (error) {
    console.error("Error al guardar datos de IMC:", error)
    throw error
  }
}

// Función para obtener el historial de la calculadora IMC
export const getHistorialIMC = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  // Añadir parámetros de ordenación
  if (!params.sort) {
    queryParams.append("sort", "fecha:desc")
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/calculadora-imcs${queryString}`)
}

// Función para actualizar el perfil del usuario
export const updateUserProfile = async (data: {
  username?: string
  email?: string
  password?: string
  currentPassword?: string
}): Promise<any> => {
  try {
    const response = await fetchAPI("/api/user/me", {
      method: "PUT",
      body: JSON.stringify(data),
    })

    return response
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    throw error
  }
}

// Función para guardar datos del usuario
export const saveDatosUsuario = async (data: Partial<DatoUsuario>): Promise<any> => {
  try {
    // Verificar si el usuario ya tiene datos
    const currentData = await getDatosUsuario()

    if (currentData && currentData.id) {
      // Actualizar datos existentes
      const response = await fetchAPI(`/api/dato-usuarios/${currentData.id}`, {
        method: "PUT",
        body: JSON.stringify({ data }),
      })
      return response
    } else {
      // Crear nuevos datos
      const response = await fetchAPI("/api/dato-usuarios", {
        method: "POST",
        body: JSON.stringify({ data }),
      })
      return response
    }
  } catch (error) {
    console.error("Error al guardar datos del usuario:", error)
    throw error
  }
}

// Función para guardar objetivos del usuario
export const saveObjetivosUsuario = async (data: Partial<Objetivo>): Promise<any> => {
  try {
    // Verificar si el usuario ya tiene objetivos
    const currentData = await getObjetivosUsuario()

    if (currentData && currentData.id) {
      // Actualizar objetivos existentes
      const response = await fetchAPI(`/api/objetivos/${currentData.id}`, {
        method: "PUT",
        body: JSON.stringify({ data }),
      })
      return response
    } else {
      // Crear nuevos objetivos
      const response = await fetchAPI("/api/objetivos", {
        method: "POST",
        body: JSON.stringify({ data }),
      })
      return response
    }
  } catch (error) {
    console.error("Error al guardar objetivos del usuario:", error)
    throw error
  }
}

// Función para obtener rutinas
export const getRutinas = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/rutinas${queryString}`)
}

// Función para obtener una rutina por ID
export const getRutina = async (id: number): Promise<any> => {
  return fetchAPI(`/api/rutinas/${id}`)
}

// Función para crear una rutina
export const createRutina = async (data: any): Promise<any> => {
  return fetchAPI("/api/rutinas", {
    method: "POST",
    body: JSON.stringify({ data }),
  })
}

// Función para actualizar una rutina
export const updateRutina = async (id: number, data: any): Promise<any> => {
  try {
    const response = await fetchAPI(`/api/rutinas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    })

    // Verificar que la actualización fue exitosa
    if (!response || !response.data) {
      throw new Error("No se pudo actualizar la rutina")
    }

    return response
  } catch (error) {
    console.error("Error al actualizar rutina:", error)
    throw error
  }
}

// Función para eliminar una rutina
export const deleteRutina = async (id: number): Promise<any> => {
  try {
    await fetchAPI(`/api/rutinas/${id}`, {
      method: "DELETE",
    })

    // En Strapi, una eliminación exitosa generalmente devuelve un 200 OK
    // Si llegamos aquí, consideramos que la eliminación fue exitosa
    return { success: true, id }
  } catch (error) {
    console.error("Error al eliminar rutina:", error)
    throw error
  }
}

// Función para añadir un ejercicio a una rutina
export const addEjercicioToRutina = async (
  rutinaId: number,
  ejercicioId: number,
  series: number,
  repeticiones: number,
  peso: number,
  descanso: number,
  orden: number,
): Promise<any> => {
  try {
    // Primero obtenemos la rutina actual
    const rutina = await getRutina(rutinaId)

    // Creamos el nuevo ejercicio para la rutina
    const nuevoEjercicio = {
      ejercicio: ejercicioId,
      series,
      repeticiones,
      peso,
      descanso,
      orden,
    }

    // Añadimos el ejercicio a la lista de ejercicios de la rutina
    const ejerciciosActualizados = [...(rutina.data.ejercicios || []), nuevoEjercicio]

    // Actualizamos la rutina con la nueva lista de ejercicios
    return updateRutina(rutinaId, { ejercicios: ejerciciosActualizados })
  } catch (error) {
    console.error("Error al añadir ejercicio a la rutina:", error)
    throw error
  }
}

// Función para eliminar un ejercicio de una rutina
export const removeEjercicioFromRutina = async (rutinaId: number, ejercicioIndex: number): Promise<any> => {
  try {
    // Primero obtenemos la rutina actual
    const rutina = await getRutina(rutinaId)

    // Filtramos el ejercicio que queremos eliminar
    const ejerciciosActualizados = rutina.data.ejercicios.filter((_: any, index: number) => index !== ejercicioIndex)

    // Actualizamos la rutina con la nueva lista de ejercicios
    return updateRutina(rutinaId, { ejercicios: ejerciciosActualizados })
  } catch (error) {
    console.error("Error al eliminar ejercicio de la rutina:", error)
    throw error
  }
}

// Función para verificar si un usuario es premium
export const isPremiumUser = async (): Promise<boolean> => {
  try {
    if (!isAuthenticated()) {
      return false
    }

    const user = await getCurrentUser()

    // Aquí implementamos la lógica para determinar si un usuario es premium
    // Por ejemplo, podría ser un campo en el perfil del usuario
    // Por ahora, simulamos que todos los usuarios autenticados son premium
    return true
  } catch (error) {
    console.error("Error al verificar si el usuario es premium:", error)
    return false
  }
}

// Función para verificar si un usuario tiene acceso a una funcionalidad premium
export const checkPremiumAccess = async (redirectIfNotPremium = true): Promise<boolean> => {
  try {
    const isPremium = await isPremiumUser()

    if (!isPremium && redirectIfNotPremium && typeof window !== "undefined") {
      // Redirigir a la página de planes premium
      window.location.href = "/planes"
      return false
    }

    return isPremium
  } catch (error) {
    console.error("Error al verificar acceso premium:", error)
    return false
  }
}