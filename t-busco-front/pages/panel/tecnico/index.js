import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Users, Briefcase, FileCheck, Eye } from 'lucide-react'
import { useRequireRol } from '../../../lib/useRequireRol'
import {
  obtenerResumenAdmin, listarUsuariosAdmin, listarVacantesAdmin, listarPostulacionesAdmin,
} from '../../../lib/api'

// Panel técnico: MISMOS datos que ve un administrador, pero sin ningún
// control que cambie o borre algo. Es deliberado: un técnico verifica
// que las cosas funcionan, no administra la plataforma en producción.

function TarjetaResumen({ Icono, numero, etiqueta }) {
  return (
    <div className="admin-tarjeta">
      <Icono size={20} aria-hidden="true" />
      <strong>{numero}</strong>
      <span>{etiqueta}</span>
    </div>
  )
}

const ESTADOS_POSTULACION = {
  enviada: 'Enviada', entrevista: 'Entrevista', aceptada: 'Aceptada', rechazada: 'Rechazada',
}

export default function PanelTecnico() {
  const { usuario, cargando } = useRequireRol(['tecnico', 'administrador'])

  const [resumen, setResumen] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [vacantes, setVacantes] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return
    Promise.all([obtenerResumenAdmin(), listarUsuariosAdmin(), listarVacantesAdmin(), listarPostulacionesAdmin()])
      .then(([r, u, v, p]) => { setResumen(r); setUsuarios(u); setVacantes(v); setPostulaciones(p) })
      .catch((e) => setError(e.message))
      .finally(() => setCargandoDatos(false))
  }, [usuario])

  const nombrePorId = Object.fromEntries(usuarios.map((u) => [u.id, u.nombre]))

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  return (
    <>
      <Head><title>Panel técnico | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <div className="panel-cabecera">
          <div>
            <h1>Panel técnico</h1>
            <p>Vista de solo lectura, para verificar que todo funciona. Ningún cambio se guarda desde aquí.</p>
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
                    <li key={u.id} className="fila-panel">
                      <div>
                        <div className="fila-panel-titulo">
                          <strong>{u.nombre}</strong>
                          <span className="etiqueta etiqueta-azul">{u.rol}</span>
                          <span className={`etiqueta ${u.activo ? 'etiqueta-verde' : 'etiqueta-roja'}`}>
                            {u.activo ? 'Activo' : 'Desactivado'}
                          </span>
                        </div>
                        <p className="dato">{u.correo}</p>
                      </div>
                    </li>
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
                    <li key={v.id} className="fila-panel">
                      <div>
                        <div className="fila-panel-titulo">
                          <strong>{v.titulo}</strong>
                          <span className={`etiqueta ${v.estado === 'activa' ? 'etiqueta-verde' : 'etiqueta-roja'}`}>
                            {v.estado === 'activa' ? 'Activa' : 'Cerrada'}
                          </span>
                        </div>
                        <p className="dato">{v.empresa} · publicada por {nombrePorId[v.reclutadorId] || 'alguien que ya no está'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-seccion">
              <h2>Postulaciones</h2>
              {postulaciones.length === 0 ? (
                <p className="vacio">No hay postulaciones todavía.</p>
              ) : (
                <ul className="lista-panel">
                  {postulaciones.map((p) => (
                    <li key={p.id} className="fila-panel">
                      <div>
                        <div className="fila-panel-titulo">
                          <strong>{p.cvSnapshot?.nombre || 'Sin nombre'}</strong>
                          <span className="etiqueta etiqueta-azul">{ESTADOS_POSTULACION[p.estado] || p.estado}</span>
                        </div>
                        <p className="dato"><Eye size={14} aria-hidden="true" /> {p.vacanteTitulo} · {p.vacanteEmpresa}</p>
                        {p.puntaje != null && <p className="dato">Puntaje: {p.puntaje}</p>}
                      </div>
                    </li>
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
