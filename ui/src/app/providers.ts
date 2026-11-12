import { provideZonelessChangeDetection, type EnvironmentProviders, type Provider } from '@angular/core';
import { providePackagePrimeNG } from '@olx/package-ui-sdk';
import { providePrassiI18n } from './i18n/provide-prassi-i18n';

/**
 * Application-level providers of the package. No router (Screens render from `subPath`); `PrassiTools` is provided by
 * each root because it needs the context that root connects.
 */
export const prassiProviders: readonly (Provider | EnvironmentProviders)[] = [
  providePackagePrimeNG({ packageName: 'it-prassi' }),
  providePrassiI18n(),
  provideZonelessChangeDetection(),
];
