/** One norm reference of a document (`doc.riferimenti`, `su_norma.matchedRefs`); `normaUrn` is null when the extractor could not resolve the citation. */
export interface Riferimento {
  readonly descrizione: string;
  readonly articolo: string | null;
  readonly comma: string | null;
  readonly normaUrn: string | null;
}

/** One document of `lookup`; `total` is the size of the filtered set, repeated on every row. Never the text. */
export interface LookupRow {
  readonly id: string;
  readonly ente: string | null;
  readonly tipo: string;
  readonly numero: string | null;
  readonly anno: number | null;
  readonly data: Date | null;
  readonly oggetto: string | null;
  readonly sourceUrl: string | null;
  readonly fonte: string;
  readonly total: number;
}

/** One hit of `search`: the estremi, the headline (words between guillemets) or a snippet, never the whole text. */
export interface SearchHit {
  readonly id: string;
  readonly tipo: string;
  readonly numero: string | null;
  readonly anno: number | null;
  readonly data: Date | null;
  readonly ente: string | null;
  readonly oggetto: string | null;
  readonly headline: string | null;
  readonly snippet: string | null;
  readonly sourceUrl: string | null;
  readonly position: number;
}

/** One document of `doc` with a slice of its text; the key `tipo + numero + anno` can match more than one row. */
export interface DocRecord {
  readonly id: string;
  readonly ente: string | null;
  readonly struttura: string | null;
  readonly tipo: string;
  readonly numero: string | null;
  readonly anno: number | null;
  readonly data: Date | null;
  readonly oggetto: string | null;
  readonly text: string;
  readonly textLength: number;
  readonly truncated: boolean;
  readonly nextOffset: number | null;
  readonly estrazione: string;
  readonly fonte: string;
  readonly sourceId: string;
  readonly sourceUrl: string | null;
  readonly riferimenti: readonly Riferimento[];
}

/** One document citing a norm (`su_norma`) with the references that matched. */
export interface SuNormaRow {
  readonly id: string;
  readonly tipo: string;
  readonly numero: string | null;
  readonly anno: number | null;
  readonly data: Date | null;
  readonly ente: string | null;
  readonly oggetto: string | null;
  readonly sourceUrl: string | null;
  readonly matchedRefs: readonly Riferimento[];
}

/** Declared versus taken for one window of a source (a month page or a DocTrib month). */
export interface CoverageWindow {
  readonly anno: number;
  readonly mese: number;
  readonly dichiarati: number;
  readonly presi: number;
  readonly mancanti: number;
  readonly troncati: number;
}

/** One (fonte, tipo) of `status`; the empty corpus answers one row with `fonte` and `tipo` null. */
export interface StatusRow {
  readonly fonte: string | null;
  readonly tipo: string | null;
  readonly documents: number;
  readonly yearMin: number | null;
  readonly yearMax: number | null;
  readonly ocrDocuments: number;
  readonly passages: number;
  readonly passagesPending: number;
  readonly refsTotal: number;
  readonly refsMapped: number;
  /** Skipped items of the fonte by reason. */
  readonly skipped: Readonly<Record<string, number>>;
  readonly duplicateIdentityGroups: number;
  readonly lastIngestedAt: Date | null;
  readonly note: string | null;
  readonly coverage: readonly CoverageWindow[];
}

/** A Tool answer: the rows of the envelope and the codes of its `warnings` (empty when the envelope has none). */
export interface ToolRows<T> {
  readonly rows: readonly T[];
  readonly warnings: readonly string[];
}

/** Wire names (camelCase) of the date members; the number members arrive as bigint text from some hosts and are coerced. */
export const DATE_KEYS: readonly string[] = ['data', 'lastIngestedAt'];
export const NUMBER_KEYS: readonly string[] = [
  'anno', 'total', 'position', 'textLength', 'nextOffset', 'documents', 'yearMin', 'yearMax', 'ocrDocuments', 'passages', 'passagesPending',
  'refsTotal', 'refsMapped', 'duplicateIdentityGroups',
];
/** jsonb members: arrays of objects whose keys are camelised (a host that serialises jsonb as text is parsed). */
export const JSON_LIST_KEYS: readonly string[] = ['riferimenti', 'matchedRefs', 'coverage'];
/** jsonb members that are maps (skipped by reason): parsed, keys left as they are. */
export const JSON_MAP_KEYS: readonly string[] = ['skipped'];
