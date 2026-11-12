-- lookup (replaces the legacy query_prassi): the estremi of the documents that match the filters, never the text.
-- The sort column is chosen by CASE on the enum (no dynamic SQL), one expression per column and direction; a missing value is last in both directions and the legacy
-- order (tipo, anno, numero numeric when it is a number, id) breaks the ties. total is a window count: the size of the filtered set, constant across pages.
WITH prm AS (
    SELECT COALESCE(NULLIF(btrim(@sort), ''), 'tipo') AS sort,
           COALESCE(@desc, false) AS dsc,
           LEAST(GREATEST(COALESCE(@limit, 20), 1), 50)::int AS lim,
           GREATEST(COALESCE(@offset, 0), 0)::int AS off
),
f AS (
    SELECT d.*, CASE WHEN d.numero ~ '^[0-9]{1,15}$' THEN d.numero::bigint END AS numero_n
      FROM documenti d
     WHERE (@tipo IS NULL OR d.tipo = lower(btrim(@tipo)))
       AND (@numero IS NULL OR d.numero = @numero)
       AND (@anno IS NULL OR d.anno = @anno)
       AND (@data_from IS NULL OR d.data >= CAST(@data_from AS date))
       AND (@data_to IS NULL OR d.data <= CAST(@data_to AS date))
       AND (@ente IS NULL OR d.ente ILIKE '%' || replace(replace(replace(@ente, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\')
       AND (@fonte IS NULL OR d.fonte = @fonte)
)
SELECT f.id,
       f.ente,
       f.tipo,
       f.numero,
       f.anno,
       f.data,
       left(f.oggetto, 300) AS oggetto,
       f.source_url,
       f.fonte,
       count(*) OVER () AS total
  FROM f
 CROSS JOIN prm
 ORDER BY CASE WHEN prm.sort = 'tipo' AND NOT prm.dsc THEN f.tipo END ASC NULLS LAST,
          CASE WHEN prm.sort = 'tipo' AND prm.dsc THEN f.tipo END DESC NULLS LAST,
          CASE WHEN prm.sort = 'anno' AND NOT prm.dsc THEN f.anno END ASC NULLS LAST,
          CASE WHEN prm.sort = 'anno' AND prm.dsc THEN f.anno END DESC NULLS LAST,
          CASE WHEN prm.sort = 'numero' AND NOT prm.dsc THEN f.numero_n END ASC NULLS LAST,
          CASE WHEN prm.sort = 'numero' AND prm.dsc THEN f.numero_n END DESC NULLS LAST,
          CASE WHEN prm.sort = 'data' AND NOT prm.dsc THEN f.data END ASC NULLS LAST,
          CASE WHEN prm.sort = 'data' AND prm.dsc THEN f.data END DESC NULLS LAST,
          f.tipo, f.anno, f.numero_n, f.numero, f.id
 LIMIT (SELECT lim FROM prm) OFFSET (SELECT off FROM prm)
