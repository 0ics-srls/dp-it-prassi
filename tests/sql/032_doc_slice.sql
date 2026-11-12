-- doc slices: substr(text, offset + 1, length); truncated while offset + length < text_length; next_offset is offset + length or NULL
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000032a1', 'circolare', '1', 2087, repeat('abcdefghi ', 4500), 'testo', 'ade-portale', 't032a');

WITH d AS (SELECT text_raw, length(text_raw) AS n FROM documenti WHERE source_id = 't032a')
SELECT (SELECT n FROM d) = 45000
   AND length(substr((SELECT text_raw FROM d), 0 + 1, 20000)) = 20000
   AND (0 + 20000 < (SELECT n FROM d)) AND (CASE WHEN 0 + 20000 < (SELECT n FROM d) THEN 0 + 20000 END) = 20000
   AND length(substr((SELECT text_raw FROM d), 40000 + 1, 20000)) = 5000
   AND NOT (40000 + 20000 < (SELECT n FROM d)) AND (CASE WHEN 40000 + 20000 < (SELECT n FROM d) THEN 40000 + 20000 END) IS NULL
   AND substr((SELECT text_raw FROM d), 99999 + 1, 20000) = '' AS ok
