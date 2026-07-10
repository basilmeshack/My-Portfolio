BEGIN;

-- Add date fields to profile_experiences table
ALTER TABLE profile_experiences
ADD COLUMN IF NOT EXISTS start_month INTEGER,
ADD COLUMN IF NOT EXISTS start_year INTEGER,
ADD COLUMN IF NOT EXISTS end_month INTEGER,
ADD COLUMN IF NOT EXISTS end_year INTEGER,
ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL;

-- Parse existing period_label values and populate new date fields
-- This will handle common formats like "May 2023 - Present", "Dec 2021 - May 2022", etc.
UPDATE profile_experiences
SET
  start_month = CASE
    WHEN period_label ILIKE '%january%' OR period_label ILIKE '%jan%' THEN 1
    WHEN period_label ILIKE '%february%' OR period_label ILIKE '%feb%' THEN 2
    WHEN period_label ILIKE '%march%' OR period_label ILIKE '%mar%' THEN 3
    WHEN period_label ILIKE '%april%' OR period_label ILIKE '%apr%' THEN 4
    WHEN period_label ILIKE '%may%' THEN 5
    WHEN period_label ILIKE '%june%' OR period_label ILIKE '%jun%' THEN 6
    WHEN period_label ILIKE '%july%' OR period_label ILIKE '%jul%' THEN 7
    WHEN period_label ILIKE '%august%' OR period_label ILIKE '%aug%' THEN 8
    WHEN period_label ILIKE '%september%' OR period_label ILIKE '%sept%' OR period_label ILIKE '%sep%' THEN 9
    WHEN period_label ILIKE '%october%' OR period_label ILIKE '%oct%' THEN 10
    WHEN period_label ILIKE '%november%' OR period_label ILIKE '%nov%' THEN 11
    WHEN period_label ILIKE '%december%' OR period_label ILIKE '%dec%' THEN 12
  END,
  start_year = CASE
    WHEN period_label ~ '\d{4}' THEN
      CAST(SUBSTRING(period_label FROM '(\d{4})') AS INTEGER)
  END,
  end_month = CASE
    WHEN period_label ILIKE '%present%' OR period_label ILIKE '%current%' THEN NULL
    WHEN period_label ~ '(\w+)\s*-\s*(\w+)\s+(\d{4})' THEN
      CASE
        WHEN period_label ILIKE '%january%' OR period_label ILIKE '%jan%' THEN 1
        WHEN period_label ILIKE '%february%' OR period_label ILIKE '%feb%' THEN 2
        WHEN period_label ILIKE '%march%' OR period_label ILIKE '%mar%' THEN 3
        WHEN period_label ILIKE '%april%' OR period_label ILIKE '%apr%' THEN 4
        WHEN period_label ILIKE '%may%' THEN 5
        WHEN period_label ILIKE '%june%' OR period_label ILIKE '%jun%' THEN 6
        WHEN period_label ILIKE '%july%' OR period_label ILIKE '%jul%' THEN 7
        WHEN period_label ILIKE '%august%' OR period_label ILIKE '%aug%' THEN 8
        WHEN period_label ILIKE '%september%' OR period_label ILIKE '%sept%' OR period_label ILIKE '%sep%' THEN 9
        WHEN period_label ILIKE '%october%' OR period_label ILIKE '%oct%' THEN 10
        WHEN period_label ILIKE '%november%' OR period_label ILIKE '%nov%' THEN 11
        WHEN period_label ILIKE '%december%' OR period_label ILIKE '%dec%' THEN 12
      END
  END,
  end_year = CASE
    WHEN period_label ILIKE '%present%' OR period_label ILIKE '%current%' THEN NULL
    WHEN period_label ~ '\d{4}.*\d{4}' THEN
      CAST(SUBSTRING(period_label FROM '(\d{4})(?!.*\d{4})') AS INTEGER)
  END
WHERE start_month IS NULL;

-- Create index for project_id foreign key
CREATE INDEX IF NOT EXISTS idx_profile_experiences_project_id
ON profile_experiences(project_id);

COMMIT;
