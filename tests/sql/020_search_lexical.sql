-- search, lexical side: websearch syntax on the italian vector of oggetto + text_raw, headline with the legacy markers
INSERT INTO documenti (tipo, numero, anno, oggetto, text_raw, estrazione, fonte, source_id) VALUES
 ('circolare', '1', 2098, 'Edilizia', 'La licenza edilizia è rilasciata dal comune entro trenta giorni.', 'testo', 'ade-portale', 't020a'),
 ('circolare', '2', 2098, NULL, 'Il permesso sostituisce la licenza urgente edilizia nei casi previsti.', 'testo', 'ade-portale', 't020b'),
 ('risoluzione', '3', 2098, NULL, 'La sanzione amministrativa è applicata dal prefetto.', 'testo', 'ade-portale', 't020c');

SELECT (SELECT count(*) FROM documenti WHERE anno = 2098 AND search_vector @@ websearch_to_tsquery('italian', '"licenza edilizia"')) = 1
   AND (SELECT count(*) FROM documenti WHERE anno = 2098 AND search_vector @@ websearch_to_tsquery('italian', 'sanzione OR permesso')) = 2
   AND (SELECT count(*) FROM documenti WHERE anno = 2098 AND search_vector @@ websearch_to_tsquery('italian', 'licenza -comune')) = 1
   AND (SELECT count(*) FROM documenti WHERE anno = 2098 AND search_vector @@ websearch_to_tsquery('italian', 'licenza sanzione')) = 0
   -- oggetto is searchable too
   AND (SELECT count(*) FROM documenti WHERE anno = 2098 AND search_vector @@ websearch_to_tsquery('italian', 'edilizia')) = 2
   AND (SELECT ts_headline('italian', text_raw, websearch_to_tsquery('italian', 'sanzione'), 'StartSel=«,StopSel=»,MaxFragments=2,MaxWords=28,MinWords=8')
          FROM documenti WHERE source_id = 't020c') LIKE '%«sanzione»%' AS ok
