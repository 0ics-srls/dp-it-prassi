-- the tests run as the writer role; the reader role exists and can select but not write
SELECT current_user = current_schema() || '_rw'
   AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_schema() || '_ro')
   AND has_table_privilege(current_schema() || '_ro', 'documenti', 'SELECT')
   AND has_table_privilege(current_schema() || '_ro', 'passages', 'SELECT')
   AND NOT has_table_privilege(current_schema() || '_ro', 'documenti', 'INSERT')
   AND NOT has_table_privilege(current_schema() || '_ro', 'riferimenti_norma', 'UPDATE')
   AND has_table_privilege(current_schema() || '_rw', 'passages', 'INSERT') AS ok
