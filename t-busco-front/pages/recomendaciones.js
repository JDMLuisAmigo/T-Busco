import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Sparkles, MapPin, Briefcase, DollarSign } from 'lucide-react'
import { useRequireRol } from '../lib/useRequireRol'
import { obtenerVacantesRecomendadas } from '../lib/api'

const pesos = (n) => (typeof n === 'number' ? `$ ${n.toLocaleString('es-CO')}` : '')

export default function Recomendaciones() {
  const { usuario, cargando } = useRequireRol('aspirante')

  const [vacantes, setVacantes] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return
    obtenerVacantesRecomendadas()
      .then(setVacantes)
      .catch((e) => setError(e.message))
      .finally(() => setCargandoLista(false))
  }, [usuario])

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Recomendado para ti | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1><Sparkles size={22} aria-hidden="true" /> Recomendado para ti</h1>
            <p>Vacantes elegidas por IA según tu hoja de vida guardada.</p>
          </div>
          <Link href="/empleos" className="boton boton-contorno">Ver todas las vacantes</Link>
        </div>

        {cargandoLista ? (
          <p className="aviso">Buscando las mejores vacantes para ti…</p>
        ) : error ? (
          <p className="aviso aviso-error" role="alert">
            {error.includes('hoja de vida')
              ? <>Primero completa y guarda tu <Link href="/hoja-de-vida">hoja de vida</Link> para recibir recomendaciones.</>
              : error}
          </p>
        ) : vacantes.length === 0 ? (
          <p className="vacio">No encontramos vacantes que encajen con tu perfil en este momento. Vuelve a intentarlo más tarde o completa más detalles en tu hoja de vida.</p>
        ) : (
          <ul className="lista-panel">
            {vacantes.map((v) => (
              <li key={v.id} className="fila-panel">
                <div>
                  <div className="fila-panel-titulo">
                    <strong><Link href={`/empleos/${v.id}`}>{v.titulo}</Link></strong>
                  </div>
                  <p className="dato"><Briefcase size={14} aria-hidden="true" /> {v.empresa}</p>
                  <p className="dato"><MapPin size={14} aria-hidden="true" /> {v.ciudad} · {v.lugar}</p>
                  {typeof v.salarioMin === 'number' && (
                    <p className="dato"><DollarSign size={14} aria-hidden="true" /> {pesos(v.salarioMin)} – {pesos(v.salarioMax)}</p>
                  )}
                  <p className="ia-razon"><Sparkles size={14} aria-hidden="true" /> {v.razon}</p>
                </div>
                <div className="fila-panel-acciones">
                  <Link href={`/empleos/${v.id}`} className="boton boton-primario boton-pequeno">Ver vacante</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
