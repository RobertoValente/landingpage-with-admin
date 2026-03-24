# How to add a new editable landing page section

This document explains the exact pattern used in this project so that any developer (or LLM) can add a new DB-backed, admin-editable section to the landing page.

---

## Overview

Every section follows the same 5-layer pattern:

```
lib/db-{section}.ts          ← SQLite schema + CRUD helpers
app/api/content/{section}/   ← REST API (auth-protected)
components/admin-{section}-editor.tsx  ← Admin UI (client component)
app/page.tsx                 ← Landing page reads from DB (server component)
app/admin/page.tsx           ← Mounts the editor component
```

---

## Step 1 — DB module (`lib/db-{section}.ts`)

Import the shared DB connection and initialise your table on module load.

### Single-row section (one set of values, e.g. Hero, Nav, CTA, Footer)

```ts
import { getDb } from "@/lib/db"

// Runs once when the module is first imported
getDb().exec(`
  CREATE TABLE IF NOT EXISTS my_section (
    id          INTEGER PRIMARY KEY CHECK (id = 1),  -- enforces single row
    title       TEXT NOT NULL,
    description TEXT NOT NULL
  );
  INSERT OR IGNORE INTO my_section (id, title, description)
  VALUES (1, 'Default title', 'Default description');
`)

export type MySectionContent = {
  id: number
  title: string
  description: string
}

export function getMySection(): MySectionContent {
  return getDb()
    .prepare("SELECT * FROM my_section WHERE id = 1")
    .get() as MySectionContent
}

export function updateMySection(
  data: Partial<Omit<MySectionContent, "id">>
): MySectionContent {
  const fields = Object.keys(data) as Array<keyof typeof data>
  if (fields.length === 0) return getMySection()
  const set = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb().prepare(`UPDATE my_section SET ${set} WHERE id = 1`).run(data)
  return getMySection()
}
```

### Multi-row section (list of items, e.g. Features, Pricing, Testimonials)

```ts
import { getDb } from "@/lib/db"

getDb().exec(`
  CREATE TABLE IF NOT EXISTS my_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`)

// Seed only if table is empty
const count = (getDb().prepare("SELECT COUNT(*) as n FROM my_items").get() as { n: number }).n
if (count === 0) {
  const insert = getDb().prepare("INSERT INTO my_items (name, sort_order) VALUES (?, ?)")
  insert.run("Item one", 0)
  insert.run("Item two", 1)
}

export type MyItem = { id: number; name: string; sort_order: number }

export function getAllMyItems(): MyItem[] {
  return getDb()
    .prepare("SELECT * FROM my_items ORDER BY sort_order")
    .all() as MyItem[]
}

export function insertMyItem(data: Omit<MyItem, "id">): MyItem {
  return getDb()
    .prepare("INSERT INTO my_items (name, sort_order) VALUES (@name, @sort_order) RETURNING *")
    .get(data) as MyItem
}

export function updateMyItem(id: number, data: Partial<Omit<MyItem, "id">>): MyItem {
  const fields = Object.keys(data) as Array<keyof typeof data>
  const set = fields.map((f) => `${f} = @${f}`).join(", ")
  getDb().prepare(`UPDATE my_items SET ${set} WHERE id = @id`).run({ ...data, id })
  return getDb().prepare("SELECT * FROM my_items WHERE id = ?").get(id) as MyItem
}

export function deleteMyItem(id: number): void {
  getDb().prepare("DELETE FROM my_items WHERE id = ?").run(id)
}
```

#### Storing arrays/objects as JSON

