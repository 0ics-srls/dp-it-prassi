-- status: live coverage per (fonte, tipo) and the honest limits, all from the data. An empty corpus answers one row of zeros.
WITH docs AS (
    SELECT d.id, d.fonte, d.tipo, d.numero, d.anno, d.estrazione, d.ingested_at,
           (SELECT count(*) FROM passages p WHERE p.documento_id = d.id) AS n_pass,
           (SELECT count(*) FROM passages p WHERE p.documento_id = d.id AND p.embedding IS NULL) AS n_pending,
           (SELECT count(*) FROM riferimenti_norma r WHERE r.documento_id = d.id) AS n_refs,
           (SELECT count(*) FROM riferimenti_norma r WHERE r.documento_id = d.id AND r.norma_urn IS NOT NULL) AS n_mapped
      FROM documenti d),
per AS (
    SELECT fonte, tipo,
           count(*) AS documents,
           min(anno) AS year_min,
           max(anno) AS year_max,
           count(*) FILTER (WHERE estrazione = 'ocr') AS ocr_documents,
           sum(n_pass)::bigint AS passages,
           sum(n_pending)::bigint AS passages_pending,
           sum(n_refs)::bigint AS refs_total,
           sum(n_mapped)::bigint AS refs_mapped,
           max(ingested_at) AS last_ingested_at
      FROM docs
     GROUP BY fonte, tipo),
dup AS (
    SELECT fonte, tipo, count(*) AS groups
      FROM (SELECT fonte, tipo, numero, anno FROM documenti
             WHERE numero IS NOT NULL AND anno IS NOT NULL
             GROUP BY fonte, tipo, numero, anno HAVING count(*) > 1) g
     GROUP BY fonte, tipo),
skip AS (
    SELECT fonte, jsonb_object_agg(reason, n) AS by_reason
      FROM (SELECT fonte, reason, count(*) AS n FROM skipped GROUP BY fonte, reason) s
     GROUP BY fonte),
cov AS (
    SELECT fonte, tipo,
           jsonb_agg(jsonb_build_object('anno', anno, 'mese', mese, 'dichiarati', dichiarati, 'presi', presi,
                                        'mancanti', mancanti, 'troncati', troncati) ORDER BY anno, mese) AS windows
      FROM coverage
     GROUP BY fonte, tipo),
tot AS (
    SELECT COALESCE(sum(n_refs), 0)::bigint AS refs, COALESCE(sum(n_mapped), 0)::bigint AS mapped,
           count(*) FILTER (WHERE fonte = 'doctrib') AS interpelli,
           min(anno) FILTER (WHERE fonte = 'doctrib') AS i_from,
           max(anno) FILTER (WHERE fonte = 'doctrib') AS i_to
      FROM docs),
note AS (
    SELECT 'Riferimenti normativi risolti in URN: ' || mapped || ' su ' || refs || ' (la ricerca per norma vede solo questi). '
           || CASE WHEN interpelli > 0 AND i_from IS NOT NULL THEN 'Interpelli: ' || i_from || '-' || i_to || '. ' ELSE '' END
           || 'Circolari e risoluzioni precedenti alle pagine mensili del portale (giugno 2019), la prassi anteriore e quella di altri enti NON sono nel corpus. '
           || 'I passaggi senza embedding non sono raggiungibili dalla ricerca semantica.' AS text
      FROM tot)
SELECT per.fonte,
       per.tipo,
       per.documents,
       per.year_min,
       per.year_max,
       per.ocr_documents,
       per.passages,
       per.passages_pending,
       per.refs_total,
       per.refs_mapped,
       COALESCE(skip.by_reason, '{}'::jsonb) AS skipped,
       COALESCE(dup.groups, 0)::bigint AS duplicate_identity_groups,
       per.last_ingested_at,
       (SELECT text FROM note) AS note,
       COALESCE(cov.windows, '[]'::jsonb) AS coverage
  FROM per
  LEFT JOIN skip ON skip.fonte = per.fonte
  LEFT JOIN dup ON dup.fonte = per.fonte AND dup.tipo = per.tipo
  LEFT JOIN cov ON cov.fonte = per.fonte AND cov.tipo = per.tipo
UNION ALL
SELECT NULL, NULL, 0::bigint, NULL::int, NULL::int, 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint,
       COALESCE((SELECT jsonb_object_agg(reason, n) FROM (SELECT reason, count(*) AS n FROM skipped GROUP BY reason) s), '{}'::jsonb),
       0::bigint, NULL::timestamptz,
       'Nessun documento nel corpus: il primo import non e'' ancora avvenuto. Circolari e risoluzioni precedenti al giugno 2019 NON sono nel corpus.',
       COALESCE((SELECT jsonb_agg(jsonb_build_object('anno', anno, 'mese', mese, 'dichiarati', dichiarati, 'presi', presi,
                                                      'mancanti', mancanti, 'troncati', troncati) ORDER BY fonte, anno, mese) FROM coverage), '[]'::jsonb)
 WHERE NOT EXISTS (SELECT 1 FROM documenti)
 ORDER BY 1, 2
