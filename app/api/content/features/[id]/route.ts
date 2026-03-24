import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { updateFeature, deleteFeature } from "@/lib/db-features"

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

    const body = await innerReq.json()

    const allowed = ["icon_name", "title", "description", "sort_order"] as const
    const updates: Record<string, string | number> = {}

    for (const key of allowed) {
      if (!(key in body)) continue
      if (key === "sort_order") {
        updates[key] = Number(body[key])
      } else {
        const val = String(body[key]).trim()
        if (key !== "icon_name" && !val) {
          return NextResponse.json({ error: `Field "${key}" cannot be empty.` }, { status: 400 })
        }
        updates[key] = val
      }
    }

    const feature = updateFeature(numId, updates)
    return NextResponse.json(feature)
  })(req)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withAuth(async () => {
    const numId = await parseId(ctx)
    if (numId === null) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    deleteFeature(numId)
    return new Response(null, { status: 204 })
  })(req)
}
