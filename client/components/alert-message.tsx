import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AlertMessageProps {
  error: string
  success: string
}

export function AlertMessage({ error, success }: AlertMessageProps) {
  if (!error && !success) return null

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-200">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="bg-green-900/20 border-green-500/50">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
