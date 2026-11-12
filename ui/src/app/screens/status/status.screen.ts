import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type PackageScreenContext } from '@olx/package-ui-sdk';
import { connectPrassiScreen, screenContextProvider } from '../../shared/connect-screen';
import { PrassiTools } from '../../tools/prassi-tools';
import { StatusStore } from './status.store';
import { StatusViewComponent } from './status-view.component';

/** Root of the dp-it-prassi-status Screen. The root only wires the context; the view injects what needs it (avoids NG0200). */
@Component({
  selector: 'dp-it-prassi-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusViewComponent],
  providers: [screenContextProvider(() => StatusScreen), PrassiTools, StatusStore],
  template: '<dp-it-prassi-status-view />',
})
export class StatusScreen {
  readonly context = input.required<PackageScreenContext>();

  constructor() {
    connectPrassiScreen(this.context);
  }
}
