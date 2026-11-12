-- doc: one document by id or by its natural key, the text in slices (the legacy get_prassi envelope as columns: truncated, text_length, next_offset).
-- The natural key is the legacy exact equality: tipo is stored lower-case so the argument is lower-cased; the key can match several rows (an English version, a repeated identity).
WITH prm AS (SELECT CAST(@offset AS int) AS o, CAST(@length AS int) AS l)
SELECT d.id,
       d.ente,
       d.struttura,
       d.tipo,
       d.numero,
       d.anno,
       d.data,
       d.oggetto,
       substr(d.text_raw, prm.o + 1, prm.l) AS text,
       length(d.text_raw) AS text_length,
       (prm.o + prm.l < length(d.text_raw)) AS truncated,
       CASE WHEN prm.o + prm.l < length(d.text_raw) THEN prm.o + prm.l END AS next_offset,
       d.estrazione,
       d.fonte,
       d.source_id,
       d.source_url,
       (SELECT COALESCE(jsonb_agg(jsonb_build_object('descrizione', r.descrizione, 'articolo', r.articolo, 'comma', r.comma, 'norma_urn', r.norma_urn) ORDER BY r.ord), '[]'::jsonb)
          FROM riferimenti_norma r
         WHERE r.documento_id = d.id) AS riferimenti
  FROM documenti d
 CROSS JOIN prm
 WHERE (@id IS NOT NULL AND d.id = CAST(@id AS uuid))
    OR (@id IS NULL AND d.tipo = lower(@tipo) AND d.numero = @numero AND d.anno = @anno)
 ORDER BY d.source_id, d.id
 LIMIT 5
