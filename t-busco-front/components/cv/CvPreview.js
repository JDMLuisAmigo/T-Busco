import { Fragment } from 'react'
import { Phone, Mail, MapPin, Link2, User, Settings, Globe, Briefcase, GraduationCap, Award, Users, Paperclip } from 'lucide-react'
import { niveles } from '../../data/cvModelo'

// ---------- Funciones auxiliares ----------

// "2022" + "" + actual=true  ->  "2022 – Actualidad"
const periodo = (desde, hasta, actual) => {
  const fin = actual ? 'Actualidad' : hasta
  return desde && fin ? `${desde} – ${fin}` : desde || fin || ''
}

// "1998-05-12" -> "12/05/1998"
const fechaLegible = (iso) => {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// Deja cortar líneas largas (correos, enlaces) DESPUÉS de @ o / en vez de a mitad de palabra.
// <wbr /> es una "oportunidad de salto" invisible: no altera el texto al copiarlo.
const conCortes = (texto) => {
  const partes = texto.match(/[^@/]+[@/]?|[@/]/g) || [texto]
  return partes.map((parte, i) => (
    <Fragment key={i}>{parte}{i < partes.length - 1 && <wbr />}</Fragment>
  ))
}

const lineas = (texto) => texto.split('\n').map((l) => l.trim()).filter(Boolean)

// Título de sección con círculo azul e icono
function Seccion({ Icono, titulo, children }) {
  return (
    <section className="cv-seccion">
      <h2><span className="cv-icono"><Icono size={18} /></span> {titulo}</h2>
      {children}
    </section>
  )
}

// Enlace "Ver documento" cuando el usuario adjuntó un diploma o certificado
function Adjunto({ archivo }) {
  if (!archivo) return null
  return (
    <a href={archivo.url} target="_blank" rel="noreferrer" className="cv-adjunto">
      <Paperclip size={12} aria-hidden="true" /> Ver documento
    </a>
  )
}

// ---------- La hoja de vida ----------
// Solo LEE el objeto cv. Cada sección aparece únicamente si tiene contenido.
export default function CvPreview({ cv }) {
  const nombre = cv.nombre.trim()

  const contacto = [
    [Phone, cv.telefono],
    [Mail, cv.correo],
    [MapPin, cv.ciudad],
    [Link2, cv.linkedin],
  ].filter(([, valor]) => valor.trim())

  const personal = [
    ['Fecha de nacimiento:', fechaLegible(cv.fechaNacimiento)],
    ['Estado civil:', cv.estadoCivil],
    ['Cédula:', cv.cedula],
    ['Nacionalidad:', cv.nacionalidad],
  ].filter(([, valor]) => valor)

  const idiomas = cv.idiomas.filter((i) => i.nombre.trim())
  const experiencia = cv.experiencia.filter((e) => e.cargo.trim() || e.empresa.trim())
  const formacion = cv.formacion.filter((f) => f.titulo.trim() || f.lugar.trim())
  const cursos = cv.cursos.filter((c) => c.nombre.trim())
  const referencias = cv.referencias.filter((r) => r.nombre.trim())

  const estaVacio =
    !nombre && !cv.cargo.trim() && !cv.perfil.trim() && !contacto.length && !personal.length &&
    !cv.habilidades.length && !idiomas.length && !experiencia.length && !formacion.length &&
    !cursos.length && !referencias.length

  return (
    <article className="cv" aria-label="Vista previa de la hoja de vida">
      <aside className="cv-lateral">
        <div className="cv-foto">
          {cv.foto ? (
            <img src={cv.foto.url} alt={`Foto de ${nombre || 'la persona aspirante'}`} />
          ) : (
            <User size={72} aria-hidden="true" />
          )}
        </div>

        {contacto.length > 0 && (
          <Seccion Icono={User} titulo="Contacto">
            <ul className="cv-contacto">
              {contacto.map(([Icono, valor]) => (
                <li key={valor}><Icono size={16} /> <span>{conCortes(valor)}</span></li>
              ))}
            </ul>
          </Seccion>
        )}

        {personal.length > 0 && (
          <Seccion Icono={User} titulo="Información personal">
            <dl className="cv-personal">
              {personal.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </Seccion>
        )}

        {cv.habilidades.length > 0 && (
          <Seccion Icono={Settings} titulo="Habilidades">
            <ul className="cv-lista">{cv.habilidades.map((h) => <li key={h}>{h}</li>)}</ul>
          </Seccion>
        )}

        {idiomas.length > 0 && (
          <Seccion Icono={Globe} titulo="Idiomas">
            {idiomas.map((i) => {
              const nivel = niveles.find((n) => n.valor === i.nivel) || niveles[1]
              return (
                <div key={i.id} className="cv-idioma">
                  <span>{i.nombre}</span>
                  <div className="barra" role="img" aria-label={`${i.nombre}: ${nivel.etiqueta}`}>
                    <div className="barra-relleno" style={{ width: `${nivel.porcentaje}%` }} />
                  </div>
                  <small>{nivel.etiqueta}</small>
                </div>
              )
            })}
          </Seccion>
        )}
      </aside>

      <div className="cv-principal">
        <header>
          <h1 className={nombre ? '' : 'cv-placeholder'}>{nombre || 'Tu nombre'}</h1>
          <p className={`cv-cargo ${cv.cargo.trim() ? '' : 'cv-placeholder'}`}>{cv.cargo.trim() || 'Tu cargo o profesión'}</p>
          {cv.perfil.trim() && <p className="cv-perfil">{cv.perfil}</p>}
        </header>

        {estaVacio && (
          <p className="cv-vacio-msg">Empieza a llenar el formulario y verás tu hoja de vida armarse aquí.</p>
        )}

        {experiencia.length > 0 && (
          <Seccion Icono={Briefcase} titulo="Experiencia laboral">
            {experiencia.map((e) => (
              <div key={e.id} className="cv-item">
                <strong>{[e.cargo.trim(), e.empresa.trim()].filter(Boolean).join(' – ')}</strong>
                {periodo(e.desde, e.hasta, e.actual) && <p>{periodo(e.desde, e.hasta, e.actual)}</p>}
                {lineas(e.logros).length > 0 && (
                  <ul>{lineas(e.logros).map((l, n) => <li key={`${e.id}-${n}`}>{l}</li>)}</ul>
                )}
              </div>
            ))}
          </Seccion>
        )}

        {formacion.length > 0 && (
          <Seccion Icono={GraduationCap} titulo="Formación académica">
            {formacion.map((f) => (
              <div key={f.id} className="cv-item">
                <strong>{f.titulo}</strong>
                {f.lugar && <p>{f.lugar}</p>}
                {periodo(f.desde, f.hasta, false) && <p>{periodo(f.desde, f.hasta, false)}</p>}
                <Adjunto archivo={f.archivo} />
              </div>
            ))}
          </Seccion>
        )}

        {cursos.length > 0 && (
          <Seccion Icono={Award} titulo="Cursos y certificaciones">
            <ul>
              {cursos.map((c) => (
                <li key={c.id}>
                  {[c.nombre.trim(), c.institucion.trim()].filter(Boolean).join(' – ')}
                  {c.anio && ` (${c.anio})`}
                  <Adjunto archivo={c.archivo} />
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        {referencias.length > 0 && (
          <Seccion Icono={Users} titulo="Referencias">
            <div className="cv-referencias">
              {referencias.map((r) => (
                <div key={r.id}>
                  <strong>{r.nombre}</strong>
                  {r.rol && <p>{r.rol}</p>}
                  {r.lugar && <p>{r.lugar}</p>}
                  {r.telefono && <p>{r.telefono}</p>}
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {!estaVacio && <p className="cv-firma" aria-hidden="true">¡Gracias por su tiempo!</p>}
      </div>
    </article>
  )
}
