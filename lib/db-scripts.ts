import { getDb } from "@/lib/db"

getDb().exec(`
  CREATE TABLE IF NOT EXISTS scripts (
    id             INTEGER PRIMARY KEY CHECK (id = 1),
    header_scripts TEXT NOT NULL DEFAULT '',
    footer_scripts TEXT NOT NULL DEFAULT ''
  );
  INSERT OR IGNORE INTO scripts (id, header_scripts, footer_scripts)
  VALUES (1, '', '');
`)

export type ScriptsContent = {
  id: number
  header_scripts: string
  footer_scripts: string
}

export function getScripts(): ScriptsContent {
  return getDb()
    .prepare("SELECT * FROM scripts WHERE id = 1")
    .get() as ScriptsContent
}

export function updateScripts(data: Partial<Omit<ScriptsContent, "id">>): ScriptsContent {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) return getScripts()

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb()
    .prepare(`UPDATE scripts SET ${setClauses} WHERE id = 1`)
    .run(data)

  return getScripts()
}
