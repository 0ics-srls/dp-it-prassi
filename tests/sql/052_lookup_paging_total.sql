-- lookup paging: total is the size of the filtered set on every page (a window count evaluated before LIMIT/OFFSET)
INSERT INTO documenti (tipo, numero, anno, text_raw, estrazione, fonte, source_id)
SELECT 'circolare', g::text, 2091, 'x', 'testo', 'ade-portale', 't052_' || g FROM generate_series(1, 7) g;

SELECT (SELECT min(total) FROM (SELECT count(*) OVER () AS total FROM documenti WHERE source_id LIKE 't052%' ORDER BY id LIMIT 3 OFFSET 0) a) = 7
   AND (SELECT min(total) FROM (SELECT count(*) OVER () AS total FROM documenti WHERE source_id LIKE 't052%' ORDER BY id LIMIT 3 OFFSET 6) b) = 7
   AND (SELECT count(*) FROM (SELECT count(*) OVER () AS total FROM documenti WHERE source_id LIKE 't052%' ORDER BY id LIMIT 3 OFFSET 20) c) = 0 AS ok
