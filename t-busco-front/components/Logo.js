import Link from 'next/link'

// Logotipo de t-Busco: texto en tipografía Allura con la "B" más grande
export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="t-Busco, ir al inicio">
      t-<span className="logo-b">B</span>usco
    </Link>
  )
}
