CREATE TABLE IF NOT EXISTS profile_experience_projects (
  id BIGSERIAL PRIMARY KEY,
  experience_id BIGINT NOT NULL REFERENCES profile_experiences(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 100,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (experience_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_experience_projects_experience_id
ON profile_experience_projects(experience_id);

CREATE INDEX IF NOT EXISTS idx_profile_experience_projects_project_id
ON profile_experience_projects(project_id);

INSERT INTO profile_experience_projects (experience_id, project_id, display_order, inserted_at, modified_at)
SELECT pe.id, pe.project_id, 100, NOW(), NOW()
FROM profile_experiences pe
WHERE pe.project_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM profile_experience_projects pep
    WHERE pep.experience_id = pe.id
      AND pep.project_id = pe.project_id
  );
