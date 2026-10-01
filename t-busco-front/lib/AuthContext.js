import { createContext, useContext, useEffect, useState } from 'react'
import { registrarse as registrarseApi, iniciarSesion as iniciarSesionApi } from './api'

const CLAVE_TOKEN = 'tbusco-token'
const CLAVE_USUARIO = 'tbusco-usuario'

// Guarda "quién soy" en un solo lugar (React Context) para que cualquier
// página o componente pueda preguntar "¿hay alguien conectado?" con useAuth().
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true) // true mientras se revisa localStorage la primera vez

  // Al abrir cualquier página, recupera la sesión guardada (si la hay)
  useEffect(() => {
    try {
      const tokenGuardado = localStorage.getItem(CLAVE_TOKEN)
      const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO)
      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado)
        setUsuario(JSON.parse(usuarioGuardado))
      }
    } catch {
      /* si algo está corrupto, se sigue como si no hubiera sesión */
    } finally {
      setCargando(false)
    }
  }, [])

  const guardarSesion = ({ usuario, token }) => {
    setUsuario(usuario)
    setToken(token)
    try {
      localStorage.setItem(CLAVE_TOKEN, token)
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
    } catch {
      /* si el navegador bloquea localStorage, la sesión igual funciona mientras no recargues */
    }
  }

  // Ambas devuelven el usuario (además de guardar la sesión), para que la
  // pantalla que llama pueda decidir a dónde navegar según el rol.
  const registrarse = async (datos) => {
    const resultado = await registrarseApi(datos)
    guardarSesion(resultado)
    return resultado.usuario
  }
  const iniciarSesion = async (datos) => {
    const resultado = await iniciarSesionApi(datos)
    guardarSesion(resultado)
    return resultado.usuario
  }

  const cerrarSesion = () => {
    setUsuario(null)
    setToken(null)
    try {
      localStorage.removeItem(CLAVE_TOKEN)
      localStorage.removeItem(CLAVE_USUARIO)
      // En un computador compartido, evita que la siguiente persona vea
      // el borrador local de la hoja de vida de quien acaba de salir.
      localStorage.removeItem('tbusco-cv-borrador')
    } catch { /* nada */ }
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, registrarse, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

// Cualquier componente hace: const { usuario, iniciarSesion } = useAuth()
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
