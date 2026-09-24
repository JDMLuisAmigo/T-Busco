// Envuelve un input con su etiqueta, texto de ayuda y mensaje de error.
// Como el <input> va DENTRO del <label>, al hacer clic en el texto se enfoca el campo.
export default function Campo({ etiqueta, error, ayuda, ancho, children }) {
  return (
    <label className={`campo ${ancho === 'completo' ? 'campo-completo' : ''}`}>
      <span className="campo-etiqueta">{etiqueta}</span>
      {children}
      {ayuda && !error && <small className="campo-ayuda">{ayuda}</small>}
      {error && <small className="campo-error" role="alert">{error}</small>}
    </label>
  )
}
