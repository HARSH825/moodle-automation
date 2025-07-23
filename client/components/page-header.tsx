"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  subtitle: string
  showBackButton?: boolean
  backTo?: string
  backLabel?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backTo = "/",
  backLabel = "Back to Home" 
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {showBackButton && (
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(backTo)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
