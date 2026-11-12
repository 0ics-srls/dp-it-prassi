/** Wire rows (snake case, like the Tool SQL returns them) for the specs. */
export type WireRow = Record<string, unknown>;

export const DOC_ID = '3f2b8c1e-6d3a-4a52-9f0e-1c2d3e4f5a6b';

/** One row of `lookup`; `total` is the size of the filtered set, repeated on every row. */
export function lookupWire(over: WireRow = {}): WireRow {
  return {
    id: DOC_ID,
    ente: 'Agenzia delle Entrate',
    tipo: 'circolare',
    numero: '10',
    anno: 2025,
    data: '2025-07-04',
    oggetto: 'Chiarimenti in materia di fringe benefit',
    source_url: 'https://www.agenziaentrate.gov.it/portale/circolare-n-10-del-2025',
    fonte: 'ade-portale',
    total: 3,
    ...over,
  };
}

/** One row of `search`. */
export function searchWire(over: WireRow = {}): WireRow {
  return {
    id: DOC_ID,
    tipo: 'circolare',
    numero: '10',
    anno: 2025,
    data: '2025-07-04',
    ente: 'Agenzia delle Entrate',
    oggetto: 'Chiarimenti in materia di fringe benefit',
    headline: 'Il valore dei «fringe benefit» concessi ai dipendenti',
    snippet: 'I fringe benefit concessi ai dipendenti concorrono al reddito.',
    source_url: 'https://www.agenziaentrate.gov.it/portale/circolare-n-10-del-2025',
    position: 1,
    ...over,
  };
}

export const WARNING_ENVELOPE = (data: readonly WireRow[]): { data: readonly WireRow[]; warnings: readonly { code: string; message: string }[] } => ({
  data,
  warnings: [{ code: 'embed_unavailable', message: 'The embedding provider is unavailable; the result is lexical only.' }],
});
