-- su_norma, act URN: matches the act-level reference and every article-level reference of the act
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000041a1', 0, 'art 1', 'urn:nir:stato:legge:2097-01-01;41~art1', 'alias'),
 ('00000000-0000-0000-0000-0000000041a2', 0, 'legge', 'urn:nir:stato:legge:2097-01-01;41', 'numero_data');

SELECT (SELECT count(DISTINCT documento_id) FROM riferimenti_norma WHERE norma_act_urn = 'urn:nir:stato:legge:2097-01-01;41') = 2 AS ok
