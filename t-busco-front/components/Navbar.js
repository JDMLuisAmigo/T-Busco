import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, LogOut, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Navbar() {
  const { pathname } = useRouter()
  const { usuario, cargando, cerrarSesion } = useAuth()
  const activo = (ruta) => (pathname.startsWith(ruta) ? 'active' : '')
  const salir = () => { cerrarSesion() }

  return (
    <header className="navbar">
      <div className="contenedor navbar-interior">
        <Link href="/" className="logo">t-<span className="logo-b">B</span>usco</Link>
        <nav className="navbar-links" aria-label="Principal">
          <Link href="/empleos" className={activo('/empleos')}>Empleos</Link>
          {(!usuario || usuario.rol === 'aspirante') && (
            <Link href="/hoja-de-vida" className={activo('/hoja-de-vida')}>Hoja de vida</Link>
          )}
          {usuario?.rol === 'aspirante' && (
            <Link href="/recomendaciones" className={activo('/recomendaciones')}>Recomendado para ti</Link>
          )}
          {usuario?.rol === 'aspirante' && (
            <Link href="/postulaciones" className={activo('/postulaciones')}>Mis postulaciones</Link>
          )}
          {usuario?.rol === 'reclutador' && (
            <Link href="/panel/vacantes" className={activo('/panel/vacantes')}>Mis vacantes</Link>
          )}
          {usuario?.rol === 'reclutador' && (
            <Link href="/panel/candidatos" className={activo('/panel/candidatos')}>Buscar candidatos</Link>
          )}
          {usuario?.rol === 'administrador' && (
            <Link href="/panel/admin" className={activo('/panel/admin')}>Administración</Link>
          )}
          {usuario?.rol === 'tecnico' && (
            <Link href="/panel/tecnico" className={activo('/panel/tecnico')}>Panel técnico</Link>
          )}
          <a href="#empresas">Empresas</a>
        </nav>
        <div className="navbar-acciones">
          <Link href="/empleos" className="icono-boton" aria-label="Buscar empleos"><Search size={18} /></Link>
          {!cargando && (
            usuario ? (
              <>
                <span className="navbar-usuario"><User size={16} aria-hidden="true" /> {usuario.nombre.split(' ')[0]}</span>
                <button type="button" className="enlace-suave" onClick={salir}><LogOut size={14} aria-hidden="true" /> Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="enlace-suave">Iniciar sesión</Link>
                <Link href="/registro" className="boton boton-primario">Regístrate</Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
