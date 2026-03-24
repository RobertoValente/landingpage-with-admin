import { getDb } from "@/lib/db"

getDb().exec(`
  CREATE TABLE IF NOT EXISTS pricing_plans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    price       TEXT NOT NULL,
    description TEXT NOT NULL,
    features    TEXT NOT NULL DEFAULT '[]',
    cta         TEXT NOT NULL,
    highlighted INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0
  );
`)

// Seed if empty
const count = (
  getDb().prepare("SELECT COUNT(*) as c FROM pricing_plans").get() as { c: number }
).c

if (count === 0) {
  const seed = [
    {
      name: "Starter",
      price: "$19",
      description: "Perfect for indie hackers and small projects.",
      features: ["Up to 5 projects", "10k monthly events", "Basic analytics", "Email support"],
      cta: "Get started",
      highlighted: 0,
      sort_order: 0,
    },
    {
      name: "Pro",
      price: "$49",
      description: "For growing teams that need more power.",
      features: [
        "Unlimited projects",
        "500k monthly events",
        "Advanced analytics",
        "Priority support",
        "Custom domains",
        "API access",
      ],
      cta: "Start free trial",
      highlighted: 1,
      sort_order: 1,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organisations with custom needs.",
      features: [
        "Everything in Pro",
        "Unlimited events",
        "SSO & SAML",
        "Dedicated manager",
        "SLA guarantee",
        "Custom contracts",
      ],
      cta: "Contact sales",
      highlighted: 0,
      sort_order: 2,
    },
  ]

  const insert = getDb().prepare(
    "INSERT INTO pricing_plans (name, price, description, features, cta, highlighted, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )

  for (const plan of seed) {
    insert.run(
      plan.name,
      plan.price,
      plan.description,
      JSON.stringify(plan.features),
      plan.cta,
      plan.highlighted,
      plan.sort_order
    )
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PricingPlan = {
  id: number
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
  sort_order: number
}

type RawPricingPlan = Omit<PricingPlan, "features" | "highlighted"> & {
  features: string
  highlighted: number
}

function hydrate(raw: RawPricingPlan): PricingPlan {
  return {
    ...raw,
    features: JSON.parse(raw.features) as string[],
    highlighted: raw.highlighted === 1,
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getAllPricingPlans(): PricingPlan[] {
  const rows = getDb()
    .prepare("SELECT * FROM pricing_plans ORDER BY sort_order ASC")
    .all() as RawPricingPlan[]
  return rows.map(hydrate)
}

export function insertPricingPlan(data: Omit<PricingPlan, "id">): PricingPlan {
  const raw = getDb()
    .prepare(
      `INSERT INTO pricing_plans (name, price, description, features, cta, highlighted, sort_order)
       VALUES (@name, @price, @description, @features, @cta, @highlighted, @sort_order)
       RETURNING *`
    )
    .get({
      ...data,
      features: JSON.stringify(data.features),
      highlighted: data.highlighted ? 1 : 0,
    }) as RawPricingPlan

  return hydrate(raw)
}

export function updatePricingPlan(
  id: number,
  data: Partial<Omit<PricingPlan, "id">>
): PricingPlan {
  const payload: Record<string, unknown> = { ...data }

  if ("features" in payload && Array.isArray(payload.features)) {
    payload.features = JSON.stringify(payload.features)
  }
  if ("highlighted" in payload) {
    payload.highlighted = payload.highlighted ? 1 : 0
  }

  const fields = Object.keys(payload)
  if (fields.length === 0) {
    const existing = getDb()
      .prepare("SELECT * FROM pricing_plans WHERE id = ?")
      .get(id) as RawPricingPlan
    return hydrate(existing)
  }

  const setClauses = fields.map((f) => `${f} = @${f}`).join(", ")
  const raw = getDb()
    .prepare(`UPDATE pricing_plans SET ${setClauses} WHERE id = @id RETURNING *`)
    .get({ ...payload, id }) as RawPricingPlan

  return hydrate(raw)
}

export function deletePricingPlan(id: number): void {
  getDb().prepare("DELETE FROM pricing_plans WHERE id = ?").run(id)
}
