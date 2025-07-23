"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, RotateCcw } from "lucide-react"

interface HeaderProps {
  currentStep: number
  onReset: () => void
}

export function Header({ currentStep, onReset }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Moodle Assistant
            </h1>
            <p className="text-sm text-gray-400">Assignment Management System</p>
          </div>
        </div>
        
        {currentStep > 1 && (
          <Button 
            variant="outline" 
            onClick={onReset}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </header>
  )
}
