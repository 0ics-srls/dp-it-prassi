-- search without a query lists the documents in the legacy order: tipo, anno, numero (numeric when it is a number), a missing number last, id breaks ties
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000024a1', 'circolare',  '10', 2094, 'a', 'testo', 'ade-portale', 't024a'),
 ('00000000-0000-0000-0000-0000000024a2', 'circolare',  '9',  2094, 'b', 'testo', 'ade-portale', 't024b'),
 ('00000000-0000-0000-0000-0000000024a3', 'circolare',  NULL, 2094, 'c', 'testo', 'ade-portale', 't024c'),
 ('00000000-0000-0000-0000-0000000024a4', 'circolare',  '1',  2093, 'd', 'testo', 'ade-portale', 't024d'),
 ('00000000-0000-0000-0000-0000000024a5', 'interpello', '5',  2090, 'e', 'testo', 'doctrib', 't024e');

SELECT (SELECT array_agg(source_id ORDER BY tipo, anno, CASE WHEN numero ~ '^[0-9]{1,15}$' THEN numero::bigint END, numero, id)
          FROM documenti WHERE source_id LIKE 't024%') = ARRAY['t024d', 't024b', 't024a', 't024c', 't024e'] AS ok
