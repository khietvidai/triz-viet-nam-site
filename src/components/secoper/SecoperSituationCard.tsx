import React from 'react';
import { Target, Activity, ShieldAlert, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SecoperSituation } from '@/types';

interface Props {
    situation: SecoperSituation;
    lang: 'vi' | 'en';
}

export const SecoperSituationCard: React.FC<Props> = ({ situation, lang }) => {
    const isVi = lang === 'vi';
    const isCeilingReached = situation.sCurveSanityCheck?.status === 'S_CURVE_CEILING_REACHED';

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                            {isVi ? 'Bước S' : 'Step S'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'SITUATION — THỰC TRẠNG & MỤC TIÊU' : 'SITUATION — FACTS & TARGETS'}
                        </h3>
                    </div>
                </div>

                {situation.isProxyOrFermi && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isVi ? 'Ước lượng Fermi / Proxy Metric' : 'Fermi / Proxy Metric'}
                    </span>
                )}
            </div>

            {/* Fact & Target Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>{isVi ? 'Câu thực trạng có số liệu' : 'Fact Statement'}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {situation.situationStatement}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span>{isVi ? 'Câu mục tiêu & thời hạn' : 'Target Statement'}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {situation.targetStatement}
                    </p>
                </div>
            </div>

            {/* Raw Gap Summary */}
            {situation.rawGap && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                        {isVi ? 'Khoảng cách sai lệch thô (Mục tiêu - Hiện tại):' : 'Raw Gap (Target - Current):'}
                    </span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                        {situation.rawGap}
                    </span>
                </div>
            )}

            {/* Safety Valves: Guardrail Metric & Shadow Metric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Guardrail Metric */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4" />
                            <span>{isVi ? 'Chỉ số đối trọng (Guardrail)' : 'Guardrail Metric'}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {isVi ? 'Chống hiệu ứng nệm nước' : 'Anti-Waterbed Effect'}
                        </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                        {situation.guardrailMetric?.name}
                    </div>
                    <div className="text-xs text-amber-200/90 font-mono">
                        {isVi ? 'Ngưỡng an toàn:' : 'Threshold:'} {situation.guardrailMetric?.threshold}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {situation.guardrailMetric?.rationale}
                    </p>
                </div>

                {/* Shadow Metric */}
                {situation.shadowMetric && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-indigo-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <Eye className="w-4 h-4" />
                                <span>{isVi ? 'Chỉ số bóng (Shadow Metric)' : 'Shadow Metric'}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {isVi ? 'Chống định luật Goodhart' : "Anti-Goodhart's Law"}
                            </span>
                        </div>
                        <div className="text-sm font-semibold text-white">
                            {situation.shadowMetric?.name}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {situation.shadowMetric?.rationale}
                        </p>
                    </div>
                )}
            </div>

            {/* S-Curve Sanity Check */}
            {situation.sCurveSanityCheck && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                    isCeilingReached
                        ? 'bg-rose-950/30 border-rose-500/30'
                        : 'bg-emerald-950/20 border-emerald-500/20'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <TrendingUp className={`w-4 h-4 ${isCeilingReached ? 'text-rose-400' : 'text-emerald-400'}`} />
                            <span className={isCeilingReached ? 'text-rose-300' : 'text-emerald-300'}>
                                {isVi ? 'Sanity Check Đường cong S (S-Curve Evolution)' : 'S-Curve Sanity Check'}
                            </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isCeilingReached
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                            {isCeilingReached ? (isVi ? 'ĐÃ CHẠM TRẦN CÔNG NGHỆ' : 'CEILING REACHED') : (isVi ? 'CHO PHÉP TỐI ƯU HÓA' : 'OPTIMIZATION ALLOWED')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {situation.sCurveSanityCheck?.analysis}
                    </p>
                    {situation.sCurveSanityCheck?.recommendation && (
                        <p className="text-xs font-medium text-cyan-300 pt-1">
                            💡 {situation.sCurveSanityCheck?.recommendation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
