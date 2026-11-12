import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'dp-it-prassi-document-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  templateUrl: './document-view.component.html',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- scaffold of block 23: the store and the template come with the Screen block
export class DocumentViewComponent {}
