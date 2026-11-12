-- lookup filters: tipo exact (lower-case), numero exact text, anno, data range (inclusive), ente substring, fonte; the legacy example tipo = circolare and anno = 2025
INSERT INTO documenti (ente, tipo, numero, anno, data, text_raw, estrazione, fonte, source_id) VALUES
 ('Agenzia delle Entrate', 'circolare', '10', 2093, DATE '2093-07-03', 'a', 'testo', 'ade-portale', 't050a'),
 ('Agenzia delle Entrate', 'circolare', '11', 2092, DATE '2092-07-18', 'b', 'testo', 'ade-portale', 't050b'),
 ('Agenzia delle Dogane', 'risoluzione', '52', 2093, DATE '2093-10-07', 'c', 'testo', 'ade-portale', 't050c'),
 ('Agenzia delle Entrate', 'interpello', '274', 2093, DATE '2093-10-28', 'd', 'testo', 'doctrib', 't050d');

SELECT (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND tipo = lower('Circolare') AND anno = 2093) = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND numero = '52') = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND data >= DATE '2093-07-03' AND data <= DATE '2093-10-07') = 2
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND ente ILIKE '%dogane%') = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND fonte = 'doctrib') = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't050%' AND tipo = 'circolare' AND anno = 2093 AND fonte = 'ade-portale' AND ente ILIKE '%entrate%') = 1 AS ok
