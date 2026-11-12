import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DocumentStore } from './document.store';

@Component({
  selector: 'dp-it-prassi-document-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, DatePipe],
  templateUrl: './document-view.component.html',
  styleUrl: './document-view.component.css',
})
export class DocumentViewComponent {
  protected readonly store = inject(DocumentStore);

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
