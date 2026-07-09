BEGIN;

ALTER TABLE assistant_knowledge_documents
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS embedding_model TEXT,
ADD COLUMN IF NOT EXISTS embedding JSONB,
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_content_hash
ON assistant_knowledge_documents(content_hash);

CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_embedding_updated_at
ON assistant_knowledge_documents(embedding_updated_at);

COMMIT;