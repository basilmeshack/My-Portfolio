BEGIN;

CREATE TABLE IF NOT EXISTS profile_experiences (
  id BIGSERIAL PRIMARY KEY,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  organization TEXT NOT NULL,
  period_label TEXT NOT NULL,
  responsibilities_html TEXT NOT NULL DEFAULT '',
  achievements_html TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 100,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_experiences_profile_id
ON profile_experiences(profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_experiences_display_order
ON profile_experiences(display_order);

DROP TRIGGER IF EXISTS trg_profile_experiences_set_modified_at ON profile_experiences;
CREATE TRIGGER trg_profile_experiences_set_modified_at
BEFORE UPDATE ON profile_experiences
FOR EACH ROW
EXECUTE FUNCTION set_modified_at();

INSERT INTO profile_experiences (
  profile_id,
  role_title,
  organization,
  period_label,
  responsibilities_html,
  achievements_html,
  display_order
)
SELECT
  p.id,
  seeded.role_title,
  seeded.organization,
  seeded.period_label,
  seeded.responsibilities_html,
  seeded.achievements_html,
  seeded.display_order
FROM (
  SELECT id
  FROM profiles
  ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC, id DESC
  LIMIT 1
) p
CROSS JOIN (
  VALUES
    (
      'Software Engineer',
      'Tracom Services Limited',
      'May 2023 - Present',
      '<ul><li>Specialized in Android development for mobile and POS applications.</li><li>Integrated RESTful and GraphQL APIs for real-time communication and data flow between systems.</li><li>Ensured PCI compliance for payment systems and secure transaction handling.</li></ul>',
      '<ul><li>Developed and deployed the Awash Bank SDK on Ingenico Axium DX devices.</li><li>Completed Visa and MasterCard certification for Bunna Bank Ingenico DX8000 SDK.</li><li>Delivered Terminal Management System functionalities across POS devices.</li></ul>',
      10
    ),
    (
      'Telecommunications Engineer',
      'Guzzer Technologies',
      'December 2021 - May 2022',
      '<ul><li>Provided network troubleshooting and issue resolution on production devices.</li><li>Worked on HFC and GPON migrations, construction, and maintenance.</li></ul>',
      '<ul><li>Improved system stability through network power migration projects in Nairobi.</li></ul>',
      20
    ),
    (
      'Data Engineer (Internship)',
      'African Economic Research Consortium (AERC)',
      'September 2021 - November 2021',
      '<ul><li>Managed electronic records indexing and secure storage workflows.</li><li>Used Azure, SQL, and PowerBI to support research reporting and dashboards.</li></ul>',
      '<ul><li>Enhanced retrieval processes through implementation of EDMS workflows.</li></ul>',
      30
    )
) AS seeded(role_title, organization, period_label, responsibilities_html, achievements_html, display_order)
ON CONFLICT DO NOTHING;

COMMIT;
