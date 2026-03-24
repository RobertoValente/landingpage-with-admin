"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import type { FooterColumn, FooterContent } from "@/lib/db-footer"

type ColumnDraft = {
  title: string
  linksText: string // one link per line
}

type FormState = {
  tagline: string
  columns: ColumnDraft[]
}

function toFormState(data: FooterContent): FormState {
  return {
    tagline: data.tagline,
    columns: data.columns.map((col) => ({
      title: col.title,
      linksText: col.links.join("\n"),
    })),
  }
}

function toPayload(form: FormState): { tagline: string; columns: FooterColumn[] } {
  return {
    tagline: form.tagline,
    columns: form.columns.map((col) => ({
      title: col.title,
      links: col.linksText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    })),
  }
}

const EMPTY: FormState = {
  tagline: "",
  columns: [],
}

export function AdminFooterEditor() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content/footer")
      .then((r) => r.json())
      .then((data: FooterContent) => {
        setForm(toFormState(data))
      })
      .finally(() => setLoading(false))
  }, [])

  function handleTaglineChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSaved(false)
    setError("")
    setForm((prev) => ({ ...prev, tagline: e.target.value }))
  }

  function handleColumnChange(
    index: number,
    field: keyof ColumnDraft,
    value: string
  ) {
    setSaved(false)
    setError("")
    setForm((prev) => {
      const columns = prev.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      )
      return { ...prev, columns }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/content/footer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
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
          <h2 className="font-semibold">Footer section</h2>
          <p className="text-xs text-muted-foreground">
            Changes are reflected on the landing page immediately after saving.
          </p>
        </div>

        <div className="divide-y">
          {/* Tagline */}
          <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
            <div className="col-span-2 pt-2">
              <label htmlFor="footer-tagline" className="text-sm font-medium">
                Tagline
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Short description below the logo
              </p>
            </div>
            <div className="col-span-3">
              <input
                id="footer-tagline"
                name="tagline"
                type="text"
                value={form.tagline}
                onChange={handleTaglineChange}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Columns */}
          {form.columns.map((col, index) => (
            <div key={index} className="grid grid-cols-5 items-start gap-4 px-6 py-4">
              <div className="col-span-2 pt-2">
                <p className="text-sm font-medium">Column {index + 1}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Title and links (one per line)
                </p>
              </div>
              <div className="col-span-3 space-y-2">
                <input
                  id={`footer-col-title-${index}`}
                  name={`col-title-${index}`}
                  type="text"
                  value={col.title}
                  onChange={(e) =>
                    handleColumnChange(index, "title", e.target.value)
                  }
                  placeholder="Column title"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <textarea
                  id={`footer-col-links-${index}`}
                  name={`col-links-${index}`}
                  rows={4}
                  value={col.linksText}
                  onChange={(e) =>
                    handleColumnChange(index, "linksText", e.target.value)
                  }
                  placeholder="One link per line"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
