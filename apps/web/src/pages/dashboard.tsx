import { AppShell } from '@/components/layout/app-shell'

export function DashboardPage() {
  return (
    <AppShell title="Dashboard" description="Visão geral">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Best Lap</h2>
        <p className="text-muted-foreground">
          Dashboard de métricas de performance - Em desenvolvimento
        </p>
      </div>
    </AppShell>
  )
}
