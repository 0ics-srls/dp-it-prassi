-- a provvedimento without number, year and date has no natural key: it is reachable by id only
INSERT INTO documenti (id, tipo, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000034a1', 'provvedimento', 'Provvedimento del Direttore', 'testo', 'ade-portale', 't034a');

SELECT (SELECT count(*) FROM documenti WHERE id = '00000000-0000-0000-0000-0000000034a1') = 1
   AND (SELECT count(*) FROM documenti WHERE tipo = 'provvedimento' AND numero = 'x' AND anno = 2025 AND source_id = 't034a') = 0
   AND (SELECT numero IS NULL AND anno IS NULL AND data IS NULL FROM documenti WHERE source_id = 't034a') AS ok
