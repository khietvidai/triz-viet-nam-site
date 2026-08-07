import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TrizStepperProps {
    steps: { title: string }[];
    currentStep: number;
}

export function TrizStepper({ steps, currentStep }: TrizStepperProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-24">
            <div className="relative flex justify-between items-center">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full -z-10 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 relative">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-gray-900",
                                    isCompleted ? "border-blue-500 bg-blue-500 text-white" :
                                        isActive ? "border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                                            "border-white/20 text-gray-500"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-medium absolute top-14 left-1/2 -translate-x-1/2 w-32 text-center transition-colors duration-300 leading-tight",
                                isActive ? "text-blue-400" : "text-gray-500"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
