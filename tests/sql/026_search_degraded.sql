-- search degraded: without a query vector (q_vec NULL) the semantic side is empty and the lexical side alone answers
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000026a1', 'circolare', '1', 2091, 'la licenza edilizia', 'testo', 'ade-portale', 't026a');
INSERT INTO passages (documento_id, seq, text, text_contextual, embedding) VALUES
 ('00000000-0000-0000-0000-0000000026a1', 0, 'p', 'p', array_cat(ARRAY[1::real], array_fill(0::real, ARRAY[1023]))::vector);

WITH prm AS (SELECT CAST(NULL AS vector) AS qv),
     chunks AS (SELECT ps.documento_id FROM passages ps CROSS JOIN prm WHERE prm.qv IS NOT NULL AND ps.embedding IS NOT NULL)
SELECT (SELECT count(*) FROM chunks) = 0
   AND (SELECT count(*) FROM documenti WHERE source_id = 't026a' AND search_vector @@ websearch_to_tsquery('italian', 'licenza')) = 1 AS ok
