import type { Type } from '@angular/core';
import { CorpusScreen } from './screens/corpus/corpus.screen';
import { DocumentScreen } from './screens/document/document.screen';
import { StatusScreen } from './screens/status/status.screen';

/** Custom elements of the package: three Screens. */
export const ELEMENTS = {
  'dp-it-prassi-corpus': CorpusScreen,
  'dp-it-prassi-document': DocumentScreen,
  'dp-it-prassi-status': StatusScreen,
} as const satisfies Readonly<Record<string, Type<unknown>>>;
