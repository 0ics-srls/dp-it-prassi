-- su_norma, article URN: matches the same article, the act-level reference and the other articles of the act (the legacy OR collapses to the act part)
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000040a1', 0, 'art 19', 'urn:nir:stato:legge:2098-01-01;40~art19', 'alias'),
 ('00000000-0000-0000-0000-0000000040a2', 0, 'art 20', 'urn:nir:stato:legge:2098-01-01;40~art20', 'alias'),
 ('00000000-0000-0000-0000-0000000040a3', 0, 'legge', 'urn:nir:stato:legge:2098-01-01;40', 'numero_data'),
 ('00000000-0000-0000-0000-0000000040a4', 0, 'altra legge', 'urn:nir:stato:legge:2098-01-01;401~art19', 'alias');

SELECT (SELECT count(DISTINCT documento_id) FROM riferimenti_norma WHERE norma_act_urn = split_part('urn:nir:stato:legge:2098-01-01;40~art19', '~', 1)) = 3
   AND (SELECT count(*) FROM riferimenti_norma WHERE norma_urn = 'urn:nir:stato:legge:2098-01-01;40~art19'
          OR norma_urn = split_part('urn:nir:stato:legge:2098-01-01;40~art19', '~', 1)
          OR starts_with(norma_urn, split_part('urn:nir:stato:legge:2098-01-01;40~art19', '~', 1) || '~')) = 3 AS ok
