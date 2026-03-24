import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getScripts, updateScripts } from "@/lib/db-scripts"

export const GET = withAuth(async () => {
  return NextResponse.json(getScripts())
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()
  const updates: Record<string, string> = {}

  for (const key of ["header_scripts", "footer_scripts"] as const) {
    if (key in body) {
      updates[key] = String(body[key]) // allow empty string — scripts can be cleared
    }
  }

  const scripts = updateScripts(updates)
  return NextResponse.json(scripts)
})
