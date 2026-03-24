import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getHero, updateHero } from "@/lib/db"

export const GET = withAuth(async () => {
  const hero = getHero()
  return NextResponse.json(hero)
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()

  const allowed = [
    "badge",
    "headline",
    "headline_highlight",
    "subtext",
    "primary_cta",
    "secondary_cta",
    "footnote",
  ] as const

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

  const hero = updateHero(updates)
  return NextResponse.json(hero)
})
