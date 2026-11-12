DO $$
BEGIN
    INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('Interpello', 'testo', 'testo', 'doctrib', 'c1');
    RAISE EXCEPTION 'mixed-case tipo was accepted';
EXCEPTION WHEN check_violation THEN
    NULL;
END $$;

DO $$
BEGIN
    INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('interpello', 'testo', 'scansione', 'doctrib', 'c2');
    RAISE EXCEPTION 'estrazione scansione was accepted';
EXCEPTION WHEN check_violation THEN
    NULL;
END $$;

DO $$
BEGIN
    INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('interpello', '   ', 'testo', 'doctrib', 'c3');
    RAISE EXCEPTION 'blank text was accepted';
EXCEPTION WHEN check_violation THEN
    NULL;
END $$;

DO $$
BEGIN
    INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('interpello', NULL, 'testo', 'doctrib', 'c4');
    RAISE EXCEPTION 'null text was accepted';
EXCEPTION WHEN not_null_violation THEN
    NULL;
END $$;

-- the legal values are accepted
INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('interpello', 'testo', 'ocr', 'doctrib', 'c5');
INSERT INTO documenti (tipo, text_raw, estrazione, fonte, source_id) VALUES ('provvedimento', 'testo', 'testo', 'ade-portale', 'c6');

SELECT count(*) = 2 AS ok FROM documenti
