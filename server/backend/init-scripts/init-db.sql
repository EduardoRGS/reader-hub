-- =====================================
-- READER HUB - INICIALIZAÇÃO POSTGRESQL
-- =====================================
-- Configurar encoding
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- =====================================
-- CRIAR USUÁRIO E BANCO DA APLICAÇÃO
-- =====================================
-- Criar usuário readerhub (se não existir)
DO $$ BEGIN IF NOT EXISTS (
    SELECT
    FROM pg_catalog.pg_roles
    WHERE rolname = 'readerhub'
) THEN CREATE USER readerhub WITH ENCRYPTED PASSWORD 'readerhub123';
ALTER USER readerhub CREATEDB;
END IF;
END $$;
-- Garantir que o banco readerhub existe e dar permissões
GRANT ALL PRIVILEGES ON DATABASE readerhub TO readerhub;
ALTER DATABASE readerhub OWNER TO readerhub;
-- Conectar ao banco readerhub para criar extensões e funções
\ c readerhub;
-- =====================================
-- PERMISSÕES DO SCHEMA PUBLIC
-- =====================================
-- Garantir que o usuário readerhub tem permissões no schema public
GRANT USAGE ON SCHEMA public TO readerhub;
GRANT CREATE ON SCHEMA public TO readerhub;
GRANT ALL PRIVILEGES ON SCHEMA public TO readerhub;
-- =====================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================
-- UUID para chaves primárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Full-text search multilíngue
CREATE EXTENSION IF NOT EXISTS "unaccent";
-- Busca fuzzy (similar a LIKE %)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- =====================================
-- FUNÇÕES AUXILIARES
-- =====================================
-- Função para busca de texto em JSONB multilíngue
CREATE OR REPLACE FUNCTION search_multilingual_text(
        jsonb_column JSONB,
        search_term TEXT,
        languages TEXT [] DEFAULT ARRAY ['pt-br', 'en']
    ) RETURNS BOOLEAN AS $$ BEGIN -- Busca em todos os idiomas especificados
    RETURN EXISTS (
        SELECT 1
        FROM jsonb_each_text(jsonb_column) AS entry
        WHERE entry.key = ANY(languages)
            AND unaccent(lower(entry.value)) ILIKE unaccent(lower('%' || search_term || '%'))
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- Função para extrair título preferencial
CREATE OR REPLACE FUNCTION get_preferred_title(
        jsonb_column JSONB,
        preferred_lang TEXT DEFAULT 'pt-br'
    ) RETURNS TEXT AS $$ BEGIN -- Tenta o idioma preferido primeiro, depois inglês, depois qualquer um
    RETURN COALESCE(
        jsonb_column->>preferred_lang,
        jsonb_column->>'en',
        (
            SELECT value
            FROM jsonb_each_text(jsonb_column)
            LIMIT 1
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- =====================================
-- PERMISSÕES FINAIS
-- =====================================
-- Garante que o usuário readerhub tem todas as permissões
GRANT ALL PRIVILEGES ON DATABASE readerhub TO readerhub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO readerhub;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO readerhub;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO readerhub;
-- Permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO readerhub;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO readerhub;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO readerhub;
-- =====================================
-- COMENTÁRIOS E METADADOS
-- =====================================
COMMENT ON DATABASE readerhub IS 'Reader Hub - Sistema de Gerenciamento de Mangás';
COMMENT ON FUNCTION search_multilingual_text IS 'Busca texto em campos JSONB multilíngues';
COMMENT ON FUNCTION get_preferred_title IS 'Extrai título no idioma preferido do JSONB';