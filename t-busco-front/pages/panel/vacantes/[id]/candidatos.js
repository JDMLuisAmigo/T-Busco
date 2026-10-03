import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react'
import { useRequireRol } from '../../../../lib/useRequireRol'
import { postulacionesDeVacante, actualizarPostulacion } from '../../../../lib/api'
import CvPreview from '../../../../components/cv/CvPreview'
import { cvVacio } from '../../../../data/cvModelo'

const ESTADOS = [
  { valor: 'enviada', etiqueta: 'Enviada' },
  { valor: 'entrevista', etiqueta: 'Entrevista' },
  { valor: 'aceptada', etiqueta: 'Aceptada' },
  { valor: 'rechazada', etiqueta: 'Rechazada' },
]
const clasePorEstado = {
  enviada: 'etiqueta-azul', entrevista: 'etiqueta-morado', aceptada: 'etiqueta-verde', rechazada: 'etiqueta-roja',
}

// Una postulación: el resumen (nombre, correo, estado) y, al expandir,
// la hoja de vida completa (reutiliza CvPreview tal cual, sin cambios)
// más los controles de evaluación (estado, puntaje, comentario).
function FilaCandidato({ postulacion, alGuardar }) {
  const [abierta, setAbierta] = useState(false)
  const [estado, setEstado] = useState(postulacion.estado)
  const [puntaje, setPuntaje] = useState(postulacion.puntaje ?? '')
  const [comentario, setComentario] = useState(postulacion.comentario ?? '')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cv = { ...cvVacio(), ...postulacion.cvSnapshot }

  const guardar = async () => {
    setGuardando(true)
    setMensaje('')
    try {
      await alGuardar(postulacion.id, {
        estado,
        puntaje: puntaje === '' ? null : Number(puntaje),
        comentario: comentario.trim() || null,
      })
      setMensaje('Guardado.')
    } catch (e) {
      setMensaje(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <li className="fila-panel fila-candidato">
      <div className="candidato-resumen">
        <div>
          <div className="fila-panel-titulo">
            <strong>{cv.nombre || 'Sin nombre'}</strong>
            <span className={`etiqueta ${clasePorEstado[postulacion.estado] || 'etiqueta-azul'}`}>
              {ESTADOS.find((e) => e.valor === postulacion.estado)?.etiqueta || postulacion.estado}
            </span>
          </div>
          <p className="dato">{cv.correo}</p>
          {cv.cargo && <p className="dato">{cv.cargo}</p>}
        </div>
        <button type="button" className="boton boton-contorno boton-pequeno" onClick={() => setAbierta(!abierta)}>
          {abierta ? <><EyeOff size={14} aria-hidden="true" /> Ocultar hoja de vida</> : <><Eye size={14} aria-hidden="true" /> Ver hoja de vida</>}
        </button>
      </div>

      {abierta && (
        <div className="candidato-detalle">
          <div className="candidato-cv">
            <CvPreview cv={cv} />
          </div>

          <div className="candidato-evaluacion">
            <label className="campo">
              <span className="campo-etiqueta">Estado</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.etiqueta}</option>)}
              </select>
            </label>
            <label className="campo">
              <span className="campo-etiqueta">Puntaje (0-100)</span>
              <input type="number" min="0" max="100" value={puntaje} onChange={(e) => setPuntaje(e.target.value)} />
            </label>
            <label className="campo campo-completo">
              <span className="campo-etiqueta">Comentario (privado, solo lo ves tú)</span>
              <textarea rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </label>
            <button type="button" className="boton boton-primario boton-pequeno" onClick={guardar} disabled={guardando}>
              <Save size={14} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar evaluación'}
            </button>
            {mensaje && <span className="candidato-mensaje">{mensaje}</span>}
          </div>
        </div>
      )}
    </li>
  )
}

export default function Candidatos() {
  const router = useRouter()
  const { id } = router.query
  const { usuario, cargando } = useRequireRol('reclutador')

  const [postulaciones, setPostulaciones] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario || !id) return
    postulacionesDeVacante(id)
      .then(setPostulaciones)
      .catch((e) => setError(e.message))
      .finally(() => setCargandoLista(false))
  }, [usuario, id])

  const alGuardarEvaluacion = async (postulacionId, datos) => {
    const actualizada = await actualizarPostulacion(postulacionId, datos)
    setPostulaciones((ps) => ps.map((p) => (p.id === postulacionId ? actualizada : p)))
  }

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Candidatos | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <nav className="migas" aria-label="Ubicación">
          <button type="button" onClick={() => router.push('/panel/vacantes')} className="enlace-boton-flecha">
            <ArrowLeft size={16} /> Volver a mis vacantes
          </button>
        </nav>

        <div className="panel-cabecera">
          <div>
            <h1>Candidatos</h1>
            <p>
              {postulaciones[0]?.vacanteTitulo
                ? `Personas que se postularon a "${postulaciones[0].vacanteTitulo}"`
                : 'Personas que se postularon a esta vacante'}
            </p>
          </div>
        </div>

        {error && <p className="aviso aviso-error" role="alert">{error}</p>}

        {cargandoLista ? (
          <p className="aviso">Cargando candidatos…</p>
        ) : postulaciones.length === 0 ? (
          <p className="vacio">Todavía nadie se ha postulado a esta vacante.</p>
        ) : (
          <ul className="lista-panel">
            {postulaciones.map((p) => (
              <FilaCandidato key={p.id} postulacion={p} alGuardar={alGuardarEvaluacion} />
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
