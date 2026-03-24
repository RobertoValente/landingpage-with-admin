import Database from "better-sqlite3"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data.db")

let db: Database.Database

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma("journal_mode = WAL")
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS hero (
        id                 INTEGER PRIMARY KEY CHECK (id = 1),
        badge              TEXT NOT NULL,
        headline           TEXT NOT NULL,
        headline_highlight TEXT NOT NULL,
        subtext            TEXT NOT NULL,
        primary_cta        TEXT NOT NULL,
        secondary_cta      TEXT NOT NULL,
        footnote           TEXT NOT NULL
      );

      INSERT OR IGNORE INTO hero (id, badge, headline, headline_highlight, subtext, primary_cta, secondary_cta, footnote)
      VALUES (
        1,
        'Now with AI-powered insights',
        'Build faster. Ship smarter.',
        'Grow confidently.',
        'Acme gives your team the tools to move fast without breaking things — analytics, automation, and collaboration in one beautiful platform.',
        'Start for free',
        'View demo',
        'No credit card required · Free 14-day trial'
      );
    `)
  }
  return db
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export type Lead = {
  id: number
  name: string
  email: string
  created_at: string
}

export function insertLead(name: string, email: string): Lead {
  return getDb()
    .prepare("INSERT INTO leads (name, email) VALUES (?, ?) RETURNING *")
    .get(name, email) as Lead
}

export function getAllLeads(): Lead[] {
  return getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as Lead[]
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export type HeroContent = {
  id: number
  badge: string
  headline: string
  headline_highlight: string
  subtext: string
  primary_cta: string
  secondary_cta: string
  footnote: string
}

export function getHero(): HeroContent {
  return getDb()
    .prepare("SELECT * FROM hero WHERE id = 1")
    .get() as HeroContent
}

export function updateHero(data: Partial<Omit<HeroContent, "id">>): HeroContent {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) return getHero()

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE hero SET ${setClauses} WHERE id = 1`)
    .run(data)

  return getHero()
}
