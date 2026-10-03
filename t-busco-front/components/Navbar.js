import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, LogOut, User } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../lib/AuthContext'
import NotificacionesBell from './NotificacionesBell'

export default function Navbar() {
  const router = useRouter()
  const { usuario, cargando, cerrarSesion } = useAuth()

  const activo = (ruta) => (router.pathname.startsWith(ruta) ? 'active' : '')

  // Ojo: aquí NO se navega a "/" después de cerrar sesión.
  // Si la persona está en una página protegida (como /hoja-de-vida), esa
  // página ya tiene su propia redirección a /login cuando detecta que no
  // hay usuario. Si además este botón también navegara, competirían dos
  // redirecciones a la vez y el resultado sería impredecible. En una
  // página pública, simplemente no hace falta navegar a ningún lado:
  // solo cambia lo que muestra el navbar.
  const salir = () => {
    cerrarSesion()
  }

  return (
    <header className="navbar">
      <div className="contenedor navbar-interior">
        <Logo />

        <nav className="navbar-links" aria-label="Principal">
          <Link href="/empleos" className={activo('/empleos')}>Empleos</Link>
          {/* Un reclutador no necesita hoja de vida; a un aspirante o a quien
              todavía no inició sesión sí se le sigue mostrando el enlace. */}
          {usuario?.rol !== 'reclutador' && (
            <Link href="/hoja-de-vida" className={activo('/hoja-de-vida')}>Hoja de vida</Link>
          )}
          {usuario?.rol === 'aspirante' && (
            <Link href="/postulaciones" className={activo('/postulaciones')}>Mis postulaciones</Link>
          )}
          {usuario?.rol === 'reclutador' && (
            <Link href="/panel/vacantes" className={activo('/panel/vacantes')}>Mis vacantes</Link>
          )}
          <a href="#empresas">Empresas</a>
          <a href="#recursos">Recursos</a>
        </nav>

        <div className="navbar-acciones">
          <Link href="/empleos" className="icono-boton" aria-label="Buscar empleos">
            <Search size={18} />
          </Link>
          <NotificacionesBell />

          {/* Mientras se confirma si hay sesión, no se muestra nada para
              evitar el parpadeo "Inicia sesión" -> "Hola, Ana" */}
          {!cargando && (
            usuario ? (
              <>
                <span className="navbar-usuario"><User size={16} aria-hidden="true" /> {usuario.nombre.split(' ')[0]}</span>
                <button type="button" className="enlace-suave" onClick={salir}>
                  <LogOut size={14} aria-hidden="true" /> Cerrar sesión
                </button>
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
