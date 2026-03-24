import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getAllPricingPlans, insertPricingPlan } from "@/lib/db-pricing"

export const GET = withAuth(async () => {
  const plans = getAllPricingPlans()
  return NextResponse.json(plans)
})

export const POST = withAuth(async (req: Request) => {
  const body = await req.json().catch(() => ({}))

  const plan = insertPricingPlan({
    name: String(body.name ?? "New plan"),
    price: String(body.price ?? "$0"),
    description: String(body.description ?? ""),
    features: Array.isArray(body.features) ? body.features.map(String) : [],
    cta: String(body.cta ?? "Get started"),
    highlighted: Boolean(body.highlighted ?? false),
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
  })

  return NextResponse.json(plan, { status: 201 })
})
