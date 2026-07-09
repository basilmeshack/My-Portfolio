BEGIN;

CREATE TABLE IF NOT EXISTS profile_contact_channels (
  id BIGSERIAL PRIMARY KEY,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  label TEXT NOT NULL,
  handle TEXT,
  value TEXT NOT NULL,
  url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 100,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, channel_type, value)
);

CREATE INDEX IF NOT EXISTS idx_profile_contact_channels_profile_id
ON profile_contact_channels(profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_contact_channels_type_public
ON profile_contact_channels(channel_type, is_public);

DROP TRIGGER IF EXISTS trg_profile_contact_channels_set_modified_at ON profile_contact_channels;
CREATE TRIGGER trg_profile_contact_channels_set_modified_at
BEFORE UPDATE ON profile_contact_channels
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

INSERT INTO profile_contact_channels (
  profile_id,
  channel_type,
  label,
  handle,
  value,
  url,
  is_public,
  is_primary,
  display_order,
  raw_payload
)
SELECT
  p.id,
  seeded.channel_type,
  seeded.label,
  seeded.handle,
  seeded.value,
  seeded.url,
  TRUE,
  TRUE,
  seeded.display_order,
  seeded.raw_payload
FROM (
  SELECT id
  FROM profiles
  ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC, id DESC
  LIMIT 1
) p
CROSS JOIN (
  VALUES
    (
      'email',
      'Primary Email',
      'bmwandera14@gmail.com',
      'bmwandera14@gmail.com',
      'mailto:bmwandera14@gmail.com',
      10,
      jsonb_build_object('source', 'ui-hardcoded', 'component', 'contact-info')
    ),
    (
      'phone',
      'Primary Phone',
      '+254 794 142 204',
      '+254794142204',
      'tel:+254794142204',
      20,
      jsonb_build_object('source', 'ui-hardcoded', 'component', 'contact-info')
    ),
    (
      'linkedin',
      'LinkedIn',
      'Meshack Bwire',
      'https://www.linkedin.com/in/meshack-bwire-b2390a213/',
      'https://www.linkedin.com/in/meshack-bwire-b2390a213/',
      30,
      jsonb_build_object('source', 'ui-hardcoded', 'component', 'footer')
    ),
    (
      'github',
      'GitHub',
      'bm-ghost',
      'https://github.com/bm-ghost',
      'https://github.com/bm-ghost',
      40,
      jsonb_build_object('source', 'ui-hardcoded', 'component', 'footer')
    ),
    (
      'meeting',
      'Calendly',
      'Schedule a Meeting',
      'https://calendly.com',
      'https://calendly.com',
      50,
      jsonb_build_object('source', 'ui-hardcoded', 'component', 'contact')
    )
) AS seeded(channel_type, label, handle, value, url, display_order, raw_payload)
ON CONFLICT (profile_id, channel_type, value) DO UPDATE SET
  label = EXCLUDED.label,
  handle = EXCLUDED.handle,
  url = EXCLUDED.url,
  is_public = EXCLUDED.is_public,
  is_primary = EXCLUDED.is_primary,
  display_order = EXCLUDED.display_order,
  raw_payload = EXCLUDED.raw_payload,
  modified_at = NOW();

INSERT INTO profile_contact_channels (
  profile_id,
  channel_type,
  label,
  handle,
  value,
  url,
  is_public,
  is_primary,
  display_order,
  raw_payload
)
SELECT
  p.id,
  source.channel_type,
  source.label,
  source.handle,
  source.value,
  source.url,
  TRUE,
  TRUE,
  source.display_order,
  jsonb_build_object('source', 'profile-columns')
FROM profiles p
CROSS JOIN LATERAL (
  VALUES
    ('email', 'Email', p.email, p.email, CASE WHEN COALESCE(p.email, '') <> '' THEN 'mailto:' || p.email ELSE NULL END, 11),
    ('phone', 'Phone', p.phone, p.phone, CASE WHEN COALESCE(p.phone, '') <> '' THEN 'tel:' || regexp_replace(p.phone, '\\s+', '', 'g') ELSE NULL END, 21),
    ('linkedin', 'LinkedIn', 'LinkedIn Profile', p.linkedin_url, p.linkedin_url, 31)
) AS source(channel_type, label, handle, value, url, display_order)
WHERE COALESCE(source.value, '') <> ''
ON CONFLICT (profile_id, channel_type, value) DO NOTHING;

UPDATE profiles p
SET email = COALESCE(
      NULLIF(p.email, ''),
      (
        SELECT c.value
        FROM profile_contact_channels c
        WHERE c.profile_id = p.id AND c.channel_type = 'email' AND c.is_public = TRUE
        ORDER BY c.is_primary DESC, c.display_order ASC, c.id ASC
        LIMIT 1
      )
    ),
    phone = COALESCE(
      NULLIF(p.phone, ''),
      (
        SELECT c.handle
        FROM profile_contact_channels c
        WHERE c.profile_id = p.id AND c.channel_type = 'phone' AND c.is_public = TRUE
        ORDER BY c.is_primary DESC, c.display_order ASC, c.id ASC
        LIMIT 1
      )
    ),
    linkedin_url = COALESCE(
      NULLIF(p.linkedin_url, ''),
      (
        SELECT c.url
        FROM profile_contact_channels c
        WHERE c.profile_id = p.id AND c.channel_type = 'linkedin' AND c.is_public = TRUE
        ORDER BY c.is_primary DESC, c.display_order ASC, c.id ASC
        LIMIT 1
      )
    ),
    modified_at = NOW();

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
      CASE WHEN COALESCE(p.linkedin_url, '') <> '' THEN 'LinkedIn: ' || p.linkedin_url END,
      CASE WHEN CARDINALITY(COALESCE(contact_data.contact_lines, ARRAY[]::text[])) > 0 THEN 'Contact Channels: ' || array_to_string(contact_data.contact_lines, ' | ') END
    ),
    ARRAY_REMOVE(
      ARRAY[
        NULLIF(COALESCE(p.full_name, ''), ''),
        NULLIF(COALESCE(p.location, ''), ''),
        'profile',
        'experience',
        'contact'
      ]
      || COALESCE(contact_data.keywords, ARRAY[]::text[]),
      NULL
    ),
    jsonb_build_object(
      'location', p.location,
      'email', p.email,
      'phone', p.phone,
      'linkedin', p.linkedin_url,
      'contactChannels', COALESCE(contact_data.metadata, '[]'::jsonb),
      'entity', 'owner-profile'
    ),
    p.raw_payload
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT
      array_agg(c.label || ': ' || COALESCE(c.handle, c.value) ORDER BY c.display_order, c.id) AS contact_lines,
      array_agg(DISTINCT COALESCE(NULLIF(c.handle, ''), NULLIF(c.value, ''), NULLIF(c.label, '')) ORDER BY COALESCE(NULLIF(c.handle, ''), NULLIF(c.value, ''), NULLIF(c.label, ''))) AS keywords,
      jsonb_agg(
        jsonb_build_object(
          'channelType', c.channel_type,
          'label', c.label,
          'handle', c.handle,
          'value', c.value,
          'url', c.url,
          'isPrimary', c.is_primary,
          'displayOrder', c.display_order
        )
        ORDER BY c.display_order, c.id
      ) AS metadata
    FROM profile_contact_channels c
    WHERE c.profile_id = p.id AND c.is_public = TRUE
  ) contact_data ON TRUE
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
    'contact-channel',
    'profile_contact_channels',
    c.id,
    'profile:' || c.profile_id::text || ':' || c.channel_type || ':' || c.value,
    c.profile_id,
    c.label,
    c.channel_type,
    CONCAT_WS(
      E'\n',
      'Contact Channel: ' || c.label,
      'Type: ' || c.channel_type,
      'Handle: ' || COALESCE(c.handle, 'N/A'),
      'Value: ' || c.value,
      CASE WHEN COALESCE(c.url, '') <> '' THEN 'URL: ' || c.url END
    ),
    ARRAY_REMOVE(ARRAY[c.channel_type, c.label, c.handle, c.value], NULL),
    jsonb_build_object(
      'channelType', c.channel_type,
      'label', c.label,
      'handle', c.handle,
      'value', c.value,
      'url', c.url,
      'isPrimary', c.is_primary,
      'isPublic', c.is_public,
      'entity', 'contact-channel'
    ),
    c.raw_payload
  FROM profile_contact_channels c
  WHERE c.is_public = TRUE
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
     OR (d.source_table = 'portfolio_items' AND NOT EXISTS (SELECT 1 FROM portfolio_items pi WHERE pi.source_pb_id = d.source_record_key))
     OR (d.source_table = 'profile_contact_channels' AND NOT EXISTS (
       SELECT 1 FROM profile_contact_channels c WHERE ('profile:' || c.profile_id::text || ':' || c.channel_type || ':' || c.value) = d.source_record_key
     ));
END;
$$;

SELECT refresh_assistant_knowledge_documents();

COMMIT;