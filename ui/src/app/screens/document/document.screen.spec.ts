import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { prassiProviders } from '../../providers';
import { must } from '../../testing/dom';
import { DOC_ID, docWire, normaWire, refWire, URN_STATUTO, URN_STATUTO_ART11 } from '../../testing/prassi-fixtures';
import { callsOf, schemaViolations, stubPrassiEnvironment } from '../../testing/stub-prassi-tools';
import { DocumentScreen } from './document.screen';

type Handler = (input: object) => unknown;

interface Handlers {
  readonly doc?: Handler;
  readonly suNorma?: Handler;
}

function setup(subPath: string, handlers: Handlers = {}, overrides: Parameters<typeof stubPrassiEnvironment>[1] = {}) {
  const env = stubPrassiEnvironment(
    {
      doc: handlers.doc ?? (() => [docWire()]),
      su_norma: handlers.suNorma ?? (() => []),
      search: () => [],
      lookup: () => [],
      status: () => [],
    },
    { locale: 'en', subPath, ...overrides },
  );
  TestBed.configureTestingModule({ providers: [...prassiProviders] });
  const fixture = TestBed.createComponent(DocumentScreen);
  fixture.componentRef.setInput('context', env.context());
  return { env, fixture };
}

type Fixture = ComponentFixture<DocumentScreen>;

async function settle(fixture: Fixture): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await vi.waitFor(() => undefined);
    await Promise.resolve();
    fixture.detectChanges();
  }
}

const root = (fixture: Fixture): HTMLElement => fixture.nativeElement as HTMLElement;
const el = (fixture: Fixture, id: string): HTMLElement => must(root(fixture), `[data-testid="${id}"]`);
const all = (fixture: Fixture, id: string): HTMLElement[] => [...root(fixture).querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)];
const has = (fixture: Fixture, id: string): boolean => root(fixture).querySelector(`[data-testid="${id}"]`) !== null;

async function loaded(subPath: string, handlers: Handlers = {}, overrides: Parameters<typeof stubPrassiEnvironment>[1] = {}) {
  const made = setup(subPath, handlers, overrides);
  made.fixture.detectChanges();
  await settle(made.fixture);
  return made;
}

const KEY = `doc~${DOC_ID}`;

