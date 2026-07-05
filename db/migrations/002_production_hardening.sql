BEGIN;

CREATE OR REPLACE FUNCTION set_modified_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.modified_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_set_modified_at ON profiles;
CREATE TRIGGER trg_profiles_set_modified_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

DROP TRIGGER IF EXISTS trg_projects_set_modified_at ON projects;
CREATE TRIGGER trg_projects_set_modified_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

DROP TRIGGER IF EXISTS trg_portfolio_items_set_modified_at ON portfolio_items;
CREATE TRIGGER trg_portfolio_items_set_modified_at
BEFORE UPDATE ON portfolio_items
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_project_tools_tool_name_not_blank'
  ) THEN
    ALTER TABLE project_tools
    ADD CONSTRAINT chk_project_tools_tool_name_not_blank
    CHECK (LENGTH(TRIM(tool_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_project_tags_tag_name_not_blank'
  ) THEN
    ALTER TABLE project_tags
    ADD CONSTRAINT chk_project_tags_tag_name_not_blank
    CHECK (LENGTH(TRIM(tag_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_portfolio_item_tags_tag_name_not_blank'
  ) THEN
    ALTER TABLE portfolio_item_tags
    ADD CONSTRAINT chk_portfolio_item_tags_tag_name_not_blank
    CHECK (LENGTH(TRIM(tag_name)) > 0);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_projects_title_description_search
ON projects
USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_portfolio_items_field_category
ON portfolio_items(field_type, category);

CREATE OR REPLACE VIEW vw_projects_catalog AS
SELECT
  p.id,
  p.source_pb_id,
  p.title,
  p.description,
  p.link,
  p.github,
  p.demo,
  p.image_url,
  pr.full_name AS profile_name,
  COALESCE(
    (SELECT array_agg(pt.tool_name ORDER BY pt.tool_name)
     FROM project_tools pt
     WHERE pt.project_id = p.id),
    ARRAY[]::text[]
  ) AS tools,
  COALESCE(
    (SELECT array_agg(ptg.tag_name ORDER BY ptg.tag_name)
     FROM project_tags ptg
     WHERE ptg.project_id = p.id),
    ARRAY[]::text[]
  ) AS tags,
  p.created_at,
  p.updated_at,
  p.modified_at
FROM projects p
LEFT JOIN profiles pr ON pr.id = p.profile_id;

CREATE OR REPLACE VIEW vw_portfolio_items_enriched AS
SELECT
  pi.id,
  pi.source_pb_id,
  pi.field_type,
  pi.category,
  pi.name,
  pi.description,
  pi.url,
  pi.demo_link,
  pi.image_url,
  pi.is_company_project,
  pi.coming_soon,
  p.title AS linked_project_title,
  pr.full_name AS linked_profile_name,
  COALESCE(
    (SELECT array_agg(pit.tag_name ORDER BY pit.tag_name)
     FROM portfolio_item_tags pit
     WHERE pit.portfolio_item_id = pi.id),
    ARRAY[]::text[]
  ) AS tags,
  pi.created_at,
  pi.updated_at,
  pi.modified_at
FROM portfolio_items pi
LEFT JOIN projects p ON p.id = pi.project_id
LEFT JOIN profiles pr ON pr.id = pi.profile_id;

COMMIT;
