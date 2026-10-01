import Head from 'next/head'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../lib/AuthContext'

// En el Pages Router, los CSS globales SOLO se pueden importar aquí
import '../styles/globals.css'
import '../styles/components.css'
import '../styles/pages.css'
import '../styles/cv-editor.css'
import '../styles/auth.css'
import '../styles/panel.css'

// _app.js envuelve TODAS las páginas: lo que pongas aquí aparece en todas.
// AuthProvider debe ir por fuera de todo lo demás, porque Navbar (y cualquier
// página) necesita poder preguntar "¿hay sesión activa?" con useAuth().
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>t-Busco | Tu próximo empleo, más cerca</title>
      </Head>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  )
}
