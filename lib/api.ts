import { document } from "postcss"

// Importa la variable de entorno API_URL desde el archivo .env
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337"

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
  role?: "public" | "premium" // Para el rol del usuario
  documentId?: string
}

export type DatoUsuario = {
  id: number
  edad: number
  peso: number
  genero: "hombre" | "mujer"
  altura: number
  categoria: string
  imc: number
  nivelActividad?: string; // Add this property
  user?: User | number // Relación con el usuario
  createdAt: string
  updatedAt: string
  publishedAt?: string
  documentId?: string
}

export type Calculadora = {
  id: number
  edad: number
  genero: "hombre" | "mujer"
  peso: number
  altura: number
  user?: User | number // Relación con el usuario
  createdAt: string
  updatedAt: string
  publishedAt?: string
  documentId?: string
}

export type Objetivo = {
  id: number
  entrenamientosSemanales: number
  intensidad: string
  pesoDeseado: number
  fechaLimite: string
  plan: string
  user?: User | number // Relación con el usuario
  createdAt: string
  updatedAt: string
  publishedAt?: string
  documentId?: string
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
  documentId?: string
  user?: User | number // Relación con el usuario
}

export type Ejercicio = {
  id: number
  nombre: string
  series: number
  repeticiones: number
  peso: number
  fecha: string
  tipo: "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "abdominales" | "cardio"
  intensidad: "principiante" | "intermedio" | "avanzado"
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  documentId?: string
  user?: User | number // Relación con el usuario
  descanso: number // Descanso en segundos
}

export type Rutina = {
  id: number
  nombre: string
  descripcion?: string
  diasSemana?: "uno" | "dos" | "tres"
  ejercicios?: Ejercicio[]
  user?: User | number // Relación con el usuario
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  documentId?: string
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
// Función para obtener el usuario actual con el rol
export const getCurrentUser = async (): Promise<any> => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    // Hacemos una petición a la API de Strapi para obtener el usuario con el rol
    const response = await fetchAPI("/api/users/me?populate=role");

    // Verificamos si la respuesta contiene el rol
    if (response.role) {
      //console.log("Usuario con rol encontrado:", response.role.type);  // Inspecciona el rol
      //("Usuario y rol:", response);  // Inspecciona la respuesta
      return response;  // Retornamos la respuesta que incluye el rol
    }

    return null;  // Si no hay rol en la respuesta, retornamos null
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
    return null;
  }
};

// Función para verificar si un usuario es premium
export const isPremiumUser = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    //console.log("Usuario actual:", user.role.type);  // Inspecciona el usuario
    // Verificamos si el rol existe y si el tipo de rol es "premium"
    if (user.role.type === "authenticated") {
      //alert("El rol del usuario es autenticated")
      // Si el rol tiene el tipo "premium", devolver true
      return true;
    }

    // Si no es Premium
    //alert("El rol del usuario no es premium")
    return false;
  } catch (error) {
    console.error("Error al verificar si el usuario es premium:", error);
    return false;
  }
};

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

// Función para obtener los datos del usuario
export const getDatosUsuario = async (): Promise<DatoUsuario | null> => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    const id = user?.id;

    if (!id) {
      //console.error("No se encontró la ID del usuario");
      return null;
    }

    // Petición que trae los datos del usuario junto con la relación 'usuarios'
    const response = await fetchAPI(`/api/users/me?populate=usuarios`);

    const datos = response?.usuarios;

    if (datos && datos.length > 0) {
      //console.log("Datos del usuario:", datos[0]);
      return datos[0]; // o datos[0].attributes si necesitas solo los atributos
    } else {
      console.error("No se encontraron datos en la relación usuarios");
      return null;
    }

  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    return null;
  }
};

