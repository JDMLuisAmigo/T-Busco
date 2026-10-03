import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  ArrowLeft, Heart, Send, MapPin, Briefcase, DollarSign, Laptop, BadgeCheck, Building2, Users,
  Tag, ShieldCheck, Check, Clock, Home, Star, ClipboardList, FileText, Wallet, Link2, Mail, MessageCircle, LogIn,
} from 'lucide-react'
import { pesos, normalizarVacante } from '../../data/jobs'
import { obtenerVacante, postularA, misPostulaciones } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { LogoEmpresa } from '../../components/JobCard'

const tabs = ['Descripción', 'Requisitos', 'Beneficios', 'Empresa']

export default function JobDetail() {
  const router = useRouter()
  const { id } = router.query // en /empleos/<uuid>, id trae ese uuid
  const { usuario } = useAuth()

  const [job, setJob] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [tab, setTab] = useState('Descripción')
  const [guardada, setGuardada] = useState(false)
  const [postulado, setPostulado] = useState(false)
  const [enviandoPostulacion, setEnviandoPostulacion] = useState(false)
  const [errorPostulacion, setErrorPostulacion] = useState('')
  const [copiado, setCopiado] = useState(false)

  // window solo existe en el navegador (no en el servidor), por eso se lee dentro de un efecto
  const [urlActual, setUrlActual] = useState('')
  useEffect(() => setUrlActual(window.location.href), [id])

  // Si ya es aspirante y ya tiene la vacante cargada, revisa si ya se había
  // postulado antes (para que el botón salga correcto al volver a esta página)
  useEffect(() => {
    if (!job || !usuario || usuario.rol !== 'aspirante') return
    let cancelado = false
    misPostulaciones()
      .then((lista) => { if (!cancelado && lista.some((p) => p.vacanteId === job.id)) setPostulado(true) })
      .catch(() => { /* si falla, se deja el botón normal; no es crítico */ })
    return () => { cancelado = true }
  }, [job, usuario])

  // Pide la vacante al backend cada vez que el id de la URL esté listo
  useEffect(() => {
    if (!router.isReady || !id) return
    let cancelado = false
    setCargando(true)
    obtenerVacante(id)
      .then((v) => { if (!cancelado) setJob(normalizarVacante(v)) })
      .catch((e) => { if (!cancelado) setErrorCarga(e.message) })
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [router.isReady, id])

  // Mientras Next.js lee la URL, o mientras se trae la vacante, no se muestra nada todavía
  if (!router.isReady || cargando) return <p className="contenedor vacio">Cargando…</p>

  if (errorCarga || !job) {
    return (
      <div className="contenedor vacio">
        <p>{errorCarga || 'No encontramos esta vacante.'}</p>
        <Link href="/empleos" className="boton boton-primario">Ver todas las vacantes</Link>
      </div>
    )
  }

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* si el navegador no permite copiar, no pasa nada */
    }
  }

  const postularme = async () => {
    setErrorPostulacion('')
    setEnviandoPostulacion(true)
    try {
      await postularA(job.id)
      setPostulado(true)
    } catch (err) {
      setErrorPostulacion(err.message)
    } finally {
      setEnviandoPostulacion(false)
    }
  }

  const textoCompartir = encodeURIComponent(`${job.titulo} en ${job.empresa}: ${urlActual}`)

  return (
    <div className="contenedor pagina-vacante">
      <nav className="migas" aria-label="Ubicación">
        <Link href="/empleos"><ArrowLeft size={16} /> Volver a resultados</Link>
        <span aria-hidden="true">›</span>
        <span>{job.titulo}</span>
      </nav>

      <div className="vacante-cuerpo">
        <article className="panel vacante-principal">
          <header className="vacante-cabecera">
            <LogoEmpresa job={job} size={64} />
            <div className="vacante-empresa">
              <p className="empresa-verificada">
                <strong>{job.empresa}</strong> <BadgeCheck size={16} aria-label="Empresa verificada" />
              </p>
              <p>{job.ciudad}{job.empleados ? ` · ${job.empleados}` : ''}</p>
            </div>
            <div className="vacante-botones">
              <button
                type="button"
                className={`boton boton-contorno ${guardada ? 'activo' : ''}`}
                onClick={() => setGuardada(!guardada)}
                aria-pressed={guardada}
              >
                <Heart size={16} fill={guardada ? 'currentColor' : 'none'} /> {guardada ? 'Guardada' : 'Guardar'}
              </button>

              {!usuario ? (
                <Link href="/login" className="boton boton-primario">
                  <LogIn size={16} /> Inicia sesión para postularte
                </Link>
              ) : usuario.rol === 'aspirante' ? (
                <button
                  type="button"
                  className="boton boton-primario"
                  onClick={postularme}
                  disabled={postulado || enviandoPostulacion}
                >
                  {postulado
                    ? <><Check size={16} /> Postulación enviada</>
                    : <><Send size={16} /> {enviandoPostulacion ? 'Enviando…' : 'Postularme'}</>}
                </button>
              ) : null}
            </div>
            {errorPostulacion && <p className="aviso aviso-error" role="alert">{errorPostulacion}</p>}
          </header>

          <h1>{job.titulo}</h1>
          <ul className="vacante-datos">
            <li><MapPin size={16} aria-hidden="true" /> {job.ciudad}</li>
            <li><Briefcase size={16} aria-hidden="true" /> {job.jornada}</li>
            <li><DollarSign size={16} aria-hidden="true" /> {pesos(job.salarioMin)} – {pesos(job.salarioMax)}</li>
            <li><Laptop size={16} aria-hidden="true" /> {job.lugar}</li>
          </ul>
          <div className="etiquetas">
            {job.tags.map((t) => <span key={t} className="etiqueta etiqueta-azul">{t}</span>)}
          </div>

          <div className="vacante-banner">
            <div className="banner-imagen"><p>{job.lema}</p></div>
            <div className="banner-texto">
              <FileText size={20} aria-hidden="true" />
              <p>{job.sobreEmpresa}</p>
              <button type="button" className="enlace-boton" onClick={() => setTab('Empresa')}>
                Conoce más sobre la empresa
              </button>
            </div>
          </div>

          <div className="tabs" role="tablist">
            {tabs.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={tab === p}
                className={tab === p ? 'tab activa' : 'tab'}
                onClick={() => setTab(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="tab-contenido">
            {tab === 'Descripción' && (
              <>
                <section>
                  <h2><Briefcase size={18} aria-hidden="true" /> Descripción del cargo</h2>
                  <p>{job.descripcion}</p>
                </section>
                <div className="dos-columnas">
                  <section>
                    <h2><ClipboardList size={18} aria-hidden="true" /> Responsabilidades</h2>
                    <ul>{job.responsabilidades.map((r) => <li key={r}>{r}</li>)}</ul>
                  </section>
                  <section>
                    <h2><FileText size={18} aria-hidden="true" /> Requisitos</h2>
                    <ul>{job.requisitos.map((r) => <li key={r}>{r}</li>)}</ul>
                  </section>
                </div>
                <section>
                  <h2><Wallet size={18} aria-hidden="true" /> Salario y beneficios</h2>
                  <div className="resumen-beneficios">
                    <div><DollarSign size={20} /><strong>{pesos(job.salarioMin)} - {pesos(job.salarioMax)}</strong><small>Salario mensual</small></div>
                    <div><Clock size={20} /><strong>{job.jornada}</strong><small>Jornada laboral</small></div>
                    <div><Home size={20} /><strong>{job.lugar}</strong><small>Modalidad</small></div>
                    <div><Star size={20} /><strong>Prestaciones de ley</strong><small>y más beneficios</small></div>
                  </div>
                </section>
              </>
            )}
            {tab === 'Requisitos' && (
              <section>
                <h2><FileText size={18} aria-hidden="true" /> Requisitos</h2>
                <ul>{job.requisitos.map((r) => <li key={r}>{r}</li>)}</ul>
              </section>
            )}
            {tab === 'Beneficios' && (
              <section>
                <h2><Star size={18} aria-hidden="true" /> Beneficios</h2>
                <ul>{job.beneficios.map((b) => <li key={b}>{b}</li>)}</ul>
              </section>
            )}
            {tab === 'Empresa' && (
              <section>
                <h2><Building2 size={18} aria-hidden="true" /> {job.empresa}</h2>
                <p>{job.sobreEmpresa}</p>
              </section>
            )}
          </div>
        </article>

        <aside className="vacante-lateral">
          <section className="panel">
            <header className="lateral-empresa">
              <LogoEmpresa job={job} size={56} />
              <div>
                <p className="empresa-verificada"><strong>{job.empresa}</strong> <BadgeCheck size={16} aria-label="Empresa verificada" /></p>
                {job.sectorEmpresa && <p>{job.sectorEmpresa}</p>}
              </div>
            </header>
            <ul className="lista-iconos">
              <li><MapPin size={16} /> {job.ciudad}</li>
              {job.empleados && <li><Users size={16} /> {job.empleados}</li>}
              {job.tags.length > 0 && <li><Tag size={16} /> {job.tags.join(', ')}</li>}
            </ul>
            <button type="button" className="boton boton-contorno boton-ancho" onClick={() => setTab('Empresa')}>
              Ver empresa
            </button>
          </section>

          <section className="panel panel-claro">
            <h2><ShieldCheck size={20} aria-hidden="true" /> ¿Por qué trabajar con nosotros?</h2>
            <ul className="lista-check">
              {job.beneficios.map((b) => <li key={b}><Check size={16} /> {b}</li>)}
            </ul>
          </section>

          <section className="panel">
            <h2 className="titulo-pequeno">Comparte esta oferta</h2>
            <div className="compartir">
              <a href={`https://wa.me/?text=${textoCompartir}`} target="_blank" rel="noreferrer" aria-label="Compartir por WhatsApp">
                <MessageCircle size={18} />
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(job.titulo)}&body=${textoCompartir}`} aria-label="Compartir por correo">
                <Mail size={18} />
              </a>
              <button type="button" onClick={copiarEnlace} aria-label="Copiar enlace">
                <Link2 size={18} />
              </button>
              {copiado && <span className="copiado" role="status">Enlace copiado</span>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
