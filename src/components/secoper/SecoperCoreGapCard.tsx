import React from 'react';
import { GitCommit, Layers, AlertCircle, Award, ArrowRight, Split, CheckCircle2 } from 'lucide-react';
import type { SecoperCoreGap } from '@/types';

interface Props {
    coreGap: SecoperCoreGap;
    lang: 'vi' | 'en';
}

export const SecoperCoreGapCard: React.FC<Props> = ({ coreGap, lang }) => {
    const isVi = lang === 'vi';

    const getLabelBadge = (label: string) => {
        switch (label) {
            case 'Gap':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{isVi ? 'Sai lệch (Gap)' : 'Gap'}</span>;
            case 'Contradiction':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">{isVi ? 'Mâu thuẫn (Contradiction)' : 'Contradiction'}</span>;
            case 'Symptom':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/30">{isVi ? 'Triệu chứng (Symptom)' : 'Symptom'}</span>;
            case 'Cause':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{isVi ? 'Nguyên nhân (Cause)' : 'Cause'}</span>;
            case 'Consequence':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{isVi ? 'Hệ quả (Consequence)' : 'Consequence'}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold">
                            {isVi ? 'Bước C' : 'Step C'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'CORE GAP — XÁC ĐỊNH SAI LỆCH CHÍNH' : 'CORE GAP — PRIMARY BOTTLENECK'}
                        </h3>
                    </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {isVi ? 'Xếp hạng Thứ bậc (Không cộng dồn)' : 'Hierarchical Ranking'}
                </span>
            </div>

            {/* Step 1 & 2: Statements & Label Classification */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>{isVi ? 'Bước 1 & 2: Phân loại 5 nhãn & Lọc ứng viên hợp lệ' : 'Classification & Valid Candidates'}</span>
                    <span className="text-slate-500">{isVi ? 'Chỉ giữ Gap & Contradiction' : 'Only Gap & Contradiction'}</span>
                </div>

                <div className="space-y-2">
                    {coreGap.allCandidates?.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                                item.label === 'Gap' || item.label === 'Contradiction'
                                    ? 'bg-slate-800/60 border-slate-700/80 text-white'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {getLabelBadge(item.label)}
                                <span className="leading-relaxed">{item.text}</span>
                            </div>

                            {item.isAdministrativeContradictionRejected && (
                                <span className="text-[10px] text-amber-400 font-medium italic">
                                    {isVi ? 'Đã hạ cấp Mâu thuẫn hành chính' : 'Admin Contradiction downgraded'}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 3 & 4: Hierarchical Ranking Matrix */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>{isVi ? 'Bước 3 & 4: Bảng xếp hạng thứ bậc (Impact ➔ Leverage)' : 'Hierarchical Ranking Matrix'}</span>
                    <span className="text-amber-400/90 text-[11px] font-normal lowercase">
                        {isVi ? '*ưu tiên mức ảnh hưởng; chỉ khi bằng mới xét đòn bẩy' : '*rank by impact first, tie-break by leverage'}
                    </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono border-b border-slate-700/60">
                            <tr>
                                <th className="p-3">{isVi ? 'Thứ bậc' : 'Rank'}</th>
                                <th className="p-3">{isVi ? 'Ứng viên hợp lệ' : 'Candidate'}</th>
                                <th className="p-3 text-center">{isVi ? 'Mức ảnh hưởng (1-5)' : 'Impact (1-5)'}</th>
                                <th className="p-3 text-center">{isVi ? 'Đòn bẩy (1-5)' : 'Leverage (1-5)'}</th>
                                <th className="p-3 text-center">{isVi ? 'Trạng thái' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                            {coreGap.validCandidates?.map((candidate, idx) => (
                                <tr
                                    key={candidate.id || idx}
                                    className={candidate.rank === 1 ? 'bg-violet-950/20 font-semibold' : ''}
                                >
                                    <td className="p-3 font-mono">
                                        {candidate.rank === 1 ? (
                                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                                <Award className="w-4 h-4" /> #1
                                            </span>
                                        ) : (
                                            `#${candidate.rank || idx + 1}`
                                        )}
                                    </td>
                                    <td className="p-3 text-slate-200">
                                        {candidate.text}
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-cyan-400">
                                        {candidate.impactScore}/5
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-violet-400">
                                        {candidate.leverageScore}/5
                                    </td>
                                    <td className="p-3 text-center">
                                        {candidate.isStrategicBypass ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                {isVi ? 'Tách nhánh tái cấu trúc (Đòn bẩy 5/5)' : 'Strategic Bypass (5/5)'}
                                            </span>
                                        ) : candidate.rank === 1 ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {isVi ? 'Được chọn (Sai lệch chính)' : 'Selected Core Gap'}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 text-[10px]">
                                                {isVi ? 'Ứng viên phụ' : 'Secondary'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {coreGap.dependencyAnalysis && (
                    <p className="text-xs text-slate-400 italic px-1">
                        🔗 {coreGap.dependencyAnalysis}
                    </p>
                )}
            </div>

            {/* Selected Core Gap Final Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 to-slate-900 border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        <span>{isVi ? 'Sai lệch chính được chốt (Step 6 Conclusion)' : 'Selected Core Gap'}</span>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                        {coreGap.selectedCoreGap?.type === 'Gap' ? (isVi ? 'Nhánh A (Gap)' : 'Branch A (Gap)') : (isVi ? 'Nhánh B (Mâu thuẫn)' : 'Branch B (Contradiction)')}
                    </span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                    {coreGap.selectedCoreGap?.statement}
                </p>
                <p className="text-xs text-slate-400">
                    <span className="font-bold text-slate-300">{isVi ? 'Căn cứ: ' : 'Rationale: '}</span>
                    {coreGap.selectedCoreGap?.rationale}
                </p>
            </div>

            {/* Strategic Bypass Notification if present */}
            {coreGap.parallelBranch && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                        <Split className="w-4 h-4" />
                        <span>{isVi ? 'Ngoại lệ Chiến lược (Strategic Bypass) — Nhánh tái cấu trúc hệ thống chạy song song' : 'Strategic Restructuring Branch'}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                        {coreGap.parallelBranch.statement}
                    </p>
                    <p className="text-[11px] text-amber-300/80 italic">
                        {isVi ? '💡 Quy tắc an toàn: Ứng viên đạt Đòn bẩy 5/5 không bị bỏ rơi mà tách cho team hệ thống tái thiết cấu trúc, tránh bẫy liên tục chữa cháy.' : 'Safety valve: Candidate with 5/5 leverage is separated for system restructuring team to avoid the perpetual firefighting trap.'}
                    </p>
                </div>
            )}
        </div>
    );
};
