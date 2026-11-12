-- status limits are built from the data: the interpelli sentence appears only when interpelli exist, with their real year range
INSERT INTO documenti (tipo, numero, anno, text_raw, estrazione, fonte, source_id) VALUES
 ('circolare', '1', 2086, 'a', 'testo', 'ade-portale', 't063a');

WITH sentence AS (
    SELECT CASE WHEN count(*) FILTER (WHERE fonte = 'doctrib') > 0
                THEN 'Interpelli: ' || min(anno) FILTER (WHERE fonte = 'doctrib') || '-' || max(anno) FILTER (WHERE fonte = 'doctrib') || '.' END AS s
      FROM documenti WHERE source_id LIKE 't063%')
SELECT (SELECT s FROM sentence) IS NULL AS ok
