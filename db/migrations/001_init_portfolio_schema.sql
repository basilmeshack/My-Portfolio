BEGIN;

CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  source_pb_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  linkedin_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  source_pb_id TEXT UNIQUE NOT NULL,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  link TEXT,
  github TEXT,
  demo TEXT,
  image_file_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tools (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  UNIQUE (project_id, tool_name)
);

CREATE TABLE IF NOT EXISTS project_tags (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  UNIQUE (project_id, tag_name)
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGSERIAL PRIMARY KEY,
  source_pb_id TEXT UNIQUE NOT NULL,
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
  field_type TEXT,
  category TEXT,
  name TEXT,
  description TEXT,
  url TEXT,
  demo_link TEXT,
  image_file_name TEXT,
  image_url TEXT,
  is_company_project BOOLEAN,
  coming_soon BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_item_tags (
  id BIGSERIAL PRIMARY KEY,
  portfolio_item_id BIGINT NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  UNIQUE (portfolio_item_id, tag_name)
);

CREATE TABLE IF NOT EXISTS migration_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_project_id ON portfolio_items(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile_id ON portfolio_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_field_type ON portfolio_items(field_type);

COMMIT;
