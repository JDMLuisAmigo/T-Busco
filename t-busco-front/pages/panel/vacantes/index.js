import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Plus, Pencil, Trash2, EyeOff, Eye, MapPin, DollarSign, Users } from 'lucide-react'
import { useRequireRol } from '../../../lib/useRequireRol'
import { misVacantes, alternarEstadoVacante, eliminarVacante } from '../../../lib/api'
import { pesos } from '../../../data/jobs'

export default function MisVacantes() {
  const { usuario, cargando } = useRequireRol('reclutador')
  const [vacantes, setVacantes] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    if (!usuario) return
    misVacantes()
      .then(setVacantes)
      .catch((e) => setMensaje({ tipo: 'error', texto: e.message }))
      .finally(() => setCargandoLista(false))
  }, [usuario])

  const alAlternar = async (id) => {
    try {
      const actualizada = await alternarEstadoVacante(id)
      setVacantes((vs) => vs.map((v) => (v.id === id ? actualizada : v)))
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  const alEliminar = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar la vacante "${titulo}"? Esto no se puede deshacer.`)) return
    try {
      await eliminarVacante(id)
      setVacantes((vs) => vs.filter((v) => v.id !== id))
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Mis vacantes | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1>Mis vacantes</h1>
            <p>Crea, edita y gestiona las vacantes que publicaste.</p>
          </div>
          <Link href="/panel/vacantes/nueva" className="boton boton-primario">
            <Plus size={16} aria-hidden="true" /> Publicar vacante
          </Link>
        </div>

        {mensaje && <p className={`aviso aviso-${mensaje.tipo}`} role="alert">{mensaje.texto}</p>}

        {cargandoLista ? (
          <p className="aviso">Cargando tus vacantes…</p>
        ) : vacantes.length === 0 ? (
          <p className="vacio">Todavía no has publicado ninguna vacante.</p>
        ) : (
          <ul className="lista-panel">
            {vacantes.map((v) => (
              <li key={v.id} className="fila-panel">
                <div>
                  <div className="fila-panel-titulo">
                    <strong>{v.titulo}</strong>
                    <span className={`etiqueta ${v.estado === 'activa' ? 'etiqueta-verde' : 'etiqueta-azul'}`}>
                      {v.estado === 'activa' ? 'Activa' : 'Cerrada'}
                    </span>
                  </div>
                  <p className="dato"><MapPin size={14} aria-hidden="true" /> {v.ciudad} · {v.lugar}</p>
                  <p className="dato"><DollarSign size={14} aria-hidden="true" /> {pesos(v.salarioMin)} - {pesos(v.salarioMax)}</p>
                </div>
                <div className="fila-panel-acciones">
                  <Link href={`/panel/vacantes/${v.id}/candidatos`} className="boton boton-contorno boton-pequeno">
                    <Users size={14} aria-hidden="true" /> Ver candidatos
                  </Link>
                  <Link href={`/panel/vacantes/${v.id}/editar`} className="boton boton-contorno boton-pequeno">
                    <Pencil size={14} aria-hidden="true" /> Editar
                  </Link>
                  <button type="button" className="boton boton-contorno boton-pequeno" onClick={() => alAlternar(v.id)}>
                    {v.estado === 'activa'
                      ? <><EyeOff size={14} aria-hidden="true" /> Cerrar</>
                      : <><Eye size={14} aria-hidden="true" /> Reactivar</>}
                  </button>
                  <button type="button" className="boton-peligro" onClick={() => alEliminar(v.id, v.titulo)}>
                    <Trash2 size={14} aria-hidden="true" /> Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
