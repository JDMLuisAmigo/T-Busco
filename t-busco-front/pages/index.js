import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Laptop, Pencil, Megaphone, HeartPulse, GraduationCap, Factory, HardHat, MoreHorizontal, ArrowRight,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import JobCard from '../components/JobCard'
import { categorias, normalizarVacante } from '../data/jobs'
import { listarVacantesPublicas } from '../lib/api'

// Traduce el texto "icono" de los datos a un componente de icono
const iconos = {
  laptop: Laptop,
  pencil: Pencil,
  megaphone: Megaphone,
  salud: HeartPulse,
  educacion: GraduationCap,
  fabrica: Factory,
  casco: HardHat,
  mas: MoreHorizontal,
}

export default function Home() {
  const router = useRouter()

  const [destacadas, setDestacadas] = useState([])
  const [cargando, setCargando] = useState(true)

  // Las 4 vacantes activas más recientes (el backend ya las entrega
  // ordenadas de más nueva a más vieja).
  useEffect(() => {
    let cancelado = false
    listarVacantesPublicas()
      .then((lista) => { if (!cancelado) setDestacadas(lista.slice(0, 4).map(normalizarVacante)) })
      .catch(() => { /* si falla, simplemente no se muestran destacadas */ })
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [])

  // Al buscar, mandamos al usuario a /empleos con los filtros en la URL
  const buscar = ({ q, ciudad, modalidad }) => {
    const query = {}
    if (q) query.q = q
    if (ciudad) query.ciudad = ciudad
    if (modalidad) query.modalidad = modalidad
    router.push({ pathname: '/empleos', query })
  }

  return (
    <>
      <section className="hero">
        <div className="contenedor hero-interior">
          <h1>
            Tu próximo <span>trabajo</span> te espera
          </h1>
          <p>Conecta con las mejores oportunidades laborales en un solo lugar.</p>
          <SearchBar onBuscar={buscar} />
          <p className="hero-script" aria-hidden="true">Grandes oportunidades comienzan aquí</p>
        </div>
      </section>

      <section className="categorias contenedor" aria-label="Categorías">
        {categorias.map((c) => {
          const Icono = iconos[c.icono]
          return (
            <Link key={c.id} href={`/empleos?categoria=${c.id}`} className="categoria">
              <span className="categoria-icono"><Icono size={22} /></span>
              <span>{c.nombre}</span>
            </Link>
          )
        })}
      </section>

      <section className="contenedor seccion">
        <div className="seccion-cabecera">
          <h2>Vacantes destacadas</h2>
          <Link href="/empleos" className="enlace-flecha">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        {cargando ? (
          <p className="vacio">Cargando vacantes…</p>
        ) : destacadas.length === 0 ? (
          <p className="vacio">Todavía no hay vacantes publicadas. ¡Vuelve pronto!</p>
        ) : (
          <div className="rejilla-destacadas">
            {destacadas.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>
    </>
  )
}
