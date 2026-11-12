-- search filters: tipo is a case-insensitive equality (the legacy ILIKE without wildcards), ente a substring, anno an inclusive range with either bound optional
INSERT INTO documenti (ente, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('Agenzia delle Entrate', 'interpello', '1', 2096, 'a', 'testo', 'doctrib', 't021a'),
 ('Agenzia delle Entrate', 'circolare', '2', 2097, 'b', 'testo', 'ade-portale', 't021b'),
 ('Agenzia delle Dogane', 'circolare', '3', 2098, 'c', 'testo', 'ade-portale', 't021c'),
 ('100% Ente_X', 'risoluzione', '4', 2099, 'd', 'testo', 'ade-portale', 't021d');

SELECT (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND tipo ILIKE 'Interpello') = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND tipo ILIKE 'CIRCOLARE') = 2
   -- a literal % or _ in the argument is escaped and matches only itself
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND tipo ILIKE replace(replace(replace('%', '\', '\\'), '%', '\%'), '_', '\_') ESCAPE '\') = 0
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND ente ILIKE '%' || replace(replace(replace('100%', '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\') = 1
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND ente ILIKE '%entrate%') = 2
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND anno >= 2097 AND anno <= 2098) = 2
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND anno >= 2098) = 2
   AND (SELECT count(*) FROM documenti WHERE source_id LIKE 't021%' AND anno <= 2096) = 1 AS ok
