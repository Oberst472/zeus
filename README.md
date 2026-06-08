# Zeus — Interview Q&A

A personal Vue 3 app for organizing interview-prep questions and answers across technologies.

- Responsive sidebar with categories (Node.js, JS, Vue, Docker, Git…)
- Click a category → scrollable list of questions
- Click a question → expanding accordion with the answer (Markdown + syntax-highlighted code)
- Track confidence, learned topics, and questions due for spaced repetition
- Practice with a timed 10-question mock interview
- No database — content lives in plain JSON files in `src/data/`

## Senior curriculum

The Middle and Senior question bank emphasizes scenarios and trade-offs across TypeScript, frontend and
backend architecture, databases, system design, security, DevOps/observability, and
technical leadership. Strong answers should clarify requirements, compare options,
identify failure modes, and explain how the result would be measured.

The main categories contain 100 questions, with smaller focused categories where
appropriate. The generated part of the bank combines core topics with Middle/Senior review angles:
mechanics, design, trade-offs, debugging, performance, reliability, security,
migration, testing, and architecture scenarios.

The curriculum structure was informed by established open interview-preparation
collections including System Design Primer, Tech Interview Handbook, Full Stack
Interview Questions, and Backend Interview Questions. Answers in this project are
original concise study notes rather than copied material.

Technical topics were checked against primary documentation including MDN, the
TypeScript and Vue handbooks, Node.js documentation, PostgreSQL documentation,
Docker Docs, Git documentation, Kubernetes documentation, OWASP guidance, and
OpenTelemetry documentation.

## Run

```bash
npm install
npm run dev
```

Build for static hosting:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. It validates the
question bank, builds the app with the correct repository base path, and deploys
`dist/` whenever changes are pushed to `main`.

In the GitHub repository, open **Settings → Pages** and set **Source** to
**GitHub Actions**. Then push to `main` or run the workflow manually from the
Actions tab.

## Add a new category

Drop a new `<slug>.json` file into `src/data/` — it appears in the sidebar automatically (no code changes).

```json
{
  "name": "PostgreSQL",
  "icon": "database",
  "order": 25,
  "questions": [
    {
      "id": "indexes",
      "question": "When should you add an index?",
      "answer": "Markdown is supported, including code blocks:\n\n```sql\nCREATE INDEX idx_users_email ON users(email);\n```"
    }
  ]
}
```

Fields:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Display name |
| `icon` | no | Icon name mapped in `src/components/AppIcon.vue` |
| `order` | no | Sidebar sort order (lower = higher). Default `100` |
| `questions[].id` | no | Stable id (auto-generated if omitted) |
| `questions[].question` | yes | Title shown in the list |
| `questions[].answer` | yes | Markdown content |
| `questions[].type` | no | `knowledge`, `scenario`, `trade-off`, `system-design`, etc. |
| `questions[].tags` | no | Searchable topic labels |

## Add a question to an existing category

Edit the matching file in `src/data/` and append to its `questions` array. Vite hot-reloads on save.

## Stack

- Vue 3 (`<script setup>`, Composition API)
- Vite
- markdown-it + highlight.js (syntax highlighting in answers)
- No Pinia / no router — overkill for a single-screen learning tool
