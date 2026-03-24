import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
