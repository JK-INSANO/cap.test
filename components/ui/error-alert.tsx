import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null

  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
      <AlertDescription className="text-destructive">{message}</AlertDescription>
    </Alert>
  )
}

