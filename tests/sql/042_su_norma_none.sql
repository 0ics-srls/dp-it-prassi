-- su_norma: an unresolved reference (no URN) is never a hit, and an unknown norm is zero rows
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000042a1', 0, 'una norma non risolta', NULL, 'numero_anno');

SELECT (SELECT count(*) FROM riferimenti_norma WHERE norma_act_urn = 'urn:nir:stato:legge:2096-01-01;1') = 0
   AND (SELECT count(*) FROM riferimenti_norma WHERE norma_act_urn = split_part('', '~', 1)) = 0 AS ok
