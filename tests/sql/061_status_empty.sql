-- status on empty tables: aggregates over nothing give zeros (never NULL counts) and the corpus is declared empty
SELECT (SELECT count(*) FROM documenti) = 0
   AND (SELECT count(*) FROM passages WHERE embedding IS NULL) = 0
   AND (SELECT COALESCE(jsonb_object_agg(reason, n), '{}'::jsonb) FROM (SELECT reason, count(*) AS n FROM skipped GROUP BY reason) s) = '{}'::jsonb
   AND (SELECT COALESCE(jsonb_agg(c.anno), '[]'::jsonb) FROM coverage c) = '[]'::jsonb
   AND NOT EXISTS (SELECT 1 FROM documenti) AS ok
