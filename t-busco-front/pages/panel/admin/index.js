import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Users, Briefcase, FileCheck, ShieldOff, ShieldCheck, Trash2, EyeOff, Eye } from 'lucide-react'
import { useRequireRol } from '../../../lib/useRequireRol'
import {
  obtenerResumenAdmin, listarUsuariosAdmin, cambiarRolUsuario, alternarActivoUsuario,
  listarVacantesAdmin, alternarEstadoVacanteAdmin, eliminarVacanteAdmin,
} from '../../../lib/api'

const ROLES = ['aspirante', 'reclutador', 'administrador']

function TarjetaResumen({ Icono, numero, etiqueta }) {
  return (
    <div className="admin-tarjeta">
      <Icono size={20} aria-hidden="true" />
      <strong>{numero}</strong>
      <span>{etiqueta}</span>
    </div>
  )
}

function FilaUsuario({ u, esUnoMismo, onCambiarRol, onAlternarActivo }) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cambiarRol = async (nuevoRol) => {
    setGuardando(true); setError('')
    try { await onCambiarRol(u.id, nuevoRol) }
    catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }
  const alternar = async () => {
    setGuardando(true); setError('')
    try { await onAlternarActivo(u.id) }
    catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  return (
    <li className="fila-panel">
      <div>
        <div className="fila-panel-titulo">
          <strong>{u.nombre}</strong>
          <span className={`etiqueta ${u.activo ? 'etiqueta-verde' : 'etiqueta-roja'}`}>
            {u.activo ? 'Activo' : 'Desactivado'}
          </span>
        </div>
        <p className="dato">{u.correo}</p>
        {error && <p className="aviso aviso-error">{error}</p>}
      </div>
      <div className="fila-panel-acciones">
        <select value={u.rol} disabled={esUnoMismo || guardando} onChange={(e) => cambiarRol(e.target.value)} aria-label={`Rol de ${u.nombre}`}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          type="button"
          className="boton boton-contorno boton-pequeno"
          onClick={alternar}
          disabled={esUnoMismo || guardando}
          title={esUnoMismo ? 'No puedes modificar tu propia cuenta' : undefined}
        >
          {u.activo ? <><ShieldOff size={14} aria-hidden="true" /> Desactivar</> : <><ShieldCheck size={14} aria-hidden="true" /> Activar</>}
        </button>
      </div>
    </li>
  )
}

function FilaVacanteAdmin({ v, nombreReclutador, onAlternarEstado, onEliminar }) {
  const [guardando, setGuardando] = useState(false)

  const alternar = async () => { setGuardando(true); try { await onAlternarEstado(v.id) } finally { setGuardando(false) } }
  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar la vacante "${v.titulo}"? Esta acción no se puede deshacer.`)) return
    setGuardando(true)
    try { await onEliminar(v.id) } finally { setGuardando(false) }
  }

  return (
    <li className="fila-panel">
      <div>
        <div className="fila-panel-titulo">
          <strong>{v.titulo}</strong>
          <span className={`etiqueta ${v.estado === 'activa' ? 'etiqueta-verde' : 'etiqueta-roja'}`}>
            {v.estado === 'activa' ? 'Activa' : 'Cerrada'}
          </span>
        </div>
        <p className="dato">{v.empresa} · publicada por {nombreReclutador || 'alguien que ya no está'}</p>
      </div>
      <div className="fila-panel-acciones">
        <button type="button" className="boton boton-contorno boton-pequeno" onClick={alternar} disabled={guardando}>
          {v.estado === 'activa' ? <><EyeOff size={14} aria-hidden="true" /> Cerrar</> : <><Eye size={14} aria-hidden="true" /> Reactivar</>}
        </button>
        <button type="button" className="boton-peligro" onClick={eliminar} disabled={guardando}>
          <Trash2 size={14} aria-hidden="true" /> Eliminar
        </button>
      </div>
    </li>
  )
}

export default function PanelAdmin() {
  const { usuario, cargando } = useRequireRol('administrador')

  const [resumen, setResumen] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [vacantes, setVacantes] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return
    Promise.all([obtenerResumenAdmin(), listarUsuariosAdmin(), listarVacantesAdmin()])
      .then(([r, u, v]) => { setResumen(r); setUsuarios(u); setVacantes(v) })
      .catch((e) => setError(e.message))
      .finally(() => setCargandoDatos(false))
  }, [usuario])

  // Para mostrar "publicada por <nombre>" sin tener que pedírselo al
  // backend aparte: ya tenemos la lista completa de usuarios acá mismo.
  const nombrePorId = Object.fromEntries(usuarios.map((u) => [u.id, u.nombre]))

  const onCambiarRol = async (id, rol) => {
    const actualizado = await cambiarRolUsuario(id, rol)
    setUsuarios((us) => us.map((u) => (u.id === id ? actualizado : u)))
  }
  const onAlternarActivo = async (id) => {
    const actualizado = await alternarActivoUsuario(id)
    setUsuarios((us) => us.map((u) => (u.id === id ? actualizado : u)))
  }
  const onAlternarEstadoVacante = async (id) => {
    const actualizada = await alternarEstadoVacanteAdmin(id)
    setVacantes((vs) => vs.map((v) => (v.id === id ? actualizada : v)))
  }
  const onEliminarVacante = async (id) => {
    await eliminarVacanteAdmin(id)
    setVacantes((vs) => vs.filter((v) => v.id !== id))
  }

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Administración | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1>Administración</h1>
            <p>Usuarios y vacantes de toda la plataforma.</p>
          </div>
        </div>

        {error && <p className="aviso aviso-error" role="alert">{error}</p>}

        {resumen && (
          <div className="admin-resumen">
            <TarjetaResumen Icono={Users} numero={resumen.totalUsuarios} etiqueta="Usuarios" />
            <TarjetaResumen Icono={Users} numero={resumen.aspirantes} etiqueta="Aspirantes" />
            <TarjetaResumen Icono={Users} numero={resumen.reclutadores} etiqueta="Reclutadores" />
            <TarjetaResumen Icono={Briefcase} numero={resumen.vacantesActivas} etiqueta="Vacantes activas" />
            <TarjetaResumen Icono={Briefcase} numero={resumen.vacantesCerradas} etiqueta="Vacantes cerradas" />
            <TarjetaResumen Icono={FileCheck} numero={resumen.totalPostulaciones} etiqueta="Postulaciones" />
          </div>
        )}

        {cargandoDatos ? (
          <p className="aviso">Cargando…</p>
        ) : (
          <>
            <section className="admin-seccion">
              <h2>Usuarios</h2>
              {usuarios.length === 0 ? (
                <p className="vacio">No hay usuarios todavía.</p>
              ) : (
                <ul className="lista-panel">
                  {usuarios.map((u) => (
                    <FilaUsuario
                      key={u.id} u={u} esUnoMismo={u.id === usuario.id}
                      onCambiarRol={onCambiarRol} onAlternarActivo={onAlternarActivo}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-seccion">
              <h2>Vacantes</h2>
              {vacantes.length === 0 ? (
                <p className="vacio">No hay vacantes todavía.</p>
              ) : (
                <ul className="lista-panel">
                  {vacantes.map((v) => (
                    <FilaVacanteAdmin
                      key={v.id} v={v} nombreReclutador={nombrePorId[v.reclutadorId]}
                      onAlternarEstado={onAlternarEstadoVacante} onEliminar={onEliminarVacante}
                    />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}
