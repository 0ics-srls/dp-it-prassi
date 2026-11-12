-- search, RRF (k = 60, 1-based): a row in both lists beats rows in one, a tie goes to the lexical side
WITH lex(key, rn) AS (VALUES ('d:3', 1), ('d:1', 2), ('d:2', 3)),
     sem(key, rn) AS (VALUES ('d:9', 1), ('d:3', 2), ('d:7', 3)),
     fused AS (
         SELECT COALESCE(l.key, s.key) AS key,
                COALESCE(1.0 / (60 + l.rn), 0) + COALESCE(1.0 / (60 + s.rn), 0) AS rrf,
                COALESCE(l.rn, 1000000000) AS lex_rn,
                COALESCE(s.rn, 1000000000) AS sem_rn
           FROM lex l FULL OUTER JOIN sem s ON s.key = l.key),
     picked AS (SELECT key, row_number() OVER (ORDER BY rrf DESC, lex_rn, sem_rn, key) AS pos FROM fused)
-- d:3 is in both lists (1/61 + 1/62); d:9 = 1/61, d:1 = 1/62, then d:2 (lexical 3) and d:7 (semantic 3) tie at 1/63 and the lexical side goes first
SELECT (SELECT array_agg(key ORDER BY pos) FROM picked) = ARRAY['d:3', 'd:9', 'd:1', 'd:2', 'd:7'] AS ok
