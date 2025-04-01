// Constantes para la API
const API_URL = "http://localhost:1337"

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
}

export type Alimento = {
  id: number
  nombre: string
  calorias: number | null
  proteinas: number | null
  carbohidratos: number | null
  grasas: number | null
  tipo: "desayuno" | "almuerzo" | "cena" | "snack" | null
  createdAt: string
  updatedAt: string
  documentId?: string
  fecha?: string | null
  locale?: string
  publishedAt?: string
}

export type Ejercicio = {
  id: number
  attributes: {
    nombre: string
    series: number
    repeticiones: number
    peso: number
    categoria: "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "abdominales" | "cardio"
    createdAt: string
    updatedAt: string
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

      const errorData = await response.json().catch(() => ({
        message: `Error HTTP: ${response.status} ${response.statusText}`,
      }))

      throw errorData
    }

    const data = await response.json()

    // Si la respuesta incluye un token JWT, lo guardamos
    if (data.jwt) {
      setAuthToken(data.jwt)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al realizar la petición:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
    throw error;
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

  return fetchAPI(`/api/alimentos`)
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
  return fetchAPI(`/api/alimentos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}

// Función para eliminar un alimento
export const deleteAlimento = async (id: number): Promise<any> => {
  return fetchAPI(`/api/alimentos/${id}`, {
    method: "DELETE",
  })
}

// Función para obtener ejercicios (antes entrenos)
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
  return fetchAPI(`/api/ejercicios/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}

// Función para eliminar un ejercicio
export const deleteEjercicio = async (id: number): Promise<any> => {
  return fetchAPI(`/api/ejercicios/${id}`, {
    method: "DELETE",
  })
}

// Función para obtener el historial de alimentos
export const getHistorialAlimentos = async (params: Record<string, any> = {}): Promise<any> => {
  const queryParams = new URLSearchParams()

  // Añadir parámetros a la URL
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  // Añadir parámetros de ordenación y agrupación
  queryParams.append("sort", "fecha:desc")

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
  queryParams.append("sort", "fecha:desc")

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

