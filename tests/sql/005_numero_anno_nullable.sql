-- provvedimenti carry no progressive number and 47 of them no date: numero, anno, data, oggetto and struttura are all optional
INSERT INTO documenti (ente, tipo, text_raw, estrazione, fonte, source_id)
VALUES ('Agenzia delle Entrate', 'provvedimento', 'Provvedimento del Direttore', 'testo', 'ade-portale', 'Provv_senza_numero');

SELECT numero IS NULL AND anno IS NULL AND data IS NULL AND oggetto IS NULL AND struttura IS NULL AND source_url IS NULL
   AND id IS NOT NULL AND ingested_at IS NOT NULL AS ok
FROM documenti WHERE source_id = 'Provv_senza_numero'
