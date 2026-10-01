import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useRequireRol } from '../../../lib/useRequireRol'
import VacanteForm from '../../../components/vacantes/VacanteForm'
import { crearVacante } from '../../../lib/api'

export default function NuevaVacante() {
  const router = useRouter()
  const { usuario, cargando } = useRequireRol('reclutador')
  const [enviando, setEnviando] = useState(false)

  if (cargando || !usuario) return <p className="contenedor vacio">Cargando…</p>

  const guardar = async (datos) => {
    setEnviando(true)
    try {
      await crearVacante(datos)
      router.push('/panel/vacantes')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Head><title>Publicar vacante | t-Busco</title></Head>
      <div className="contenedor pagina-panel">
        <h1>Publicar una vacante</h1>
        <VacanteForm alEnviar={guardar} enviando={enviando} textoBoton="Publicar vacante" />
      </div>
    </>
  )
}
