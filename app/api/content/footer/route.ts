import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getFooter, updateFooter } from "@/lib/db-footer"
import type { FooterColumn } from "@/lib/db-footer"

export const GET = withAuth(async () => {
  const footer = getFooter()
  return NextResponse.json(footer)
})

export const PATCH = withAuth(async (req: Request) => {
  const body = await req.json()

  const updates: { tagline?: string; columns?: FooterColumn[] } = {}

  if ("tagline" in body) {
    const tagline = String(body.tagline).trim()
    if (!tagline) {
      return NextResponse.json(
        { error: 'Field "tagline" cannot be empty.' },
        { status: 400 }
      )
    }
    updates.tagline = tagline
  }

  if ("columns" in body) {
    updates.columns = body.columns as FooterColumn[]
  }

  const footer = updateFooter(updates)
  return NextResponse.json(footer)
})
