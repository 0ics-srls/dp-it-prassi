import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { prassiProviders } from '../../providers';
import { must } from '../../testing/dom';
import { coverageWire, emptyStatusWire, statusWire } from '../../testing/prassi-fixtures';
import { callsOf, schemaViolations, stubPrassiEnvironment } from '../../testing/stub-prassi-tools';
import { StatusScreen } from './status.screen';

type Handler = (input: object) => unknown;

function setup(status: Handler, overrides: Parameters<typeof stubPrassiEnvironment>[1] = {}) {
  const env = stubPrassiEnvironment({ status, search: () => [], lookup: () => [], doc: () => [], su_norma: () => [] }, { locale: 'en', ...overrides });
  TestBed.configureTestingModule({ providers: [...prassiProviders] });
  const fixture = TestBed.createComponent(StatusScreen);
  fixture.componentRef.setInput('context', env.context());
  return { env, fixture };
}

type Fixture = ComponentFixture<StatusScreen>;

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

async function loaded(status: Handler, overrides: Parameters<typeof stubPrassiEnvironment>[1] = {}) {
  const made = setup(status, overrides);
  made.fixture.detectChanges();
  await settle(made.fixture);
  return made;
}

const TWO_FONTI: Handler = () => [
  statusWire(),
  statusWire({
    fonte: 'doctrib',
    tipo: 'interpello',
    documents: 40,
    year_min: 2023,
    year_max: 2025,
    ocr_documents: 0,
    passages: 300,
    passages_pending: 12,
    refs_total: 90,
    refs_mapped: 60,
    skipped: {},
    duplicate_identity_groups: 2,
    coverage: [coverageWire({ anno: 2025, mese: 10, dichiarati: 17, presi: 15, mancanti: 2, troncati: 1 })],
  }),
];

