-- Create additional databases if needed
-- CREATE DATABASE nassayem_test;

-- Create additional users
-- CREATE USER nassayem_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE nassayem_db TO nassayem_readonly;
-- GRANT USAGE ON SCHEMA public TO nassayem_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO nassayem_readonly;

-- Set up extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional schemas
-- CREATE SCHEMA IF NOT EXISTS analytics;