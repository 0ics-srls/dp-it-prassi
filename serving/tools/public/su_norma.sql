-- su_norma (the repaired legacy get_prassi_su_norma): documents with a reference to an act or an article of it.
-- The legacy three-way match (equal URN, the act, any URN starting with act~) is exactly "same act part": riferimenti_norma.norma_act_urn is generated as
-- split_part(norma_urn, '~', 1) and indexed, so an article query also finds the other articles and the act-level references of the act, with no prefix collision
-- (act ;21 never matches act ;212) and no wildcard. Unresolved references (norma_urn NULL) have a NULL act part and are never hits.
-- Order (legacy): tipo, anno (a missing year last), numero (numeric when it is a number). One row per document; its matching references are in matched_refs.
WITH hits AS (
    SELECT r.documento_id,
           jsonb_agg(jsonb_build_object('descrizione', r.descrizione, 'articolo', r.articolo, 'comma', r.comma, 'norma_urn', r.norma_urn) ORDER BY r.ord) AS matched_refs
      FROM riferimenti_norma r
     WHERE r.norma_act_urn = split_part(@norma_urn, '~', 1)
     GROUP BY r.documento_id
)
SELECT d.id,
       d.tipo,
       d.numero,
       d.anno,
       d.data,
       d.ente,
       d.oggetto,
       d.source_url,
       h.matched_refs
  FROM hits h
  JOIN documenti d ON d.id = h.documento_id
 ORDER BY d.tipo, d.anno NULLS LAST, CASE WHEN d.numero ~ '^[0-9]{1,15}$' THEN d.numero::bigint END, d.numero, d.id
 LIMIT CAST(@limit AS int)
