// Todas las llamadas al backend viven aquí. Si algo de la API cambia
// (la URL, el nombre de una ruta), solo se toca este archivo.

// .replace(/\/+$/, '') quita cualquier barra final, sin importar si
// NEXT_PUBLIC_API_URL se escribió con ella o sin ella en Vercel.
// Sin esto, una URL con barra final produce rutas con "//" duplicada.
const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
const CLAVE_TOKEN = 'tbusco-token'

const leerToken = () => {
  try { return localStorage.getItem(CLAVE_TOKEN) } catch { return null }
}
const encabezadosAutenticados = () => {
  const token = leerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function leerRespuesta(res, mensajePorDefecto) {
  if (res.ok) return res.json()
  const cuerpo = await res.json().catch(() => null)
  const mensaje = Array.isArray(cuerpo?.message) ? cuerpo.message.join(' ') : cuerpo?.message
  throw new Error(mensaje || mensajePorDefecto)
}

// ---------------- Autenticación ----------------

export async function registrarse({ nombre, correo, contrasena, rol }) {
  const res = await fetch(`${BASE}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena, rol }),
  })
  return leerRespuesta(res, 'No se pudo crear la cuenta.')
}

export async function iniciarSesion({ correo, contrasena }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  })
  return leerRespuesta(res, 'No se pudo iniciar sesión.')
}

// ---------------- Hoja de vida ----------------

export async function obtenerCv() {
  const res = await fetch(`${BASE}/cv`, { headers: encabezadosAutenticados() })
  if (!res.ok) throw new Error('No se pudo obtener la hoja de vida del servidor.')
  const datos = await res.json()
  return Object.keys(datos).length ? datos : null
}

export async function guardarCv(datos) {
  const res = await fetch(`${BASE}/cv`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error('No se pudo guardar la hoja de vida en el servidor.')
  return res.json()
}

export async function subirArchivo(file) {
  const form = new FormData()
  form.append('archivo', file)
  const res = await fetch(`${BASE}/cv/archivos`, { method: 'POST', headers: encabezadosAutenticados(), body: form })
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null)
    throw new Error(cuerpo?.message || 'No se pudo subir el archivo.')
  }
  return res.json()
}

export function urlArchivo(ruta) {
  if (!ruta) return ''
  if (ruta.startsWith('blob:') || ruta.startsWith('http')) return ruta
  return `${BASE}${ruta}`
}

// ---------------- Vacantes ----------------

export async function listarVacantesPublicas() {
  const res = await fetch(`${BASE}/vacantes`)
  if (!res.ok) throw new Error('No se pudieron cargar las vacantes.')
  return res.json()
}

export async function obtenerVacante(id) {
  const res = await fetch(`${BASE}/vacantes/${id}`)
  if (!res.ok) throw new Error('Esta vacante no existe.')
  return res.json()
}

export async function misVacantes() {
  const res = await fetch(`${BASE}/vacantes/mias`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener tus vacantes.')
}

export async function crearVacante(datos) {
  const res = await fetch(`${BASE}/vacantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify(datos),
  })
  return leerRespuesta(res, 'No se pudo publicar la vacante.')
}

export async function actualizarVacante(id, datos) {
  const res = await fetch(`${BASE}/vacantes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify(datos),
  })
  return leerRespuesta(res, 'No se pudo actualizar la vacante.')
}

export async function alternarEstadoVacante(id) {
  const res = await fetch(`${BASE}/vacantes/${id}/estado`, { method: 'PUT', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo cambiar el estado de la vacante.')
}

export async function eliminarVacante(id) {
  const res = await fetch(`${BASE}/vacantes/${id}`, { method: 'DELETE', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo eliminar la vacante.')
}

// ---------------- Postulaciones ----------------

export async function postularA(vacanteId) {
  const res = await fetch(`${BASE}/postulaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify({ vacanteId }),
  })
  return leerRespuesta(res, 'No se pudo enviar tu postulación.')
}

export async function misPostulaciones() {
  const res = await fetch(`${BASE}/postulaciones/mias`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener tus postulaciones.')
}

export async function postulacionesDeVacante(vacanteId) {
  const res = await fetch(`${BASE}/postulaciones/vacante/${vacanteId}`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener los candidatos.')
}

export async function actualizarPostulacion(id, datos) {
  const res = await fetch(`${BASE}/postulaciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify(datos),
  })
  return leerRespuesta(res, 'No se pudo actualizar la postulación.')
}

// ---------------- Notificaciones ----------------

export async function listarNotificaciones() {
  const res = await fetch(`${BASE}/notificaciones`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener tus notificaciones.')
}

export async function marcarNotificacionLeida(id) {
  const res = await fetch(`${BASE}/notificaciones/${id}/leida`, { method: 'PUT', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo marcar como leída.')
}

export async function marcarTodasNotificacionesLeidas() {
  const res = await fetch(`${BASE}/notificaciones/leer-todas`, { method: 'PUT', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo marcar todas como leídas.')
}

// ---------------- Administración ----------------

export async function obtenerResumenAdmin() {
  const res = await fetch(`${BASE}/admin/resumen`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo obtener el resumen.')
}

export async function listarUsuariosAdmin() {
  const res = await fetch(`${BASE}/admin/usuarios`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener los usuarios.')
}

export async function cambiarRolUsuario(id, rol) {
  const res = await fetch(`${BASE}/admin/usuarios/${id}/rol`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...encabezadosAutenticados() },
    body: JSON.stringify({ rol }),
  })
  return leerRespuesta(res, 'No se pudo cambiar el rol.')
}

export async function alternarActivoUsuario(id) {
  const res = await fetch(`${BASE}/admin/usuarios/${id}/estado`, { method: 'PUT', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo cambiar el estado del usuario.')
}

export async function listarVacantesAdmin() {
  const res = await fetch(`${BASE}/admin/vacantes`, { headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudieron obtener las vacantes.')
}

export async function alternarEstadoVacanteAdmin(id) {
  const res = await fetch(`${BASE}/admin/vacantes/${id}/estado`, { method: 'PUT', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo cambiar el estado de la vacante.')
}

export async function eliminarVacanteAdmin(id) {
  const res = await fetch(`${BASE}/admin/vacantes/${id}`, { method: 'DELETE', headers: encabezadosAutenticados() })
  return leerRespuesta(res, 'No se pudo eliminar la vacante.')
}
