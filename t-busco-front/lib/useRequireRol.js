import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'

// Exige sesión iniciada Y uno de los roles permitidos. Acepta un solo
// rol ("reclutador") o una lista (["tecnico", "administrador"]) para
// páginas que, como el panel técnico, comparten acceso de lectura con
// más de un rol (igual que ya hace el backend en admin.controller.ts).
// Sin sesión -> /login. Con sesión pero rol no autorizado -> /inicio.
export function useRequireRol(rolesPermitidos) {
  const router = useRouter()
  const { usuario, cargando } = useAuth()
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos]

  useEffect(() => {
    if (cargando) return
    if (!usuario) { router.replace('/login'); return }
    if (!roles.includes(usuario.rol)) { router.replace('/') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, usuario, router, rolesPermitidos])

  const autorizado = !cargando && !!usuario && roles.includes(usuario.rol)
  return { usuario: autorizado ? usuario : null, cargando: cargando || (!!usuario && !autorizado) }
}