When a column holds a list (e.g. a plan's feature bullets), store it as `TEXT` and serialize/deserialize:

```ts
// Writing
getDb().prepare("INSERT INTO plans (features) VALUES (?)").run(JSON.stringify(features))

// Reading — always parse after fetching
const row = getDb().prepare("SELECT * FROM plans WHERE id = ?").get(id) as RawRow
return { ...row, features: JSON.parse(row.features) as string[] }
```

---

## Step 2 — API routes (`app/api/content/{section}/route.ts`)

**Always wrap handlers with `withAuth`** from `@/lib/auth`. It currently logs `"Should Check Auth here..."` and passes through — replace its body with real auth logic when ready.

### Single-row (GET + PATCH)

```ts
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getMySection, updateMySection } from "@/lib/db-my-section"

export const GET = withAuth(async () => {
  return NextResponse.json(getMySection())
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()
  const allowed = ["title", "description"] as const
  const updates: Record<string, string> = {}

  for (const key of allowed) {
    if (key in body) {
      const val = String(body[key]).trim()
      if (!val) return NextResponse.json({ error: `"${key}" cannot be empty.` }, { status: 400 })
      updates[key] = val
    }
  }

  return NextResponse.json(updateMySection(updates))
})
```

### Multi-row (GET + POST in route.ts, PATCH + DELETE in `[id]/route.ts`)

`app/api/content/my-items/route.ts`:
```ts
export const GET  = withAuth(async () => NextResponse.json(getAllMyItems()))
export const POST = withAuth(async (req) => {
  const { name } = await req.json()
  const item = insertMyItem({ name, sort_order: 0 })
  return NextResponse.json(item, { status: 201 })
})
```

`app/api/content/my-items/[id]/route.ts`:

> **Important:** Next.js dynamic route handlers receive a second `context` argument for params. Because `withAuth` only types `(req: Request)`, call it **internally** rather than exporting it directly.

```ts
type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  return withAuth(async (innerReq) => {
    const { id } = await ctx.params
    const numId = Number(id)
    // ... validate, update, return
  })(req)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withAuth(async () => {
    const { id } = await ctx.params
    deleteMyItem(Number(id))
    return new Response(null, { status: 204 })
  })(req)
}
```

---

## Step 3 — Admin editor component (`components/admin-{section}-editor.tsx`)

Always a `"use client"` component. Follows this structure:

```tsx
"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"

export function AdminMySectionEditor() {
  const [form, setForm] = useState({ title: "", description: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState("")

  // 1. Fetch current values on mount
  useEffect(() => {
    fetch("/api/content/my-section")
      .then((r) => r.json())
      .then(({ id: _id, ...rest }) => setForm(rest))
      .finally(() => setLoading(false))
  }, [])

  // 2. Save on submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/content/my-section", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  // 3. Render — card with divide-y field rows, same style as hero editor
  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">My section</h2>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {/* Each field row */}
            <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
              <div className="col-span-2 pt-2">
                <label className="text-sm font-medium">Title</label>
              </div>
              <div className="col-span-3">
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            {saved && <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-green-600">Saved</span></>}
            {error && <span className="text-destructive">{error}</span>}
          </div>
          <Button type="submit" disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}
```

For **multi-row sections**, fetch items into an array, render each as an editable card, save on `onBlur` per field via `PATCH /api/.../[id]`, add a delete button, and add an "Add item" button that calls `POST`.

---

## Step 4 — Wire up the landing page (`app/page.tsx`)

`app/page.tsx` is a **server component** — it reads from the DB directly (no `fetch`).

```ts
// 1. Import the DB helper
import { getMySection } from "@/lib/db-my-section"

// 2. Update the section component to accept props
function MySection({ data }: { data: MySectionContent }) {
  return <section>{data.title}</section>
}

// 3. In the Page component, call the helper and pass the result
export default function Page() {
  const mySection = getMySection()
  // ...
  return (
    <>
      <MySection data={mySection} />
    </>
  )
}
```

---

## Step 5 — Mount the editor in admin (`app/admin/page.tsx`)

```ts
import { AdminMySectionEditor } from "@/components/admin-my-section-editor"

// Inside the <main> content area:
<AdminMySectionEditor />
```

Add it to the `flex flex-col gap-8` list in the correct visual order.

---

## Key rules / gotchas

| Rule | Why |
|---|---|
| Always `export { getDb }` from `lib/db.ts` and import it in section db files | Shares the single SQLite connection (WAL mode, same process) |
| Use `INSERT OR IGNORE` + `CHECK (id = 1)` for single-row tables | Guarantees exactly one row, safe to call on every boot |
| Seed multi-row tables by checking `COUNT(*) = 0` first | Idempotent, won't re-seed on restart |
| `withAuth` wraps `(req: Request) => Response` only | For dynamic `[id]` routes, call `withAuth(handler)(req)` **inside** the exported function instead of exporting `withAuth(...)` directly |
| `app/page.tsx` is a server component — call DB helpers directly | No `fetch` needed; avoids an extra HTTP round-trip |
| Admin editor components are always `"use client"` | They need `useState`/`useEffect` for form state and `fetch` for the API |
| Empty strings are a validation error for most fields | The API returns `400` if a required field is blanked; the editor shows the error inline |
| `scripts` section is the exception — empty strings are valid | A user should be able to clear all injected scripts |
