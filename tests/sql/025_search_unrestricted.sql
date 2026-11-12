-- an unrestricted listing (no query, no filter) is a normal answer: rows, not an error; the guard only fires for an inverted year range
INSERT INTO documenti (tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('circolare', '1', 2092, 'a', 'testo', 'ade-portale', 't025a'), ('circolare', '2', 2092, 'b', 'testo', 'ade-portale', 't025b');

WITH prm AS (SELECT NULL::text AS query, LEAST(GREATEST(COALESCE(NULL::int, 10), 1), 50)::int AS k)
SELECT (SELECT count(*) FROM documenti d, prm WHERE prm.query IS NULL) >= 2
   AND (SELECT k FROM prm) = 10
   AND (SELECT LEAST(GREATEST(500, 1), 50)) = 50 AS ok
