import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Briefcase, MapPin } from 'lucide-react'
import { useRequireRol } from '../lib/useRequireRol'
import { misPostulaciones } from '../lib/api'

const ESTADOS = {
  enviada: { etiqueta: 'Enviada', clase: 'etiqueta-azul' },
  entrevista: { etiqueta: 'Entrevista', clase: 'etiqueta-morado' },
  aceptada: { etiqueta: 'Aceptada', clase: 'etiqueta-verde' },
  rechazada: { etiqueta: 'Rechazada', clase: 'etiqueta-roja' },
}

export default function Postulaciones() {
  const { usuario, cargando } = useRequireRol('aspirante')
  const [postulaciones, setPostulaciones] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return
    misPostulaciones()
      .then(setPostulaciones)
      .catch((e) => setError(e.message))
      .finally(() => setCargandoLista(false))
  }, [usuario])

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Mis postulaciones | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1>Mis postulaciones</h1>
            <p>El estado de las vacantes a las que te has postulado.</p>
          </div>
          <Link href="/empleos" className="boton boton-contorno">
            <Briefcase size={16} aria-hidden="true" /> Buscar más empleos
          </Link>
        </div>

        {error && <p className="aviso aviso-error" role="alert">{error}</p>}

        {cargandoLista ? (
          <p className="aviso">Cargando tus postulaciones…</p>
        ) : postulaciones.length === 0 ? (
          <p className="vacio">
            Todavía no te has postulado a ninguna vacante. <Link href="/empleos">Explora las ofertas disponibles</Link>.
          </p>
        ) : (
          <ul className="lista-panel">
            {postulaciones.map((p) => {
              const estado = ESTADOS[p.estado] || ESTADOS.enviada
              return (
                <li key={p.id} className="fila-panel">
                  <div>
                    <div className="fila-panel-titulo">
                      <strong>{p.vacanteTitulo}</strong>
                      <span className={`etiqueta ${estado.clase}`}>{estado.etiqueta}</span>
                    </div>
                    <p className="dato"><MapPin size={14} aria-hidden="true" /> {p.vacanteEmpresa}</p>
                    {/* El comentario del reclutador es privado (ver candidatos.js): no se muestra aquí a propósito */}
                  </div>
                  <div className="fila-panel-acciones">
                    <Link href={`/empleos/${p.vacanteId}`} className="boton boton-contorno boton-pequeno">
                      Ver vacante
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
