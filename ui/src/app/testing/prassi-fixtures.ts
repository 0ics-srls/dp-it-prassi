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

export const URN_STATUTO = 'urn:nir:stato:legge:2000-07-27;212';
export const URN_STATUTO_ART11 = 'urn:nir:stato:legge:2000-07-27;212~art11';

/** One norm reference as `doc.riferimenti` and `su_norma.matched_refs` carry it. */
export function refWire(over: WireRow = {}): WireRow {
  return { descrizione: 'articolo 11 della legge 27 luglio 2000, n. 212', articolo: '11', comma: null, norma_urn: URN_STATUTO_ART11, ...over };
}

/** One row of `doc` (a slice of the text). */
export function docWire(over: WireRow = {}): WireRow {
  return {
    id: DOC_ID,
    ente: 'Agenzia delle Entrate',
    struttura: 'Direzione Centrale Normativa',
    tipo: 'circolare',
    numero: '10',
    anno: 2025,
    data: '2025-07-04',
    oggetto: 'Chiarimenti in materia di fringe benefit',
    text: 'Primo tratto del testo.',
    text_length: 23,
    truncated: false,
    next_offset: null,
    estrazione: 'testo',
    fonte: 'ade-portale',
    source_id: 'Circolare_n_10_2025',
    source_url: 'https://www.agenziaentrate.gov.it/portale/circolare-n-10-del-2025',
    riferimenti: [refWire(), refWire({ descrizione: 'una norma non risolta', articolo: null, norma_urn: null })],
    ...over,
  };
}

/** One row of `su_norma`. */
export function normaWire(over: WireRow = {}): WireRow {
  return {
    id: '9c1d7e2a-4b5f-4c6d-8e7f-0a1b2c3d4e5f',
    tipo: 'risoluzione',
    numero: '33',
    anno: 2024,
    data: '2024-05-02',
    ente: 'Agenzia delle Entrate',
    oggetto: 'Interpello sul diritto di interpello',
    source_url: 'https://www.agenziaentrate.gov.it/portale/risoluzione-n-33-del-2024',
    matched_refs: [refWire()],
    ...over,
  };
}

/** One declared-versus-taken window of `status.coverage`. */
export function coverageWire(over: WireRow = {}): WireRow {
  return { anno: 2025, mese: 7, dichiarati: 3, presi: 3, mancanti: 0, troncati: 0, ...over };
}

/** One (fonte, tipo) row of `status`; the jsonb members arrive as JSON values (D114). */
export function statusWire(over: WireRow = {}): WireRow {
  return {
    fonte: 'ade-portale',
    tipo: 'circolare',
    documents: 120,
    year_min: 2019,
    year_max: 2025,
    ocr_documents: 7,
    passages: 900,
    passages_pending: 0,
    refs_total: 400,
    refs_mapped: 250,
    skipped: { ocr_empty: 2, senza_pdf: 1 },
    duplicate_identity_groups: 0,
    last_ingested_at: '2026-11-10T08:30:00Z',
    note: 'Riferimenti normativi risolti in URN: 250 su 400. Interpelli: 2023-2025.',
    coverage: [coverageWire(), coverageWire({ mese: 8, dichiarati: 5, presi: 3, mancanti: 2 })],
    ...over,
  };
}

/** The single row the Tool answers on an empty corpus. */
export function emptyStatusWire(): WireRow {
  return statusWire({
    fonte: null,
    tipo: null,
    documents: 0,
    year_min: null,
    year_max: null,
    ocr_documents: 0,
    passages: 0,
    refs_total: 0,
    refs_mapped: 0,
    skipped: {},
    last_ingested_at: null,
    note: 'Nessun documento nel corpus: il primo import non e ancora avvenuto.',
    coverage: [],
  });
}
