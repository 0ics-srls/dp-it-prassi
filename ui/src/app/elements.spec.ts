import { NgZone, type EnvironmentProviders, type Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { PrimeNG } from 'primeng/config';
import { must } from './testing/dom';
import { stubPrassiEnvironment } from './testing/stub-prassi-tools';
import { prassiProviders } from './providers';
import { registerPrassi } from './register';
import { ELEMENTS } from './screens';

const TAGS = ['dp-it-prassi-corpus', 'dp-it-prassi-document', 'dp-it-prassi-status'];

function flatten(providers: readonly (Provider | EnvironmentProviders)[]): readonly unknown[] {
  return providers.flatMap((p) => {
    if (Array.isArray(p)) {
      return flatten(p as Provider[]);
    }
    const inner = (p as { ɵproviders?: readonly Provider[] }).ɵproviders;
    return inner === undefined ? [p] : flatten(inner);
  });
}

describe('ELEMENTS', () => {
  it('should hold exactly the three package tags when listed', () => {
    expect(Object.keys(ELEMENTS).sort()).toEqual(TAGS);
  });

  it('should prefix every tag with dp-it-prassi- and map it to a component class when listed', () => {
    for (const [tag, type] of Object.entries(ELEMENTS)) {
      expect(tag.startsWith('dp-it-prassi-')).toBe(true);
      expect((type as unknown as { ɵcmp?: unknown }).ɵcmp).toBeDefined();
    }
  });
});

describe('registerPrassi', () => {
  it('should pass the package name, the map and the providers when registering', async () => {
    const define = vi.fn().mockResolvedValue(undefined);
    await registerPrassi(define);
    expect(define).toHaveBeenCalledTimes(1);
    const [name, map, options] = define.mock.calls[0] as [string, unknown, { providers: unknown }];
    expect(name).toBe('it-prassi');
    expect(map).toBe(ELEMENTS);
    expect(options.providers).toBe(prassiProviders);
  });

  it('should provide PrimeNG, i18n and zoneless change detection when the injector is built', () => {
    TestBed.configureTestingModule({ providers: [...prassiProviders] });
    expect(TestBed.inject(PrimeNG)).toBeDefined();
    expect(TestBed.inject(TranslocoService)).toBeDefined();
    expect(TestBed.inject(NgZone).constructor.name).toBe('NoopNgZone');
  });

  it('should not provide a router or zone change detection when the providers are listed', () => {
    const tokens = flatten(prassiProviders).map((p) => (p as { provide?: unknown }).provide);
    const names = tokens.map((t) => (typeof t === 'function' ? t.name : String(t)));
    expect(names).not.toContain('Router');
    expect(names.join('|')).not.toMatch(/ROUTES|NgZoneChangeDetectionScheduler|ZoneChangeDetection/);
  });
});

describe('Screen elements', () => {
  for (const tag of TAGS) {
    it(`should render a title without network when ${tag} gets a stub context`, async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const env = stubPrassiEnvironment({
        search: () => [],
        lookup: () => [],
        doc: () => [],
        su_norma: () => [],
        status: () => [],
      });
      TestBed.configureTestingModule({ providers: [...prassiProviders] });
      const fixture = TestBed.createComponent(ELEMENTS[tag as keyof typeof ELEMENTS]);
      fixture.componentRef.setInput('context', env.context());
      fixture.detectChanges();
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(must(fixture.nativeElement as HTMLElement, '[data-testid="screen-title"]').textContent.trim()).not.toBe('');
      });
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  }
});
