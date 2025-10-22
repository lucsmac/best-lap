import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
