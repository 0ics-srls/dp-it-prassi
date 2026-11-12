-- an unrestricted lookup is a normal answer: the first page of the corpus and its total, never an error
INSERT INTO documenti (tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('circolare', '1', 2090, 'a', 'testo', 'ade-portale', 't053a'), ('circolare', '2', 2090, 'b', 'testo', 'ade-portale', 't053b');

SELECT (SELECT count(*) FROM documenti WHERE (NULL::text IS NULL OR tipo = lower(NULL::text)) AND (NULL::int IS NULL OR anno = NULL::int)) >= 2
   AND LEAST(GREATEST(COALESCE(NULL::int, 20), 1), 50) = 20 AS ok
