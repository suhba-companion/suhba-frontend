-- Close the Supabase PostgREST exposure on the public schema.
--
-- Why this is needed: Supabase auto-exposes the `public` schema as a REST API and
-- pre-grants the `anon` / `authenticated` roles table privileges there. Those grants
-- are gated only by row level security, and RLS is off on every table because Flyway
-- creates tables with plain CREATE TABLE (unlike the Supabase dashboard, which enables
-- RLS by default). Result: all 6 app tables plus flyway_schema_history were readable
-- with the project's public anon key, including the bcrypt hashes in admin_users.
--
-- Nothing outside the Spring Boot backend has a database credential -- the React client
-- only calls /api/v1 on the backend -- so revoking anon/authenticated access breaks no
-- caller. Flyway and Hibernate connect as the table owner, which bypasses RLS.
--
-- Every statement is idempotent, so this is safe to re-run or to apply by hand in the
-- Supabase SQL editor before the next deploy.

-- 1. Enable RLS on every table. With no policies attached this is deny-by-default for
--    any non-owner role. The owner (the Flyway/Hibernate role) is unaffected.
--    NOTE: if you ever want to read a table through PostgREST, add an explicit
--    `CREATE POLICY ... FOR SELECT TO anon USING (...)` rather than disabling RLS.
ALTER TABLE prayer_spots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE halal_spots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE halal_spot_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;

-- flyway_schema_history is deliberately NOT altered here. Flyway holds a lock on that
-- table for the whole run, and ENABLE ROW LEVEL SECURITY needs ACCESS EXCLUSIVE on it,
-- so the statement waits on a lock its own runner is holding and the migration hangs
-- forever -- taking application startup down with it.
--
-- It is covered anyway: step 2 revokes ALL on every table in the schema plus USAGE on
-- the schema itself, so anon/authenticated cannot reach it. Enable RLS there by hand in
-- the Supabase SQL editor if you want the extra layer.

-- 2. Remove the privileges themselves, so the tables are closed even if RLS is ever
--    switched off again. Revoking USAGE on the schema also covers every table added
--    in future migrations, which RLS-per-table would not.
--
--    Guarded on role existence: the Supabase-managed roles anon / authenticated /
--    service_role do not exist on the plain Postgres used by docker-compose for local
--    dev, and an unguarded REVOKE would abort the migration there.
DO $$
DECLARE
    target_role text;
BEGIN
    FOREACH target_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = target_role) THEN
            EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', target_role);
            EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', target_role);
            EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', target_role);
            EXECUTE format('REVOKE ALL ON SCHEMA public FROM %I', target_role);

            -- Stop the grants being reapplied to tables created by later migrations.
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I',
                target_role);
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I',
                target_role);
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I',
                target_role);

            RAISE NOTICE 'Revoked public schema access from role %', target_role;
        ELSE
            RAISE NOTICE 'Role % not present, skipping (expected on local dev)', target_role;
        END IF;
    END LOOP;
END $$;
