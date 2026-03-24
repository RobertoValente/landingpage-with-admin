import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getAllTestimonials, insertTestimonial } from "@/lib/db-testimonials"

export const GET = withAuth(async () => {
  const testimonials = getAllTestimonials()
  return NextResponse.json(testimonials)
})

export const POST = withAuth(async (req: Request) => {
  const body = await req.json()

  const name = String(body.name ?? "").trim()
  const role = String(body.role ?? "").trim()
  const avatar = String(body.avatar ?? "").trim()
  const rating = Number(body.rating ?? 5)
  const testimonialBody = String(body.body ?? "").trim()
  const sort_order = Number(body.sort_order ?? 0)

  if (!name || !role || !avatar || !testimonialBody) {
    return NextResponse.json(
      { error: "Fields name, role, avatar, and body are required." },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5." },
      { status: 400 }
    )
  }

  const testimonial = insertTestimonial({ name, role, avatar, rating, body: testimonialBody, sort_order })
  return NextResponse.json(testimonial, { status: 201 })
})
