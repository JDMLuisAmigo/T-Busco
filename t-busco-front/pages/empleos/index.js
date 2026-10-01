import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { MapPin, Briefcase, DollarSign, FileText, RotateCcw, ChevronDown } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import JobCard from '../../components/JobCard'
import { ciudades, jornadas, contratos, categorias, normalizarVacante } from '../../data/jobs'
import { listarVacantesPublicas } from '../../lib/api'

// Un grupo de casillas del panel de filtros (Ubicación, Modalidad, etc.)
function GrupoFiltro({ titulo, Icono, opciones, seleccionadas, alCambiar, contar }) {
  return (
    <fieldset className="filtro-grupo">
      <legend><Icono size={16} aria-hidden="true" /> {titulo}</legend>
      {opciones.map((op) => (
        <label key={op} className="filtro-opcion">
          <input
            type="checkbox"
            checked={seleccionadas.includes(op)}
            onChange={() => alCambiar(op)}
          />
          <span>{op}</span>
          <small>{contar(op)}</small>
        </label>
      ))}
    </fieldset>
  )
}

const filtrosVacios = { ciudades: [], jornadas: [], contratos: [], salario: '' }

// Los valores de la URL pueden venir como texto o como lista; nos quedamos con un texto
const texto = (v) => (Array.isArray(v) ? v[0] : v) || ''

export default function Search() {
  const router = useRouter()

  // En Next.js los parámetros de la URL (?q=...&ciudad=...) están en router.query
  const q = texto(router.query.q)
  const ciudad = texto(router.query.ciudad)
  const modalidad = texto(router.query.modalidad)
  const categoria = texto(router.query.categoria)

  const [filtros, setFiltros] = useState(filtrosVacios)
  const [orden, setOrden] = useState('relevantes')

  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  // Trae las vacantes UNA vez; todo el filtrado de abajo sigue pasando
  // en el navegador, igual que antes, solo que ahora sobre datos reales.
  useEffect(() => {
    let cancelado = false
    listarVacantesPublicas()
      .then((lista) => { if (!cancelado) setVacantes(lista.map(normalizarVacante)) })
      .catch(() => { if (!cancelado) setErrorCarga('No se pudieron cargar las vacantes. Intenta de nuevo más tarde.') })
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [])

  // Al cargar la página, router.query llega vacío un instante y luego se llena.
  // Este efecto marca la ciudad en los filtros cuando la URL trae una.
  useEffect(() => {
    if (!router.isReady) return
    setFiltros((f) => ({ ...f, ciudades: ciudad ? [ciudad] : [] }))
  }, [router.isReady, ciudad])

  // Marca o desmarca una opción dentro de un grupo
  const alternar = (grupo) => (valor) =>
    setFiltros((f) => ({
      ...f,
      [grupo]: f[grupo].includes(valor) ? f[grupo].filter((v) => v !== valor) : [...f[grupo], valor],
    }))

  // Actualiza la URL sin recargar la página (shallow: true)
  const buscar = ({ q, ciudad, modalidad }) => {
    const query = {}
    if (q) query.q = q
    if (ciudad) query.ciudad = ciudad
    if (modalidad) query.modalidad = modalidad
    router.push({ pathname: '/empleos', query }, undefined, { shallow: true })
  }

  const limpiar = () => {
    setFiltros(filtrosVacios)
    router.push('/empleos', undefined, { shallow: true })
  }

  // useMemo recalcula la lista solo cuando cambian los filtros
  const resultados = useMemo(() => {
    const lista = vacantes.filter((j) => {
      const t = `${j.titulo} ${j.empresa} ${j.tags.join(' ')}`.toLowerCase()
      if (q && !t.includes(q.toLowerCase())) return false
      if (modalidad && j.lugar !== modalidad) return false
      if (categoria && j.categoria !== categoria) return false
      if (filtros.ciudades.length && !filtros.ciudades.includes(j.ciudad)) return false
      if (filtros.jornadas.length && !filtros.jornadas.includes(j.jornada)) return false
      if (filtros.contratos.length && !filtros.contratos.includes(j.contrato)) return false
      if (filtros.salario && j.salarioMax < Number(filtros.salario)) return false
      return true
    })
    if (orden === 'salario') lista.sort((a, b) => b.salarioMax - a.salarioMax)
    return lista
  }, [vacantes, q, modalidad, categoria, filtros, orden])

  const contar = (campo) => (valor) => vacantes.filter((j) => j[campo] === valor).length
  const nombreCategoria = categorias.find((c) => c.id === categoria)?.nombre

  return (
    <div className="contenedor pagina-busqueda">
      <div className="busqueda-cabecera">
        <div>
          <h1>Resultados de búsqueda</h1>
          <p>Encuentra la oportunidad perfecta para ti</p>
        </div>
        {/* key: si cambia la URL, el buscador se reinicia con los valores nuevos */}
        <SearchBar
          key={`${q}|${ciudad}|${modalidad}`}
          compacta
          inicial={{ q, ciudad, modalidad }}
          onBuscar={buscar}
        />
      </div>

      <div className="busqueda-cuerpo">
        <aside className="filtros" aria-label="Filtros">
          <div className="filtros-titulo">
            <h2>Filtros</h2>
            <button type="button" className="enlace-boton" onClick={limpiar}>
              Limpiar filtros <RotateCcw size={12} />
            </button>
          </div>

          <GrupoFiltro
            titulo="Ubicación" Icono={MapPin} opciones={ciudades}
            seleccionadas={filtros.ciudades} alCambiar={alternar('ciudades')} contar={contar('ciudad')}
          />
          <GrupoFiltro
            titulo="Modalidad" Icono={Briefcase} opciones={jornadas}
            seleccionadas={filtros.jornadas} alCambiar={alternar('jornadas')} contar={contar('jornada')}
          />

          <fieldset className="filtro-grupo">
            <legend><DollarSign size={16} aria-hidden="true" /> Salario</legend>
            <label className="filtro-select">
              <select
                value={filtros.salario}
                onChange={(e) => setFiltros((f) => ({ ...f, salario: e.target.value }))}
                aria-label="Rango de salario"
              >
                <option value="">Selecciona un rango</option>
                <option value="2000000">Hasta $ 2.000.000 o más</option>
                <option value="3000000">Hasta $ 3.000.000 o más</option>
                <option value="4000000">Hasta $ 4.000.000 o más</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </fieldset>

          <GrupoFiltro
            titulo="Tipo de contrato" Icono={FileText} opciones={contratos}
            seleccionadas={filtros.contratos} alCambiar={alternar('contratos')} contar={contar('contrato')}
          />
        </aside>

        <section className="resultados" aria-live="polite">
          <div className="resultados-barra">
            <span>
              {resultados.length} resultado{resultados.length === 1 ? '' : 's'}
              {nombreCategoria && <> en {nombreCategoria}</>}
            </span>
            <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar por">
              <option value="relevantes">Más relevantes</option>
              <option value="salario">Mayor salario</option>
            </select>
          </div>

          {cargando ? (
            <p className="vacio">Cargando vacantes…</p>
          ) : errorCarga ? (
            <p className="vacio">{errorCarga}</p>
          ) : resultados.length === 0 ? (
            <p className="vacio">
              No encontramos vacantes con esos filtros. Prueba quitar alguno o busca otro cargo.
            </p>
          ) : (
            resultados.map((j) => <JobCard key={j.id} job={j} variante="lista" />)
          )}
        </section>
      </div>
    </div>
  )
}
