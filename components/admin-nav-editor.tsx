"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import type { NavContent } from "@/lib/db-nav"

type FormState = Omit<NavContent, "id">

const FIELDS: { key: keyof FormState; label: string; hint?: string }[] = [
  { key: "logo", label: "Logo text", hint: "Brand name shown in the top-left of the nav" },
  { key: "primary_cta", label: "Primary CTA label" },
  { key: "secondary_cta", label: "Secondary CTA label" },
]

const EMPTY: FormState = {
  logo: "",
  primary_cta: "",
  secondary_cta: "",
}

export function AdminNavEditor() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content/nav")
      .then((r) => r.json())
      .then((data) => {
        const { id: _id, ...rest } = data
        setForm(rest)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      const res = await fetch("/api/content/nav", {
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Nav section</h2>
          <p className="text-xs text-muted-foreground">
            Changes are reflected on the landing page immediately after saving.
          </p>
        </div>

        <div className="divide-y">
          {FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="grid grid-cols-5 items-start gap-4 px-6 py-4">
              <div className="col-span-2 pt-2">
                <label htmlFor={key} className="text-sm font-medium">
                  {label}
                </label>
                {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
              </div>
              <div className="col-span-3">
                <input
                  id={key}
                  name={key}
                  type="text"
                  value={form[key]}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
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
