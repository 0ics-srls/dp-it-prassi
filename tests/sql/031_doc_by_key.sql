-- doc by natural key (tipo, numero, anno): a circolare and its English version share it, so the lookup can return several rows
INSERT INTO documenti (tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('circolare', '20', 2088, 'italiano', 'testo', 'ade-portale', 't031a'),
 ('circolare', '20', 2088, 'english', 'testo', 'ade-portale', 't031a_Eng'),
 ('circolare', '21', 2088, 'altra', 'testo', 'ade-portale', 't031b');

SELECT (SELECT array_agg(source_id ORDER BY source_id) FROM documenti WHERE tipo = lower('Circolare') AND numero = '20' AND anno = 2088) = ARRAY['t031a', 't031a_Eng']
   AND (SELECT count(*) FROM documenti WHERE tipo = 'circolare' AND numero = '20' AND anno = 2087) = 0 AS ok
