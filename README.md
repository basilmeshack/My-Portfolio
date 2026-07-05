
# 🧑‍💻 My Portfolio

Welcome to **My Portfolio** — a modern, full-stack personal showcase built with [Next.js](https://nextjs.org/), styled with [Tailwind CSS](https://tailwindcss.com/), and powered by a [PocketBase](https://pocketbase.io/) backend. It also integrates [OpenAI](https://platform.openai.com/) to enable smart and interactive experiences.

## 🚀 Features

- ✅ **PocketBase Integration** for dynamic content (e.g., portfolio images, project data)
- 🤖 **OpenAI Integration** to support smart interactions (like AI summaries or content generation)
- 🎨 **Tailwind CSS** styling with custom theming
- ⚙️ **TypeScript** support for safer, scalable development
- 🔍 **Dynamic Search & Filtering** for projects
- 🌐 **Responsive Design** optimized for all devices

## 🗄️ PocketBase to Neon Migration

This project now includes a safe migration path from PocketBase collections to Neon PostgreSQL.

### 1. Environment variables

Create/update `.env` with:

```bash
NEON_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require&channel_binding=require
POCKETBASE_URL=https://remain-faceghost.pockethost.io
POCKETBASE_ADMIN_EMAIL=
POCKETBASE_ADMIN_PASSWORD=
```

`POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` are optional (only required for protected collections).

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run migration

```bash
pnpm db:migrate:pocketbase-to-neon
```

### 4. Verify migrated data

```bash
pnpm db:verify
```

### Normalized relational structure

The migration creates a microservice-friendly schema with separate tables and relationships:

- `profiles` (source: `profile` collection)
- `projects` (source: `projects` collection, linked to `profiles`)
- `project_tools` (one-to-many tools for each project)
- `project_tags` (one-to-many AI/feature tags for each project)
- `portfolio_items` (source: `portfolio_images`, linked to `projects` and `profiles`)
- `portfolio_item_tags` (one-to-many tags for each portfolio item)
- `migration_runs` (audit trail for every migration execution)

To avoid data loss, each core table stores the full PocketBase record in `raw_payload` (JSONB), in addition to normalized columns.

### Runtime data source

The application runtime now reads from Neon (PostgreSQL) via Next.js API routes:

- `/api/profile`
- `/api/projects`
- `/api/portfolio-items`

PocketBase is now only required for migration workflows (`pnpm db:migrate:pocketbase-to-neon`) and can be retired after you verify Neon data and app behavior in production.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙋‍♂️ Author

**Meshack Bwire**  
[Portfolio Website](https://meshackbwire.vercel.app/) | [GitHub](https://github.com/BM-Ghost)
