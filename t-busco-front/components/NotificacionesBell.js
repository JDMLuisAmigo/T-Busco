import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas } from '../lib/api'

// La campana del navbar: trae las notificaciones una vez al iniciar sesión,
// y las actualiza localmente (sin volver a pedirlas) al marcarlas como leídas.
export default function NotificacionesBell() {
  const { usuario } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [abierta, setAbierta] = useState(false)
  const contenedorRef = useRef(null)

  useEffect(() => {
    if (!usuario) return
    listarNotificaciones().then(setNotificaciones).catch(() => { /* si falla, la campana solo queda vacía */ })
  }, [usuario])

  // Cierra el panel al hacer clic fuera de él
  useEffect(() => {
    const alClicFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierta(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  if (!usuario) return null

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const alClicNotificacion = async (n) => {
    if (!n.leida) {
      try {
        await marcarNotificacionLeida(n.id)
        setNotificaciones((ns) => ns.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))
      } catch { /* si falla, no es grave: se reintentará la próxima vez que se abra */ }
    }
    setAbierta(false)
  }

  const marcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas()
      setNotificaciones((ns) => ns.map((n) => ({ ...n, leida: true })))
    } catch { /* no crítico */ }
  }

  return (
    <div className="notificaciones" ref={contenedorRef}>
      <button
        type="button"
        className="icono-boton notificaciones-boton"
        onClick={() => setAbierta(!abierta)}
        aria-label={`Notificaciones${noLeidas ? `, ${noLeidas} sin leer` : ''}`}
        aria-expanded={abierta}
      >
        <Bell size={18} />
        {noLeidas > 0 && <span className="notificaciones-contador">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {abierta && (
        <div className="notificaciones-panel" role="menu">
          <div className="notificaciones-cabecera">
            <strong>Notificaciones</strong>
            {noLeidas > 0 && (
              <button type="button" className="enlace-boton" onClick={marcarTodas}>Marcar todas como leídas</button>
            )}
          </div>

          {notificaciones.length === 0 ? (
            <p className="notificaciones-vacio">No tienes notificaciones todavía.</p>
          ) : (
            <ul className="notificaciones-lista">
              {notificaciones.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.enlace || '#'}
                    className={`notificaciones-item ${n.leida ? '' : 'no-leida'}`}
                    onClick={() => alClicNotificacion(n)}
                  >
                    {n.mensaje}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
