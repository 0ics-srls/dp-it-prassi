-- status counts per (fonte, tipo): documents, ocr documents, passages without embedding, resolved references, skipped by reason
INSERT INTO documenti (id, tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000062a1', 'circolare', '1', 2088, 'a', 'testo', 'ade-portale', 't062a'),
 ('00000000-0000-0000-0000-0000000062a2', 'circolare', '2', 2087, 'b', 'ocr', 'ade-portale', 't062b'),
 ('00000000-0000-0000-0000-0000000062a3', 'interpello', '3', 2088, 'c', 'testo', 'doctrib', 't062c');
INSERT INTO passages (documento_id, seq, text, text_contextual, embedding) VALUES
 ('00000000-0000-0000-0000-0000000062a1', 0, 'p', 'p', array_cat(ARRAY[1::real], array_fill(0::real, ARRAY[1023]))::vector),
 ('00000000-0000-0000-0000-0000000062a1', 1, 'q', 'q', NULL);
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000062a1', 0, 'x', 'urn:nir:stato:legge:2000-07-27;212', 'numero_data'),
 ('00000000-0000-0000-0000-0000000062a1', 1, 'y', NULL, 'numero_anno');
INSERT INTO skipped (fonte, item_ref, reason) VALUES ('ade-portale', 'a', 'ocr_empty'), ('ade-portale', 'b', 'ocr_empty'), ('ade-portale', 'c', 'senza_pdf');

SELECT (SELECT count(*) FILTER (WHERE estrazione = 'ocr') FROM documenti WHERE fonte = 'ade-portale' AND source_id LIKE 't062%') = 1
   AND (SELECT count(*) FILTER (WHERE p.embedding IS NULL) FROM passages p JOIN documenti d ON d.id = p.documento_id WHERE d.source_id LIKE 't062%') = 1
   AND (SELECT count(*) FILTER (WHERE r.norma_urn IS NOT NULL) FROM riferimenti_norma r JOIN documenti d ON d.id = r.documento_id WHERE d.source_id LIKE 't062%') = 1
   AND (SELECT jsonb_object_agg(reason, n) FROM (SELECT reason, count(*) AS n FROM skipped WHERE fonte = 'ade-portale' GROUP BY reason) s) = '{"ocr_empty": 2, "senza_pdf": 1}'::jsonb AS ok
