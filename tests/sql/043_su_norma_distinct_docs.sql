-- su_norma: two references of one document are one row, both listed in matched_refs
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, articolo, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000043a1', 1, 'art 20', '20', 'urn:nir:stato:legge:2095-01-01;43~art20', 'alias'),
 ('00000000-0000-0000-0000-0000000043a1', 0, 'art 19', '19', 'urn:nir:stato:legge:2095-01-01;43~art19', 'alias');

WITH hits AS (
    SELECT r.documento_id, jsonb_agg(jsonb_build_object('descrizione', r.descrizione, 'articolo', r.articolo, 'comma', r.comma, 'norma_urn', r.norma_urn) ORDER BY r.ord) AS matched
      FROM riferimenti_norma r WHERE r.norma_act_urn = 'urn:nir:stato:legge:2095-01-01;43' GROUP BY r.documento_id)
SELECT (SELECT count(*) FROM hits) = 1
   AND (SELECT jsonb_array_length(matched) FROM hits) = 2
   AND (SELECT matched -> 0 ->> 'articolo' FROM hits) = '19' AS ok
