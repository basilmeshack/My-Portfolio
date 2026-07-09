BEGIN;

CREATE TABLE IF NOT EXISTS assistant_knowledge_documents (
  id BIGSERIAL PRIMARY KEY,
  document_type TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_record_id BIGINT,
  source_record_key TEXT NOT NULL,
  owner_profile_id BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
  ) STORED,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_table, source_record_key)
);

CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_document_type
ON assistant_knowledge_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_owner_profile_id
ON assistant_knowledge_documents(owner_profile_id);

CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_search_vector
ON assistant_knowledge_documents
USING GIN (search_vector);

DROP TRIGGER IF EXISTS trg_assistant_knowledge_documents_set_modified_at ON assistant_knowledge_documents;
CREATE TRIGGER trg_assistant_knowledge_documents_set_modified_at
BEFORE UPDATE ON assistant_knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

CREATE OR REPLACE FUNCTION refresh_assistant_knowledge_documents()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO assistant_knowledge_documents (
    document_type,
    source_table,
    source_record_id,
    source_record_key,
    owner_profile_id,
    title,
    summary,
    content,
    keywords,
    metadata,
    raw_payload
  )
  SELECT
    'profile',
    'profiles',
    p.id,
    p.source_pb_id,
    p.id,
    COALESCE(p.full_name, 'Portfolio Owner'),
    p.summary,
    CONCAT_WS(
      E'\n',
      'Profile: ' || COALESCE(p.full_name, 'Portfolio Owner'),
      CASE WHEN COALESCE(p.summary, '') <> '' THEN 'Summary: ' || p.summary END,
      CASE WHEN COALESCE(p.location, '') <> '' THEN 'Location: ' || p.location END,
      CASE WHEN COALESCE(p.email, '') <> '' THEN 'Email: ' || p.email END,
      CASE WHEN COALESCE(p.phone, '') <> '' THEN 'Phone: ' || p.phone END,
      CASE WHEN COALESCE(p.linkedin_url, '') <> '' THEN 'LinkedIn: ' || p.linkedin_url END
    ),
    ARRAY_REMOVE(
      ARRAY[
        NULLIF(COALESCE(p.full_name, ''), ''),
        NULLIF(COALESCE(p.location, ''), ''),
        'profile',
        'experience',
        'contact'
      ],
      NULL
    ),
    jsonb_build_object(
      'location', p.location,
      'email', p.email,
      'phone', p.phone,
      'linkedin', p.linkedin_url,
      'entity', 'owner-profile'
    ),
    p.raw_payload
  FROM profiles p
  ON CONFLICT (source_table, source_record_key)
  DO UPDATE SET
    document_type = EXCLUDED.document_type,
    source_record_id = EXCLUDED.source_record_id,
    owner_profile_id = EXCLUDED.owner_profile_id,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    keywords = EXCLUDED.keywords,
    metadata = EXCLUDED.metadata,
    raw_payload = EXCLUDED.raw_payload,
    modified_at = NOW();

  INSERT INTO assistant_knowledge_documents (
    document_type,
    source_table,
    source_record_id,
    source_record_key,
    owner_profile_id,
    title,
    summary,
    content,
    keywords,
    metadata,
    raw_payload
  )
  SELECT
    'project',
    'projects',
    p.id,
    p.source_pb_id,
    p.profile_id,
    COALESCE(p.title, 'Untitled Project'),
    p.description,
    CONCAT_WS(
      E'\n',
      'Project: ' || COALESCE(p.title, 'Untitled Project'),
      CASE WHEN COALESCE(p.description, '') <> '' THEN 'Description: ' || p.description END,
      CASE WHEN COALESCE(pr.full_name, '') <> '' THEN 'Owner: ' || pr.full_name END,
      CASE WHEN CARDINALITY(COALESCE(tool_data.tools, ARRAY[]::text[])) > 0 THEN 'Tools: ' || array_to_string(tool_data.tools, ', ') END,
      CASE WHEN CARDINALITY(COALESCE(tag_data.tags, ARRAY[]::text[])) > 0 THEN 'Tags: ' || array_to_string(tag_data.tags, ', ') END,
      CASE WHEN CARDINALITY(COALESCE(portfolio_tag_data.tags, ARRAY[]::text[])) > 0 THEN 'Portfolio Tags: ' || array_to_string(portfolio_tag_data.tags, ', ') END,
      CASE WHEN COALESCE(p.link, '') <> '' THEN 'Link: ' || p.link END,
      CASE WHEN COALESCE(p.github, '') <> '' THEN 'GitHub: ' || p.github END,
      CASE WHEN COALESCE(p.demo, '') <> '' THEN 'Demo: ' || p.demo END
    ),
    ARRAY_REMOVE(
      ARRAY[NULLIF(COALESCE(p.title, ''), ''), NULLIF(COALESCE(pr.full_name, ''), '')]
      || COALESCE(tool_data.tools, ARRAY[]::text[])
      || COALESCE(tag_data.tags, ARRAY[]::text[])
      || COALESCE(portfolio_tag_data.tags, ARRAY[]::text[]),
      NULL
    ),
    jsonb_build_object(
      'link', p.link,
      'github', p.github,
      'demo', p.demo,
      'imageUrl', p.image_url,
      'profileName', pr.full_name,
      'tools', COALESCE(tool_data.tools, ARRAY[]::text[]),
      'tags', COALESCE(tag_data.tags, ARRAY[]::text[]),
      'portfolioTags', COALESCE(portfolio_tag_data.tags, ARRAY[]::text[]),
      'entity', 'project'
    ),
    p.raw_payload
  FROM projects p
  LEFT JOIN profiles pr ON pr.id = p.profile_id
  LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT pt.tool_name ORDER BY pt.tool_name) AS tools
    FROM project_tools pt
    WHERE pt.project_id = p.id
  ) tool_data ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT ptg.tag_name ORDER BY ptg.tag_name) AS tags
    FROM project_tags ptg
    WHERE ptg.project_id = p.id
  ) tag_data ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT pit.tag_name ORDER BY pit.tag_name) AS tags
    FROM portfolio_items pi
    JOIN portfolio_item_tags pit ON pit.portfolio_item_id = pi.id
    WHERE pi.project_id = p.id
  ) portfolio_tag_data ON TRUE
  ON CONFLICT (source_table, source_record_key)
  DO UPDATE SET
    document_type = EXCLUDED.document_type,
    source_record_id = EXCLUDED.source_record_id,
    owner_profile_id = EXCLUDED.owner_profile_id,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    keywords = EXCLUDED.keywords,
    metadata = EXCLUDED.metadata,
    raw_payload = EXCLUDED.raw_payload,
    modified_at = NOW();

  INSERT INTO assistant_knowledge_documents (
    document_type,
    source_table,
    source_record_id,
    source_record_key,
    owner_profile_id,
    title,
    summary,
    content,
    keywords,
    metadata,
    raw_payload
  )
  SELECT
    CASE
      WHEN COALESCE(pi.field_type, '') = 'profile' THEN 'profile-artifact'
      WHEN COALESCE(pi.field_type, '') = 'partners' THEN 'partner'
      ELSE 'portfolio-item'
    END,
    'portfolio_items',
    pi.id,
    pi.source_pb_id,
    pi.profile_id,
    COALESCE(pi.name, COALESCE(pi.field_type, 'Portfolio Item')),
    pi.description,
    CONCAT_WS(
      E'\n',
      'Portfolio Item: ' || COALESCE(pi.name, COALESCE(pi.field_type, 'Portfolio Item')),
      CASE WHEN COALESCE(pi.field_type, '') <> '' THEN 'Field: ' || pi.field_type END,
      CASE WHEN COALESCE(pi.category, '') <> '' THEN 'Category: ' || pi.category END,
      CASE WHEN COALESCE(pi.description, '') <> '' THEN 'Description: ' || pi.description END,
      CASE WHEN COALESCE(linked_project.title, '') <> '' THEN 'Related Project: ' || linked_project.title END,
      CASE WHEN COALESCE(pr.full_name, '') <> '' THEN 'Owner: ' || pr.full_name END,
      CASE WHEN CARDINALITY(COALESCE(tag_data.tags, ARRAY[]::text[])) > 0 THEN 'Tags: ' || array_to_string(tag_data.tags, ', ') END,
      CASE WHEN COALESCE(pi.url, '') <> '' THEN 'URL: ' || pi.url END,
      CASE WHEN COALESCE(pi.demo_link, '') <> '' THEN 'Demo: ' || pi.demo_link END
    ),
    ARRAY_REMOVE(
      ARRAY[
        NULLIF(COALESCE(pi.name, ''), ''),
        NULLIF(COALESCE(pi.field_type, ''), ''),
        NULLIF(COALESCE(pi.category, ''), ''),
        NULLIF(COALESCE(linked_project.title, ''), ''),
        NULLIF(COALESCE(pr.full_name, ''), '')
      ] || COALESCE(tag_data.tags, ARRAY[]::text[]),
      NULL
    ),
    jsonb_build_object(
      'fieldType', pi.field_type,
      'category', pi.category,
      'url', pi.url,
      'demo', pi.demo_link,
      'isCompanyProject', pi.is_company_project,
      'comingSoon', pi.coming_soon,
      'linkedProjectTitle', linked_project.title,
      'linkedProfileName', pr.full_name,
      'tags', COALESCE(tag_data.tags, ARRAY[]::text[]),
      'entity', 'portfolio-item'
    ),
    pi.raw_payload
  FROM portfolio_items pi
  LEFT JOIN projects linked_project ON linked_project.id = pi.project_id
  LEFT JOIN profiles pr ON pr.id = pi.profile_id
  LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT pit.tag_name ORDER BY pit.tag_name) AS tags
    FROM portfolio_item_tags pit
    WHERE pit.portfolio_item_id = pi.id
  ) tag_data ON TRUE
  ON CONFLICT (source_table, source_record_key)
  DO UPDATE SET
    document_type = EXCLUDED.document_type,
    source_record_id = EXCLUDED.source_record_id,
    owner_profile_id = EXCLUDED.owner_profile_id,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    keywords = EXCLUDED.keywords,
    metadata = EXCLUDED.metadata,
    raw_payload = EXCLUDED.raw_payload,
    modified_at = NOW();

  DELETE FROM assistant_knowledge_documents d
  WHERE (d.source_table = 'profiles' AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.source_pb_id = d.source_record_key))
     OR (d.source_table = 'projects' AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.source_pb_id = d.source_record_key))
     OR (d.source_table = 'portfolio_items' AND NOT EXISTS (SELECT 1 FROM portfolio_items pi WHERE pi.source_pb_id = d.source_record_key));
END;
$$;

CREATE OR REPLACE VIEW vw_assistant_knowledge_catalog AS
SELECT
  id,
  document_type,
  source_table,
  source_record_key,
  title,
  summary,
  keywords,
  metadata,
  inserted_at,
  modified_at
FROM assistant_knowledge_documents;

SELECT refresh_assistant_knowledge_documents();

COMMIT;