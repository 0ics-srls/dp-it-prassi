import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'dp-it-prassi-corpus-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  templateUrl: './corpus-view.component.html',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- scaffold of block 23: the store and the template come with the Screen block
export class CorpusViewComponent {}
