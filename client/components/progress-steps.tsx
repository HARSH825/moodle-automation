interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Login" },
    { number: 2, label: "Select Courses" },
    { number: 3, label: "Generate Documents" },
  ]

  return (
    <div className="flex items-center justify-center space-x-8 py-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= step.number
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-800 text-gray-400 border-2 border-gray-700"
              }`}
            >
              {step.number}
            </div>
            <div
              className={`text-sm font-medium transition-colors duration-300 ${
                currentStep >= step.number ? "text-white" : "text-gray-500"
              }`}
            >
              {step.label}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                currentStep > step.number
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-gray-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
