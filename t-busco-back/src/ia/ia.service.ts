import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

// Google retira y cambia los modelos de Gemini con frecuencia (gemini-2.5-flash,
// por ejemplo, ya devuelve 404 desde mediados de 2026), y además cada modelo
// tiene su PROPIA cuota gratuita. Por eso el servicio prueba una LISTA de modelos
// en orden: si uno falla (retirado, sin cuota, caído), pasa al siguiente.
//
// GEMINI_MODEL (opcional, separado por comas) pone tus preferidos AL PRINCIPIO,
// pero estos de respaldo siempre quedan detrás, para que un nombre viejo en la
// configuración no deje la función muerta.
// Primero los "Flash-Lite" (mayor cuota gratuita y suficientes para elegir y
// explicar), luego 3.5-flash, y al final el alias "-latest", que Google mantiene
// apuntando al Flash vigente. Revisa los vigentes en:
// https://ai.google.dev/gemini-api/docs/models
const MODELOS_DE_RESPALDO = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

type Sugerencia = { id: string; razon: string };
type Intento =
  | { ok: true; texto: string }
  | { ok: false; estado: number; cuerpo: string; fatal: boolean };

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  async recomendarVacantes(cv: Record<string, any>, vacantes: any[]): Promise<Sugerencia[]> {
    if (vacantes.length === 0) return [];

    const perfil = this.resumirCv(cv);
    const lista = vacantes
      .map((v) => `- id: ${v.id} | ${v.titulo} en ${v.empresa} (${v.ciudad}, ${v.lugar}) | categoría: ${v.categoria} | ${String(v.descripcion || '').slice(0, 200)}`)
      .join('\n');

    const prompt = `Eres un asistente de una bolsa de empleo. A partir del perfil de un aspirante y una lista de vacantes activas, elige como máximo 5 vacantes que mejor encajen con su perfil, ordenadas de mejor a peor ajuste. Para cada una escribe una razón breve (máximo 20 palabras) en español, concreta y basada SOLO en datos del perfil que aparecen abajo (no inventes datos que no estén ahí). Si ninguna encaja razonablemente, devuelve una lista vacía.

Perfil del aspirante:
${perfil}

Vacantes disponibles:
${lista}`;

    const resultado = await this.llamarGemini(prompt, this.esquemaLista());
    const idsValidos = new Set(vacantes.map((v) => v.id));
    return resultado.filter((r) => idsValidos.has(r.id));
  }

  async sugerirCandidatos(vacante: any, candidatos: any[]): Promise<Sugerencia[]> {
    if (candidatos.length === 0) return [];

    const lista = candidatos
      .map((c) => `- id: ${c.aspiranteId} | ${c.nombre} | ${c.cargo || 'sin cargo registrado'} | ${c.ciudad || 'sin ciudad'} | habilidades: ${(c.habilidades || []).join(', ') || 'ninguna registrada'}`)
      .join('\n');

    const prompt = `Eres un asistente de reclutamiento. A partir de la descripción de una vacante y una lista de candidatos disponibles, elige como máximo 5 candidatos que mejor encajen, ordenados de mejor a peor ajuste. Para cada uno escribe una razón breve (máximo 20 palabras) en español, concreta y basada SOLO en los datos del candidato que aparecen abajo (no inventes datos que no estén ahí). Si ninguno encaja razonablemente, devuelve una lista vacía.

Vacante:
${vacante.titulo} en ${vacante.empresa} (${vacante.categoria}, ${vacante.ciudad})
Requisitos: ${(vacante.requisitos || []).join('; ') || 'no especificados'}
Descripción: ${vacante.descripcion}

Candidatos disponibles:
${lista}`;

    const resultado = await this.llamarGemini(prompt, this.esquemaLista());
    const idsValidos = new Set(candidatos.map((c) => c.aspiranteId));
    return resultado.filter((r) => idsValidos.has(r.id));
  }

  private esquemaLista() {
    return {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, razon: { type: 'STRING' } },
        required: ['id', 'razon'],
      },
    };
  }

  private resumirCv(cv: Record<string, any>) {
    const partes = [
      `Nombre: ${cv.nombre || ''}`,
      cv.cargo && `Cargo actual/deseado: ${cv.cargo}`,
      cv.ciudad && `Ciudad: ${cv.ciudad}`,
      cv.perfil && `Perfil: ${cv.perfil}`,
      Array.isArray(cv.habilidades) && cv.habilidades.length > 0 && `Habilidades: ${cv.habilidades.join(', ')}`,
      Array.isArray(cv.experiencia) && cv.experiencia.length > 0
        && `Experiencia: ${cv.experiencia.map((e: any) => `${e.cargo} en ${e.empresa}`).join('; ')}`,
      Array.isArray(cv.formacion) && cv.formacion.length > 0
        && `Formación: ${cv.formacion.map((f: any) => f.titulo).join('; ')}`,
    ].filter(Boolean);
    return partes.join('\n');
  }

  // Los configurados primero, luego los de respaldo, sin repetir.
  private modelos(): string[] {
    const configurados = (process.env.GEMINI_MODEL || '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const todos = [...configurados, ...MODELOS_DE_RESPALDO];
    return todos.filter((m, i) => todos.indexOf(m) === i);
  }

  // Prueba los modelos en orden hasta que uno responda. Un error de la CLAVE
  // (inválida o sin permiso) corta de inmediato: otro modelo no lo arreglaría.
  // Cualquier otro (404 retirado, 429 sin cuota, 5xx, tiempo agotado) pasa al siguiente.
  private async llamarGemini(prompt: string, esquema: any): Promise<Sugerencia[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('La recomendación con IA no está configurada (falta GEMINI_API_KEY).');
    }

    let ultimoEstado = 0;
    for (const modelo of this.modelos()) {
      let intento = await this.pedir(modelo, apiKey, prompt, esquema);

      // Un 400 que no es por la clave suele ser que ese modelo no acepta el
      // esquema estricto: se reintenta el MISMO modelo pidiendo JSON "a secas".
      if (!intento.ok && intento.estado === 400 && !intento.fatal) {
        this.logger.warn(`Gemini (${modelo}) respondió 400; reintentando sin esquema estricto.`);
        intento = await this.pedir(modelo, apiKey, prompt, null);
      }

      if (intento.ok) return this.leerLista(intento.texto);

      ultimoEstado = intento.estado;
      this.logger.error(`Gemini (${modelo}) respondió ${intento.estado}: ${intento.cuerpo.slice(0, 300)}`);
      if (intento.fatal) break;
    }

    const codigo = ultimoEstado ? ` (código ${ultimoEstado})` : '';
    throw new ServiceUnavailableException(`El servicio de IA no respondió correctamente${codigo}. Intenta de nuevo más tarde.`);
  }

  private async pedir(modelo: string, apiKey: string, prompt: string, esquema: any | null): Promise<Intento> {
    const textoPrompt = esquema
      ? prompt
      : `${prompt}\n\nResponde ÚNICAMENTE con un arreglo JSON válido de objetos {"id": "...", "razon": "..."}, sin texto adicional.`;

    // El tiempo máximo se maneja a mano (AbortController) para no depender de
    // versiones recientes de los tipos de Node. Configurable con GEMINI_TIMEOUT_MS.
    const tiempoMaximo = Number(process.env.GEMINI_TIMEOUT_MS) || 20000;
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), tiempoMaximo);

    try {
      const respuesta = await fetch(`${URL_BASE}/${modelo}:generateContent`, {
        method: 'POST',
        // La clave va en un encabezado, no en la URL, para que nunca quede en logs.
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textoPrompt }] }],
          generationConfig: esquema ? { responseMimeType: 'application/json', responseSchema: esquema } : {},
        }),
        signal: controlador.signal,
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.text().catch(() => '');
        const claveInvalida =
          respuesta.status === 401 || respuesta.status === 403 || /API_KEY_INVALID|API key not valid/i.test(cuerpo);
        return { ok: false, estado: respuesta.status, cuerpo, fatal: claveInvalida };
      }

      const datos: any = await respuesta.json().catch(() => null);
      const partes: any[] = datos?.candidates?.[0]?.content?.parts ?? [];
      const texto = partes.map((p) => p?.text).filter(Boolean).join('');
      return { ok: true, texto };
    } catch (err) {
      return { ok: false, estado: 0, cuerpo: String(err), fatal: false };
    } finally {
      clearTimeout(temporizador);
    }
  }

  // Lee la lista aunque el modelo haya envuelto el JSON en ```json ... ``` o
  // agregado texto alrededor. Si no se puede leer, devuelve [] (sin sugerencias)
  // en vez de romper la página.
  private leerLista(texto: string): Sugerencia[] {
    if (!texto) return [];
    try {
      const limpio = texto.trim();
      const inicio = limpio.indexOf('[');
      const fin = limpio.lastIndexOf(']');
      const json = inicio !== -1 && fin > inicio ? limpio.slice(inicio, fin + 1) : limpio;
      const analizado = JSON.parse(json);
      if (!Array.isArray(analizado)) return [];
      return analizado.filter((x) => x && typeof x.id === 'string' && typeof x.razon === 'string');
    } catch (err) {
      this.logger.error('La respuesta de Gemini no fue JSON legible', String(err));
      return [];
    }
  }
}
