import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Printer, Save, Trash2, Sparkles, Eye, Pencil } from 'lucide-react'
import CvForm from '../components/cv/CvForm'
import CvPreview from '../components/cv/CvPreview'
import { cvVacio, cvEjemplo } from '../data/cvModelo'

const CLAVE_BORRADOR = 'tbusco-cv-borrador'

// Libera de la memoria las vistas previas de los archivos adjuntos
const liberarArchivos = (cv) => {
  if (cv.foto?.url) URL.revokeObjectURL(cv.foto.url)
  ;[...cv.formacion, ...cv.cursos].forEach((i) => i.archivo?.url && URL.revokeObjectURL(i.archivo.url))
}

export default function HojaDeVida() {
  // ÚNICA fuente de verdad: el formulario la modifica y la hoja la muestra
  const [cv, setCv] = useState(cvVacio)
  const [vista, setVista] = useState('editar') // solo importa en pantallas pequeñas
  const [mensaje, setMensaje] = useState(null) // { tipo: 'ok' | 'error', texto }

  // Al abrir la página, recupera el borrador guardado (localStorage solo existe en el navegador)
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_BORRADOR)
      if (guardado) setCv({ ...cvVacio(), ...JSON.parse(guardado) })
    } catch {
      /* si el borrador está dañado, empezamos en blanco */
    }
  }, [])

  // El aviso desaparece solo a los 4 segundos
  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(() => setMensaje(null), 4000)
    return () => clearTimeout(t)
  }, [mensaje])

  // ----- Funciones que modifican el CV (se las pasamos al formulario) -----
  const actualizar = (campo, valor) => setCv((c) => ({ ...c, [campo]: valor }))

  const agregar = (lista, fabrica) => setCv((c) => ({ ...c, [lista]: [...c[lista], fabrica()] }))

  const quitar = (lista, id) => {
    const item = cv[lista].find((i) => i.id === id)
    if (item?.archivo?.url) URL.revokeObjectURL(item.archivo.url)
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

  const vaciar = () => {
    if (hayContenido() && !window.confirm('¿Borrar todo el contenido del formulario?')) return
    liberarArchivos(cv)
    setCv(cvVacio())
    try { localStorage.removeItem(CLAVE_BORRADOR) } catch { /* nada */ }
  }

  const guardar = () => {
    if (!cv.nombre.trim() || !cv.correo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Escribe al menos tu nombre y tu correo para guardar.' })
      return
    }
    try {
      // Los archivos NO se guardan aquí (localStorage no sirve para archivos).
      // Cuando exista el backend, se subirán con FormData a tu API / S3.
      const texto = JSON.stringify(cv, (clave, valor) => (clave === 'archivo' || clave === 'foto' ? undefined : valor))
      localStorage.setItem(CLAVE_BORRADOR, texto)
      setMensaje({ tipo: 'ok', texto: 'Borrador guardado en este navegador.' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar el borrador en este navegador.' })
    }
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
            <button type="button" className="boton boton-contorno boton-pequeno" onClick={guardar}>
              <Save size={14} aria-hidden="true" /> Guardar borrador
            </button>
            <button type="button" className="boton boton-primario boton-pequeno" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" /> Descargar / imprimir
            </button>
          </div>
        </div>

        {/* Zona de avisos: siempre existe para que los lectores de pantalla anuncien los cambios */}
        <div role="status" aria-live="polite">
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
