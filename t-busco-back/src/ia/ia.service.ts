import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

// El nombre exacto del modelo de Gemini cambia seguido (en octubre de 2026
// conviven gemini-2.5-flash, 3-flash-preview, 3.5/3.7/3.8-flash...). Por eso
// queda en una variable de entorno con un valor por defecto razonable, en
// vez de un nombre fijo en el código. Revisa cuál está vigente (y cuál sigue
// en el nivel gratuito) en https://ai.google.dev/gemini-api/docs/models
// antes de desplegar.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type Sugerencia = { id: string; razon: string };

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

    const esquema = {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, razon: { type: 'STRING' } },
        required: ['id', 'razon'],
      },
    };

    const resultado = await this.llamarGemini(prompt, esquema);
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

    const esquema = {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, razon: { type: 'STRING' } },
        required: ['id', 'razon'],
      },
    };

    const resultado = await this.llamarGemini(prompt, esquema);
    const idsValidos = new Set(candidatos.map((c) => c.aspiranteId));
    return resultado.filter((r) => idsValidos.has(r.id));
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

  // Llama a Gemini pidiendo una respuesta en JSON con una forma fija
  // (responseSchema), para no tener que "adivinar" el formato del texto
  // que devuelve el modelo.
  private async llamarGemini(prompt: string, esquema: any): Promise<Sugerencia[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('La recomendación con IA no está configurada (falta GEMINI_API_KEY).');
    }

    let respuesta: Response;
    try {
      respuesta = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: esquema },
        }),
      });
    } catch (err) {
      this.logger.error('No se pudo contactar a Gemini', err as Error);
      throw new ServiceUnavailableException('No se pudo contactar al servicio de IA. Intenta de nuevo más tarde.');
    }

    if (!respuesta.ok) {
      this.logger.error(`Gemini respondió ${respuesta.status}: ${await respuesta.text()}`);
      throw new ServiceUnavailableException('El servicio de IA no respondió correctamente. Intenta de nuevo más tarde.');
    }

    const datos = await respuesta.json();
    const texto = datos?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) return [];

    try {
      const analizado = JSON.parse(texto);
      return Array.isArray(analizado) ? analizado : [];
    } catch (err) {
      // Esto NO debería pasar gracias a responseSchema, pero si el modelo
      // devuelve algo inesperado, mejor mostrar "sin sugerencias" que romper la página.
      this.logger.error('La respuesta de Gemini no fue JSON válido', err as Error);
      return [];
    }
  }
}
