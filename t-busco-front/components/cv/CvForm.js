import { User, Phone, Briefcase, GraduationCap, Award, Settings, Globe, Users, Plus, Trash2 } from 'lucide-react'
import Campo from './Campo'
import AdjuntoArchivo from './AdjuntoArchivo'
import CampoEtiquetas from './CampoEtiquetas'
import {
  niveles, estadosCiviles,
  vacioExperiencia, vacioFormacion, vacioCurso, vacioIdioma, vacioReferencia,
} from '../../data/cvModelo'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_TELEFONO = /^\+?[\d\s-]{7,}$/
const soloAnio = (v) => v.replace(/\D/g, '').slice(0, 4) // deja solo dígitos, máximo 4
const errorAnio = (v) => (v && v.length !== 4 ? 'Usa 4 dígitos, por ejemplo 2022' : '')

// ---------- Piezas reutilizables dentro del formulario ----------

// Sección plegable (usa <details>, que ya viene con el navegador: no necesita JavaScript)
function Bloque({ Icono, titulo, abierto = false, children }) {
  return (
    <details className="bloque" open={abierto}>
      <summary><Icono size={18} aria-hidden="true" /> {titulo}</summary>
      <div className="bloque-cuerpo">{children}</div>
    </details>
  )
}

// Un elemento de una lista (ej: "Experiencia 2") con su botón Quitar
function ItemRepetible({ nombre, numero, alQuitar, children }) {
  return (
    <div className="item-form">
      <div className="item-cabecera">
        <strong>{nombre} {numero}</strong>
        <button
          type="button"
          className="boton-peligro"
          onClick={alQuitar}
          aria-label={`Quitar ${nombre} ${numero}`}
        >
          <Trash2 size={14} aria-hidden="true" /> Quitar
        </button>
      </div>
      {children}
    </div>
  )
}

function BotonAgregar({ alClic, children }) {
  return (
    <button type="button" className="boton-agregar" onClick={alClic}>
      <Plus size={16} aria-hidden="true" /> {children}
    </button>
  )
}

function CampoAnio({ etiqueta, valor, alCambiar, deshabilitado = false }) {
  const error = errorAnio(valor)
  return (
    <Campo etiqueta={etiqueta} error={error}>
      <input
        type="text"
        inputMode="numeric"
        placeholder="2022"
        value={valor}
        disabled={deshabilitado}
        aria-invalid={Boolean(error)}
        onChange={(e) => alCambiar(soloAnio(e.target.value))}
      />
    </Campo>
  )
}

