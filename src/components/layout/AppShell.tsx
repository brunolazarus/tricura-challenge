import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <span className="font-semibold text-sm tracking-wide text-foreground">
          Tricura Insurance Group
        </span>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
