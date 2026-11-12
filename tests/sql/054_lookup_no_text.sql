-- lookup never reads the full text: the column list is estremi, oggetto (cut at 300), link and total only
INSERT INTO documenti (id, tipo, numero, anno, oggetto, text_raw, estrazione, fonte, source_id) VALUES
 ('00000000-0000-0000-0000-0000000054a1', 'circolare', '1', 2089, repeat('o', 500), 'TESTO LUNGO RISERVATO AL TOOL DOC', 'testo', 'ade-portale', 't054a');

SELECT (SELECT length(left(oggetto, 300)) FROM documenti WHERE source_id = 't054a') = 300
   AND (SELECT left(oggetto, 300) NOT LIKE '%RISERVATO%' FROM documenti WHERE source_id = 't054a') AS ok
