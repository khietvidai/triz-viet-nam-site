import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StepCardProps {
    title: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onBack?: () => void;
    isGenerating: boolean;
    isLastStep?: boolean;
}

export function StepCard({
    title,
    description,
    value,
    onChange,
    onNext,
    onBack,
    isGenerating,
    isLastStep = false,
}: StepCardProps) {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl text-white">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-300 mb-6">{description}</p>

            <div className="mb-6 relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-48 bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Waiting for input or agent generation..."
                    disabled={isGenerating}
                />
                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                        disabled={isGenerating}
                    >
                        Back
                    </button>
                ) : (
                    <div />
                )}

                <button
                    onClick={onNext}
                    className={cn(
                        "px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-500/30",
                        isGenerating && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isGenerating}
                >
                    {isLastStep ? "Finish" : "Next Step"}
                </button>
            </div>
        </div>
    );
}
