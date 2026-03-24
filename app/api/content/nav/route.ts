import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getNav, updateNav } from "@/lib/db-nav"

export const GET = withAuth(async () => {
  return NextResponse.json(getNav())
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()

  const allowed = ["logo", "primary_cta", "secondary_cta"] as const

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

  const nav = updateNav(updates)
  return NextResponse.json(nav)
})
