import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllLeads } from "@/lib/db"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const dynamic = "force-dynamic"

export default function LeadsPage() {
  const leads = getAllLeads()

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div>
          <h1 className="text-sm font-semibold">Leads</h1>
          <p className="text-xs text-muted-foreground">
            {leads.length} {leads.length === 1 ? "lead" : "leads"} collected
          </p>
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

      <main className="flex-1 p-6">
        {leads.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border bg-background text-center">
            <p className="font-medium">No leads yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Leads will appear here once people fill in the waitlist form.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created at</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={i !== leads.length - 1 ? "border-b" : ""}
                  >
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
