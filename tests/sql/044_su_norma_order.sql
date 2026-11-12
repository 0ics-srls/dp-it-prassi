-- su_norma order (legacy): tipo, anno (a missing year last), numero (numeric when it is a number)
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000044a1', 'circolare', '10', 2094, 'a', 'testo', 'ade-portale', 't044a'),
 ('00000000-0000-0000-0000-0000000044a2', 'circolare', '9', 2094, 'b', 'testo', 'ade-portale', 't044b'),
 ('00000000-0000-0000-0000-0000000044a3', 'circolare', '3', NULL, 'c', 'testo', 'ade-portale', 't044c'),
 ('00000000-0000-0000-0000-0000000044a4', 'risoluzione', '1', 2090, 'd', 'testo', 'ade-portale', 't044d');

SELECT (SELECT array_agg(source_id ORDER BY tipo, anno NULLS LAST, CASE WHEN numero ~ '^[0-9]{1,15}$' THEN numero::bigint END, numero, id) FROM documenti WHERE source_id LIKE 't044%')
         = ARRAY['t044b', 't044a', 't044c', 't044d'] AS ok
