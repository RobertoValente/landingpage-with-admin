"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Plus } from "lucide-react"
import type { PricingPlan } from "@/lib/db-pricing"

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanState = Omit<PricingPlan, "id"> & { id: number }

// ─── Per-plan card ────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onDelete,
  onUpdate,
}: {
  plan: PlanState
  onDelete: (id: number) => void
  onUpdate: (id: number, updated: PlanState) => void
}) {
  const [local, setLocal] = useState<PlanState>(plan)
  const [deleting, setDeleting] = useState(false)

  // Keep local in sync when parent refreshes (e.g. after add)
  useEffect(() => {
    setLocal(plan)
  }, [plan])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setLocal((prev) => ({ ...prev, [name]: checked }))
    } else {
      setLocal((prev) => ({ ...prev, [name]: value }))
    }
  }

  const patch = useCallback(
    async (field: string, value: unknown) => {
      const payload: Record<string, unknown> = {}

      if (field === "features") {
        // value is the raw textarea string; split into lines
        payload.features = String(value)
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      } else {
        payload[field] = value
      }

      const res = await fetch(`/api/content/pricing/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const updated: PricingPlan = await res.json()
        const next: PlanState = { ...updated }
        setLocal(next)
        onUpdate(plan.id, next)
      }
    },
    [plan.id, onUpdate]
  )

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    if (type === "checkbox") return // handled via onChange
    patch(name, value)
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked
    setLocal((prev) => ({ ...prev, highlighted: checked }))
    patch("highlighted", checked)
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/content/pricing/${plan.id}`, { method: "DELETE" })
    onDelete(plan.id)
  }

  const featuresText = local.features.join("\n")

  const inputClass =
    "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  const textareaClass =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  return (
    <div className="rounded-xl border bg-background">
      {/* Card header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold">{local.name || "Untitled plan"}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete plan"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </div>

      {/* Fields */}
      <div className="divide-y">
        {/* Name */}
        <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
          <div className="col-span-2 pt-2">
            <label htmlFor={`name-${plan.id}`} className="text-sm font-medium">
              Name
            </label>
          </div>
          <div className="col-span-3">
            <input
              id={`name-${plan.id}`}
              name="name"
              type="text"
              value={local.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
          <div className="col-span-2 pt-2">
            <label htmlFor={`price-${plan.id}`} className="text-sm font-medium">
              Price
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              e.g. $19 or Custom
            </p>
          </div>
          <div className="col-span-3">
            <input
              id={`price-${plan.id}`}
              name="price"
              type="text"
              value={local.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
          <div className="col-span-2 pt-2">
            <label
              htmlFor={`description-${plan.id}`}
              className="text-sm font-medium"
            >
              Description
            </label>
          </div>
          <div className="col-span-3">
            <textarea
              id={`description-${plan.id}`}
              name="description"
              rows={2}
              value={local.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={textareaClass}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
          <div className="col-span-2 pt-2">
            <label htmlFor={`cta-${plan.id}`} className="text-sm font-medium">
              CTA label
            </label>
          </div>
          <div className="col-span-3">
            <input
              id={`cta-${plan.id}`}
              name="cta"
              type="text"
              value={local.cta}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
          </div>
        </div>

        {/* Highlighted */}
        <div className="grid grid-cols-5 items-center gap-4 px-6 py-4">
          <div className="col-span-2">
            <label
              htmlFor={`highlighted-${plan.id}`}
              className="text-sm font-medium"
            >
              Highlighted
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shows "Most popular" badge
            </p>
          </div>
          <div className="col-span-3">
            <input
              id={`highlighted-${plan.id}`}
              name="highlighted"
              type="checkbox"
              checked={local.highlighted}
              onChange={handleCheckboxChange}
              className="h-4 w-4 cursor-pointer rounded border"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-5 items-start gap-4 px-6 py-4">
          <div className="col-span-2 pt-2">
            <label
              htmlFor={`features-${plan.id}`}
              className="text-sm font-medium"
            >
              Features
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              One feature per line
            </p>
          </div>
          <div className="col-span-3">
            <textarea
              id={`features-${plan.id}`}
              name="features"
              rows={Math.max(3, local.features.length + 1)}
              value={featuresText}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  features: e.target.value.split("\n"),
                }))
              }
              onBlur={(e) => patch("features", e.target.value)}
              className={textareaClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function AdminPricingEditor() {
  const [plans, setPlans] = useState<PlanState[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch("/api/content/pricing")
      .then((r) => r.json())
      .then((data: PricingPlan[]) => setPlans(data))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdate = useCallback((id: number, updated: PlanState) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const handleDelete = useCallback((id: number) => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }, [])

  async function handleAdd() {
    setAdding(true)
    try {
      const res = await fetch("/api/content/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New plan",
          price: "$0",
          description: "",
          features: [],
          cta: "Get started",
          highlighted: false,
          sort_order: plans.length,
        }),
      })
      if (res.ok) {
        const plan: PricingPlan = await res.json()
        setPlans((prev) => [...prev, plan])
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Section header card */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Pricing section</h2>
          <p className="text-xs text-muted-foreground">
            Manage pricing plans shown on the landing page. Fields save on blur.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}

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
            Add plan
          </Button>
        </>
      )}
    </div>
  )
}
