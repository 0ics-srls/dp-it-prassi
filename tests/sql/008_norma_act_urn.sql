-- the act urn is the part of norma_urn before the article separator
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, articolo, norma_urn, via)
VALUES ('00000000-0000-0000-0000-0000000000b1', 0, 'art. 19 del decreto IVA', 'art. 19', 'urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;633~art19', 'alias'),
       ('00000000-0000-0000-0000-0000000000b1', 1, 'legge 27 luglio 2000, n. 212', NULL, 'urn:nir:stato:legge:2000-07-27;212', 'numero_data'),
       ('00000000-0000-0000-0000-0000000000b1', 2, 'una norma non risolta', NULL, NULL, 'numero_anno');

SELECT (SELECT norma_act_urn FROM riferimenti_norma WHERE ord = 0) = 'urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;633'
   AND (SELECT norma_act_urn FROM riferimenti_norma WHERE ord = 1) = 'urn:nir:stato:legge:2000-07-27;212'
   AND (SELECT norma_act_urn FROM riferimenti_norma WHERE ord = 2) IS NULL
   AND (SELECT count(*) FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'riferimenti_norma' AND indexdef ILIKE '%text_pattern_ops%') = 1 AS ok
