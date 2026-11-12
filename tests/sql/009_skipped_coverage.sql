INSERT INTO skipped (fonte, item_ref, reason) VALUES ('ade-portale', 'ade:circolari:2025:07/x.pdf', 'ocr_empty');
INSERT INTO coverage (fonte, tipo, anno, mese, dichiarati, presi, mancanti) VALUES ('doctrib', 'interpello', 2025, 10, 17, 17, 0);

DO $$
BEGIN
    INSERT INTO skipped (fonte, item_ref, reason) VALUES ('ade-portale', 'ade:circolari:2025:07/x.pdf', 'again');
    RAISE EXCEPTION 'duplicate skipped key was accepted';
EXCEPTION WHEN unique_violation THEN
    NULL;
END $$;

DO $$
BEGIN
    INSERT INTO coverage (fonte, tipo, anno, mese, dichiarati, presi, mancanti) VALUES ('doctrib', 'interpello', 2025, 10, 1, 1, 0);
    RAISE EXCEPTION 'duplicate coverage key was accepted';
EXCEPTION WHEN unique_violation THEN
    NULL;
END $$;

SELECT (SELECT count(*) FROM skipped WHERE seen_at IS NOT NULL) = 1 AND (SELECT count(*) FROM coverage WHERE noted_at IS NOT NULL AND troncati = 0) = 1 AS ok
