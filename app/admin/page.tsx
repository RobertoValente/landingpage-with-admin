"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Loader2, CheckCircle2 } from "lucide-react"
import type { HeroContent } from "@/lib/db"
import { AdminNavEditor } from "@/components/admin-nav-editor"
import { AdminFeaturesEditor } from "@/components/admin-features-editor"
import { AdminPricingEditor } from "@/components/admin-pricing-editor"
import { AdminTestimonialsEditor } from "@/components/admin-testimonials-editor"
import { AdminCtaEditor } from "@/components/admin-cta-editor"
import { AdminFooterEditor } from "@/components/admin-footer-editor"
import { AdminScriptsEditor } from "@/components/admin-scripts-editor"

type FormState = Omit<HeroContent, "id">

const FIELDS: { key: keyof FormState; label: string; hint?: string }[] = [
  { key: "badge", label: "Badge text", hint: "Small pill above the headline" },
  { key: "headline", label: "Headline" },
  { key: "headline_highlight", label: "Headline highlight", hint: "Rendered in the primary colour" },
  { key: "subtext", label: "Subtext" },
  { key: "primary_cta", label: "Primary CTA label" },
  { key: "secondary_cta", label: "Secondary CTA label" },
  { key: "footnote", label: "Footnote", hint: "Small text below the buttons" },
]

const EMPTY: FormState = {
  badge: "",
  headline: "",
  headline_highlight: "",
  subtext: "",
  primary_cta: "",
  secondary_cta: "",
  footnote: "",
}

function AdminHeroEditor() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content/hero")
      .then((r) => r.json())
      .then(({ id: _id, ...rest }) => setForm(rest))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setSaved(false)
    setError("")
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/content/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? "Failed to save.")
      }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Hero section</h2>
          <p className="text-xs text-muted-foreground">The first thing visitors see.</p>
        </div>
        <div className="divide-y">
          {FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="grid grid-cols-5 items-start gap-4 px-6 py-4">
              <div className="col-span-2 pt-2">
                <label htmlFor={key} className="text-sm font-medium">{label}</label>
                {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
              </div>
              <div className="col-span-3">
                {key === "subtext" ? (
                  <textarea
                    id={key}
                    name={key}
                    rows={3}
                    value={form[key]}
                    onChange={handleChange}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                ) : (
                  <input
                    id={key}
                    name={key}
                    type="text"
                    value={form[key]}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            {saved && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Saved successfully</span>
              </>
            )}
            {error && <span className="text-destructive">{error}</span>}
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function ContentPage() {
  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div>
          <h1 className="text-sm font-semibold">Content</h1>
          <p className="text-xs text-muted-foreground">Edit your landing page copy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            A
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <AdminNavEditor />
          <AdminHeroEditor />
          <AdminFeaturesEditor />
          <AdminPricingEditor />
          <AdminTestimonialsEditor />
          <AdminCtaEditor />
          <AdminFooterEditor />
          <AdminScriptsEditor />
        </div>
      </main>
    </>
  )
}
