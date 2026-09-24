import Head from 'next/head'
import Navbar from '../components/Navbar'

// En el Pages Router, los CSS globales SOLO se pueden importar aquí
import '../styles/globals.css'
import '../styles/components.css'
import '../styles/pages.css'
import '../styles/cv-editor.css'

// _app.js envuelve TODAS las páginas: lo que pongas aquí aparece en todas
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>t-Busco | Tu próximo empleo, más cerca</title>
      </Head>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}
