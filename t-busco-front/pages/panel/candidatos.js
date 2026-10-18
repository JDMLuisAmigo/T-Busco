import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Search, Send, Check, MapPin, Briefcase } from 'lucide-react'
import { useRequireRol } from '../../lib/useRequireRol'
import { buscarCandidatos, misVacantes, misInvitacionesReclutador, invitarCandidato } from '../../lib/api'

function FilaCandidato({ candidato, vacanteSeleccionada, yaInvitado, onInvitar }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const invitar = async () => {
    setEnviando(true)
    setError('')
    try {
      await onInvitar(candidato.aspiranteId)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <li className="fila-panel">
      <div>
        <div className="fila-panel-titulo">
          <strong>{candidato.nombre}</strong>
        </div>
        {candidato.cargo && <p className="dato"><Briefcase size={14} aria-hidden="true" /> {candidato.cargo}</p>}
        {candidato.ciudad && <p className="dato"><MapPin size={14} aria-hidden="true" /> {candidato.ciudad}</p>}
        {candidato.habilidades.length > 0 && (
          <div className="etiquetas">
            {candidato.habilidades.slice(0, 6).map((h) => <span key={h} className="etiqueta etiqueta-azul">{h}</span>)}
          </div>
        )}
        {candidato.experiencia.length > 0 && (
          <p className="dato">
            {candidato.experiencia.map((e, i) => (
              <span key={i}>{e.cargo}{e.empresa ? ` en ${e.empresa}` : ''}{i < candidato.experiencia.length - 1 ? ' · ' : ''}</span>
            ))}
          </p>
        )}
        {error && <p className="aviso aviso-error">{error}</p>}
      </div>
      <div className="fila-panel-acciones">
        <button
          type="button"
          className="boton boton-primario boton-pequeno"
          onClick={invitar}
          disabled={!vacanteSeleccionada || enviando || yaInvitado}
        >
          {yaInvitado
            ? <><Check size={14} aria-hidden="true" /> Ya invitado</>
            : <><Send size={14} aria-hidden="true" /> {enviando ? 'Enviando…' : 'Invitar a postularse'}</>}
        </button>
      </div>
    </li>
  )
}

export default function BuscarCandidatos() {
  const { usuario, cargando } = useRequireRol('reclutador')

  const [vacantes, setVacantes] = useState([])
  const [vacanteId, setVacanteId] = useState('')
  const [invitaciones, setInvitaciones] = useState([])
  const [q, setQ] = useState('')
  const [candidatos, setCandidatos] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState('')

  // Vacantes propias (para elegir a cuál invitar) + invitaciones ya enviadas
  useEffect(() => {
    if (!usuario) return
    Promise.all([misVacantes(), misInvitacionesReclutador()])
      .then(([vs, invs]) => {
        setVacantes(vs)
        setInvitaciones(invs)
        const primeraActiva = vs.find((v) => v.estado === 'activa')
        if (primeraActiva) setVacanteId(primeraActiva.id)
      })
      .catch((e) => setError(e.message))
  }, [usuario])

  // Búsqueda: se repite cada vez que cambia el texto (sin filtro = todos los candidatos)
  useEffect(() => {
    if (!usuario) return
    setCargandoLista(true)
    const temporizador = setTimeout(() => {
      buscarCandidatos(q)
        .then(setCandidatos)
        .catch((e) => setError(e.message))
        .finally(() => setCargandoLista(false))
    }, 300) // pequeña espera para no buscar en cada tecla
    return () => clearTimeout(temporizador)
  }, [usuario, q])

  const invitadosAEstaVacante = new Set(
    invitaciones.filter((i) => i.vacanteId === vacanteId).map((i) => i.aspiranteId)
  )

  const onInvitar = async (aspiranteId) => {
    const nueva = await invitarCandidato(vacanteId, aspiranteId)
    setInvitaciones((inv) => [...inv, nueva])
  }

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Buscar candidatos | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1>Buscar candidatos</h1>
            <p>Encuentra aspirantes con hoja de vida guardada e invítalos a postularse.</p>
          </div>
        </div>

        {error && <p className="aviso aviso-error" role="alert">{error}</p>}

        {vacantes.length === 0 ? (
          <p className="vacio">Primero publica una vacante para poder invitar candidatos.</p>
        ) : (
          <>
            <div className="busqueda-candidatos-controles">
              <label className="campo">
                <span className="campo-etiqueta">Invitar a la vacante</span>
                <select value={vacanteId} onChange={(e) => setVacanteId(e.target.value)}>
                  {vacantes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} {v.estado === 'cerrada' ? '(cerrada)' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="campo campo-busqueda">
                <span className="campo-etiqueta">Buscar por nombre, cargo, ciudad o habilidad</span>
                <div className="buscador-candidatos-input">
                  <Search size={16} aria-hidden="true" />
                  <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: diseñador, Figma, Medellín…" />
                </div>
              </label>
            </div>

            {cargandoLista ? (
              <p className="aviso">Buscando…</p>
            ) : candidatos.length === 0 ? (
              <p className="vacio">No hay candidatos que coincidan con esa búsqueda.</p>
            ) : (
              <ul className="lista-panel">
                {candidatos.map((c) => (
                  <FilaCandidato
                    key={c.aspiranteId}
                    candidato={c}
                    vacanteSeleccionada={vacanteId}
                    yaInvitado={invitadosAEstaVacante.has(c.aspiranteId)}
                    onInvitar={onInvitar}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  )
}
