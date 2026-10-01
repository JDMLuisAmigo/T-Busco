import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'

// Protege una página: si no hay sesión, manda a /login; si hay sesión
// pero el rol no es el requerido, manda al inicio. Se usa igual que
// useAuth(), pero además hace la redirección por ti.
//
// Uso:  const { usuario, cargando } = useRequireRol('reclutador')
//       if (cargando || !usuario) return <p>Cargando…</p>
export function useRequireRol(rolRequerido) {
  const router = useRouter()
  const { usuario, cargando } = useAuth()

  useEffect(() => {
    if (cargando) return
    if (!usuario) { router.replace('/login'); return }
    if (rolRequerido && usuario.rol !== rolRequerido) router.replace('/')
  }, [cargando, usuario, rolRequerido, router])

  // Mientras cargando sea true, o si el rol no coincide, el llamador no
  // debe mostrar el contenido protegido (evita el parpadeo antes de redirigir).
  const autorizado = !cargando && usuario && (!rolRequerido || usuario.rol === rolRequerido)
  return { usuario: autorizado ? usuario : null, cargando: cargando || !autorizado }
}
