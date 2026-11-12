# ui/dist build notes

Recorded for the 0.2.0 release (open-lex-it plan-c, blocks 23-27). The Host never builds; the committed `dist` is the registered artifact.

| Item | Value |
|---|---|
| Command | `npm ci && npm run build` |
| SDK | `@olx/package-ui-sdk` 0.2.2 from `vendor/olx-package-ui-sdk-0.2.2.tgz` (the same tarball as `dp-it-giurisprudenza`, copied, not rebuilt) |
| `du -sb dist` | 483602 bytes (limit `PackageUi:MaxBytes` 5 MB) |
| `main.js` | 440396 bytes (limit per file 1.5 MB) |
| chunks | none (single bundle, no lazy chunks) |
| `styles.css` | 0 bytes (the package relies on the Host PrimeNG theme) |
| `3rdpartylicenses.txt` | 43188 bytes |
| `prerendered-routes.json` | 18 bytes |
| files in `dist` / tracked by git | 4 / 4 |
| `grep -c "zone.js" dist/main.js` | 0 (zoneless) |
| Custom elements | `dp-it-prassi-corpus`, `dp-it-prassi-document`, `dp-it-prassi-status` (the SDK requires the prefix `dp-<package name>-`) |
| Determinism | a second `npm run build` gives the same md5 for the four files (`outputHashing: none`) |
| Unit tests | `npm test` (Vitest through `ng test`), `npm run lint` |

The lock file derives from the one of `dp-it-giurisprudenza` (package name replaced; `ajv` added as a devDependency, it was already in the lock as a transitive development dependency); `npm ci` works.

The specs validate every argument object a Screen sends against the real Tool schemas in `../serving/tools/public` (`src/app/testing/tool-schemas.ts`), so a Screen that drifts from a Tool fails its own spec.
