import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { updateTestimonial, deleteTestimonial } from "@/lib/db-testimonials"

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
    const allowed = ["name", "role", "avatar", "rating", "body", "sort_order"] as const
    const updates: Record<string, string | number> = {}

    for (const key of allowed) {
      if (!(key in body)) continue
      if (key === "rating" || key === "sort_order") {
        const n = Number(body[key])
        if (isNaN(n)) {
          return NextResponse.json({ error: `Field "${key}" must be a number.` }, { status: 400 })
        }
        if (key === "rating" && (n < 1 || n > 5)) {
          return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 })
        }
        updates[key] = n
      } else {
        const val = String(body[key]).trim()
        if (!val) {
          return NextResponse.json({ error: `Field "${key}" cannot be empty.` }, { status: 400 })
        }
        updates[key] = val
      }
    }

    const testimonial = updateTestimonial(numId, updates)
    return NextResponse.json(testimonial)
  })(req)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withAuth(async () => {
    const numId = await parseId(ctx)
    if (numId === null) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }
    deleteTestimonial(numId)
    return new Response(null, { status: 204 })
  })(req)
}
