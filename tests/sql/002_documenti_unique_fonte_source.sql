-- identity of a document is (fonte, source_id); the same source id under another fonte is a different document
INSERT INTO documenti (ente, tipo, numero, anno, data, oggetto, text_raw, estrazione, fonte, source_id)
VALUES ('Agenzia delle Entrate', 'circolare', '10', 2025, '2025-07-03', 'oggetto', 'testo uno', 'testo', 'ade-portale', 'Circolare_n_10');

DO $$
BEGIN
    INSERT INTO documenti (ente, tipo, text_raw, estrazione, fonte, source_id) VALUES ('Agenzia delle Entrate', 'circolare', 'altro', 'testo', 'ade-portale', 'Circolare_n_10');
    RAISE EXCEPTION 'duplicate (fonte, source_id) was accepted';
EXCEPTION WHEN unique_violation THEN
    NULL;
END $$;

INSERT INTO documenti (ente, tipo, text_raw, estrazione, fonte, source_id) VALUES ('Agenzia delle Entrate', 'interpello', 'altro', 'testo', 'doctrib', 'Circolare_n_10');

SELECT count(*) = 2 AS ok FROM documenti WHERE source_id = 'Circolare_n_10'
