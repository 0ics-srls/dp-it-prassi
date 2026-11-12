-- an unknown document is zero rows (the legacy found = false), never an error
SELECT (SELECT count(*) FROM documenti WHERE id = '00000000-0000-0000-0000-0000000033ff') = 0
   AND (SELECT count(*) FROM documenti WHERE tipo = 'circolare' AND numero = '99999' AND anno = 1999) = 0 AS ok
