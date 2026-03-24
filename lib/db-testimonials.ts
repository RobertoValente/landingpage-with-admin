import { getDb } from "@/lib/db"

// ─── Schema + Seed ────────────────────────────────────────────────────────────

getDb().exec(`
  CREATE TABLE IF NOT EXISTS testimonials (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    role       TEXT NOT NULL,
    avatar     TEXT NOT NULL,
    rating     INTEGER NOT NULL DEFAULT 5,
    body       TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`)

const seedRows = [
  { name: "Sarah Chen",    role: "CTO at Loopback",              avatar: "SC", rating: 5, body: "Acme cut our deployment time by 60%. The analytics alone are worth the price — we finally understand what our users are doing.",                                         sort_order: 0 },
  { name: "Marcus Wright", role: "Founder at Buildly",           avatar: "MW", rating: 5, body: "I evaluated 6 platforms before choosing Acme. The onboarding was smooth and the team is incredibly responsive. Couldn't be happier.",                                   sort_order: 1 },
  { name: "Priya Nair",    role: "Head of Engineering at Flux",  avatar: "PN", rating: 5, body: "The security features are enterprise-grade without the enterprise headache. We passed our SOC 2 audit with zero findings related to Acme.",                              sort_order: 2 },
  { name: "James Okafor",  role: "Product Lead at Waverly",      avatar: "JO", rating: 5, body: "We onboarded our whole team in an afternoon. The UX is so clean that even our non-technical stakeholders use the dashboards daily.",                                     sort_order: 3 },
  { name: "Elena Rossi",   role: "CEO at Nexus Studio",          avatar: "ER", rating: 5, body: "Revenue grew 3x after switching to Acme. The automation workflows replaced two full-time positions and actually work more reliably.",                                    sort_order: 4 },
  { name: "David Kim",     role: "Lead Developer at Sprout",     avatar: "DK", rating: 5, body: "The API is a joy to work with — well documented, consistent, and blazing fast. Integration took hours, not weeks.",                                                     sort_order: 5 },
]

const db = getDb()
const count = (db.prepare("SELECT COUNT(*) as n FROM testimonials").get() as { n: number }).n
if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO testimonials (name, role, avatar, rating, body, sort_order) VALUES (@name, @role, @avatar, @rating, @body, @sort_order)"
  )
  const insertMany = db.transaction((rows: typeof seedRows) => {
    for (const row of rows) insert.run(row)
  })
  insertMany(seedRows)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Testimonial = {
  id: number
  name: string
  role: string
  avatar: string
  rating: number
  body: string
  sort_order: number
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getAllTestimonials(): Testimonial[] {
  return getDb()
    .prepare("SELECT * FROM testimonials ORDER BY sort_order ASC")
    .all() as Testimonial[]
}

export function insertTestimonial(data: Omit<Testimonial, "id">): Testimonial {
  return getDb()
    .prepare(
      "INSERT INTO testimonials (name, role, avatar, rating, body, sort_order) VALUES (@name, @role, @avatar, @rating, @body, @sort_order) RETURNING *"
    )
    .get(data) as Testimonial
}

export function updateTestimonial(
  id: number,
  data: Partial<Omit<Testimonial, "id">>
): Testimonial {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) {
    return getDb()
      .prepare("SELECT * FROM testimonials WHERE id = ?")
      .get(id) as Testimonial
  }

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE testimonials SET ${setClauses} WHERE id = @id`)
    .run({ ...data, id })

  return getDb()
    .prepare("SELECT * FROM testimonials WHERE id = ?")
    .get(id) as Testimonial
}

export function deleteTestimonial(id: number): void {
  getDb().prepare("DELETE FROM testimonials WHERE id = ?").run(id)
}
