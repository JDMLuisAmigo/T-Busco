import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import Campo from '../components/cv/Campo'
import { useAuth } from '../lib/AuthContext'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Registro() {
  const router = useRouter()
  const { registrarse } = useAuth()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [rol, setRol] = useState('aspirante')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Las mismas reglas que ya valida el backend (RegistroDto), repetidas aquí
  // para avisar al instante, sin esperar la respuesta del servidor.
  const errorCorreo = correo && !REGEX_CORREO.test(correo) ? 'Escribe un correo válido.' : ''
  const errorContrasena = contrasena && contrasena.length < 8 ? 'Debe tener al menos 8 caracteres.' : ''
  const errorConfirmar = confirmar && confirmar !== contrasena ? 'Las contraseñas no coinciden.' : ''

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    if (errorCorreo || errorContrasena || errorConfirmar) return
    setEnviando(true)
    try {
      await registrarse({ nombre: nombre.trim(), correo: correo.trim(), contrasena, rol })
      router.push(rol === 'reclutador' ? '/panel/vacantes' : '/hoja-de-vida')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Head><title>Crear cuenta | t-Busco</title></Head>
      <div className="pagina-auth">
        <form className="tarjeta-auth" onSubmit={enviar}>
          <h1>Crea tu cuenta</h1>
          <p className="nota">Te toma menos de un minuto.</p>

          <Campo etiqueta="Nombre completo" ancho="completo">
            <input
              type="text" required maxLength={80} autoComplete="name"
              value={nombre} onChange={(e) => setNombre(e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Correo electrónico" error={errorCorreo} ancho="completo">
            <input
              type="email" required autoComplete="email"
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Contraseña" error={errorContrasena} ayuda="Al menos 8 caracteres." ancho="completo">
            <input
              type="password" required autoComplete="new-password"
              value={contrasena} onChange={(e) => setContrasena(e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Confirmar contraseña" error={errorConfirmar} ancho="completo">
            <input
              type="password" required autoComplete="new-password"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
            />
          </Campo>

          <fieldset className="campo campo-completo">
            <legend className="campo-etiqueta">Quiero registrarme como</legend>
            <label className="check"><input type="radio" name="rol" checked={rol === 'aspirante'} onChange={() => setRol('aspirante')} /> Aspirante (busco empleo)</label>
            <label className="check"><input type="radio" name="rol" checked={rol === 'reclutador'} onChange={() => setRol('reclutador')} /> Reclutador (busco candidatos)</label>
          </fieldset>

          {error && <p className="aviso aviso-error" role="alert">{error}</p>}

          <button type="submit" className="boton boton-primario boton-ancho" disabled={enviando}>
            <UserPlus size={16} aria-hidden="true" /> {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="auth-enlace">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
        </form>
      </div>
    </>
  )
}
