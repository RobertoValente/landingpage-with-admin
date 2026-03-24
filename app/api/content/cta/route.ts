import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getCta, updateCta } from "@/lib/db-cta"

export const GET = withAuth(async () => {
  const cta = getCta()
  return NextResponse.json(cta)
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()

  const allowed = ["heading", "subtext", "footnote"] as const

  const updates: Record<string, string> = {}
  for (const key of allowed) {
    if (key in body) {
      const val = String(body[key]).trim()
      if (!val) {
        return NextResponse.json(
          { error: `Field "${key}" cannot be empty.` },
          { status: 400 }
        )
      }
      updates[key] = val
    }
  }

  const cta = updateCta(updates)
  return NextResponse.json(cta)
})