// ---------- Formulario ----------
// Este componente NO guarda datos: recibe el CV y funciones para modificarlo.
//   actualizar(campo, valor)          -> cambia un campo simple (nombre, correo...)
//   agregar(lista, fabrica)           -> añade un elemento a una lista
//   quitar(lista, id)                 -> elimina un elemento de una lista
//   editar(lista, id, campo, valor)   -> cambia un campo de un elemento de una lista
export default function CvForm({ cv, actualizar, agregar, quitar, editar }) {
  const errorCorreo =
    cv.correo && !REGEX_CORREO.test(cv.correo.trim()) ? 'Escribe un correo válido, ej: nombre@correo.com' : ''
  const errorTelefono =
    cv.telefono && !REGEX_TELEFONO.test(cv.telefono.trim()) ? 'Escribe un teléfono válido, ej: +57 300 123 4567' : ''

  const campoTexto = (campo, extra = {}) => ({
    type: 'text',
    value: cv[campo],
    onChange: (e) => actualizar(campo, e.target.value),
    ...extra,
  })

  return (
    <div className="formulario-cv">
      <Bloque Icono={User} titulo="Datos básicos" abierto>
        <div>
          <p className="campo-etiqueta">Foto (opcional)</p>
          <AdjuntoArchivo
            etiqueta="foto"
            tipos={['image/jpeg', 'image/png']}
            maxMb={2}
            archivo={cv.foto}
            alCambiar={(archivo) => actualizar('foto', archivo)}
          />
        </div>
        <div className="rejilla-campos">
          <Campo etiqueta="Nombre completo *" ancho="completo">
            <input {...campoTexto('nombre', { autoComplete: 'name', maxLength: 80, placeholder: 'Ej: Juan David Morales' })} />
          </Campo>
          <Campo etiqueta="Cargo o profesión" ancho="completo">
            <input {...campoTexto('cargo', { maxLength: 80, placeholder: 'Ej: Ingeniero de Sistemas' })} />
          </Campo>
          <Campo etiqueta="Perfil profesional" ancho="completo" ayuda={`${cv.perfil.length}/500 caracteres`}>
            <textarea
              rows={4}
              maxLength={500}
              value={cv.perfil}
              onChange={(e) => actualizar('perfil', e.target.value)}
              placeholder="Cuéntale al reclutador quién eres y qué buscas."
            />
          </Campo>
        </div>
      </Bloque>

      <Bloque Icono={Phone} titulo="Contacto" abierto>
        <div className="rejilla-campos">
          <Campo etiqueta="Teléfono" error={errorTelefono}>
            <input {...campoTexto('telefono', { type: 'tel', autoComplete: 'tel', 'aria-invalid': Boolean(errorTelefono) })} />
          </Campo>
          <Campo etiqueta="Correo electrónico *" error={errorCorreo}>
            <input {...campoTexto('correo', { type: 'email', autoComplete: 'email', 'aria-invalid': Boolean(errorCorreo) })} />
          </Campo>
          <Campo etiqueta="Ciudad">
            <input {...campoTexto('ciudad', { placeholder: 'Ej: Medellín, Antioquia' })} />
          </Campo>
          <Campo etiqueta="LinkedIn (opcional)">
            <input {...campoTexto('linkedin', { placeholder: 'linkedin.com/in/tu-usuario' })} />
          </Campo>
        </div>
      </Bloque>

      <Bloque Icono={User} titulo="Información personal">
        <p className="nota">Todo es opcional. Comparte solo lo que quieras que vea el reclutador.</p>
        <div className="rejilla-campos">
          <Campo etiqueta="Fecha de nacimiento">
            <input
              type="date"
              value={cv.fechaNacimiento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => actualizar('fechaNacimiento', e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Estado civil">
            <select value={cv.estadoCivil} onChange={(e) => actualizar('estadoCivil', e.target.value)}>
              <option value="">Selecciona</option>
              {estadosCiviles.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Cédula">
            <input {...campoTexto('cedula', { inputMode: 'numeric', maxLength: 15 })} />
          </Campo>
          <Campo etiqueta="Nacionalidad">
            <input {...campoTexto('nacionalidad', { placeholder: 'Ej: Colombiano' })} />
          </Campo>
        </div>
      </Bloque>

      <Bloque Icono={Briefcase} titulo="Experiencia laboral">
        {cv.experiencia.map((e, i) => (
          <ItemRepetible key={e.id} nombre="Experiencia" numero={i + 1} alQuitar={() => quitar('experiencia', e.id)}>
            <div className="rejilla-campos">
              <Campo etiqueta="Cargo">
                <input type="text" value={e.cargo} onChange={(ev) => editar('experiencia', e.id, 'cargo', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Empresa">
                <input type="text" value={e.empresa} onChange={(ev) => editar('experiencia', e.id, 'empresa', ev.target.value)} />
              </Campo>
              <CampoAnio etiqueta="Año de inicio" valor={e.desde} alCambiar={(v) => editar('experiencia', e.id, 'desde', v)} />
              <CampoAnio
                etiqueta="Año de fin"
                valor={e.hasta}
                deshabilitado={e.actual}
                alCambiar={(v) => editar('experiencia', e.id, 'hasta', v)}
              />
              <label className="check campo-completo">
                <input
                  type="checkbox"
                  checked={e.actual}
                  onChange={(ev) => editar('experiencia', e.id, 'actual', ev.target.checked)}
                />
                Trabajo aquí actualmente
              </label>
              <Campo etiqueta="Funciones y logros" ancho="completo" ayuda="Escribe uno por línea (Enter para separar).">
                <textarea
                  rows={4}
                  value={e.logros}
                  onChange={(ev) => editar('experiencia', e.id, 'logros', ev.target.value)}
                />
              </Campo>
            </div>
          </ItemRepetible>
        ))}
        <BotonAgregar alClic={() => agregar('experiencia', vacioExperiencia)}>Agregar experiencia</BotonAgregar>
      </Bloque>

      <Bloque Icono={GraduationCap} titulo="Formación académica">
        {cv.formacion.map((f, i) => (
          <ItemRepetible key={f.id} nombre="Estudio" numero={i + 1} alQuitar={() => quitar('formacion', f.id)}>
            <div className="rejilla-campos">
              <Campo etiqueta="Título o programa">
                <input type="text" value={f.titulo} onChange={(ev) => editar('formacion', f.id, 'titulo', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Institución">
                <input type="text" value={f.lugar} onChange={(ev) => editar('formacion', f.id, 'lugar', ev.target.value)} />
              </Campo>
              <CampoAnio etiqueta="Año de inicio" valor={f.desde} alCambiar={(v) => editar('formacion', f.id, 'desde', v)} />
              <CampoAnio etiqueta="Año de fin" valor={f.hasta} alCambiar={(v) => editar('formacion', f.id, 'hasta', v)} />
            </div>
            <AdjuntoArchivo
              etiqueta="diploma"
              archivo={f.archivo}
              alCambiar={(archivo) => editar('formacion', f.id, 'archivo', archivo)}
            />
          </ItemRepetible>
        ))}
        <BotonAgregar alClic={() => agregar('formacion', vacioFormacion)}>Agregar estudio</BotonAgregar>
      </Bloque>

      <Bloque Icono={Award} titulo="Cursos y certificaciones">
        {cv.cursos.map((c, i) => (
          <ItemRepetible key={c.id} nombre="Curso" numero={i + 1} alQuitar={() => quitar('cursos', c.id)}>
            <div className="rejilla-campos">
              <Campo etiqueta="Nombre del curso" ancho="completo">
                <input type="text" value={c.nombre} onChange={(ev) => editar('cursos', c.id, 'nombre', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Institución">
                <input type="text" value={c.institucion} onChange={(ev) => editar('cursos', c.id, 'institucion', ev.target.value)} />
              </Campo>
              <CampoAnio etiqueta="Año" valor={c.anio} alCambiar={(v) => editar('cursos', c.id, 'anio', v)} />
            </div>
            <AdjuntoArchivo
              etiqueta="certificado"
              archivo={c.archivo}
              alCambiar={(archivo) => editar('cursos', c.id, 'archivo', archivo)}
            />
          </ItemRepetible>
        ))}
        <BotonAgregar alClic={() => agregar('cursos', vacioCurso)}>Agregar curso</BotonAgregar>
      </Bloque>

      <Bloque Icono={Settings} titulo="Habilidades">
        <CampoEtiquetas
          etiqueta="Escribe una habilidad y pulsa Enter"
          placeholder="Ej: Trabajo en equipo"
          valores={cv.habilidades}
          alCambiar={(valores) => actualizar('habilidades', valores)}
        />
      </Bloque>

      <Bloque Icono={Globe} titulo="Idiomas">
        {cv.idiomas.map((i, n) => (
          <ItemRepetible key={i.id} nombre="Idioma" numero={n + 1} alQuitar={() => quitar('idiomas', i.id)}>
            <div className="rejilla-campos">
              <Campo etiqueta="Idioma">
                <input type="text" value={i.nombre} onChange={(ev) => editar('idiomas', i.id, 'nombre', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Nivel">
                <select value={i.nivel} onChange={(ev) => editar('idiomas', i.id, 'nivel', ev.target.value)}>
                  {niveles.map((nv) => <option key={nv.valor} value={nv.valor}>{nv.etiqueta}</option>)}
                </select>
              </Campo>
            </div>
          </ItemRepetible>
        ))}
        <BotonAgregar alClic={() => agregar('idiomas', vacioIdioma)}>Agregar idioma</BotonAgregar>
      </Bloque>

      <Bloque Icono={Users} titulo="Referencias">
        {cv.referencias.map((r, i) => (
          <ItemRepetible key={r.id} nombre="Referencia" numero={i + 1} alQuitar={() => quitar('referencias', r.id)}>
            <div className="rejilla-campos">
              <Campo etiqueta="Nombre">
                <input type="text" value={r.nombre} onChange={(ev) => editar('referencias', r.id, 'nombre', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Cargo o relación">
                <input type="text" value={r.rol} onChange={(ev) => editar('referencias', r.id, 'rol', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Empresa o institución">
                <input type="text" value={r.lugar} onChange={(ev) => editar('referencias', r.id, 'lugar', ev.target.value)} />
              </Campo>
              <Campo etiqueta="Teléfono">
                <input type="tel" value={r.telefono} onChange={(ev) => editar('referencias', r.id, 'telefono', ev.target.value)} />
              </Campo>
            </div>
          </ItemRepetible>
        ))}
        <BotonAgregar alClic={() => agregar('referencias', vacioReferencia)}>Agregar referencia</BotonAgregar>
      </Bloque>
    </div>
  )
}
