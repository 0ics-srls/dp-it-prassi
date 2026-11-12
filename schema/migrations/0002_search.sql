-- dp-it-prassi 0002: full-text (italian) over oggetto and text, generated act urn, vector index, lookup indexes.

ALTER TABLE documenti ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('italian', coalesce(oggetto, '') || ' ' || text_raw)) STORED;

-- The act part of norma_urn (before the article separator) joins the references to it-normativa acts.
ALTER TABLE riferimenti_norma ADD COLUMN norma_act_urn text GENERATED ALWAYS AS (split_part(norma_urn, '~', 1)) STORED;

CREATE INDEX documenti_search_vector_idx ON documenti USING gin (search_vector);
CREATE INDEX documenti_tipo_anno_numero_idx ON documenti (tipo, anno, numero);
CREATE INDEX documenti_anno_idx ON documenti (anno);
CREATE INDEX documenti_ente_idx ON documenti (ente);
CREATE INDEX documenti_data_idx ON documenti (data);
CREATE INDEX documenti_numero_idx ON documenti (numero);

CREATE INDEX passages_embedding_hnsw_idx ON passages USING hnsw (embedding vector_cosine_ops);
CREATE INDEX passages_documento_id_idx ON passages (documento_id);

CREATE INDEX riferimenti_norma_norma_urn_idx ON riferimenti_norma (norma_urn text_pattern_ops);
CREATE INDEX riferimenti_norma_norma_act_urn_idx ON riferimenti_norma (norma_act_urn);
CREATE INDEX riferimenti_norma_documento_id_idx ON riferimenti_norma (documento_id);
