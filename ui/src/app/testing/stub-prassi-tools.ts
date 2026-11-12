import { signal, type Provider, type WritableSignal } from '@angular/core';
import { PACKAGE_CONTEXT, type PackageScreenContext } from '@olx/package-ui-sdk';
import { createPackageContext, createStubAssets, type ToolHandler } from '@olx/package-ui-sdk/testing';

export interface ToolCallRecord {
  readonly tool: string;
  readonly input: object;
}

export interface StubPrassiEnvironment {
  readonly context: WritableSignal<PackageScreenContext>;
  readonly calls: ToolCallRecord[];
  readonly providers: Provider[];
  /** Replaces the context with a copy that has the given overrides (a NEW object, like the Host does). */
  update(overrides: Partial<PackageScreenContext>): void;
}

/** Context signal + recording tools for specs of the facade, stores and Screens. Handlers may return rows or reject. */
export function stubPrassiEnvironment(
  handlers: Readonly<Record<string, ToolHandler>> = {},
  overrides: Partial<PackageScreenContext> = {},
): StubPrassiEnvironment {
  const calls: ToolCallRecord[] = [];
  const tools = {
    call: async <T>(tool: string, input: object = {}): Promise<T> => {
      calls.push({ tool, input });
      const handler = handlers[tool];
      if (handler === undefined) {
        throw new Error(`no stub handler for ${tool}`);
      }
      return (await handler(input)) as T;
    },
  };
  const context = signal(createPackageContext({ tools, assets: createStubAssets(), ...overrides }));
  return {
    context,
    calls,
    providers: [{ provide: PACKAGE_CONTEXT, useValue: context }],
    update: (next) => {
      context.update((current) => ({ ...current, ...next }));
    },
  };
}

/** Inputs of the recorded calls of one Tool. */
export function callsOf(env: StubPrassiEnvironment, tool: string): object[] {
  return env.calls.filter((call) => call.tool === tool).map((call) => call.input);
}
