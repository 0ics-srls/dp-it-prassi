import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { StatusStore } from './status.store';

const KNOWN_FONTI: readonly string[] = ['ade-portale', 'doctrib'];

@Component({
  selector: 'dp-it-prassi-status-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, DatePipe],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css',
})
export class StatusViewComponent {
  protected readonly store = inject(StatusStore);

  /** The translation key of a fonte the package knows, null for any other (then the raw name is shown). */
  protected fonteKey(fonte: string | null): string | null {
    return fonte !== null && KNOWN_FONTI.includes(fonte) ? `status.fonti.${fonte}` : null;
  }
}
