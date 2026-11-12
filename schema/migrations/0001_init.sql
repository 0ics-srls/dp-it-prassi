-- dp-it-prassi 0001: the five prassi tables. Additive only; applied by the Host as ds_it_prassi_rw with search_path ds_it_prassi, public.
-- No foreign keys: ingest replaces the passages and references of a document in one transaction (P80-07). The pgvector extension is provided by the Host.

-- Circolari, risoluzioni, provvedimenti (Agenzia delle Entrate portal) and interpelli (MEF DocTrib).
-- Identity is (fonte, source_id). numero is text and nullable (provvedimenti carry a protocol or nothing), anno and data are nullable too.
-- tipo is stored lower-case (the legacy Interpello / interpello split is fixed at ingest).
CREATE TABLE documenti (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ente text,
    struttura text,
    tipo text NOT NULL,
    numero text,
    anno integer,
    data date,
    oggetto text,
    text_raw text NOT NULL,
    estrazione text NOT NULL,
    fonte text NOT NULL,
    source_id text NOT NULL,
    source_url text,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT documenti_tipo_lower_chk CHECK (tipo = lower(tipo)),
    CONSTRAINT documenti_estrazione_chk CHECK (estrazione IN ('testo', 'ocr')),
    CONSTRAINT documenti_text_raw_not_blank_chk CHECK (length(btrim(text_raw)) > 0),
    CONSTRAINT documenti_fonte_source_id_uq UNIQUE (fonte, source_id)
);

-- Passages of a document (best passage per document feeds the semantic search). embedding is filled by the embed step.
CREATE TABLE passages (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    documento_id uuid NOT NULL,
    seq integer NOT NULL,
    text text NOT NULL,
    text_contextual text NOT NULL,
    embedding vector(1024),
    CONSTRAINT passages_documento_seq_uq UNIQUE (documento_id, seq)
);

-- Norm references cited by a document: descrizione is always the raw citation, norma_urn only when the extractor resolved it unambiguously.
CREATE TABLE riferimenti_norma (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    documento_id uuid NOT NULL,
    ord integer NOT NULL,
    descrizione text NOT NULL,
    articolo text,
    comma text,
    norma_urn text,
    via text
);

-- Items the pipeline saw but did not turn into a document (cards without PDF, details without content, headers, OCR failures).
CREATE TABLE skipped (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fonte text NOT NULL,
    item_ref text NOT NULL,
    reason text NOT NULL,
    seen_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT skipped_fonte_item_ref_uq UNIQUE (fonte, item_ref)
);

-- Declared versus taken per source window: DocTrib counter vs served per month, AdE cards vs documents per month page.
CREATE TABLE coverage (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fonte text NOT NULL,
    tipo text NOT NULL,
    anno integer NOT NULL,
    mese integer NOT NULL DEFAULT 0,
    dichiarati integer NOT NULL DEFAULT 0,
    presi integer NOT NULL DEFAULT 0,
    mancanti integer NOT NULL DEFAULT 0,
    troncati integer NOT NULL DEFAULT 0,
    noted_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT coverage_window_uq UNIQUE (fonte, tipo, anno, mese)
);
