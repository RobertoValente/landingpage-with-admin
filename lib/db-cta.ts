import { getDb } from "@/lib/db"

// ─── Table bootstrap ──────────────────────────────────────────────────────────

function bootstrap() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS cta_section (
      id       INTEGER PRIMARY KEY CHECK (id = 1),
      heading  TEXT NOT NULL,
      subtext  TEXT NOT NULL,
      footnote TEXT NOT NULL
    );
    INSERT OR IGNORE INTO cta_section (id, heading, subtext, footnote)
    VALUES (1, 'Be the first to know', 'Join our waitlist and get early access when we launch.', 'No spam, ever. Unsubscribe at any time.');
  `)
}

bootstrap()

// ─── Types & helpers ──────────────────────────────────────────────────────────

export type CtaContent = {
  id: number
  heading: string
  subtext: string
  footnote: string
}

export function getCta(): CtaContent {
  return getDb()
    .prepare("SELECT * FROM cta_section WHERE id = 1")
    .get() as CtaContent
}

export function updateCta(data: Partial<Omit<CtaContent, "id">>): CtaContent {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) return getCta()

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE cta_section SET ${setClauses} WHERE id = 1`)
    .run(data)

  return getCta()
}
