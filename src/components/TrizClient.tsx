import React, { useState, useRef, useEffect } from 'react';
import { actions } from 'astro:actions';
import { AlertTriangle, Search, Loader2, Sparkles, Command, Sliders } from 'lucide-react';
import { TrizResults } from '@/components/TrizResults';
import type { FullTrizResult, AnalysisConstraints, Dictionary } from '@/types';
import { cn } from '@/lib/utils';

interface TrizClientProps {
    lang: 'en' | 'vi';
    dict: Dictionary;
}

/**
 * Renders a range slider with a label and value display.
 */
const ConstraintSlider = ({
    label,
    value,
    onChange,
    minLabel,
    maxLabel,
    colorClass,
    fillColor
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    minLabel: string;
    maxLabel: string;
    colorClass: string;
    fillColor: string;
}) => (
    <div className="space-y-3 group">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
            <span>{label}</span>
            <span className={cn("text-lg font-black", colorClass)}>{value}%</span>
        </div>

        <div className="relative w-full h-2 rounded-full bg-slate-800">
            {/* This div acts as the filled progress bar */}
            <div
                className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-100 ease-out"
                style={{
                    width: `${value}%`,
                    backgroundColor: fillColor,
                }}
            />
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 z-10"
                aria-label={`Set ${label}`}
            />
        </div>

        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

export default function TrizClient({ lang, dict }: TrizClientProps) {
    const [result, setResult] = useState<FullTrizResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [situation, setSituation] = useState('');
    const [error, setError] = useState<string | null>(null);

    // New State for Analysis Constraints
    const [constraints, setConstraints] = useState<AnalysisConstraints>({
        budget: 50,
        time: 50,
        risk: 50
    });

    const handleSolve = async () => {
        if (!situation.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Unified Single LLM Call
            const response = await actions.solveTrizProblem({
                situation,
                lang,
                constraints
            });

            // Handle potential errors from the action wrapper
            if (response.error) {
                // response.error is usually of type ActionError | undefined
                throw new Error(response.error.message || "An unknown error occurred during analysis.");
            }

            const data = response.data;
            if (!data) {
                throw new Error("No data returned from analysis.");
            }

            console.log("Unified Response Data:", data); // Debug log

            // The data structure returned by solveTrizProblem matches FullTrizResult
            setResult(data as FullTrizResult);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Analysis failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to calculate correct scrollHeight
            textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`; // Ensure min-height
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [situation]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 px-4 md:px-6 lg:px-8 pt-24 pb-6">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-400">TRIZ</span> AI
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl">
                        {lang === 'vi'
                            ? "Hệ thống TRIZ AI giúp bạn chấm dứt quy trình 'thử và sai' tốn kém để chuyển hóa thách thức thành giải pháp sinh lợi nhuận"
                            : "TRIZ AI helps you break the cycle of 'trial and error' to convert challenges into profitable solutions."}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-slate-400">v3.3.3-stable</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar Stats - Interactive Constraints */}
                {/* Mobile: Order 2 (Bottom), Desktop: Order 1 (Left) */}
                <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                    <div className="glass-panel p-6 rounded-3xl sticky top-24">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Sliders className="w-4 h-4" /> {dict.constraints.title}
                        </h3>

                        <div className="space-y-8">
                            <ConstraintSlider
                                label={dict.constraints.budget.label}
                                value={constraints.budget}
                                onChange={(v) => setConstraints(prev => ({ ...prev, budget: v }))}
                                minLabel={dict.constraints.budget.min}
                                maxLabel={dict.constraints.budget.max}
                                colorClass="text-violet-400"
                                fillColor="#a78bfa" // violet-400
                            />

                            <ConstraintSlider
                                label={dict.constraints.time.label}
                                value={constraints.time}
                                onChange={(v) => setConstraints(prev => ({ ...prev, time: v }))}
                                minLabel={dict.constraints.time.min}
                                maxLabel={dict.constraints.time.max}
                                colorClass="text-cyan-400"
                                fillColor="#22d3ee" // cyan-400
                            />

                            <ConstraintSlider
                                label={dict.constraints.risk.label}
                                value={constraints.risk}
                                onChange={(v) => setConstraints(prev => ({ ...prev, risk: v }))}
                                minLabel={dict.constraints.risk.min}
                                maxLabel={dict.constraints.risk.max}
                                colorClass="text-emerald-400"
                                fillColor="#34d399" // emerald-400
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {dict.constraints.ai_note.text}
                                        <span className="block mt-2 text-white font-medium">
                                            {constraints.risk > 70 ? dict.constraints.ai_note.sub_radical : dict.constraints.ai_note.sub_practical}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Interface */}
                {/* Mobile: Order 1 (Top), Desktop: Order 2 (Right) */}
                <div className="lg:col-span-9 space-y-8 order-1 lg:order-2">
                    {/* Input Area */}
                    <div className="glass-panel p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
                        <div className="bg-[#0B0F19] rounded-[30px] p-6 md:p-10 relative overflow-hidden group">

                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-violet-500/20 transition-all duration-1000" />

                            <div className="relative z-10">
                                <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                                    {dict.common.commandInput}
                                </label>

                                <div className="relative">
                                    <div className="absolute left-6 top-6 pointer-events-none">
                                        <Command className="w-5 h-5 text-violet-400 animate-pulse" />
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        placeholder={dict.common.inputPlaceholder}
                                        className="w-full bg-[#131B2D] border border-violet-500/20 rounded-2xl p-6 pl-16 text-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all min-h-[120px] max-h-[600px] resize-none font-medium leading-relaxed shadow-inner hover:bg-[#1A2438] overflow-y-auto"
                                    />

                                    {/* Voice visualizer simulation */}
                                    <div className="absolute bottom-6 right-6 flex items-end gap-1 opacity-30 pointer-events-none">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="w-1 bg-violet-500 rounded-full animate-pulse"
                                                style={{
                                                    height: `${[20, 35, 15, 40, 25][i % 5]}px`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        {dict.common.systemReady}
                                    </div>
                                    <button
                                        onClick={handleSolve}
                                        disabled={isLoading || !situation.trim()}
                                        className="bg-white text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-violet-400 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isLoading ? (
                                                <>{dict.common.solving} <Loader2 className="w-4 h-4 animate-spin" /></>
                                            ) : (
                                                <>{dict.common.executeAnalysis} <Search className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div id="results-container">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {result ? (
                            <TrizResults result={result} dict={dict} />
                        ) : (
                            !isLoading && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                                        <Sparkles className="w-4 h-4 text-violet-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {lang === 'vi' ? "Gợi ý nhanh" : "Quick Start"}
                                        </span>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {dict.common.examples.map((example, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSituation(example.text)}
                                                className="text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all group/card relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-violet-500/5 group-hover/card:via-violet-500/5 group-hover/card:to-violet-500/10 transition-all duration-500" />

                                                <h4 className="text-sm font-bold text-slate-300 group-hover/card:text-violet-300 mb-2 transition-colors relative z-10">
                                                    {example.label}
                                                </h4>
                                                <p className="text-xs text-slate-500 line-clamp-3 group-hover/card:text-slate-400 transition-colors relative z-10">
                                                    &quot;{example.text}&quot;
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
