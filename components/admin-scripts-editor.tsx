"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"

type FormState = {
  header_scripts: string
  footer_scripts: string
}

const FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  {
    key: "header_scripts",
    label: "Header scripts",
    hint: "Injected into <head>. Use full <script> tags.",
  },
  {
    key: "footer_scripts",
    label: "Footer scripts",
    hint: "Injected at the end of <body>. Use full <script> tags.",
  },
]

export function AdminScriptsEditor() {
  const [form, setForm] = useState<FormState>({ header_scripts: "", footer_scripts: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content/scripts")
      .then((r) => r.json())
      .then(({ id: _id, ...rest }) => setForm(rest))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
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
      const res = await fetch("/api/content/scripts", {
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Custom scripts</h2>
          <p className="text-xs text-muted-foreground">
            Paste full{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;script&gt;</code>{" "}
            tags. Changes take effect on the next page load.
          </p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="px-6 py-4">
                <div className="mb-2">
                  <label htmlFor={key} className="text-sm font-medium">{label}</label>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <textarea
                  id={key}
                  name={key}
                  rows={6}
                  value={form[key]}
                  onChange={handleChange}
                  spellCheck={false}
                  placeholder={`<!-- e.g. Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  ...\n</script>`}
                  className="w-full rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs outline-none ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            ))}
          </div>
        )}

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
          <Button type="submit" disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save scripts"}
          </Button>
        </div>
      </div>
    </form>
  )
}
