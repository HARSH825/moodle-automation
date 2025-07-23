"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, Settings } from "lucide-react"

interface HeaderProps {
  currentStep: number
  onReset: () => void
}

export function Header({ currentStep, onReset }: HeaderProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Moodle Assistant</h1>
              <p className="text-sm text-muted-foreground">Assignment Management System</p>
            </div>
          </div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={onReset}>
              <Settings className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
