-- search mode lexical: the Host skips the query embedding (x-embed.skipWhen) and binds q_vec NULL; the lexical rows are exactly those of a call that had a vector
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000027a1', 'circolare', '1', 2092, 'La licenza edilizia è rilasciata dal comune.', 'testo', 'ade-portale', 't027a'),
 ('00000000-0000-0000-0000-0000000027a2', 'circolare', '2', 2092, 'Il permesso sostituisce la licenza edilizia.', 'testo', 'ade-portale', 't027b'),
 ('00000000-0000-0000-0000-0000000027a3', 'circolare', '3', 2092, 'La sanzione è applicata dal prefetto.', 'testo', 'ade-portale', 't027c');
INSERT INTO passages (documento_id, seq, text, text_contextual, embedding) VALUES
 ('00000000-0000-0000-0000-0000000027a1', 0, 'p', 'p', array_cat(ARRAY[1::real], array_fill(0::real, ARRAY[1023]))::vector),
 ('00000000-0000-0000-0000-0000000027a2', 0, 'p', 'p', array_cat(ARRAY[0::real, 1::real], array_fill(0::real, ARRAY[1022]))::vector);

WITH calls AS (
    SELECT 'with_vector' AS name, 'lexical' AS mode, CAST(array_cat(ARRAY[1::real], array_fill(0::real, ARRAY[1023]))::vector AS text) AS q_vec
    UNION ALL
    SELECT 'null_vector', 'lexical', CAST(NULL AS text)
),
result AS (
    SELECT c.name,
           (SELECT array_agg(f.source_id ORDER BY f.rn)
              FROM (SELECT d.source_id, row_number() OVER (ORDER BY ts_rank_cd(d.search_vector, websearch_to_tsquery('italian', 'licenza edilizia')) DESC, d.id) AS rn
                      FROM documenti d
                     WHERE d.anno = 2092 AND c.mode <> 'semantic' AND d.search_vector @@ websearch_to_tsquery('italian', 'licenza edilizia')) f) AS lexical_rows,
           (SELECT count(*) FROM passages ps
             WHERE ps.documento_id::text LIKE '00000000-0000-0000-0000-0000000027a%' AND c.mode <> 'lexical' AND CAST(c.q_vec AS vector) IS NOT NULL AND ps.embedding IS NOT NULL) AS semantic_rows
      FROM calls c
)
SELECT (SELECT count(*) FROM result) = 2
   AND (SELECT count(DISTINCT lexical_rows) FROM result) = 1
   AND (SELECT lexical_rows FROM result WHERE name = 'null_vector') @> ARRAY['t027a', 't027b']
   AND (SELECT cardinality(lexical_rows) FROM result WHERE name = 'null_vector') = 2
   AND (SELECT max(semantic_rows) FROM result) = 0 AS ok
