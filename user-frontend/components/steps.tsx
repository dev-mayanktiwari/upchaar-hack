interface StepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className = "" }: StepsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
            style={{ width: `${100 / steps.length}%` }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium ${
                index + 1 === currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index + 1 < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index + 1 < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground bg-background text-muted-foreground"
              }`}
            >
              {index + 1 < currentStep ? "✓" : index + 1}
            </div>
            <div className="mt-2 text-xs text-center">{step}</div>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-muted"></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 ${
                index + 1 <= currentStep ? "bg-primary" : "bg-muted"
              }`}
              style={{
                width: `${100 / (steps.length - 1)}%`,
                marginLeft:
                  index === 0
                    ? "0"
                    : `-${100 / (steps.length - 1) / (steps.length - 1)}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
