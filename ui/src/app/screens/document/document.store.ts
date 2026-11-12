import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { injectPackageContext } from '@olx/package-ui-sdk';
import { docKey, parseDocKey } from '../../shared/doc-key';
import { httpsUrl } from '../../shared/safe-url';
import type { DocRecord, SuNormaRow } from '../../tools/prassi-dto';
import { PrassiTools } from '../../tools/prassi-tools';

export type LoadState = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';
export type NormaState = 'idle' | 'loading' | 'done' | 'invalid' | 'error';

/** The same shape the Tool `su_norma` accepts for `norma_urn`: a malformed URN is refused here instead of answered 400. */
export const NORMA_PATTERN = /^urn:nir:[a-z.]+:[a-z.]+:[0-9]{4}-[0-9]{2}-[0-9]{2};[0-9a-z-]+(~[a-z0-9-]+)?$/;
const NORMA_MAX_LENGTH = 500;

/** The detail Screen: one document named by the route key, loaded when the key changes (an effect, never in the constructor, P78-30). */
@Injectable()
export class DocumentStore {
  private readonly tools = inject(PrassiTools);
  private readonly context = injectPackageContext();

  readonly key = computed(() => parseDocKey(this.context().subPath));
  readonly state = signal<LoadState>('idle');
  readonly errorDetail = signal('');

  /** The document row of the first slice (header, references, source); `truncated` and `nextOffset` follow the last slice. */
  readonly doc = signal<DocRecord | null>(null);
  /** The slices loaded so far, concatenated. */
  readonly text = signal('');
  readonly loadingMore = signal(false);
  readonly moreError = signal('');
  readonly sourceLink = computed(() => httpsUrl(this.doc()?.sourceUrl));
  readonly hasMore = computed(() => this.doc()?.truncated === true && this.doc()?.nextOffset !== null);

  readonly normaText = signal('');
  readonly normaState = signal<NormaState>('idle');
  readonly normaRows = signal<readonly SuNormaRow[]>([]);

  private request = 0;
  private normaRequest = 0;

  constructor() {
    effect(() => {
      const key = this.key();
      untracked(() => void this.load(key));
    });
  }

  back(): void {
    this.context().navigateScreen('corpus');
  }

  openDocument(id: string): void {
    this.context().navigateScreen('document', docKey(id));
  }

  async nextSlice(): Promise<void> {
    const current = this.doc();
    const key = this.key();
    if (current === null || key === null || current.nextOffset === null || this.loadingMore()) {
      return;
    }
    const request = this.request;
    this.loadingMore.set(true);
    this.moreError.set('');
    try {
      const { rows } = await this.tools.doc({ id: key, offset: current.nextOffset });
      const slice = rows[0];
      if (request !== this.request || slice === undefined) {
        return;
      }
      this.text.update((text) => text + slice.text);
      this.doc.set({ ...current, truncated: slice.truncated, nextOffset: slice.nextOffset });
    } catch (error) {
      if (request === this.request) {
        this.moreError.set(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (request === this.request) {
        this.loadingMore.set(false);
      }
    }
  }

  setNorma(text: string): void {
    this.normaText.set(text);
  }

  /** Searches the typed URN: the shape is checked first, an invalid one calls nothing. */
  async searchNorma(): Promise<void> {
    const urn = this.normaText().trim();
    if (urn.length > NORMA_MAX_LENGTH || !NORMA_PATTERN.test(urn)) {
      this.normaState.set('invalid');
      this.normaRows.set([]);
      return;
    }
    const request = ++this.normaRequest;
    this.normaState.set('loading');
    try {
      const { rows } = await this.tools.suNorma({ normaUrn: urn });
      if (request !== this.normaRequest) {
        return;
      }
      this.normaRows.set(rows);
      this.normaState.set('done');
    } catch {
      if (request === this.normaRequest) {
        this.normaRows.set([]);
        this.normaState.set('error');
      }
    }
  }

  /** The "documents citing this norm" action of a reference. */
  citing(urn: string): Promise<void> {
    this.normaText.set(urn);
    return this.searchNorma();
  }

  private reset(): void {
    this.errorDetail.set('');
    this.doc.set(null);
    this.text.set('');
    this.loadingMore.set(false);
    this.moreError.set('');
    this.normaText.set('');
    this.normaState.set('idle');
    this.normaRows.set([]);
    this.normaRequest++;
  }

  private async load(key: string | null): Promise<void> {
    const request = ++this.request;
    this.reset();
    if (key === null) {
      this.state.set('idle');
      return;
    }
    this.state.set('loading');
    try {
      const { rows } = await this.tools.doc({ id: key });
      if (request !== this.request) {
        return;
      }
      const [first] = rows;
      this.doc.set(first ?? null);
      this.text.set(first?.text ?? '');
      this.state.set(first === undefined ? 'notfound' : 'ready');
    } catch (error) {
      if (request !== this.request) {
        return;
      }
      this.errorDetail.set(error instanceof Error ? error.message : String(error));
      this.state.set('error');
    }
  }
}
