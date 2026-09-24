import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const { pathname } = useRouter()

  // Marca en azul el enlace de la sección donde estás (ej: /empleos/[id] también cuenta como Empleos)
  const activo = (ruta) => (pathname.startsWith(ruta) ? 'active' : '')

  return (
    <header className="navbar">
      <div className="contenedor navbar-interior">
        <Logo />

        <nav className="navbar-links" aria-label="Principal">
          <Link href="/empleos" className={activo('/empleos')}>Empleos</Link>
          <Link href="/hoja-de-vida" className={activo('/hoja-de-vida')}>Hoja de vida</Link>
          <a href="#empresas">Empresas</a>
          <a href="#recursos">Recursos</a>
        </nav>

        <div className="navbar-acciones">
          <Link href="/empleos" className="icono-boton" aria-label="Buscar empleos">
            <Search size={18} />
          </Link>
          <a href="#login" className="enlace-suave">Iniciar sesión</a>
          <a href="#registro" className="boton boton-primario">Regístrate</a>
        </div>
      </div>
    </header>
  )
}
