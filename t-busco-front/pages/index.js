import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Laptop, Pencil, Megaphone, HeartPulse, GraduationCap, Factory, HardHat, MoreHorizontal, ArrowRight,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import JobCard from '../components/JobCard'
import { categorias, jobs } from '../data/jobs'

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

  // Al buscar, mandamos al usuario a /empleos con los filtros en la URL
  const buscar = ({ q, ciudad, modalidad }) => {
    const query = {}
    if (q) query.q = q
    if (ciudad) query.ciudad = ciudad
    if (modalidad) query.modalidad = modalidad
    router.push({ pathname: '/empleos', query })
  }

  const destacadas = jobs.filter((j) => [6, 2, 7, 8].includes(j.id))

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
        <div className="rejilla-destacadas">
          {destacadas.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      </section>
    </>
  )
}
