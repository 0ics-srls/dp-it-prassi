INSERT INTO passages (documento_id, seq, text, text_contextual) VALUES ('00000000-0000-0000-0000-0000000000a1', 0, 't', 'c');

DO $$
BEGIN
    INSERT INTO passages (documento_id, seq, text, text_contextual) VALUES ('00000000-0000-0000-0000-0000000000a1', 0, 'x', 'y');
    RAISE EXCEPTION 'duplicate (documento_id, seq) was accepted';
EXCEPTION WHEN unique_violation THEN
    NULL;
END $$;

INSERT INTO passages (documento_id, seq, text, text_contextual) VALUES ('00000000-0000-0000-0000-0000000000a1', 1, 'x', 'y');

SELECT count(*) = 2 AS ok FROM passages WHERE documento_id = '00000000-0000-0000-0000-0000000000a1' AND embedding IS NULL
