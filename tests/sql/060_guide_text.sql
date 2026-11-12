-- guide: the Tool names in the text are the Gateway names with a hyphen (D116); LIKE would treat the underscore as a wildcard, so position() is used
WITH names(tool) AS (VALUES ('search'), ('doc'), ('su_norma'), ('lookup'), ('guide'), ('status')),
     sample AS (SELECT string_agg('it-prassi_' || tool, ' ' ORDER BY tool) AS t FROM names)
SELECT position('it_prassi_' IN (SELECT t FROM sample)) = 0
   AND (SELECT count(*) FROM names, sample WHERE position('it-prassi_' || names.tool IN sample.t) > 0) = 6 AS ok