// Función para obtener los objetivos del usuario
export const getObjetivosUsuario = async (): Promise<Objetivo | null> => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    const id = user?.id;

    if (!id) {
      //console.error("No se encontró la ID del usuario");
      return null;
    }

    // Petición que trae los objetivos del usuario junto con la relación 'objetivos'
    const response = await fetchAPI(`/api/users/me?populate=objetivos`);

    const objetivos = response?.objetivos;

    if (objetivos && objetivos.length > 0) {
      //console.log("objetivos del usuario:", objetivos[0]);
      return objetivos[0]; // o objetivos[0].attributes si necesitas solo los atributos
    } else {
      console.error("No se encontraron objetivos en la relación objetivos");
      return null;
    }

  } catch (error) {
    console.error("Error al obtener los objetivos del usuario:", error);
    return null;
  }
};

// Función para guardar datos del usuario
export const saveDatosUsuario = async (data: Partial<DatoUsuario>): Promise<any> => {
  try {
    const currentData = await getDatosUsuario()

    if (currentData?.documentId) {
      // Actualizar datos existentes
      console.log("Actualizando datos del usuario con ID:", currentData.documentId); // Log para verificar el ID
      const response = await fetchAPI(`/api/usuarios/${currentData.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      console.log("Respuesta del PUT:", response); // Log para verificar la respuesta
      return response;
    } else {
      // Crear nuevos datos
      console.log("Creando nuevos datos para el usuario");
      const response = await fetchAPI("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      console.log("Respuesta del POST:", response); // Log para verificar la respuesta
      return response;
    }
  } catch (error) {
    console.error("Error al guardar datos del usuario:", error);
    throw error;
  }
}

// Función para guardar objetivos del usuario
export const saveObjetivosUsuario = async (data: Partial<Objetivo>): Promise<any> => {
  try {
    const currentData = await getObjetivosUsuario()

    if (currentData?.documentId) {
      // Actualizar objetivos existentes
      console.log("Actualizando objetivos con ID:", currentData.documentId); // Log para verificar el ID
      const response = await fetchAPI(`/api/objetivos/${currentData.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      console.log("Respuesta del PUT:", response); // Log para verificar la respuesta
      return response;
    } else {
      // Crear nuevos objetivos
      console.log("Creando nuevos objetivos");
      const response = await fetchAPI("/api/objetivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      console.log("Respuesta del POST:", response); // Log para verificar la respuesta
      return response;
    }
  } catch (error) {
    console.error("Error al guardar objetivos del usuario:", error);
    throw error;
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
        errorMessage = (errorData.error?.message ?? errorData.message) ?? errorMessage
      } catch (e) {
        console.error("Error al parsear la respuesta como JSON:", e);
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
    if (data?.jwt) {
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

// Función para obtener alimentos de un usuario específico
export const getAlimentos = async (params: Record<string, any> = {}): Promise<any> => {
  const user = await getCurrentUser()
  //alert("ID de usuario: " + user?.id)
  return fetchAPI(`/api/alimentos?filters[user][id][$eq]=${user.id}&populate=user`)
}


// Función para obtener un alimento por ID
export const getAlimento = async (id: number): Promise<any> => {
  return fetchAPI(`/api/alimentos?filters[id][$eq]=${id}`)
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
    const { nombre, calorias, proteinas, grasas, fecha, carbohidratos, tipo } = data

    const updateData = {
      nombre,
      calorias,
      carbohidratos,
      proteinas,
      fecha,
      tipo,
      grasas,
    }
    //alert("ID de alimento a actualizar: " + id)
    const response = await fetchAPI(`/api/alimentos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: updateData }),
    })

    // Verificar que la actualización fue exitosa
    if (!response?.data) {
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
  const user = await getCurrentUser()
  //alert("ID de usuario: " + user?.id)
  return fetchAPI(`/api/ejercicios?filters[user][id][$eq]=${user.id}&populate=user`)
}

// Función para obtener un ejercicio por ID
export const getEjercicio = async (id: number): Promise<any> => {
  return fetchAPI(`/api/ejercicios?filters[id][$eq]=${id}`)
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
    const { nombre, series, repeticiones, peso, fecha, tipo, intensidad } = data

    const updateData = {
      nombre,
      series,
      repeticiones,
      peso,
      fecha,
      tipo,
      intensidad,
    }

    const response = await fetchAPI(`/api/ejercicios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: updateData }),
    })

    // Verificar que la actualización fue exitosa
    if (!response.data) {
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

// Función para guardar los datos de la calculadoras IMC
export const guardarCalculadoraIMC = async (datos: {
  peso: number
  altura: number
  edad: number
  genero: string
  imc: number
  categoria: string
}): Promise<any> => {
  try {
    const response = await fetchAPI("/api/calculadoras", {
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
    queryParams.append("sort", "createdAt:desc")
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  return fetchAPI(`/api/calculadoras${queryString}`)
}

// Función mejorada para obtener rutinas (solo del usuario actual)
export const getRutinas = async (params: Record<string, any> = {}): Promise<{ data: Rutina[] }> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Usuario no autenticado");
    }

    // Opcionalmente filtrar por usuario actual
    const queryParams = new URLSearchParams({
      ...params,
      'filters[user][id][$eq]': user.id.toString()
    });
    
    const response = await fetchAPI(`/api/rutinas?${queryParams}`);

    // Transformar la respuesta para que sea más fácil de usar
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data.map((item: any): Rutina => {

          // Extraer ejercicios si existen
          const ejercicios: Ejercicio[] = item.ejercicios?.data
            ? item.ejercicios.data.map((ej: any): Ejercicio => ({
                id: ej.id,
                ...ej.item,
              }))
            : [];

          return {
            id: item.id,
            nombre: item.nombre ?? "",
            descripcion: item.descripcion ?? "",
            diasSemana: item.diaSemana ?? null,
            ejercicios,
            user: item.user?.data?.id ?? null,
          };
        }),
      };
    }

    return { data: [] };
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    throw new Error(`Error al obtener rutinas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función mejorada para obtener una rutina por ID
export const getRutina = async (documentId: string): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }
    alert("ID de la rutina a obtener: " + documentId)

    const response = await fetchAPI(`/api/rutinas/${documentId}`)
    console.log("Respuesta de la rutina:", response)
    if (response.data) {
      const attributes = response.data.attributes || {}

      // Extraer ejercicios si existen
      let ejercicios = []
      if (attributes.ejercicios.data) {
        ejercicios = attributes.ejercicios.data.map((ej: any) => ({
          id: ej.id,
          ...ej.attributes,
        }))
      }

      return {
        data: {
          documentId: response.data.documentId,
          nombre: attributes.nombre || "",
          descripcion: attributes.descripcion || "",
          diasSemana: attributes.diasSemana || null,
          ejercicios: ejercicios,
        },
      }
    }

    return { data: null }
  } catch (error) {
    console.error("Error al obtener rutina:", error)
    throw error
  }
}

// Función mejorada para crear una rutina
export const createRutina = async (data: any): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Validar datos mínimos
    if (!data.nombre) {
      throw new Error("El nombre de la rutina es obligatorio")
    }

    // Preparar los datos para enviar
    const rutinaData = {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      diasSemana: data.diasSemana || null,
      user: user.id,
    }

    const response = await fetchAPI("/api/rutinas", {
      method: "POST",
      body: JSON.stringify({ data: rutinaData }),
    })

    // Verificar que la creación fue exitosa
    if (!response || !response.data) {
      throw new Error("No se pudo crear la rutina")
    }

    // Transformar la respuesta para que sea más fácil de usar
    const attributes = response.data.attributes || {}

    return {
      data: {
        id: response.data.id,
        nombre: attributes.nombre || "",
        descripcion: attributes.descripcion || "",
        diasSemana: attributes.diasSemana || null,
        ejercicios: [],
        users_permissions_user: attributes.users_permissions_user?.data?.id || user.id,
      },
    }
  } catch (error) {
    console.error("Error al crear rutina:", error)
    throw error
  }
}

// Función mejorada para actualizar una rutina
export const updateRutina = async (documentId: string, data: any): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que la rutina pertenece al usuario
    const rutina = await getRutina(documentId)
    if (rutina?.data?.user !== user.id) {
      throw new Error("No tienes permiso para actualizar esta rutina")
    }

    // Preparar los datos para actualizar
    const updateData = {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      diasSemana: data.diasSemana || null,
    }

    const response = await fetchAPI(`/api/rutinas/${documentId}`, {
      method: "PUT",
      body: JSON.stringify({ data: updateData }),
    })

    // Verificar que la actualización fue exitosa
    if (!response || !response.data) {
      throw new Error("No se pudo actualizar la rutina")
    }

    // Obtener la rutina actualizada con todos sus datos
    return getRutina(documentId)
  } catch (error) {
    console.error("Error al actualizar rutina:", error)
    throw error
  }
}

// Función mejorada para eliminar una rutina
export const deleteRutina = async (documentId: number): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que la rutina pertenece al usuario
    const rutina = await getRutina(documentId)
    if (!rutina.data || rutina.data.user !== user.id) {
      throw new Error("No tienes permiso para eliminar esta rutina")
    }

    await fetchAPI(`/api/rutinas/${documentId}`, {
      method: "DELETE",
    })

    return {
      success: true,
      documentId,
    }
  } catch (error) {
    console.error("Error al eliminar rutina:", error)
    throw error
  }
}

// Función mejorada para añadir un ejercicio a una rutina
export const addEjercicioToRutina = async (
  rutinaId: number,
  ejercicioId: number,
  series: number,
  repeticiones: number,
  peso: number,
  descanso: number,
): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que la rutina existe y pertenece al usuario
    const rutinaResponse = await getRutina(rutinaId)
    if (!rutinaResponse.data) {
      throw new Error("La rutina no existe o no tienes permiso para modificarla")
    }

    // Verificar que el ejercicio existe
    const ejercicioResponse = await getEjercicio(ejercicioId)
    if (!ejercicioResponse.data) {
      throw new Error("El ejercicio no existe")
    }

    // En Strapi v4, para añadir una relación, usamos el endpoint específico para relaciones
    // La URL correcta es /api/rutinas/{id}/relationships/ejercicios
    const response = await fetchAPI(`/api/rutinas/${rutinaId}/ejercicios`, {
      method: "POST",
      body: JSON.stringify({
        data: [ejercicioId],
      }),
    })

    console.log("Respuesta de añadir ejercicio:", response)

    // Después de añadir la relación, obtenemos la rutina actualizada
    return getRutina(rutinaId.toString())
  } catch (error) {
    console.error("Error al añadir ejercicio a la rutina:", error)
    throw error
  }
}

// Función mejorada para eliminar un ejercicio de una rutina
export const removeEjercicioFromRutina = async (rutinaId: number, ejercicioIndex: number): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que la rutina pertenece al usuario
    const rutina = await getRutina(rutinaId)
    if (!rutina || !rutina.data || rutina.data.users_permissions_user !== user.id) {
      throw new Error("No tienes permiso para modificar esta rutina")
    }

    // Verificar que el ejercicio existe en la rutina
    if (!rutina.data.ejercicios?.[ejercicioIndex]) {
      throw new Error("El ejercicio no existe en la rutina")
    }

    const ejercicioId = rutina.data.ejercicios[ejercicioIndex].id

    // En Strapi v4, para eliminar una relación, usamos el endpoint de relaciones
    await fetchAPI(`/api/rutinas/${rutinaId}/ejercicios/${ejercicioId}`, {
      method: "DELETE",
    })

    // Después de eliminar la relación, obtenemos la rutina actualizada
    return getRutina(rutinaId)
  } catch (error) {
    console.error("Error al eliminar ejercicio de la rutina:", error)
    throw error
  }
}

export const upgradeUserToPremium = async (): Promise<any> => {
  try {
    // Verificar que el usuario esté autenticado
    const token = getAuthToken();
    if (!token) {
      throw new Error("Usuario no autenticado");
    }
    
    // Esta es la ruta que debería coincidir con tu backend
    const url = `${API_URL}/api/premium`;
    console.log("Intentando conectar a:", url);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Respuesta de error del servidor:", response.status, errorData);
      throw new Error(`Error del servidor: ${response.status} ${errorData}`);
    }
    
    const responseData = await response.json();
    console.log("Respuesta exitosa:", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Error detallado al actualizar a premium:", error);
    throw new Error("No se pudo actualizar el rol: " + (error.message || "Error desconocido"));
  }
}