import React from 'react';
import { GitBranch, Repeat, AlertOctagon, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import type { SecoperObstacle } from '@/types';

interface Props {
    obstacle: SecoperObstacle;
    lang: 'vi' | 'en';
}

export const SecoperObstacleCard: React.FC<Props> = ({ obstacle, lang }) => {
    const isVi = lang === 'vi';
    const isLoop = obstacle.reinforcingLoopCheck?.isReinforcingLoop;
    const hasVested = obstacle.incentiveCheck?.hasVestedInterest;

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                            {isVi ? 'Bước OR' : 'Step OR'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'ROOT OBSTACLE — ĐIỂM NGHẼN CỐT LÕI' : 'ROOT OBSTACLE — BOTTLENECK ANALYSIS'}
                        </h3>
                    </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {isVi ? 'Cây nguyên nhân đa nhánh' : 'Multi-branch Cause Tree'}
                </span>
            </div>

            {/* Visual Cause Tree */}
            <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? 'Cây phân tích nguyên nhân (Có xét nhánh thay thế / xương cá):' : 'Cause Tree Hierarchy:'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {obstacle.causeTree?.map((node) => (
                        <div
                            key={node.id}
                            className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                                node.name === obstacle.selectedObstacle || (node.isLeaf && node.impactScore && node.impactScore >= 4)
                                    ? 'bg-rose-950/20 border-rose-500/40 text-white'
                                    : node.isAlternativeBranch
                                    ? 'bg-indigo-950/20 border-indigo-500/30 text-slate-300'
                                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                    {node.isAlternativeBranch
                                        ? (isVi ? 'Nhánh thay thế' : 'Alternative Branch')
                                        : node.isLeaf
                                        ? (isVi ? 'Nguyên nhân lá' : 'Leaf Cause')
                                        : (isVi ? 'Nút phân nhánh' : 'Branch Node')}
                                </span>

                                {node.impactScore && (
                                    <span className="text-[11px] font-mono font-bold text-rose-400">
                                        Impact: {node.impactScore}/5 | Direct: {node.directnessScore}/5
                                    </span>
                                )}
                            </div>

                            <div className="text-sm font-semibold flex items-center gap-1.5">
                                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                <span>{node.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Root Obstacle */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                        <CheckCircle2 className="w-4 h-4 text-rose-400" />
                        <span>{isVi ? 'Điểm nghẽn được chốt (Root Obstacle)' : 'Selected Root Obstacle'}</span>
                    </div>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                    {obstacle.selectedObstacle}
                </p>
                <p className="text-xs text-slate-400">
                    <span className="font-bold text-slate-300">{isVi ? 'Căn cứ ước lượng tác động: ' : 'Impact estimation: '}</span>
                    {obstacle.impactRationale}
                </p>
            </div>

            {/* Safety Valves: Reinforcing Loop Check & Incentive Check */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Reinforcing Loop Check */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                    isLoop
                        ? 'bg-amber-950/30 border-amber-500/30'
                        : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                            <Repeat className="w-4 h-4" />
                            <span>{isVi ? 'Cổng kiểm tra Vòng lặp gia cường' : 'Reinforcing Loop Check'}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isLoop ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                            {isLoop ? (isVi ? 'VÒNG LẶP GIA CƯỜNG' : 'LOOP DETECTED') : (isVi ? 'NÚT TĨNH' : 'STATIC NODE')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {obstacle.reinforcingLoopCheck?.analysis}
                    </p>
                    {isLoop && obstacle.reinforcingLoopCheck?.weakestLink && (
                        <p className="text-xs font-medium text-amber-300 pt-1">
                            🎯 {isVi ? 'Mắt xích yếu nhất cần cắt / đảo chiều: ' : 'Weakest link to disrupt: '}
                            {obstacle.reinforcingLoopCheck.weakestLink}
                        </p>
                    )}
                </div>

                {/* Incentive Check */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                    hasVested
                        ? 'bg-rose-950/30 border-rose-500/30'
                        : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                            <AlertOctagon className="w-4 h-4" />
                            <span>{isVi ? 'Incentive Check (Lợi ích ngầm)' : 'Incentive Check'}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            hasVested ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                            {hasVested ? (isVi ? 'CÓ LỢI ÍCH NGẦM (COBRA)' : 'VESTED INTEREST') : (isVi ? 'KHÔNG CÓ' : 'NO VESTED INTEREST')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {obstacle.incentiveCheck?.cobraEffectAnalysis}
                    </p>
                    {hasVested && obstacle.incentiveCheck?.recommendation && (
                        <p className="text-xs font-medium text-rose-300 pt-1">
                            ⚙️ {obstacle.incentiveCheck.recommendation}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
