import { useState } from 'react'
import Campo from '../cv/Campo'
import CampoEtiquetas from '../cv/CampoEtiquetas'
import { categorias, ciudades, lugares, jornadas, contratos } from '../../data/jobs'

const listaATexto = (arr) => (arr || []).join('\n')
const textoALista = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean)

const vacio = () => ({
  titulo: '', empresa: '', sectorEmpresa: '', ciudad: ciudades[0], lugar: lugares[0],
  jornada: jornadas[0], contrato: contratos[0], categoria: categorias[0].id,
  salarioMin: '', salarioMax: '', descripcion: '',
  responsabilidades: '', requisitos: '', beneficios: '', tags: [],
})

// El backend guarda listas (arrays); el formulario las edita como texto
// con un renglón por elemento. Esta función convierte de array a texto
// para poder EDITAR una vacante que ya existe.
export const vacanteAFormulario = (v) => ({
  ...vacio(),
  ...v,
  responsabilidades: listaATexto(v.responsabilidades),
  requisitos: listaATexto(v.requisitos),
  beneficios: listaATexto(v.beneficios),
  tags: v.tags || [],
})

// inicial: los valores de partida (vacío para "nueva", o vacanteAFormulario(v) para "editar")
// alEnviar: función async que recibe los datos ya convertidos a lo que espera el backend
export default function VacanteForm({ inicial, alEnviar, enviando, textoBoton }) {
  const [datos, setDatos] = useState(inicial || vacio())
  const [error, setError] = useState('')

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setError('')

    const salarioMin = Number(datos.salarioMin)
    const salarioMax = Number(datos.salarioMax)

    if (!datos.titulo.trim() || !datos.empresa.trim() || !datos.descripcion.trim()) {
      setError('Completa al menos el título, la empresa y la descripción.')
      return
    }
    if (!salarioMin || !salarioMax || salarioMax < salarioMin) {
      setError('Revisa los salarios: el máximo no puede ser menor que el mínimo.')
      return
    }

    try {
      await alEnviar({
        ...datos,
        salarioMin,
        salarioMax,
        responsabilidades: textoALista(datos.responsabilidades),
        requisitos: textoALista(datos.requisitos),
        beneficios: textoALista(datos.beneficios),
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="formulario-vacante" onSubmit={enviar}>
      <div className="rejilla-campos">
        <Campo etiqueta="Título del cargo *" ancho="completo">
          <input type="text" value={datos.titulo} onChange={cambiar('titulo')} maxLength={80} />
        </Campo>
        <Campo etiqueta="Empresa *">
          <input type="text" value={datos.empresa} onChange={cambiar('empresa')} maxLength={80} />
        </Campo>
        <Campo etiqueta="Sector de la empresa">
          <input type="text" value={datos.sectorEmpresa} onChange={cambiar('sectorEmpresa')} maxLength={80} />
        </Campo>
        <Campo etiqueta="Ciudad">
          <select value={datos.ciudad} onChange={cambiar('ciudad')}>
            {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Modalidad">
          <select value={datos.lugar} onChange={cambiar('lugar')}>
            {lugares.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Jornada">
          <select value={datos.jornada} onChange={cambiar('jornada')}>
            {jornadas.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Tipo de contrato">
          <select value={datos.contrato} onChange={cambiar('contrato')}>
            {contratos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Categoría">
          <select value={datos.categoria} onChange={cambiar('categoria')}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Salario mínimo *">
          <input type="number" min="0" step="50000" value={datos.salarioMin} onChange={cambiar('salarioMin')} />
        </Campo>
        <Campo etiqueta="Salario máximo *">
          <input type="number" min="0" step="50000" value={datos.salarioMax} onChange={cambiar('salarioMax')} />
        </Campo>
        <Campo etiqueta="Descripción del cargo *" ancho="completo" ayuda="Al menos 20 caracteres.">
          <textarea rows={4} value={datos.descripcion} onChange={cambiar('descripcion')} />
        </Campo>
        <Campo etiqueta="Responsabilidades" ancho="completo" ayuda="Una por línea.">
          <textarea rows={4} value={datos.responsabilidades} onChange={cambiar('responsabilidades')} />
        </Campo>
        <Campo etiqueta="Requisitos" ancho="completo" ayuda="Uno por línea.">
          <textarea rows={4} value={datos.requisitos} onChange={cambiar('requisitos')} />
        </Campo>
        <Campo etiqueta="Beneficios" ancho="completo" ayuda="Uno por línea.">
          <textarea rows={3} value={datos.beneficios} onChange={cambiar('beneficios')} />
        </Campo>
      </div>

      <CampoEtiquetas
        etiqueta="Etiquetas (ej: Remoto, Diseño)"
        placeholder="Escribe una y pulsa Enter"
        valores={datos.tags}
        alCambiar={(tags) => setDatos((d) => ({ ...d, tags }))}
      />

      {error && <p className="aviso aviso-error" role="alert">{error}</p>}

      <button type="submit" className="boton boton-primario" disabled={enviando}>
        {enviando ? 'Guardando…' : textoBoton || 'Guardar vacante'}
      </button>
    </form>
  )
}
