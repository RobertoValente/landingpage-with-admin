import { Button } from "@/components/ui/button"
import { LeadForm } from "@/components/lead-form"
import { getHero, type HeroContent } from "@/lib/db"
import { getNav, type NavContent } from "@/lib/db-nav"
import { getAllFeatures, type Feature } from "@/lib/db-features"
import { getAllPricingPlans, type PricingPlan } from "@/lib/db-pricing"
import { getAllTestimonials, type Testimonial } from "@/lib/db-testimonials"
import { getCta, type CtaContent } from "@/lib/db-cta"
import { getFooter, type FooterContent } from "@/lib/db-footer"
import {
  Zap,
  Shield,
  BarChart3,
  Globe,
  Headphones,
  Layers,
  Star,
  Check,
  ArrowRight,
  Menu,
} from "lucide-react"
import type { LucideProps } from "lucide-react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

type LucideIcon = ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Shield, Globe, Zap, Headphones, Layers, Star, Check, ArrowRight, Menu,
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav({ nav }: { nav: NavContent }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="text-lg font-bold tracking-tight">
          {nav.logo}<span className="text-primary">.</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="text-muted-foreground transition-colors hover:text-foreground">Testimonials</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">{nav.secondary_cta}</Button>
          <Button size="sm">{nav.primary_cta}</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-36">
      <span className="mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        <Zap className="mr-1.5 h-3 w-3 text-yellow-500" /> {hero.badge}
      </span>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        {hero.headline}{" "}
        <span className="text-primary">{hero.headline_highlight}</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">{hero.subtext}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">
          {hero.primary_cta} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline">{hero.secondary_cta}</Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{hero.footnote}</p>

      {/* Mock dashboard preview */}
      <div className="mt-16 w-full max-w-4xl rounded-2xl border bg-muted/40 p-1 shadow-2xl">
        <div className="rounded-xl bg-background p-6">
          <div className="mb-4 flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Revenue", value: "$48,295" },
              { label: "Active Users", value: "12,841" },
              { label: "Conversion Rate", value: "4.7%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-32 rounded-lg border bg-muted/30" />
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features({ features }: { features: Feature[] }) {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to scale</h2>
          <p className="mt-4 text-muted-foreground">
            A complete platform so you can focus on building, not infrastructure.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = ICON_MAP[f.icon_name] ?? Zap
            return (
              <div key={f.id} className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing({ plans }: { plans: PricingPlan[] }) {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                plan.highlighted ? "border-primary bg-primary text-primary-foreground shadow-lg" : "bg-background"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-yellow-900">
                  Most popular
                </span>
              )}
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className={`mb-1 text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/mo</span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>
              <ul className="my-8 flex grow flex-col gap-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.highlighted ? "secondary" : "default"}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="testimonials" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Loved by teams worldwide</h2>
          <p className="mt-4 text-muted-foreground">Join 10,000+ companies already growing with Acme.</p>
        </div>
        <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <div key={t.id} className="mb-6 break-inside-avoid rounded-xl border bg-background p-6 shadow-sm">
              <Stars count={t.rating} />
              <p className="mt-3 text-sm text-muted-foreground">&ldquo;{t.body}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA({ cta }: { cta: CtaContent }) {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{cta.heading}</h2>
        <p className="mt-4 text-muted-foreground">{cta.subtext}</p>
        <div className="mt-8 w-full max-w-md">
          <LeadForm />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{cta.footnote}</p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ footer }: { footer: FooterContent }) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold">Acme<span className="text-primary">.</span></p>
            <p className="mt-2 text-sm text-muted-foreground">{footer.tagline}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Acme Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const hero = getHero()
  const nav = getNav()
  const features = getAllFeatures()
  const plans = getAllPricingPlans()
  const testimonials = getAllTestimonials()
  const cta = getCta()
  const footer = getFooter()

  return (
    <>
      <Nav nav={nav} />
      <main>
        <Hero hero={hero} />
        <Features features={features} />
        <Pricing plans={plans} />
        <Testimonials testimonials={testimonials} />
        <CTA cta={cta} />
      </main>
      <Footer footer={footer} />
    </>
  )
}
