import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Printer, Save, Trash2, Sparkles, Eye, Pencil } from 'lucide-react'
import CvForm from '../components/cv/CvForm'
import CvPreview from '../components/cv/CvPreview'
import { cvVacio, cvEjemplo } from '../data/cvModelo'
import { obtenerCv, guardarCv, subirArchivo } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const CLAVE_BORRADOR = 'tbusco-cv-borrador'

// Libera de la memoria las vistas previas de los archivos adjuntos (evita fugas de memoria)
const liberarArchivos = (cv) => {
  if (cv.foto?.url?.startsWith('blob:')) URL.revokeObjectURL(cv.foto.url)
  ;[...cv.formacion, ...cv.cursos].forEach((i) => {
    if (i.archivo?.url?.startsWith('blob:')) URL.revokeObjectURL(i.archivo.url)
  })
}

// Sube al backend cualquier archivo que el usuario acaba de adjuntar en esta sesión
// (los que tienen ".file", el objeto File real) y reemplaza su vista previa local
// por la URL definitiva que entrega el servidor. Los archivos que ya venían
// guardados de antes (sin ".file") se dejan tal cual.
const subirPendientes = async (cv) => {
  const nuevo = { ...cv }

  if (cv.foto?.file) {
    nuevo.foto = await subirArchivo(cv.foto.file)
  }
  nuevo.formacion = await Promise.all(
    cv.formacion.map(async (f) =>
      f.archivo?.file ? { ...f, archivo: await subirArchivo(f.archivo.file) } : f
    )
  )
  nuevo.cursos = await Promise.all(
    cv.cursos.map(async (c) =>
      c.archivo?.file ? { ...c, archivo: await subirArchivo(c.archivo.file) } : c
    )
  )
  return nuevo
}

