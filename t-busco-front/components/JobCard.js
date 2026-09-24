import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Briefcase, DollarSign, Clock, BadgeCheck } from 'lucide-react'
import { pesos } from '../data/jobs'

// Logo de empresa: cuadrado de color con la inicial (luego será la imagen real)
export function LogoEmpresa({ job, size = 48 }) {
  return (
    <span
      className="logo-empresa"
      style={{ background: job.color, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {job.inicial}
    </span>
  )
}

// Etiqueta de color según el texto (Remoto = verde, Híbrido = morado, etc.)
export function Etiqueta({ children }) {
  const clase =
    children === 'Remoto' ? 'etiqueta-verde'
    : children === 'Híbrido' ? 'etiqueta-morado'
    : 'etiqueta-azul'
  return <span className={`etiqueta ${clase}`}>{children}</span>
}

function Guardar() {
  const [guardada, setGuardada] = useState(false)
  return (
    <button
      type="button"
      className={`corazon ${guardada ? 'corazon-activo' : ''}`}
      onClick={() => setGuardada(!guardada)}
      aria-pressed={guardada}
      aria-label={guardada ? 'Quitar de guardadas' : 'Guardar vacante'}
    >
      <Heart size={18} fill={guardada ? 'currentColor' : 'none'} />
    </button>
  )
}

// variante="destacada": tarjeta vertical del inicio
// variante="lista": tarjeta horizontal de resultados
export default function JobCard({ job, variante = 'destacada' }) {
  if (variante === 'lista') {
    return (
      <article className="tarjeta tarjeta-lista">
        <div className="tarjeta-lista-logo">
          <LogoEmpresa job={job} size={60} />
          <span>{job.empresa}</span>
        </div>

        <div className="tarjeta-lista-info">
          <h3>{job.titulo}</h3>
          <p className="empresa-verificada">
            {job.empresa} <BadgeCheck size={15} aria-label="Empresa verificada" />
          </p>
          <p className="dato"><MapPin size={14} aria-hidden="true" /> {job.ciudad}</p>
          <p className="dato">
            <Clock size={14} aria-hidden="true" /> {job.jornada}
            <span className="separador" />
            <DollarSign size={14} aria-hidden="true" /> {pesos(job.salarioMin)} - {pesos(job.salarioMax)}
          </p>
          <div className="etiquetas">
            {job.tags.map((t) => <Etiqueta key={t}>{t}</Etiqueta>)}
          </div>
        </div>

        <div className="tarjeta-lista-acciones">
          <Guardar />
          <Link href={`/empleos/${job.id}`} className="boton boton-primario">Ver detalle</Link>
        </div>
      </article>
    )
  }

  return (
    <article className="tarjeta tarjeta-destacada">
      <div className="tarjeta-cabecera">
        <LogoEmpresa job={job} />
        <div>
          <strong>{job.empresa}</strong>
          <span>{job.sectorEmpresa}</span>
        </div>
        <Guardar />
      </div>

      <h3><Link href={`/empleos/${job.id}`}>{job.titulo}</Link></h3>
      <p className="dato"><MapPin size={14} aria-hidden="true" /> {job.ciudad}</p>
      <p className="dato"><Briefcase size={14} aria-hidden="true" /> {job.lugar}</p>
      <p className="dato">
        <DollarSign size={14} aria-hidden="true" /> {pesos(job.salarioMin)} – {pesos(job.salarioMax)}
      </p>
      <div className="etiquetas">
        <Etiqueta>{job.jornada}</Etiqueta>
      </div>
    </article>
  )
}
