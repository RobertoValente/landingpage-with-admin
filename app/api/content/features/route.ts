import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getAllFeatures, insertFeature } from "@/lib/db-features"

export const GET = withAuth(async () => {
  const features = getAllFeatures()
  return NextResponse.json(features)
})

export const POST = withAuth(async (req: Request) => {
  const body = await req.json()

  const title = String(body.title ?? "").trim()
  const description = String(body.description ?? "").trim()

  if (!title) {
    return NextResponse.json({ error: "Field \"title\" cannot be empty." }, { status: 400 })
  }
  if (!description) {
    return NextResponse.json({ error: "Field \"description\" cannot be empty." }, { status: 400 })
  }

  const icon_name = String(body.icon_name ?? "Zap").trim() || "Zap"
  const sort_order = typeof body.sort_order === "number" ? body.sort_order : 0

  const feature = insertFeature({ icon_name, title, description, sort_order })
  return NextResponse.json(feature, { status: 201 })
})
