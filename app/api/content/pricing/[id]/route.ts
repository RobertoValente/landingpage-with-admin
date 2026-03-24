import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { updatePricingPlan, deletePricingPlan } from "@/lib/db-pricing"

type Ctx = { params: Promise<{ id: string }> }

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params
  const num = Number(id)
  return Number.isInteger(num) && num > 0 ? num : null
}

export async function PATCH(req: Request, ctx: Ctx) {
  return withAuth(async (innerReq: Request) => {
    const numId = await parseId(ctx)
    if (numId === null) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const body = await innerReq.json().catch(() => ({}))
    const allowed = ["name", "price", "description", "features", "cta", "highlighted", "sort_order"] as const
    const updates: Record<string, unknown> = {}

    for (const key of allowed) {
      if (!(key in body)) continue
      if (key === "features") {
        updates.features = Array.isArray(body.features) ? body.features.map(String) : []
      } else if (key === "highlighted") {
        updates.highlighted = Boolean(body.highlighted)
      } else if (key === "sort_order") {
        updates.sort_order = Number(body.sort_order)
      } else {
        const val = String(body[key]).trim()
        if (!val) {
          return NextResponse.json({ error: `Field "${key}" cannot be empty.` }, { status: 400 })
        }
        updates[key] = val
      }
    }

    const plan = updatePricingPlan(numId, updates as Parameters<typeof updatePricingPlan>[1])
    return NextResponse.json(plan)
  })(req)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withAuth(async () => {
    const numId = await parseId(ctx)
    if (numId === null) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }
    deletePricingPlan(numId)
    return new Response(null, { status: 204 })
  })(req)
}
