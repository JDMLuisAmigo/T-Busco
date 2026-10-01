import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useRequireRol } from '../../../../lib/useRequireRol'
import VacanteForm, { vacanteAFormulario } from '../../../../components/vacantes/VacanteForm'
import { obtenerVacante, actualizarVacante } from '../../../../lib/api'

export default function EditarVacante() {
  const router = useRouter()
  const { id } = router.query
  const { usuario, cargando } = useRequireRol('reclutador')
  const [inicial, setInicial] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario || !id) return
    obtenerVacante(id)
      .then((v) => setInicial(vacanteAFormulario(v)))
      .catch((e) => setError(e.message))
  }, [usuario, id])

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>
  if (error) return <p className="contenedor vacio">{error}</p>
  if (!inicial) return <p className="contenedor vacio">Cargando vacante…</p>

  const guardar = async (datos) => {
    setEnviando(true)
    try {
      await actualizarVacante(id, datos)
      router.push('/panel/vacantes')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Head><title>Editar vacante | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <h1>Editar vacante</h1>
        <VacanteForm inicial={inicial} alEnviar={guardar} enviando={enviando} textoBoton="Guardar cambios" />
      </div>
    </>
  )
}