function typeUrn(fixture: Fixture, value: string): void {
  const input = el(fixture, 'norma-input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('DocumentScreen', () => {
  describe('loading', () => {
    it('should load doc once with the id only and render the header and the first slice when the key is doc~uuid', async () => {
      const { env, fixture } = await loaded(KEY);
      expect(callsOf(env, 'doc')).toEqual([{ id: DOC_ID }]);
      expect(env.calls).toHaveLength(1);
      expect(schemaViolations(env)).toEqual([]);
      const header = el(fixture, 'doc-header').textContent;
      for (const text of ['circolare', '10/2025', '2025-07-04', 'Agenzia delle Entrate', 'Direzione Centrale Normativa']) {
        expect(header, text).toContain(text);
      }
      expect(el(fixture, 'doc-oggetto').textContent).toContain('Chiarimenti in materia di fringe benefit');
      expect(el(fixture, 'doc-text').textContent).toBe('Primo tratto del testo.');
      expect(el(fixture, 'doc-length').textContent).toContain('23 of 23');
      expect(has(fixture, 'doc-next')).toBe(false);
      expect(has(fixture, 'doc-ocr')).toBe(false);
    });

    it('should show the no-number wording when the document declares no number', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [docWire({ numero: null, anno: 2018 })] });
      expect(el(fixture, 'doc-header').textContent).toContain('no number');
      expect(el(fixture, 'doc-header').textContent).toContain('2018');
    });

    it('should show the OCR badge only when the text was extracted by OCR', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [docWire({ estrazione: 'ocr' })] });
      expect(el(fixture, 'doc-ocr').textContent).toContain('OCR');
    });

    it('should reload and reset when the Host navigates to another document', async () => {
      const second = '9c1d7e2a-4b5f-4c6d-8e7f-0a1b2c3d4e5f';
      const { env, fixture } = await loaded(KEY, { doc: (input) => [docWire({ id: (input as { id: string }).id, text: `Testo di ${(input as { id: string }).id.slice(0, 4)}` })] });
      expect(el(fixture, 'doc-text').textContent).toBe('Testo di 3f2b');
      env.update({ subPath: `doc~${second}` });
      fixture.componentRef.setInput('context', env.context());
      fixture.detectChanges();
      await settle(fixture);
      expect(callsOf(env, 'doc')).toEqual([{ id: DOC_ID }, { id: second }]);
      expect(el(fixture, 'doc-text').textContent).toBe('Testo di 9c1d');
    });

    it('should render Slovak texts when the locale is sk', async () => {
      const { fixture } = await loaded(KEY, {}, { locale: 'sk' });
      expect(el(fixture, 'screen-title').textContent.trim()).toBe('Dokument');
    });
  });

  describe('slices', () => {
    const sliced: Handler = (input) => {
      const { offset } = input as { offset?: number };
      return offset === undefined
        ? [docWire({ text: 'AAAA', text_length: 10, truncated: true, next_offset: 4 })]
        : [docWire({ text: 'BBBBBB', text_length: 10, truncated: false, next_offset: null })];
    };

    it('should append the next slice with offset = next_offset and update the length line when the button is pressed', async () => {
      const { env, fixture } = await loaded(KEY, { doc: sliced });
      expect(el(fixture, 'doc-text').textContent).toBe('AAAA');
      expect(el(fixture, 'doc-length').textContent).toContain('4 of 10');
      el(fixture, 'doc-next').click();
      await settle(fixture);
      expect(callsOf(env, 'doc')).toEqual([{ id: DOC_ID }, { id: DOC_ID, offset: 4 }]);
      expect(el(fixture, 'doc-text').textContent).toBe('AAAABBBBBB');
      expect(el(fixture, 'doc-length').textContent).toContain('10 of 10');
      expect(has(fixture, 'doc-next')).toBe(false);
      expect(schemaViolations(env)).toEqual([]);
    });

    it('should keep the first slice and show an error when the next slice fails', async () => {
      const { fixture } = await loaded(KEY, {
        doc: (input) => {
          if ((input as { offset?: number }).offset !== undefined) {
            throw new Error('slice down');
          }
          return [docWire({ text: 'AAAA', text_length: 10, truncated: true, next_offset: 4 })];
        },
      });
      el(fixture, 'doc-next').click();
      await settle(fixture);
      expect(el(fixture, 'doc-text').textContent).toBe('AAAA');
      expect(el(fixture, 'doc-slice-error').textContent).toContain('slice down');
    });
  });

  describe('text safety', () => {
    it('should render the text and the oggetto as text nodes when they carry tags', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [docWire({ text: 'Testo con <b>grassetto</b> e <script>alert(1)</script>', oggetto: 'Oggetto <i>x</i>' })] });
      expect(el(fixture, 'doc-text').textContent).toContain('<b>grassetto</b>');
      expect(el(fixture, 'doc-oggetto').textContent).toContain('<i>x</i>');
      expect(root(fixture).querySelector('b')).toBeNull();
      expect(root(fixture).querySelector('i')).toBeNull();
      expect(root(fixture).querySelector('script')).toBeNull();
    });

    it('should link the source only for https and open it safely when the document has a source url', async () => {
      const { fixture } = await loaded(KEY);
      const link = el(fixture, 'doc-source') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('https://www.agenziaentrate.gov.it/portale/circolare-n-10-del-2025');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      TestBed.resetTestingModule();
      const unsafe = await loaded(KEY, { doc: () => [docWire({ source_url: 'javascript:alert(1)' })] });
      expect(has(unsafe.fixture, 'doc-source')).toBe(false);
    });

    it('should show the attribution and the not-a-source-of-law line when a document is open', async () => {
      const { fixture } = await loaded(KEY);
      expect(el(fixture, 'doc-attribution').textContent).toContain('Agenzia delle Entrate (portale) / MEF - def.finanze.it (DocTrib)');
      expect(el(fixture, 'doc-not-law').textContent).toContain('NOT a source of law');
    });
  });

  describe('riferimenti', () => {
    it('should list the references and offer the citing-documents action only for mapped ones', async () => {
      const { fixture } = await loaded(KEY);
      const refs = all(fixture, 'doc-ref');
      expect(refs).toHaveLength(2);
      expect(refs[0]?.textContent).toContain('articolo 11 della legge 27 luglio 2000, n. 212');
      expect(refs[0]?.textContent).toContain(URN_STATUTO_ART11);
      expect(refs[0]?.querySelector('[data-testid="doc-ref-cites"]')).not.toBeNull();
      expect(refs[1]?.textContent).toContain('una norma non risolta');
      expect(refs[1]?.querySelector('[data-testid="doc-ref-urn"]')).toBeNull();
      expect(refs[1]?.querySelector('[data-testid="doc-ref-cites"]')).toBeNull();
    });

    it('should read the references when the host serialises jsonb as text', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [docWire({ riferimenti: JSON.stringify([refWire({ articolo: '11', comma: '2' })]) })] });
      expect(all(fixture, 'doc-ref')).toHaveLength(1);
      expect(el(fixture, 'doc-ref').textContent).toContain('2');
    });

    it('should show a no-references line when the document has none', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [docWire({ riferimenti: [] })] });
      expect(all(fixture, 'doc-ref')).toHaveLength(0);
      expect(has(fixture, 'doc-refs-empty')).toBe(true);
    });

    it('should call su_norma with the mapped urn and list the citing documents with links to document when the action is pressed', async () => {
      const navigateScreen = vi.fn();
      const { env, fixture } = await loaded(KEY, { suNorma: () => [normaWire()] }, { navigateScreen });
      must(all(fixture, 'doc-ref')[0] ?? root(fixture), '[data-testid="doc-ref-cites"]').click();
      await settle(fixture);
      expect(callsOf(env, 'su_norma')).toEqual([{ norma_urn: URN_STATUTO_ART11 }]);
      const rows = all(fixture, 'norma-row');
      expect(rows).toHaveLength(1);
      expect(rows[0]?.textContent).toContain('risoluzione');
      expect(rows[0]?.textContent).toContain('33/2024');
      expect(rows[0]?.textContent).toContain('articolo 11 della legge 27 luglio 2000, n. 212');
      must(rows[0] ?? root(fixture), '[data-testid="norma-open"]').click();
      expect(navigateScreen).toHaveBeenCalledExactlyOnceWith('document', 'doc~9c1d7e2a-4b5f-4c6d-8e7f-0a1b2c3d4e5f');
      expect(schemaViolations(env)).toEqual([]);
    });
  });

  describe('norma box', () => {
    it('should call su_norma with the typed urn and show the best-effort note when the urn is valid', async () => {
      const { env, fixture } = await loaded(KEY, { suNorma: () => [normaWire()] });
      expect(el(fixture, 'norma-note').textContent).toContain('NOT proof');
      typeUrn(fixture, URN_STATUTO);
      el(fixture, 'norma-go').click();
      await settle(fixture);
      expect(callsOf(env, 'su_norma')).toEqual([{ norma_urn: URN_STATUTO }]);
      expect(all(fixture, 'norma-row')).toHaveLength(1);
      expect(el(fixture, 'norma-note').textContent).toContain('NOT proof');
    });

    it('should validate the urn shape like the Tool pattern and call nothing when it is wrong', async () => {
      const { env, fixture } = await loaded(KEY);
      for (const wrong of ['', 'legge 212/2000', 'urn:nir:stato:legge:2000-07-27', 'urn:nir:stato:legge:2000-07-27;212/art11', 'URN:NIR:STATO:LEGGE:2000-07-27;212']) {
        typeUrn(fixture, wrong);
        el(fixture, 'norma-go').click();
        await settle(fixture);
        expect(has(fixture, 'norma-invalid'), wrong).toBe(true);
      }
      expect(callsOf(env, 'su_norma')).toEqual([]);
      typeUrn(fixture, URN_STATUTO_ART11);
      el(fixture, 'norma-go').click();
      await settle(fixture);
      expect(has(fixture, 'norma-invalid')).toBe(false);
      expect(callsOf(env, 'su_norma')).toEqual([{ norma_urn: URN_STATUTO_ART11 }]);
    });

    it('should say that no documents were found without claiming nobody cites the norm when su_norma is empty', async () => {
      const { fixture } = await loaded(KEY, { suNorma: () => [] });
      typeUrn(fixture, URN_STATUTO);
      el(fixture, 'norma-go').click();
      await settle(fixture);
      expect(el(fixture, 'norma-empty').textContent).toContain('No document found');
      expect(el(fixture, 'norma-note').textContent).toContain('NOT proof');
    });

    it('should show an error line and keep the document when su_norma fails', async () => {
      const { fixture } = await loaded(KEY, {
        suNorma: () => {
          throw new Error('norma down');
        },
      });
      typeUrn(fixture, URN_STATUTO);
      el(fixture, 'norma-go').click();
      await settle(fixture);
      expect(el(fixture, 'norma-error').textContent).toContain('could not be loaded');
      expect(el(fixture, 'doc-text').textContent).toBe('Primo tratto del testo.');
    });
  });

  describe('states and keys', () => {
    it('should show the not-found state when doc returns no row for the id', async () => {
      const { fixture } = await loaded(KEY, { doc: () => [] });
      expect(has(fixture, 'doc-notfound')).toBe(true);
      expect(has(fixture, 'doc-text')).toBe(false);
    });

    it('should show the error state and not throw when doc fails', async () => {
      const { fixture } = await loaded(KEY, {
        doc: () => {
          throw new Error('doc down');
        },
      });
      expect(el(fixture, 'doc-error').textContent).toContain('doc down');
    });

    it('should show a hint and call no Tool when the key is missing', async () => {
      for (const subPath of ['', 'something', 'doc~', 'doc~not-a-uuid', 'cc~ECLI:IT:COST:2026:95']) {
        const { env, fixture } = await loaded(subPath);
        expect(has(fixture, 'doc-hint'), subPath).toBe(true);
        expect(env.calls, subPath).toEqual([]);
        TestBed.resetTestingModule();
      }
    });

    it('should go back to the corpus when the back button is pressed', async () => {
      const navigateScreen = vi.fn();
      const { fixture } = await loaded(KEY, {}, { navigateScreen });
      el(fixture, 'doc-back').click();
      expect(navigateScreen).toHaveBeenCalledExactlyOnceWith('corpus');
    });
  });
});
