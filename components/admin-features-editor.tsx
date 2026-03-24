"use client"

import { useEffect, useRef, useState } from "react"
import { Trash2, PlusCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Feature } from "@/lib/db-features"

type RowState = Feature & { saved: boolean; error: string }

export function AdminFeaturesEditor() {
  const [rows, setRows] = useState<RowState[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Track per-row save flash timers so we can clear them on unmount
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    fetch("/api/content/features")
      .then((r) => r.json())
      .then((data: Feature[]) => {
        setRows(data.map((f) => ({ ...f, saved: false, error: "" })))
      })
      .finally(() => setLoading(false))

    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

  function flashSaved(id: number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved: true, error: "" } : r))
    )
    const t = setTimeout(() => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, saved: false } : r))
      )
      timers.current.delete(id)
    }, 2000)
    const existing = timers.current.get(id)
    if (existing) clearTimeout(existing)
    timers.current.set(id, t)
  }

  function setRowError(id: number, error: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, error } : r)))
  }

  function handleChange(id: number, field: keyof Feature, value: string | number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value, saved: false, error: "" } : r))
    )
  }

  async function handleBlur(id: number, field: keyof Feature, value: string | number) {
    try {
      const res = await fetch(`/api/content/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setRowError(id, error ?? "Failed to save.")
        return
      }
      const updated: Feature = await res.json()
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated, saved: false, error: "" } : r))
      )
      flashSaved(id)
    } catch {
      setRowError(id, "Network error.")
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/content/features/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) {
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // silently ignore
    }
  }

  async function handleAdd() {
    setAdding(true)
    try {
      const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0
      const res = await fetch("/api/content/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icon_name: "Zap",
          title: "New feature",
          description: "Describe this feature.",
          sort_order: nextOrder,
        }),
      })
      if (!res.ok) return
      const feature: Feature = await res.json()
      setRows((prev) => [...prev, { ...feature, saved: false, error: "" }])
    } finally {
      setAdding(false)
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
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border bg-background">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Features section</h2>
          <p className="text-xs text-muted-foreground">
            Changes are saved automatically when you leave a field.
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Icon name + title row */}
                  <div className="flex gap-3">
                    <div className="w-36 shrink-0">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Icon name
                      </label>
                      <input
                        type="text"
                        value={row.icon_name}
                        onChange={(e) => handleChange(row.id, "icon_name", e.target.value)}
                        onBlur={(e) => handleBlur(row.id, "icon_name", e.target.value)}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Title
                      </label>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => handleChange(row.id, "title", e.target.value)}
                        onBlur={(e) => handleBlur(row.id, "title", e.target.value)}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={row.description}
                      onChange={(e) => handleChange(row.id, "description", e.target.value)}
                      onBlur={(e) => handleBlur(row.id, "description", e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  {/* Per-row feedback */}
                  <div className="flex h-4 items-center gap-1.5 text-xs">
                    {row.saved && (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600">Saved</span>
                      </>
                    )}
                    {row.error && (
                      <span className="text-destructive">{row.error}</span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  className="mt-6 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete feature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer — add button */}
        <div className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add feature
          </Button>
        </div>
      </div>
    </div>
  )
}
