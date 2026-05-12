import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldBoxProps {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}

export function FieldBox({ label, error, className, children }: FieldBoxProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <div className="rounded-lg border border-input bg-transparent px-3 pt-1.5 pb-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <span className="block text-xs text-muted-foreground leading-none mb-1 select-none">
          {label}
        </span>
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export const fieldBoxInputCls =
  'w-full outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 [color-scheme:light]'
