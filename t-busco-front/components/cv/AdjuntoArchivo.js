import { useRef, useState } from 'react'
import { Paperclip, FileText, X } from 'lucide-react'

const NOMBRES = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG' }

const formatoTamano = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

// Botón para adjuntar UN archivo (diploma, certificado, foto...).
// Recibe el archivo actual (o null) y avisa con alCambiar(nuevoArchivo | null).
//
// OJO: aquí solo validamos en el navegador para dar buena experiencia.
// El backend SIEMPRE debe volver a validar tipo y tamaño (el usuario puede saltarse esto).
export default function AdjuntoArchivo({
  etiqueta,
  archivo,
  alCambiar,
  tipos = ['application/pdf', 'image/jpeg', 'image/png'],
  maxMb = 5,
}) {
  const entrada = useRef(null)
  const [error, setError] = useState('')
  const formatos = tipos.map((t) => NOMBRES[t]).join(', ')

  const elegir = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo más tarde
    if (!file) return

    if (!tipos.includes(file.type)) {
      setError(`Formato no permitido. Usa ${formatos}.`)
      return
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`El archivo pesa más de ${maxMb} MB.`)
      return
    }

    setError('')
    if (archivo?.url) URL.revokeObjectURL(archivo.url) // libera la vista previa anterior
    alCambiar({
      nombre: file.name,
      tamano: file.size,
      tipo: file.type,
      url: URL.createObjectURL(file), // enlace temporal para "Ver" el archivo
      file, // el archivo real: es el que enviarás al backend con FormData
    })
  }

  const quitar = () => {
    if (archivo?.url) URL.revokeObjectURL(archivo.url)
    setError('')
    alCambiar(null)
  }

  const abrirSelector = () => entrada.current?.click()

  return (
    <div className="adjunto">
      <input ref={entrada} type="file" accept={tipos.join(',')} onChange={elegir} hidden />

      {archivo ? (
        <div className="adjunto-archivo">
          <FileText size={18} aria-hidden="true" />
          <span className="adjunto-nombre" title={archivo.nombre}>{archivo.nombre}</span>
          <small>{formatoTamano(archivo.tamano)}</small>
          <a href={archivo.url} target="_blank" rel="noreferrer" className="enlace-boton">Ver</a>
          <button type="button" className="enlace-boton" onClick={abrirSelector}>Cambiar</button>
          <button type="button" className="adjunto-quitar" onClick={quitar} aria-label={`Quitar ${etiqueta}`}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" className="boton boton-contorno boton-pequeno" onClick={abrirSelector}>
          <Paperclip size={14} aria-hidden="true" /> Adjuntar {etiqueta}
        </button>
      )}

      <small className="campo-ayuda">{formatos} · máx. {maxMb} MB</small>
      {error && <small className="campo-error" role="alert">{error}</small>}
    </div>
  )
}
