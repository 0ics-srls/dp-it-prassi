-- lookup sort: one CASE per column and direction, a missing value last in both directions, the legacy order as tie-break
INSERT INTO documenti (id, tipo, numero, anno, data, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000051a1', 'circolare', '10', 2092, DATE '2092-01-10', 'a', 'testo', 'ade-portale', 't051a'),
 ('00000000-0000-0000-0000-0000000051a2', 'circolare', '9',  2092, DATE '2092-01-09', 'b', 'testo', 'ade-portale', 't051b'),
 ('00000000-0000-0000-0000-0000000051a3', 'circolare', NULL, 2092, NULL,              'c', 'testo', 'ade-portale', 't051c');

SELECT (SELECT array_agg(source_id ORDER BY CASE WHEN numero ~ '^[0-9]{1,15}$' THEN numero::bigint END ASC NULLS LAST, id) FROM documenti WHERE source_id LIKE 't051%') = ARRAY['t051b', 't051a', 't051c']
   AND (SELECT array_agg(source_id ORDER BY CASE WHEN numero ~ '^[0-9]{1,15}$' THEN numero::bigint END DESC NULLS LAST, id) FROM documenti WHERE source_id LIKE 't051%') = ARRAY['t051a', 't051b', 't051c']
   AND (SELECT array_agg(source_id ORDER BY data DESC NULLS LAST, id) FROM documenti WHERE source_id LIKE 't051%') = ARRAY['t051a', 't051b', 't051c'] AS ok
