import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  title?: string
  message: string
  onRetry: () => void
}

export function ErrorState({
  title = "Couldn't load policies",
  message,
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Something went wrong, try again in a moment.</p>
      </div>
      <code className="text-xs bg-muted text-foreground px-2 py-1 rounded-md font-mono border border-border">
        {message}
      </code>
      <Button size="sm" onClick={onRetry} className="text-xs font-semibold tracking-wide">
        RETRY
      </Button>
    </div>
  )
}
