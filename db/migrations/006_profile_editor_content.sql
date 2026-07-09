BEGIN;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS about_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS edit_password_hash TEXT;

UPDATE profiles
SET about_payload = CASE
  WHEN about_payload = '{}'::jsonb THEN jsonb_build_object(
    'professionalBlurb', 'Software Engineer specializing in POS systems integration, mobile applications, and API development with a focus on secure payment solutions.',
    'aboutIntro', 'My name is Meshack Bwire from Nairobi, Kenya.',
    'aboutCurrentRole', 'Throughout my career, I have consistently demonstrated expertise and innovation in software engineering and data management. Currently, I am employed as a Software Engineer at Tracom Services Limited, specializing in Android development and working with technologies such as C#, JavaScript, and .NET for desk POS systems. My other roles involve integrating client Web APIs, ensuring PCI compliance, creation of Bitbucket pipelines and deployment of applications.',
    'aboutHighlights', jsonb_build_array(
      'My notable achievements include developing the current payment application for Awash Bank of Ethiopia on Ingenico''s DX devices.',
      'I also worked on the current Nexgo device SDK for Cooperative Rural Development Bank (CRDB) of Tanzania.',
      'These projects reflect my focus on robust payment solutions, device integrations, and delivery in regulated environments.'
    ),
    'aboutPreviousRole', 'Previously, I worked as a Telecommunications Engineer at Guzzer Technologies, where I excelled in network troubleshooting, construction, and maintenance.',
    'interests', jsonb_build_array('Researching Quantum and Astro-Physics', 'Writing Tech Blogs', 'Travelling'),
    'quote', 'Strive to build things that make a difference!',
    'quoteAuthor', 'Bwire'
  )
  ELSE about_payload
END,
edit_password_hash = COALESCE(edit_password_hash, 'scrypt:14f84b722d5ef3783106e26401515a12:6174796df555b07c8c46e107dd627fbaf958d282a6e3805fcff4f51dd4114f49b62b3e88e2f64c984f27f6e4393de494c0029063322ae87c8f6fe0c4f7c90b64');

SELECT refresh_assistant_knowledge_documents();

COMMIT;