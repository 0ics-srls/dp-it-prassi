import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type PackageScreenContext } from '@olx/package-ui-sdk';
import { connectPrassiScreen, screenContextProvider } from '../../shared/connect-screen';
import { DocumentViewComponent } from './document-view.component';

/** Root of the dp-it-prassi-document Screen. The root only wires the context; the view injects what needs it (avoids NG0200). */
@Component({
  selector: 'dp-it-prassi-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentViewComponent],
  providers: [screenContextProvider(() => DocumentScreen)],
  template: '<dp-it-prassi-document-view />',
})
export class DocumentScreen {
  readonly context = input.required<PackageScreenContext>();

  constructor() {
    connectPrassiScreen(this.context);
  }
}
