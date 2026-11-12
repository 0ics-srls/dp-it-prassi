SELECT (SELECT count(*) FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'passages' AND indexdef ILIKE '%hnsw%' AND indexdef ILIKE '%vector_cosine_ops%') = 1
   AND (SELECT count(*) FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'passages' AND indexdef ILIKE '%(documento_id)%') >= 1
   AND (SELECT format_type(a.atttypid, a.atttypmod) FROM pg_attribute a WHERE a.attrelid = 'passages'::regclass AND a.attname = 'embedding') = 'vector(1024)'
   AND (SELECT count(*) FROM pg_constraint WHERE conrelid = 'passages'::regclass AND contype = 'u') >= 1 AS ok
