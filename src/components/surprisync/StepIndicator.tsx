import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Visual progress bars */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx < currentStep
                ? "bg-white w-8"
                : idx === currentStep
                  ? "bg-white/70 w-6 animate-pulse"
                  : "bg-white/20 w-4"
            }`}
          />
        ))}
      </div>

      {/* Step counter and label */}
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest font-semibold">
          Step {currentStep + 1} of {totalSteps}
        </div>
        {stepLabels[currentStep] && (
          <div className="text-sm text-white/80 mt-1">{stepLabels[currentStep]}</div>
        )}
      </div>

      {/* Tap hint */}
      <div className="text-xs text-white/60 animate-bounce mt-2">
        Tap anywhere to continue
      </div>
    </div>
  );
};
