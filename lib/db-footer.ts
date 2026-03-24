import { getDb } from "@/lib/db"

// ─── Schema + seed ────────────────────────────────────────────────────────────

const INITIAL_COLUMNS = JSON.stringify([
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
])

getDb().exec(`
  CREATE TABLE IF NOT EXISTS footer (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    tagline TEXT NOT NULL,
    columns TEXT NOT NULL DEFAULT '[]'
  );
  INSERT OR IGNORE INTO footer (id, tagline, columns)
  VALUES (1, 'Build faster, ship smarter, grow confidently.', '${INITIAL_COLUMNS.replace(/'/g, "''")}');
`)

// ─── Types ────────────────────────────────────────────────────────────────────

export type FooterColumn = {
  title: string
  links: string[]
}

export type FooterContent = {
  id: number
  tagline: string
  columns: FooterColumn[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FooterRow = {
  id: number
  tagline: string
  columns: string
}

function parseRow(row: FooterRow): FooterContent {
  return {
    ...row,
    columns: JSON.parse(row.columns) as FooterColumn[],
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getFooter(): FooterContent {
  const row = getDb()
    .prepare("SELECT * FROM footer WHERE id = 1")
    .get() as FooterRow
  return parseRow(row)
}

export function updateFooter(
  data: Partial<Omit<FooterContent, "id">>
): FooterContent {
  const payload: Record<string, string> = {}

  if (data.tagline !== undefined) {
    payload.tagline = data.tagline
  }
  if (data.columns !== undefined) {
    payload.columns = JSON.stringify(data.columns)
  }

  const fields = Object.keys(payload)
  if (fields.length === 0) return getFooter()

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE footer SET ${setClauses} WHERE id = 1`)
    .run(payload)

  return getFooter()
}
