// Importa la variable de entorno API_URL desde el archivo .env
import { API_URL } from "@/lib/api"


// Función para registrar un usuario
export const register = async (
  username: string,
  email: string,
  password: string,
  role: "public" | "premium" = "public",
): Promise<any> => {
  try {
    // Modificamos la solicitud para no enviar el role directamente
    const response = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        username,
        email,
        password,
        role: role == "public" ? 2 : 1, // Enviamos el rol como public inicialmente
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw data
    }

    // Si el registro es exitoso, guardar el token en localStorage
    if (data.jwt) {
      localStorage.setItem("token", data.jwt)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Si se especificó un rol diferente al predeterminado, actualizamos el rol del usuario
      // en una solicitud separada después del registro exitoso
      if (role !== "public" && data.user && data.user.id) {
        try {
          // Realizar una solicitud para actualizar el rol del usuario
          const updateResponse = await fetch(`${API_URL}/api/users/${data.user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.jwt}`,
            },
            body: JSON.stringify({
              role: role,
            }),
          })

          if (!updateResponse.ok) {
            console.warn("No se pudo actualizar el rol del usuario, pero el registro fue exitoso")
          }
        } catch (roleError) {
          console.error("Error al actualizar el rol:", roleError)
          // No fallamos el registro si no se puede actualizar el rol
        }
      }
    }

    return data
  } catch (error) {
    console.error("Error de registro:", error)
    throw error
  }
}