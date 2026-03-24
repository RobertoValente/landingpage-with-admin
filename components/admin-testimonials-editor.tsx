"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Plus } from "lucide-react"
import type { Testimonial } from "@/lib/db-testimonials"

// ─── Types ────────────────────────────────────────────────────────────────────

type TestimonialDraft = Omit<Testimonial, "id"> & { id: number }

// ─── Individual card ──────────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  onDelete,
  onSaved,
}: {
  testimonial: TestimonialDraft
  onDelete: (id: number) => void
  onSaved: (updated: Testimonial) => void
}) {
  const [fields, setFields] = useState<Omit<Testimonial, "id">>({
    name: testimonial.name,
    role: testimonial.role,
    avatar: testimonial.avatar,
    rating: testimonial.rating,
    body: testimonial.body,
    sort_order: testimonial.sort_order,
  })
  const [deleting, setDeleting] = useState(false)
  const [savingField, setSavingField] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => ({
      ...prev,
      [name]: name === "rating" || name === "sort_order" ? Number(value) : value,
    }))
  }

  async function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const payload = {
      [name]: name === "rating" || name === "sort_order" ? Number(value) : String(value).trim(),
    }
    setSavingField(name)
    try {
      const res = await fetch(`/api/content/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated: Testimonial = await res.json()
        onSaved(updated)
      }
    } finally {
      setSavingField(null)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/content/testimonials/${testimonial.id}`, { method: "DELETE" })
      onDelete(testimonial.id)
    } finally {
      setDeleting(false)
    }
  }

  const inputClass =
    "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  const textareaClass =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {fields.avatar || "?"}
          </div>
          <span className="text-sm font-medium">{fields.name || "New testimonial"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="divide-y">
        {/* Name */}
        <div className="grid grid-cols-5 items-start gap-4 px-5 py-3">
          <div className="col-span-2 pt-1.5">
            <label className="text-sm font-medium">Name</label>
          </div>
          <div className="relative col-span-3">
            <input
              name="name"
              type="text"
              value={fields.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            {savingField === "name" && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Role */}
        <div className="grid grid-cols-5 items-start gap-4 px-5 py-3">
          <div className="col-span-2 pt-1.5">
            <label className="text-sm font-medium">Role</label>
          </div>
          <div className="relative col-span-3">
            <input
              name="role"
              type="text"
              value={fields.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            {savingField === "role" && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="grid grid-cols-5 items-start gap-4 px-5 py-3">
          <div className="col-span-2 pt-1.5">
            <label className="text-sm font-medium">Avatar</label>
            <p className="mt-0.5 text-xs text-muted-foreground">2-letter initials</p>
          </div>
          <div className="relative col-span-3">
            <input
              name="avatar"
              type="text"
              maxLength={2}
              value={fields.avatar}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            {savingField === "avatar" && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="grid grid-cols-5 items-start gap-4 px-5 py-3">
          <div className="col-span-2 pt-1.5">
            <label className="text-sm font-medium">Rating</label>
            <p className="mt-0.5 text-xs text-muted-foreground">1 – 5</p>
          </div>
          <div className="relative col-span-3">
            <input
              name="rating"
              type="number"
              min={1}
              max={5}
              value={fields.rating}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            {savingField === "rating" && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-5 items-start gap-4 px-5 py-3">
          <div className="col-span-2 pt-1.5">
            <label className="text-sm font-medium">Quote</label>
          </div>
          <div className="relative col-span-3">
            <textarea
              name="body"
              rows={3}
              value={fields.body}
              onChange={handleChange}
              onBlur={handleBlur}
              className={textareaClass}
            />
            {savingField === "body" && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function AdminTestimonialsEditor() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch("/api/content/testimonials")
      .then((r) => r.json())
      .then((data: Testimonial[]) => setTestimonials(data))
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id: number) {
    setTestimonials((prev) => prev.filter((t) => t.id !== id))
  }

  function handleSaved(updated: Testimonial) {
    setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleAdd() {
    setAdding(true)
    try {
      const nextOrder = testimonials.length
      const res = await fetch("/api/content/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Person",
          role: "Role at Company",
          avatar: "NP",
          rating: 5,
          body: "Share their testimonial here.",
          sort_order: nextOrder,
        }),
      })
      if (res.ok) {
        const created: Testimonial = await res.json()
        setTestimonials((prev) => [...prev, created])
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Testimonials section</h2>
          <p className="text-xs text-muted-foreground">
            Each field saves automatically when you leave it.
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {testimonials.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No testimonials yet. Add one below.
              </p>
            )}

            {testimonials.map((t) => (
              <div key={t.id} className="px-6 py-4">
                <TestimonialCard
                  testimonial={t}
                  onDelete={handleDelete}
                  onSaved={handleSaved}
                />
              </div>
            ))}

            <div className="px-6 py-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {adding ? "Adding…" : "Add testimonial"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
