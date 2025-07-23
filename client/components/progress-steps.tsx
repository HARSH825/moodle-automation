interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Login" },
    { number: 2, label: "Check Assignments" },
    { number: 3, label: "Generate Documents" },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border-2 transition-colors ${
                currentStep >= step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 transition-colors ${
                  currentStep > step.number ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2 space-x-16 text-sm text-muted-foreground">
        {steps.map((step) => (
          <span key={step.number} className={currentStep >= step.number ? "text-primary" : ""}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
