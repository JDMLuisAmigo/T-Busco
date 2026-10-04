// Todas las llamadas al backend viven aquí. Si algo de la API cambia
// (la URL, el nombre de una ruta), solo se toca este archivo.

// .replace(/\/+$/, '') quita cualquier barra final, sin importar si
// NEXT_PUBLIC_API_URL se escribió con ella o sin ella en Vercel.
// Sin esto, una URL con barra final produce rutas con "//" duplicada
// (ej. ".../railway.app//auth/registro"), que el backend no reconoce.
const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
const CLAVE_TOKEN = 'tbusco-token'

// ... el resto de lib/api.js sigue exactamente igual a como lo tenías,
// esta es la ÚNICA línea que cambia (la constante BASE, al principio del archivo) ...
