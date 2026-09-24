import { useState } from 'react'
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react'
import { ciudades, lugares } from '../data/jobs'

// Barra de búsqueda: cargo / ciudad / modalidad + botón.
// "compacta" es la versión blanca de la pantalla de resultados.
export default function SearchBar({ inicial = {}, onBuscar, compacta = false }) {
  const [q, setQ] = useState(inicial.q || '')
  const [ciudad, setCiudad] = useState(inicial.ciudad || '')
  const [modalidad, setModalidad] = useState(inicial.modalidad || '')

  const enviar = (e) => {
    e.preventDefault() // evita que la página se recargue
    onBuscar({ q: q.trim(), ciudad, modalidad })
  }

  return (
    <form className={`buscador ${compacta ? 'buscador-compacto' : ''}`} onSubmit={enviar} role="search">
      <label className="buscador-campo buscador-campo-texto">
        <Search size={18} aria-hidden="true" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cargo, empresa o palabra clave"
        />
      </label>

      <label className="buscador-campo">
        <MapPin size={18} aria-hidden="true" />
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} aria-label="Ciudad">
          <option value="">Ciudad</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </label>

      <label className="buscador-campo">
        <Briefcase size={18} aria-hidden="true" />
        <select value={modalidad} onChange={(e) => setModalidad(e.target.value)} aria-label="Modalidad">
          <option value="">{compacta ? 'Todas las modalidades' : 'Modalidad'}</option>
          {lugares.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </label>

      <button type="submit" className="boton boton-primario">
        {compacta ? 'Buscar' : 'Buscar empleo'}
      </button>
    </form>
  )
}
