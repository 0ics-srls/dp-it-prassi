-- doc by id: every column of the document, the references as one jsonb array ordered by ord
INSERT INTO documenti (id, ente, tipo, numero, anno, data, oggetto, text_raw, estrazione, fonte, source_id, source_url) VALUES
 ('00000000-0000-0000-0000-0000000030a1', 'Agenzia delle Entrate', 'circolare', '10', 2089, DATE '2089-07-03', 'Oggetto', 'testo del documento', 'testo', 'ade-portale', 't030a', 'https://example.test/t030a');
INSERT INTO riferimenti_norma (documento_id, ord, descrizione, articolo, comma, norma_urn, via) VALUES
 ('00000000-0000-0000-0000-0000000030a1', 1, 'seconda', NULL, NULL, 'urn:nir:stato:legge:2000-07-27;212', 'numero_data'),
 ('00000000-0000-0000-0000-0000000030a1', 0, 'prima', '51', '3', NULL, 'alias');

SELECT (SELECT COALESCE(jsonb_agg(jsonb_build_object('descrizione', r.descrizione, 'articolo', r.articolo, 'comma', r.comma, 'norma_urn', r.norma_urn) ORDER BY r.ord), '[]'::jsonb)
          FROM riferimenti_norma r WHERE r.documento_id = d.id)
         = '[{"descrizione":"prima","articolo":"51","comma":"3","norma_urn":null},{"descrizione":"seconda","articolo":null,"comma":null,"norma_urn":"urn:nir:stato:legge:2000-07-27;212"}]'::jsonb
   AND jsonb_typeof((SELECT COALESCE(jsonb_agg(r.descrizione), '[]'::jsonb) FROM riferimenti_norma r WHERE r.documento_id = '00000000-0000-0000-0000-0000000030b9')) = 'array'
   AND d.ente = 'Agenzia delle Entrate' AND d.estrazione = 'testo' AND d.fonte = 'ade-portale' AS ok
  FROM documenti d WHERE d.id = '00000000-0000-0000-0000-0000000030a1'
