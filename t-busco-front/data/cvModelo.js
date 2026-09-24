// MODELO DE DATOS DE LA HOJA DE VIDA
// Todo el CV vive en UN solo objeto. El formulario lo edita y la hoja lo lee.
// Cuando tengas backend, este mismo objeto es el que enviarás (JSON) a tu API.

// Genera un identificador corto para cada elemento de una lista (experiencia, cursos...)
export const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const niveles = [
  { valor: 'basico', etiqueta: 'Básico (A1-A2)', porcentaje: 30 },
  { valor: 'intermedio', etiqueta: 'Intermedio (B1-B2)', porcentaje: 60 },
  { valor: 'avanzado', etiqueta: 'Avanzado (C1-C2)', porcentaje: 85 },
  { valor: 'nativo', etiqueta: 'Nativo', porcentaje: 100 },
]

export const estadosCiviles = ['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a']

// "Fábricas" de elementos vacíos: cada vez que pulsas "Agregar" se crea uno nuevo
export const vacioExperiencia = () => ({ id: nuevoId(), cargo: '', empresa: '', desde: '', hasta: '', actual: false, logros: '' })
export const vacioFormacion = () => ({ id: nuevoId(), titulo: '', lugar: '', desde: '', hasta: '', archivo: null })
export const vacioCurso = () => ({ id: nuevoId(), nombre: '', institucion: '', anio: '', archivo: null })
export const vacioIdioma = () => ({ id: nuevoId(), nombre: '', nivel: 'intermedio' })
export const vacioReferencia = () => ({ id: nuevoId(), nombre: '', rol: '', lugar: '', telefono: '' })

export const cvVacio = () => ({
  foto: null, // { nombre, tamano, tipo, url, file }
  nombre: '',
  cargo: '',
  perfil: '',
  telefono: '',
  correo: '',
  ciudad: '',
  linkedin: '',
  fechaNacimiento: '', // formato AAAA-MM-DD (así lo entrega <input type="date">)
  estadoCivil: '',
  cedula: '',
  nacionalidad: '',
  habilidades: [],
  idiomas: [],
  experiencia: [],
  formacion: [],
  cursos: [],
  referencias: [],
})

// CV de ejemplo (el del mockup) para probar rápido con el botón "Cargar ejemplo"
export const cvEjemplo = () => ({
  ...cvVacio(),
  nombre: 'Juan David Morales',
  cargo: 'Ingeniero de Sistemas',
  perfil:
    'Apasionado por la tecnología, la innovación y el trabajo en equipo. Busco aportar mis habilidades y conocimientos para crecer profesionalmente y generar un impacto positivo en la organización.',
  telefono: '+57 300 123 4567',
  correo: 'juandavid.morales@gmail.com',
  ciudad: 'Medellín, Antioquia',
  linkedin: 'linkedin.com/in/juandavidmorales',
  fechaNacimiento: '1998-05-12',
  estadoCivil: 'Soltero/a',
  cedula: '1.234.567.890',
  nacionalidad: 'Colombiano',
  habilidades: [
    'Trabajo en equipo',
    'Resolución de problemas',
    'Pensamiento analítico',
    'Comunicación efectiva',
    'Manejo de herramientas digitales',
    'Adaptabilidad',
  ],
  idiomas: [
    { id: nuevoId(), nombre: 'Español', nivel: 'nativo' },
    { id: nuevoId(), nombre: 'Inglés', nivel: 'intermedio' },
  ],
  experiencia: [
    {
      id: nuevoId(), cargo: 'Desarrollador de Software', empresa: 'TechSolutions S.A.S.',
      desde: '2022', hasta: '', actual: true,
      logros: 'Desarrollo y mantenimiento de aplicaciones web.\nTrabajo en equipo con el área de diseño y producto.\nImplementación de mejoras en el rendimiento del sistema.',
    },
    {
      id: nuevoId(), cargo: 'Practicante de Sistemas', empresa: 'Innovar S.A.',
      desde: '2021', hasta: '2022', actual: false,
      logros: 'Soporte técnico a usuarios.\nGestión de bases de datos.\nDocumentación de procesos y manuales.',
    },
  ],
  formacion: [
    { id: nuevoId(), titulo: 'Ingeniería de Sistemas', lugar: 'Universidad Nacional de Colombia', desde: '2016', hasta: '2021', archivo: null },
    { id: nuevoId(), titulo: 'Bachiller Académico', lugar: 'Colegio San José', desde: '2010', hasta: '2015', archivo: null },
  ],
  cursos: [
    { id: nuevoId(), nombre: 'Desarrollo Web Full Stack', institucion: 'Platzi', anio: '2023', archivo: null },
    { id: nuevoId(), nombre: 'Bases de Datos SQL', institucion: 'Coursera', anio: '2022', archivo: null },
    { id: nuevoId(), nombre: 'Introducción a la Inteligencia Artificial', institucion: 'Google', anio: '2022', archivo: null },
  ],
  referencias: [
    { id: nuevoId(), nombre: 'Laura Gómez', rol: 'Jefe Inmediato', lugar: 'TechSolutions S.A.S.', telefono: '+57 300 987 6543' },
    { id: nuevoId(), nombre: 'Carlos Rojas', rol: 'Docente Universitario', lugar: 'Universidad Nacional de Colombia', telefono: '+57 310 456 7890' },
  ],
})
