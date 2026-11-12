import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import type { CoverageWindow, StatusRow } from '../../tools/prassi-dto';
import { PrassiTools } from '../../tools/prassi-tools';

export interface SkippedGroup {
  readonly fonte: string;
  readonly reasons: readonly { readonly reason: string; readonly count: number }[];
}

export interface CoverageLine extends CoverageWindow {
  readonly key: string;
  readonly fonte: string;
  readonly tipo: string;
  /** `YYYY-MM`, or the year only for a window without a month. */
  readonly label: string;
}

@Injectable()
export class StatusStore {
  private readonly tools = inject(PrassiTools);

  readonly rows = signal<readonly StatusRow[]>([]);
  readonly loading = signal(false);
  /** Translation key of the failure, null when fine. */
  readonly error = signal<string | null>(null);
  readonly errorDetail = signal('');

  /** The (fonte, tipo) rows; the empty corpus answers one row without fonte, which is not a row of the table. */
  readonly dataRows = computed(() => this.rows().filter((row) => row.fonte !== null));
  /** True once a load has finished: before it the Screen shows the loading line, not "no documents". */
  readonly loaded = signal(false);
  readonly empty = computed(() => this.loaded() && this.dataRows().length === 0 && this.error() === null);
  /** The note the Tool builds from the data is the same on every row: shown once. */
  readonly note = computed(() => this.rows()[0]?.note ?? null);

  /** Skipped reasons are per fonte and repeated on every row of the fonte: listed once per fonte. */
  readonly skipped = computed<readonly SkippedGroup[]>(() => {
    const seen = new Set<string>();
    const groups: SkippedGroup[] = [];
    for (const row of this.dataRows()) {
      if (row.fonte === null || seen.has(row.fonte)) {
        continue;
      }
      seen.add(row.fonte);
      const reasons = Object.entries(row.skipped).map(([reason, count]) => ({ reason, count }));
      if (reasons.length > 0) {
        groups.push({ fonte: row.fonte, reasons });
      }
    }
    return groups;
  });

  readonly coverage = computed<readonly CoverageLine[]>(() =>
    this.dataRows().flatMap((row) =>
      row.coverage.map((window) => ({
        ...window,
        key: `${row.fonte ?? ''}|${row.tipo ?? ''}|${String(window.anno)}|${String(window.mese)}`,
        fonte: row.fonte ?? '',
        tipo: row.tipo ?? '',
        label: window.mese > 0 ? `${String(window.anno)}-${String(window.mese).padStart(2, '0')}` : String(window.anno),
      })),
    ),
  );

  private request = 0;

  constructor() {
    // an effect, not a constructor call: the context input is set after construction (P78-30)
    effect(() => {
      untracked(() => void this.refresh());
    });
  }

  async refresh(): Promise<void> {
    const request = ++this.request;
    this.loading.set(true);
    try {
      const { rows } = await this.tools.status();
      if (request !== this.request) {
        return;
      }
      this.rows.set(rows);
      this.error.set(null);
      this.errorDetail.set('');
    } catch (error) {
      if (request !== this.request) {
        return;
      }
      this.rows.set([]);
      this.error.set('common.error');
      this.errorDetail.set(error instanceof Error ? error.message : String(error));
    } finally {
      if (request === this.request) {
        this.loading.set(false);
        this.loaded.set(true);
      }
    }
  }
}
