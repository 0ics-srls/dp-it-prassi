# dp-it-prassi

Data Platform package `it-prassi` (0.1.0): the Italian tax practice (prassi) as a searchable corpus with norm references.

## Purpose

Circolari, risoluzioni and provvedimenti of the Agenzia delle Entrate and the interpelli answers published by the MEF on DocTrib are
fetched, converted to text (PDF text layer first, local tesseract OCR for scans), split into passages, embedded and served through six
Tools. The package replaces the legacy `search_prassi`, `get_prassi`, `get_prassi_su_norma` and `query_prassi` Tools of the Letak/Lex corpus
(Legacy) and keeps their behaviour where a test pins it (Parity: RRF constants, snippet and headline options, slice size).

Prassi is the interpretation of the tax administration. NON è una fonte del diritto: every Tool answer and the `it-prassi_guide` text say so.

## Sources and licences

| Source | Content | Licence status |
| --- | --- | --- |
| Agenzia delle Entrate portal (`https://www.agenziaentrate.gov.it/`) | circolari, risoluzioni, provvedimenti, month pages | `source-terms-not-published` (official acts, art. 5 L. 633/1941; no licence text is published) |
| MEF def.finanze.it DocTrib (`https://def.finanze.it/`) | interpelli of the Agenzia delle Entrate | `source-terms-not-published` (MEF/CeRDEF, terms not found) |

Both are public administrative acts. The package respects the hosts: a browser User-Agent, a pause of at least 0.6 s between requests
(`delaySeconds`) and one request at a time.

## Source types and settings

Two Source types, each with its own configuration (see `dataplatform.json` for the schema and the labels):

- `ade-portale`: `tipologie` (circolari, risoluzioni, provvedimenti), `annoFrom`, `annoTo`, `mesi`, `skipBefore` (default `2019-06`), `only` and `maxDocs`
  (sample filters), `baseUrl` (replay server), `refreshToken`, `tokenBudget`, `dryRun`.
- `doctrib-prassi`: `tipoEstremi` (Interpello), `ente`, `annoFrom`, `annoTo`, `mesi`, `only`, `maxItems`, `delaySeconds` (at least 0.6), `verifyTls` (default true),
  `refreshToken`, `tokenBudget`, `dryRun`.

`verifyTls` stays on: def.finanze.it sends only its leaf certificate, so the grab class pins the missing Sectigo intermediate (certs/ in the grab repo)
and verifies the chain against it. `tokenBudget` is the hard stop of embedding tokens per Run and `dryRun` plans the embeddings without calling the
embedding service.

## Pipeline

| Step | Class (pinned tag) | Does |
| --- | --- | --- |
| detect | `dp-it-prassi-detect@v0.1.0` | lists the month pages and the DocTrib windows; one catalog item per document and version (`itemId|version`) |
| grab | `dp-it-prassi-grab@v0.1.0` | downloads the PDF of one item and writes the coverage (declared versus taken) |
| convert | `dp-it-prassi-convert@v0.1.0` | extracts the text (pypdfium2 text layer, local tesseract OCR for scans), the estremi and the norm references; writes a plan |
| ingest | `dp-it-prassi-ingest@v0.1.0` | applies the plan to the dataset: documents, passages, references, skipped, coverage |
| embed | `dp-lex-embed@dp-p7.1` | embeds the passages that have no vector yet (`passages.embedding`, 1024 dimensions) |

## Schema

Dataset schema `ds_it_prassi` (migrations in `schema/migrations`, contract `serving/dataset.odcs.yaml`):

- `documenti`: ente, tipo, numero, anno, data, oggetto, `text_raw` (large value, only the `doc` Tool serves it, in slices), estrazione (`testo` or `ocr`), fonte, source_id, source_url.
- `passages`: the chunks of a document with `text`, `text_contextual` and `embedding vector(1024)`.
- `riferimenti_norma`: the norm references of a document; `descrizione` is the raw citation, `norma_urn` is set only when the extractor resolved it unambiguously.
- `skipped`: items seen but not turned into a document, with the reason (cards without PDF, OCR failures).
- `coverage`: declared versus taken per source window.

## Tools

All Tools are public and read-only. The Gateway names carry the hyphenated prefix.

| Tool | Parameters | Returns |
| --- | --- | --- |
| `it-prassi_search` | `query`, `mode` (hybrid, lexical, semantic), `k` (1..50, default 10), `tipo`, `ente`, `anno_from`, `anno_to` | documents with estremi, snippet, headline and link; hybrid fuses full text and the best passage per document with RRF (k = 60) |
| `it-prassi_doc` | `id` or `tipo` + `numero` + `anno`; `offset`, `length` (default 20,000) | one document, the text in slices (`truncated`, `next_offset`) and its norm references |
| `it-prassi_su_norma` | `norma_urn` (URN:NIR of the act or the article), `limit` | documents that cite the norm; best-effort |
| `it-prassi_lookup` | `tipo`, `numero`, `anno`, `data_from`, `data_to`, `ente`, `fonte`, `sort`, `desc`, `limit`, `offset` | the estremi of the matching documents, never the text; `total` is the size of the filtered set |
| `it-prassi_guide` | none | the Italian usage text |
| `it-prassi_status` | none | real coverage per source and type, computed from the data |

Examples:

- `it-prassi_search` with `{"query": "fringe benefit", "tipo": "circolare", "anno_from": 2023, "k": 5}`
- `it-prassi_doc` with `{"tipo": "circolare", "numero": "10", "anno": 2025}`, then again with `offset` = `next_offset` while `truncated` is true
- `it-prassi_su_norma` with `{"norma_urn": "urn:nir:stato:legge:2000-07-27;212~art11"}`
- `it-prassi_lookup` with `{"tipo": "interpello", "anno": 2025, "sort": "numero", "desc": true, "limit": 10}`

`search` and `lookup` accept an empty call (a Screen opens with no parameters) and list the first page of the corpus.

## Honest limits

- The portal month pages exist from mid-2019 (`skipBefore` 2019-06): circolari and risoluzioni of the pre-2019 archive are NOT in the corpus; the same holds for other authorities.
- The corpus holds only the years a Source asks for (`annoFrom`, `annoTo`, default the current year). The legacy default for interpelli started in 2018; `it-prassi_status` reports the years really present.
- `it-prassi_su_norma` is best-effort: only the references the extractor resolved to an URN are searchable. NON è una prova that nobody cites a norm when the answer is empty.
- Some interpelli do not declare their number; the same estremi may belong to more than one row (for example an English version), which `status` counts as duplicate identity groups.
- OCR is local tesseract only; a scan with an empty OCR result is skipped with the reason `ocr_empty` and listed in `status`.
- Numeric ranking scores are not exposed: results are ordered by relevance.

## Tests

- `tests/sql/*.sql`: migrations, constraints and the SQL facts behind every Tool (each file returns one boolean `ok`).
- `tests/tools/*.json`: one call per Tool with the expected row count.
- `tests/conformance/*.json`: the detect class and the embed class conformance fixtures.
- The C# harness (`tests/DataPlatform.Registry.Tests/DpItPrassi` in open-lex-it) runs the real Tool SQL against a scratch dataset and the registration stages offline.
- Each class repository carries its own pytest suite (ruff, mypy strict) and a Dockerfile.test that runs it in the image.
