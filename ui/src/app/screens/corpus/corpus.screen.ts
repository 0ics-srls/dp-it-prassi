import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type PackageScreenContext } from '@olx/package-ui-sdk';
import { connectPrassiScreen, screenContextProvider } from '../../shared/connect-screen';
import { CorpusViewComponent } from './corpus-view.component';

/** Root of the dp-it-prassi-corpus Screen. The root only wires the context; the view injects what needs it (avoids NG0200). */
@Component({
  selector: 'dp-it-prassi-corpus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CorpusViewComponent],
  providers: [screenContextProvider(() => CorpusScreen)],
  template: '<dp-it-prassi-corpus-view />',
})
export class CorpusScreen {
  readonly context = input.required<PackageScreenContext>();

  constructor() {
    connectPrassiScreen(this.context);
  }
}
