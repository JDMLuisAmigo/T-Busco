import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import Campo from '../components/cv/Campo'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const router = useRouter()
  const { iniciarSesion } = useAuth()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const usuario = await iniciarSesion({ correo: correo.trim(), contrasena })
      if (usuario.rol === 'reclutador') router.push('/panel/vacantes')
      else if (usuario.rol === 'administrador') router.push('/panel/admin')
      else router.push('/hoja-de-vida')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Head><title>Iniciar sesión | t-Busco</title></Head>
      <div className="pagina-auth">
        <form className="tarjeta-auth" onSubmit={enviar}>
          <h1>Inicia sesión</h1>
          <p className="nota">Ingresa para ver y editar tu hoja de vida.</p>

          <Campo etiqueta="Correo electrónico" ancho="completo">
            <input type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </Campo>
          <Campo etiqueta="Contraseña" ancho="completo">
            <input type="password" required autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </Campo>

          {error && <p className="aviso aviso-error" role="alert">{error}</p>}

          <button type="submit" className="boton boton-primario boton-ancho" disabled={enviando}>
            <LogIn size={16} aria-hidden="true" /> {enviando ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="auth-enlace">¿No tienes cuenta? <Link href="/registro">Regístrate</Link></p>
        </form>
      </div>
    </>
  )
}
