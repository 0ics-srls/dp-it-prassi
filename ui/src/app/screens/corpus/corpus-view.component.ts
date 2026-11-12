import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CorpusStore } from './corpus.store';

@Component({
  selector: 'dp-it-prassi-corpus-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, DatePipe],
  templateUrl: './corpus-view.component.html',
  styleUrl: './corpus-view.component.css',
})
export class CorpusViewComponent {
  protected readonly store = inject(CorpusStore);

  protected readonly tipi: readonly string[] = ['circolare', 'risoluzione', 'provvedimento', 'interpello'];
  protected readonly sorts: readonly string[] = ['tipo', 'anno', 'numero', 'data'];
  protected readonly modes: readonly string[] = ['hybrid', 'lexical', 'semantic'];

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
