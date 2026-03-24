import { getDb } from "@/lib/db"

// ─── Schema + Seed ────────────────────────────────────────────────────────────

function init() {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS features (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      icon_name   TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );
  `)

  const count = (db.prepare("SELECT COUNT(*) as n FROM features").get() as { n: number }).n
  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO features (icon_name, title, description, sort_order) VALUES (?, ?, ?, ?)"
    )
    const seed = db.transaction(() => {
      insert.run("BarChart3", "Advanced Analytics", "Get deep insights into your business with real-time dashboards and custom reports.", 0)
      insert.run("Shield", "Enterprise Security", "SOC 2 Type II compliant with end-to-end encryption and SSO out of the box.", 1)
      insert.run("Globe", "Global CDN", "Deploy to 200+ edge locations and serve users with sub-50ms latency worldwide.", 2)
      insert.run("Zap", "Instant Automation", "Automate repetitive workflows with our no-code builder and 500+ integrations.", 3)
      insert.run("Headphones", "24/7 Support", "Dedicated success managers and around-the-clock support on every plan.", 4)
      insert.run("Layers", "Seamless Integrations", "Connect your existing stack in minutes with pre-built connectors and a REST API.", 5)
    })
    seed()
  }
}

init()

// ─── Types ────────────────────────────────────────────────────────────────────

export type Feature = {
  id: number
  icon_name: string
  title: string
  description: string
  sort_order: number
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getAllFeatures(): Feature[] {
  return getDb()
    .prepare("SELECT * FROM features ORDER BY sort_order ASC")
    .all() as Feature[]
}

export function insertFeature(data: Omit<Feature, "id">): Feature {
  return getDb()
    .prepare(
      "INSERT INTO features (icon_name, title, description, sort_order) VALUES (@icon_name, @title, @description, @sort_order) RETURNING *"
    )
    .get(data) as Feature
}

export function updateFeature(id: number, data: Partial<Omit<Feature, "id">>): Feature {
  const db = getDb()
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) {
    return db.prepare("SELECT * FROM features WHERE id = ?").get(id) as Feature
  }
  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  db.prepare(`UPDATE features SET ${setClauses} WHERE id = @id`).run({ ...data, id })
  return db.prepare("SELECT * FROM features WHERE id = ?").get(id) as Feature
}

export function deleteFeature(id: number): void {
  getDb().prepare("DELETE FROM features WHERE id = ?").run(id)
}
