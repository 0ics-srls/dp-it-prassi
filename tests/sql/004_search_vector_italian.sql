-- the generated search vector uses the italian configuration and covers oggetto as well as text_raw
INSERT INTO documenti (tipo, oggetto, text_raw, estrazione, fonte, source_id)
VALUES ('circolare', 'Agevolazioni per le ristrutturazioni edilizie', 'Il contribuente puo detrarre le spese sostenute', 'testo', 'ade-portale', 's1'),
       ('risoluzione', NULL, 'Il datore ha licenziato il dipendente', 'testo', 'ade-portale', 's2');

SELECT (SELECT count(*) FROM documenti WHERE search_vector @@ websearch_to_tsquery('italian', 'spesa sostenuta')) = 1
   AND (SELECT count(*) FROM documenti WHERE search_vector @@ websearch_to_tsquery('italian', 'ristrutturazione edilizia')) = 1
   AND (SELECT count(*) FROM documenti WHERE search_vector @@ websearch_to_tsquery('italian', 'licenziamento')) = 1
   AND (SELECT count(*) FROM documenti WHERE search_vector @@ websearch_to_tsquery('italian', 'inesistente')) = 0 AS ok
