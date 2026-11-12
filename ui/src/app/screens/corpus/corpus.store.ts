import { computed, inject, Injectable, signal } from '@angular/core';
import { injectPackageContext } from '@olx/package-ui-sdk';
import { docKey } from '../../shared/doc-key';
import { ListStore, toYear } from '../../shared/list-store';
import { httpsUrl } from '../../shared/safe-url';
import { textParts, type TextPart } from '../../shared/text-parts';
import { PrassiTools } from '../../tools/prassi-tools';

/** The Tool `lookup` pages by its default limit; the Screen does not send a limit so that the first open is the empty argument object (P79-56). */
export const PAGE_SIZE = 20;
/** Hits asked from `search` (the Tool maximum). */
export const SEARCH_K = 50;

export type SearchMode = 'hybrid' | 'lexical' | 'semantic';
export type SortKey = 'tipo' | 'anno' | 'numero' | 'data';

export interface Estremi {
  readonly tipo: string;
  readonly numero: string;
  readonly anno: number | undefined;
}

export interface CorpusQuery {
  readonly text: string;
  readonly tipo: string;
  readonly ente: string;
  readonly annoFrom: number | undefined;
  readonly annoTo: number | undefined;
  readonly mode: SearchMode;
  readonly sort: SortKey;
  readonly desc: boolean;
  readonly offset: number;
  /** Set by the estremi row: the list then shows only what these fields find. */
  readonly estremi: Estremi | null;
}

/** One line of the list, whichever Tool produced it. */
export interface CorpusItem {
  readonly key: string;
  readonly id: string;
  readonly tipo: string;
  readonly numero: string | null;
  readonly anno: number | null;
  readonly data: Date | null;
  readonly ente: string | null;
  readonly oggetto: string | null;
  readonly headline: readonly TextPart[];
  readonly snippet: string | null;
  /** Only an https link; the empty string otherwise. */
  readonly sourceUrl: string;
}

/** Which Tool a query uses: the estremi row and the filters without text go to `lookup`, text goes to `search`. */
export function toolOf(query: CorpusQuery): 'search' | 'lookup' {
  return query.estremi === null && query.text !== '' ? 'search' : 'lookup';
}

const year = (value: number, edge: string): string => `${String(value).padStart(4, '0')}-${edge}`;
const orUndefined = (value: string): string | undefined => (value === '' ? undefined : value);

@Injectable()
export class CorpusStore extends ListStore<CorpusQuery, CorpusItem> {
  private readonly tools = inject(PrassiTools);
  private readonly context = injectPackageContext();
  private readonly total = signal(0);

  /** Warning codes of the last answer (an embedding problem makes `search` lexical only). */
  readonly warnings = signal<readonly string[]>([]);
  readonly tool = computed(() => toolOf(this.query()));
  readonly paged = computed(() => this.tool() === 'lookup');
  readonly offset = computed(() => this.query().offset);
  readonly count = computed(() => this.total());
  readonly from = computed(() => (this.count() === 0 ? 0 : this.offset() + 1));
  readonly to = computed(() => Math.min(this.offset() + PAGE_SIZE, this.count()));
  readonly hasPrevious = computed(() => this.paged() && this.offset() > 0);
  readonly hasNext = computed(() => this.paged() && this.offset() + PAGE_SIZE < this.count());
  readonly estremiActive = computed(() => this.query().estremi !== null);

  constructor() {
    super({ text: '', tipo: '', ente: '', annoFrom: undefined, annoTo: undefined, mode: 'hybrid', sort: 'tipo', desc: false, offset: 0, estremi: null }, true);
  }

  search(text: string): void {
    this.edit({ text: text.trim(), offset: 0 });
  }

  ente(text: string): void {
    this.edit({ ente: text.trim(), offset: 0 });
  }

  annoFrom(text: string): void {
    this.edit({ annoFrom: toYear(text), offset: 0 });
  }

  annoTo(text: string): void {
    this.edit({ annoTo: toYear(text), offset: 0 });
  }

  tipo(tipo: string): void {
    this.choose({ tipo, offset: 0 });
  }

  mode(mode: string): void {
    this.choose({ mode: mode === 'lexical' || mode === 'semantic' ? mode : 'hybrid', offset: 0 });
  }

  sort(sort: string): void {
    this.choose({ sort: sort === 'anno' || sort === 'numero' || sort === 'data' ? sort : 'tipo', offset: 0 });
  }

  desc(desc: boolean): void {
    this.choose({ desc, offset: 0 });
  }

  /** The estremi row: tipo, numero and anno only; all three empty is the same as clearing it. */
  findEstremi(tipo: string, numero: string, anno: string): void {
    const estremi: Estremi = { tipo: tipo.trim(), numero: numero.trim(), anno: toYear(anno) };
    this.choose({ estremi: estremi.tipo === '' && estremi.numero === '' && estremi.anno === undefined ? null : estremi, offset: 0 });
  }

  clearEstremi(): void {
    this.choose({ estremi: null, offset: 0 });
  }

  next(): void {
    if (this.hasNext()) {
      this.choose({ offset: this.offset() + PAGE_SIZE });
    }
  }

  previous(): void {
    if (this.hasPrevious()) {
      this.choose({ offset: Math.max(0, this.offset() - PAGE_SIZE) });
    }
  }

  open(item: CorpusItem): void {
    this.context().navigateScreen('document', docKey(item.id));
  }

  protected override async readRows(query: CorpusQuery): Promise<readonly CorpusItem[]> {
    const tipo = orUndefined(query.tipo);
    if (toolOf(query) === 'search') {
      const { rows, warnings } = await this.tools.search({
        query: query.text,
        k: SEARCH_K,
        mode: query.mode === 'hybrid' ? undefined : query.mode,
        tipo,
        ente: orUndefined(query.ente),
        annoFrom: query.annoFrom,
        annoTo: query.annoTo,
      });
      this.total.set(rows.length);
      this.warnings.set(warnings);
      return rows.map((hit) => ({
        key: `${hit.id}|${String(hit.position)}`,
        id: hit.id,
        tipo: hit.tipo,
        numero: hit.numero,
        anno: hit.anno,
        data: hit.data,
        ente: hit.ente,
        oggetto: hit.oggetto,
        headline: textParts(hit.headline),
        snippet: hit.snippet,
        sourceUrl: httpsUrl(hit.sourceUrl),
      }));
    }

    const offset = query.offset > 0 ? query.offset : undefined;
    const { estremi } = query;
    const { rows, warnings } = await (estremi === null
      ? this.tools.lookup({
          tipo,
          ente: orUndefined(query.ente),
          dataFrom: query.annoFrom === undefined ? undefined : year(query.annoFrom, '01-01'),
          dataTo: query.annoTo === undefined ? undefined : year(query.annoTo, '12-31'),
          sort: query.sort === 'tipo' ? undefined : query.sort,
          desc: query.desc ? true : undefined,
          offset,
        })
      : this.tools.lookup({ tipo: orUndefined(estremi.tipo), numero: orUndefined(estremi.numero), anno: estremi.anno, offset }));
    this.total.set(rows[0]?.total ?? 0);
    this.warnings.set(warnings);
    return rows.map((row) => ({
      key: row.id,
      id: row.id,
      tipo: row.tipo,
      numero: row.numero,
      anno: row.anno,
      data: row.data,
      ente: row.ente,
      oggetto: row.oggetto,
      headline: [],
      snippet: null,
      sourceUrl: httpsUrl(row.sourceUrl),
    }));
  }
}
