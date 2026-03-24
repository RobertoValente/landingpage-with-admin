import { getDb } from "@/lib/db"

getDb().exec(`
  CREATE TABLE IF NOT EXISTS nav (
    id           INTEGER PRIMARY KEY CHECK (id = 1),
    logo         TEXT NOT NULL,
    primary_cta  TEXT NOT NULL,
    secondary_cta TEXT NOT NULL
  );
  INSERT OR IGNORE INTO nav (id, logo, primary_cta, secondary_cta)
  VALUES (1, 'Acme', 'Get started', 'Log in');
`)

export type NavContent = {
  id: number
  logo: string
  primary_cta: string
  secondary_cta: string
}

export function getNav(): NavContent {
  return getDb()
    .prepare("SELECT * FROM nav WHERE id = 1")
    .get() as NavContent
}

export function updateNav(data: Partial<Omit<NavContent, "id">>): NavContent {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) return getNav()

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE nav SET ${setClauses} WHERE id = 1`)
    .run(data)

  return getNav()
}
