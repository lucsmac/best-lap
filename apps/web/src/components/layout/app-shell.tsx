import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import {
  PageBreadcrumbs,
  type BreadcrumbItem,
} from './page-breadcrumbs'

interface AppShellProps {
  children: ReactNode
  title: string
  description?: string
  action?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function AppShell({
  children,
  title,
  description,
  action,
  breadcrumbs,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} description={description} action={action} />
        <main className="flex-1 overflow-y-auto bg-background">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="border-b bg-muted/30 px-6 py-3">
              <PageBreadcrumbs items={breadcrumbs} />
            </div>
          )}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
