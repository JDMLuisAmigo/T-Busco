import { useState } from 'react'
import { X } from 'lucide-react'

// Lista de "chips" (ej: habilidades). Escribes, pulsas Enter o "Agregar", y aparece un chip.
export default function CampoEtiquetas({ etiqueta, valores, alCambiar, placeholder }) {
  const [texto, setTexto] = useState('')

  const agregar = () => {
    const nuevo = texto.trim()
    setTexto('')
    if (!nuevo) return
    // Evita duplicados sin importar mayúsculas
    if (valores.some((v) => v.toLowerCase() === nuevo.toLowerCase())) return
    alCambiar([...valores, nuevo])
  }

  const alPulsarTecla = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      agregar()
    }
  }

  return (
    <div className="campo campo-completo">
      <label className="campo-etiqueta" htmlFor="entrada-etiquetas">{etiqueta}</label>
      <div className="etiquetas-entrada">
        <input
          id="entrada-etiquetas"
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alPulsarTecla}
          placeholder={placeholder}
          maxLength={40}
        />
        <button type="button" className="boton boton-contorno boton-pequeno" onClick={agregar}>
          Agregar
        </button>
      </div>

      {valores.length > 0 && (
        <ul className="chips">
          {valores.map((v) => (
            <li key={v} className="chip">
              {v}
              <button
                type="button"
                onClick={() => alCambiar(valores.filter((x) => x !== v))}
                aria-label={`Quitar ${v}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
