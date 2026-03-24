import { NextResponse } from "next/server"
import { insertLead, getAllLeads } from "@/lib/db"

export async function POST(req: Request) {
  const { name, email } = await req.json()

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 })
  }

  const lead = insertLead(name.trim(), email.trim())
  return NextResponse.json(lead, { status: 201 })
}

export async function GET() {
  const leads = getAllLeads()
  return NextResponse.json(leads)
}