describe('StatusScreen', () => {
  describe('rows', () => {
    it('should call status once with an empty argument object, not in the constructor, and render one row per fonte and tipo', async () => {
      const made = setup(TWO_FONTI);
      expect(made.env.calls).toEqual([]);
      made.fixture.detectChanges();
      await settle(made.fixture);
      expect(callsOf(made.env, 'status')).toEqual([{}]);
      expect(schemaViolations(made.env)).toEqual([]);
      const rows = all(made.fixture, 'status-row');
      expect(rows).toHaveLength(2);
      const first = rows[0]?.textContent ?? '';
      for (const text of ['Agenzia delle Entrate portal', 'circolare', '120', '2019-2025', '900', '250 of 400', '2026-11-10 08:30']) {
        expect(first, text).toContain(text);
      }
      expect(must(rows[0] ?? root(made.fixture), '[data-testid="status-ocr"]').textContent.trim()).toBe('7');
      const second = rows[1]?.textContent ?? '';
      for (const text of ['MEF DocTrib', 'interpello', '40', '2023-2025', '60 of 90']) {
        expect(second, text).toContain(text);
      }
    });

    it('should show the warning badge as a status role only for rows with passages waiting for an embedding', async () => {
      const { fixture } = await loaded(TWO_FONTI);
      const rows = all(fixture, 'status-row');
      expect(rows[0]?.querySelector('[data-testid="status-warning"]')).toBeNull();
      const badge = must(rows[1] ?? root(fixture), '[data-testid="status-warning"]');
      expect(badge.getAttribute('role')).toBe('status');
      expect(badge.textContent).toContain('12');
    });

    it('should show the duplicate identity groups of a row when there are some', async () => {
      const { fixture } = await loaded(TWO_FONTI);
      const rows = all(fixture, 'status-row');
      expect(must(rows[0] ?? root(fixture), '[data-testid="status-duplicates"]').textContent.trim()).toBe('0');
      expect(must(rows[1] ?? root(fixture), '[data-testid="status-duplicates"]').textContent.trim()).toBe('2');
    });

    it('should show the note the Tool builds from the data once and the package honest limits', async () => {
      const { fixture } = await loaded(TWO_FONTI);
      expect(all(fixture, 'status-note')).toHaveLength(1);
      expect(el(fixture, 'status-note').textContent).toContain('Interpelli: 2023-2025');
      expect(el(fixture, 'status-limits').textContent).toContain('2019');
      expect(el(fixture, 'status-limits').textContent).toContain('NOT proof');
    });

    it('should re-call status when refresh is pressed', async () => {
      const { env, fixture } = await loaded(TWO_FONTI);
      el(fixture, 'status-refresh').click();
      await settle(fixture);
      expect(callsOf(env, 'status')).toEqual([{}, {}]);
    });
  });

  describe('skipped and coverage', () => {
    it('should list the skipped reasons once per fonte even when the fonte has more than one row', async () => {
      const { fixture } = await loaded(() => [statusWire(), statusWire({ tipo: 'risoluzione' }), statusWire({ fonte: 'doctrib', tipo: 'interpello', skipped: { details_empty: 4 } })]);
      const lists = all(fixture, 'status-skipped');
      expect(lists).toHaveLength(2);
      expect(lists[0]?.textContent).toContain('ade-portale');
      expect(lists[0]?.textContent).toContain('ocr_empty');
      expect(lists[0]?.textContent).toContain('2');
      expect(lists[0]?.textContent).toContain('senza_pdf');
      expect(lists[1]?.textContent).toContain('details_empty');
      expect(lists[1]?.textContent).toContain('4');
    });

    it('should show no skipped list when nothing was skipped', async () => {
      const { fixture } = await loaded(() => [statusWire({ skipped: {} })]);
      expect(has(fixture, 'status-skipped')).toBe(false);
    });

    it('should show declared against taken per window and highlight the windows with missing items', async () => {
      const { fixture } = await loaded(TWO_FONTI);
      const windows = all(fixture, 'coverage-row');
      expect(windows).toHaveLength(3);
      expect(windows[0]?.textContent).toContain('2025-07');
      expect(windows[0]?.classList.contains('missing')).toBe(false);
      expect(windows[0]?.querySelector('[data-testid="coverage-missing"]')).toBeNull();
      expect(windows[1]?.textContent).toContain('2025-08');
      expect(windows[1]?.classList.contains('missing')).toBe(true);
      expect(must(windows[1] ?? root(fixture), '[data-testid="coverage-missing"]').textContent.trim()).toBe('2');
      expect(windows[2]?.textContent).toContain('2025-10');
      expect(windows[2]?.textContent).toContain('17');
      expect(windows[2]?.textContent).toContain('15');
      expect(must(windows[2] ?? root(fixture), '[data-testid="coverage-truncated"]').textContent.trim()).toBe('1');
    });

    it('should show a window without a month as the year only', async () => {
      const { fixture } = await loaded(() => [statusWire({ coverage: [coverageWire({ mese: 0, anno: 2024 })] })]);
      const window = el(fixture, 'coverage-row');
      expect(window.textContent).toContain('2024');
      expect(window.textContent).not.toContain('2024-00');
    });

    it('should consume the jsonb members as JSON values and also when the host serialises them as text', async () => {
      const asText = (): unknown[] => [
        statusWire({ skipped: JSON.stringify({ ocr_empty: 2 }), coverage: JSON.stringify([coverageWire({ mese: 8, mancanti: 2 })]) }),
      ];
      const values = await loaded(() => [statusWire({ skipped: { ocr_empty: 2 }, coverage: [coverageWire({ mese: 8, mancanti: 2 })] })]);
      TestBed.resetTestingModule();
      const text = await loaded(asText);
      for (const { fixture } of [values, text]) {
        expect(el(fixture, 'status-skipped').textContent).toContain('ocr_empty');
        expect(el(fixture, 'coverage-row').classList.contains('missing')).toBe(true);
      }
    });
  });

  describe('states', () => {
    it('should show the no-documents state and the note of the Tool when the corpus is empty', async () => {
      const { fixture } = await loaded(() => [emptyStatusWire()]);
      expect(el(fixture, 'status-empty').textContent).toContain('No documents yet');
      expect(all(fixture, 'status-row')).toHaveLength(0);
      expect(el(fixture, 'status-note').textContent).toContain('Nessun documento');
    });

    it('should show the empty state when the Tool returns no row at all', async () => {
      const { fixture } = await loaded(() => []);
      expect(has(fixture, 'status-empty')).toBe(true);
    });

    it('should show the error and not throw when the Tool fails, and recover on refresh', async () => {
      let fail = true;
      const { fixture } = await loaded(() => {
        if (fail) {
          throw new Error('status down');
        }
        return [statusWire()];
      });
      expect(el(fixture, 'status-error').textContent).toContain('status down');
      fail = false;
      el(fixture, 'status-refresh').click();
      await settle(fixture);
      expect(has(fixture, 'status-error')).toBe(false);
      expect(all(fixture, 'status-row')).toHaveLength(1);
    });
  });

  describe('languages and footer', () => {
    it.each([
      ['en', 'Corpus status', 'administrative acts', 'NOT a source of law'],
      ['sk', 'Stav korpusu', 'administratívne akty', 'NIE JE prameňom práva'],
      ['it', 'Stato del corpus', 'atti amministrativi', 'NON è una fonte del diritto'],
    ])('should carry the licence footer and the title in %s', async (locale, title, acts, notLaw) => {
      const { fixture } = await loaded(TWO_FONTI, { locale: locale as 'en' });
      expect(el(fixture, 'screen-title').textContent.trim()).toBe(title);
      const footer = el(fixture, 'status-footer').textContent;
      expect(footer).toContain('Agenzia delle Entrate (portale) / MEF - def.finanze.it (DocTrib)');
      expect(footer).toContain(acts);
      expect(footer).toContain(notLaw);
    });
  });
});