export default function HojaDeVida() {
  const router = useRouter()
  // Se nombra "cargandoSesion" (y no "cargando") porque más abajo ya existe
  // un "cargando" propio de esta página, para "trayendo el CV del backend".
  const { usuario, cargando: cargandoSesion } = useAuth()

  // ÚNICA fuente de verdad: el formulario la modifica y la hoja la muestra
  const [cv, setCv] = useState(cvVacio)
  const [vista, setVista] = useState('editar') // solo importa en pantallas pequeñas
  const [mensaje, setMensaje] = useState(null) // { tipo: 'ok' | 'error', texto }
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Si ya se confirmó que NO hay sesión iniciada, manda a la página de login.
  // Se espera a que cargandoSesion termine para no redirigir de más justo
  // antes de confirmar que sí había una sesión guardada de una visita anterior.
  useEffect(() => {
    if (!cargandoSesion && !usuario) router.replace('/login')
  }, [cargandoSesion, usuario, router])

  // Al abrir la página (ya con sesión): primero intenta traer el CV del backend.
  // Si el backend no responde o no tiene nada, usa el borrador guardado en este navegador.
  useEffect(() => {
    if (!usuario) return // sin sesión no tiene caso pedirlo: el efecto de arriba ya va a redirigir
    let cancelado = false
    ;(async () => {
      try {
        const remoto = await obtenerCv()
        if (!cancelado && remoto) {
          setCv({ ...cvVacio(), ...remoto })
          return
        }
      } catch {
        // sin conexión al backend: seguimos con el plan B de abajo
      }
      try {
        const guardado = localStorage.getItem(CLAVE_BORRADOR)
        if (!cancelado && guardado) setCv({ ...cvVacio(), ...JSON.parse(guardado) })
      } catch {
        /* si el borrador está dañado, empezamos en blanco */
      }
    })().finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [usuario])

  // El aviso desaparece solo a los 5 segundos
  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(() => setMensaje(null), 5000)
    return () => clearTimeout(t)
  }, [mensaje])

  // ----- Funciones que modifican el CV (se las pasamos al formulario) -----
  const actualizar = (campo, valor) => setCv((c) => ({ ...c, [campo]: valor }))

  const agregar = (lista, fabrica) => setCv((c) => ({ ...c, [lista]: [...c[lista], fabrica()] }))

  const quitar = (lista, id) => {
    const item = cv[lista].find((i) => i.id === id)
    if (item?.archivo?.url?.startsWith('blob:')) URL.revokeObjectURL(item.archivo.url)
    setCv((c) => ({ ...c, [lista]: c[lista].filter((i) => i.id !== id) }))
  }

  const editar = (lista, id, campo, valor) =>
    setCv((c) => ({
      ...c,
      [lista]: c[lista].map((i) => (i.id === id ? { ...i, [campo]: valor } : i)),
    }))

  // ----- Botones de la barra superior -----
  const hayContenido = () => JSON.stringify(cv) !== JSON.stringify(cvVacio())

  const cargarEjemplo = () => {
    if (hayContenido() && !window.confirm('Se reemplazará lo que has escrito por el ejemplo. ¿Continuar?')) return
    liberarArchivos(cv)
    setCv(cvEjemplo())
  }

  // Solo borra en este navegador: NO borra lo que ya esté guardado en el servidor.
  const vaciar = () => {
    if (hayContenido() && !window.confirm('¿Borrar todo el contenido del formulario en este navegador?')) return
    liberarArchivos(cv)
    setCv(cvVacio())
    try { localStorage.removeItem(CLAVE_BORRADOR) } catch { /* nada */ }
  }

  const guardar = async () => {
    if (!cv.nombre.trim() || !cv.correo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Escribe al menos tu nombre y tu correo para guardar.' })
      return
    }
    setGuardando(true)
    try {
      const conArchivosSubidos = await subirPendientes(cv)
      await guardarCv(conArchivosSubidos)
      setCv(conArchivosSubidos) // ahora los archivos tienen la URL definitiva del servidor
      setMensaje({ tipo: 'ok', texto: 'Hoja de vida guardada en el servidor.' })
      try { localStorage.removeItem(CLAVE_BORRADOR) } catch { /* ya no hace falta el borrador local */ }
    } catch {
      // Si no hay conexión con el backend, no perdemos el trabajo: queda una copia local
      try {
        const texto = JSON.stringify(cv, (clave, valor) => (clave === 'file' ? undefined : valor))
        localStorage.setItem(CLAVE_BORRADOR, texto)
        setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor. Se guardó una copia local en este navegador.' })
      } catch {
        setMensaje({ tipo: 'error', texto: 'No se pudo guardar ni en el servidor ni en este navegador.' })
      }
    } finally {
      setGuardando(false)
    }
  }

  // Mientras se confirma la sesión, o si no hay nadie conectado (el efecto de
  // arriba ya va a redirigir a /login), no se muestra el formulario: evita
  // el parpadeo de ver el editor un instante antes de saltar a otra página.
  if (cargandoSesion || !usuario) {
    return <p className="contenedor vacio">Cargando…</p>
  }

  return (
    <>
      <Head>
        <title>Mi hoja de vida | t-Busco</title>
      </Head>

      <div className="pagina-editor">
        <div className="editor-barra">
          <div>
            <h1>Mi hoja de vida</h1>
            <p>Completa el formulario y mira cómo se arma tu hoja en tiempo real.</p>
          </div>
          <div className="editor-acciones">
            <button type="button" className="boton boton-contorno boton-pequeno" onClick={cargarEjemplo}>
              <Sparkles size={14} aria-hidden="true" /> Cargar ejemplo
            </button>
            <button type="button" className="boton boton-contorno boton-pequeno" onClick={vaciar}>
              <Trash2 size={14} aria-hidden="true" /> Vaciar
            </button>
            <button type="button" className="boton boton-contorno boton-pequeno" onClick={guardar} disabled={guardando}>
              <Save size={14} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="boton boton-primario boton-pequeno" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" /> Descargar / imprimir
            </button>
          </div>
        </div>

        {/* Zona de avisos: siempre existe para que los lectores de pantalla anuncien los cambios */}
        <div role="status" aria-live="polite">
          {cargando && <p className="aviso">Cargando tu hoja de vida…</p>}
          {mensaje && <p className={`aviso aviso-${mensaje.tipo}`}>{mensaje.texto}</p>}
        </div>

        {/* Pestañas: solo se ven en pantallas pequeñas, donde no caben las dos columnas */}
        <div className="editor-tabs" role="group" aria-label="Cambiar vista">
          <button type="button" aria-pressed={vista === 'editar'} onClick={() => setVista('editar')}>
            <Pencil size={14} aria-hidden="true" /> Editar
          </button>
          <button type="button" aria-pressed={vista === 'previa'} onClick={() => setVista('previa')}>
            <Eye size={14} aria-hidden="true" /> Vista previa
          </button>
        </div>

        <div className="editor-cv" data-vista={vista}>
          <section className="editor-form" aria-label="Formulario de la hoja de vida">
            <CvForm cv={cv} actualizar={actualizar} agregar={agregar} quitar={quitar} editar={editar} />
          </section>
          <section className="editor-previa" aria-label="Vista previa">
            <CvPreview cv={cv} />
          </section>
        </div>
      </div>
    </>
  )
}
