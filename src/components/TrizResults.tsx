import React from 'react';
import { Target, Scale, TrendingUp, Sparkles, TrendingDown, Clock, ShieldCheck, Zap, Activity } from 'lucide-react';
import type { FullTrizResult, Dictionary, GoalStructure } from '@/types';
import { ProblemRadarChart } from './ProblemRadarChart';
import { DownloadPDFButton } from './DownloadPDFButton';

interface TrizResultsProps {
    /** The complete TRIZ analysis result to display */
    result: FullTrizResult;
    /** Localization dictionary */
    dict: Dictionary;
}

/**
 * Displays the results of the TRIZ analysis, including metrics, radar chart, contradiction, and solutions.
 */
export function TrizResults({ result, dict }: TrizResultsProps) {
    const { goal, contradiction, solutions, evaluation } = result;

    const parseMetric = (metricStr: string | undefined) => {
        if (!metricStr) return { value: 'N/A', unit: '' };
        const value = parseFloat(metricStr);
        // Extract unit: non-digit/dot/minus chars at end
        const unit = metricStr.match(/[^0-9.,-]+$/)?.[0] || '';
        return { value: isNaN(value) ? metricStr : value, unit };
    };

    // Helper to safely access goal properties
    const goalMetrics = (typeof goal !== 'string' && goal.metrics) ? goal.metrics : undefined;
    const goalSummary = (typeof goal !== 'string' && goal.summary) ? goal.summary : (typeof goal === 'string' ? goal : "Optimization target defined.");

    const costMetric = parseMetric(goalMetrics?.logistics_cost);
    const durabilityMetric = parseMetric(goalMetrics?.durability);
    const deploymentMetric = parseMetric(goalMetrics?.deployment);

    // Safe access for unit labels
    const getUnitLabel = (unit: string) => {
        const key = unit.replace('%', 'percent');
        return dict.results.units[key] || unit;
    };

    return (
        <div id="triz-results-content" className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">
            {/* Header Actions */}
            <div className="flex justify-end mb-2">
                <DownloadPDFButton targetId="triz-results-content" fileName="triz-solution.pdf" />
            </div>

            {/* HERO SECTION: Ideal Final Result (Metrics) */}
            <section className="col-span-12">
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-violet-500/40 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Sparkles className="w-48 h-48 text-violet-400" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-xs font-black text-violet-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4" /> {dict.results.idealFinalResult}
                        </h2>

                        <div className="grid md:grid-cols-4 gap-8">
                            {/* Summary Text (Small) */}
                            <div className="md:col-span-1 border-r border-white/5 pr-6 flex flex-col justify-center">
                                <div className="max-h-[160px] overflow-y-auto pr-2">
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        {goalSummary}
                                    </p>
                                </div>
                            </div>

                            {/* Big Metric Cards */}
                            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Metric 1: Cost */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-emerald-400" /> {dict.results.metrics.logisticsCost}
                                    </span>
                                    <div className="text-3xl lg:text-4xl font-black text-white mt-2">
                                        {costMetric.value}<span className="text-emerald-400 text-lg">{getUnitLabel(costMetric.unit)}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${typeof costMetric.value === 'number' ? Math.max(100 - Math.abs(costMetric.value), 5) : 50}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metric 2: Durability */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-cyan-400" /> {dict.results.metrics.durability}
                                    </span>
                                    <div className="text-3xl lg:text-4xl font-black text-white mt-2">
                                        {durabilityMetric.value}<span className="text-cyan-400 text-lg">{getUnitLabel(durabilityMetric.unit)}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500"
                                            style={{ width: `${typeof durabilityMetric.value === 'number' ? durabilityMetric.value : 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metric 3: Speed */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-violet-400" /> {dict.results.metrics.deployment}
                                    </span>
                                    <div className="text-3xl lg:text-4xl font-black text-white mt-2">
                                        {deploymentMetric.value}<span className="text-violet-400 text-lg">{dict.results.units.days}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-violet-500"
                                            style={{ width: `${typeof deploymentMetric.value === 'number' ? Math.max(100 - deploymentMetric.value, 5) : 85}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ANALYSIS ROW (Chart + Contradiction) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* RADAR CHART (Problem Statement) */}
                <div className="lg:col-span-5 glass-panel p-6 rounded-3xl min-h-[400px]">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> {dict.results.operationalDelta}
                    </h2>
                    <div className="h-[320px] w-full flex items-center justify-center">
                        <ProblemRadarChart
                            labels={{
                                currentState: dict.results.currentState,
                                idealState: dict.results.idealState,
                                subjects: {
                                    costEfficiency: dict.results.chart.costEfficiency,
                                    durability: dict.results.chart.durability,
                                    speed: dict.results.chart.speed,
                                    simplicity: dict.results.chart.simplicity
                                }
                            }}
                        />
                    </div>
                </div>

                {/* CONTRADICTION VISUAL */}
                <div className="lg:col-span-7 glass-panel p-6 rounded-3xl">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Scale className="w-4 h-4" /> {dict.results.technicalConflict}
                    </h2>

                    {contradiction ? (
                        <div className="min-h-[320px] flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4 h-full relative">
                                {/* Connector */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#0B0F19] border border-white/10 rounded-full z-10 flex items-center justify-center">
                                    <span className="text-xs font-black text-yellow-500">{dict.results.vs}</span>
                                </div>

                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-start text-center gap-4 group hover:bg-emerald-500/20 transition-colors h-full">
                                    <span className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 mt-2">
                                        <TrendingUp className="w-6 h-6" />
                                    </span>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">{dict.results.improving}</div>
                                        <div className="text-xl font-bold text-white">{contradiction.improvingParameter.Name}</div>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-start text-center gap-4 group hover:bg-red-500/20 transition-colors h-full">
                                    <span className="bg-red-500/20 p-3 rounded-full text-red-400 mt-2">
                                        <TrendingDown className="w-6 h-6" />
                                    </span>
                                    <div>
                                        <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">{dict.results.worsening}</div>
                                        <div className="text-xl font-bold text-white">{contradiction.worseningParameter.Name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Principles Bar */}
                            <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-2 justify-center">
                                {contradiction.principles.map((p) => (
                                    <span key={p.id} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-xs font-bold uppercase hover:bg-violet-500/30 transition-colors cursor-default whitespace-nowrap flex-grow text-center">
                                        #{p.id} {p.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center text-center text-slate-500">
                            <p>No technical conflict could be identified from the problem description.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SOLUTIONS GRID */}
            <section>
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 pl-2">
                    <Zap className="w-4 h-4 text-yellow-500" /> {dict.results.strategicOptions}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {solutions && solutions.length > 0 ? (
                        solutions.map((sol, idx) => {
                            const isLastAndOdd = solutions.length % 2 !== 0 && idx === solutions.length - 1;
                            return (
                                <div key={idx} className={`glass-panel p-8 rounded-3xl group hover:bg-[#1a1f2e] transition-all hover:border-violet-500/30 ${isLastAndOdd ? 'md:col-span-2' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{sol.title}</h3>
                                        <div className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">0{idx + 1}</div>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                        {sol.description.replace(/^#+\s/g, '')}
                                    </p>

                                    {/* Display Driven Principles */}
                                    {sol.principles && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {sol.principles.split(',').map((p, pIdx) => (
                                                <span key={pIdx} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {p.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <button className="text-xs font-bold text-violet-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                                            {dict.results.deployStrategy} <TrendingUp className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="md:col-span-2 glass-panel p-8 rounded-3xl text-center">
                            <p className="text-slate-400">No strategic options were generated for this problem.</p>
                        </div>
                    )}
                </div>
            </section>

            {evaluation && (
                <section className="glass-panel p-1 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-transparent">
                    <div className="bg-[#0B0F19]/95 backdrop-blur-3xl rounded-[22px] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

                        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-black uppercase tracking-widest animate-pulse">
                                <Sparkles className="w-4 h-4" /> {dict.results.aiRecommendation}
                            </div>

                            <h3 className="text-3xl md:text-5xl font-black text-white">{evaluation.bestSolution}</h3>

                            <p className="text-lg text-slate-400 italic font-serif">
                                &quot;{evaluation.bestSolutionReason}&quot;
                            </p>

                            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">{dict.results.metrics.feasibility}</div>
                                    <div className="text-xl font-bold text-white">High</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">{dict.results.metrics.risk}</div>
                                    <div className="text-xl font-bold text-white">Low</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">{dict.results.metrics.roi}</div>
                                    <div className="text-xl font-bold text-emerald-400">10x</div>
                                </div>
                            </div>

                            {/* IMPLEMENTATION PLAN */}
                            {evaluation.implementationPlan && evaluation.implementationPlan.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-white/5 text-left">
                                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> {dict.results.implementationPlan || "Implementation Plan"}
                                    </h4>
                                    <div className="space-y-3">
                                        {evaluation.implementationPlan.map((step: string, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
