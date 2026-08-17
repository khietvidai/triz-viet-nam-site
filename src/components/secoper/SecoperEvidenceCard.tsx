import React from 'react';
import { SearchCheck, Flame, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import type { SecoperEvidence } from '@/types';

interface Props {
    evidence: SecoperEvidence;
    lang: 'vi' | 'en';
}

export const SecoperEvidenceCard: React.FC<Props> = ({ evidence, lang }) => {
    const isVi = lang === 'vi';

    const getConclusionBadge = (conclusion: 'TRUE' | 'FALSE' | 'INSUFFICIENT_DATA') => {
        switch (conclusion) {
            case 'TRUE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isVi ? 'Đúng (Fact)' : 'True'}
                    </span>
                );
            case 'FALSE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {isVi ? 'Sai (Bác bỏ)' : 'False'}
                    </span>
                );
            case 'INSUFFICIENT_DATA':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {isVi ? 'Chưa đủ dữ liệu' : 'Insufficient Data'}
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <SearchCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                            {isVi ? 'Bước E' : 'Step E'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'EVIDENCE — KIỂM TRA GIẢ ĐỊNH & RED-TEAM' : 'EVIDENCE — ASSUMPTIONS & RED-TEAM'}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <Flame className="w-3.5 h-3.5" />
                        {isVi ? 'Phản biện Đội quân Đỏ (Devil’s Advocate)' : 'Red-Team Falsifier'}
                    </span>
                </div>
            </div>

            {/* Assumptions 4-Part Table / Cards */}
            <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? 'Bảng kiểm chứng giả định 4 phần (Định dạng phản chứng):' : '4-Part Falsification Checklist:'}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {evidence.assumptions?.map((item, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors space-y-3"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="text-xs font-mono font-bold text-slate-400">
                                        #{index + 1} {isVi ? 'GIẢ ĐỊNH' : 'ASSUMPTION'}
                                    </div>
                                    <div className="text-sm font-semibold text-white">
                                        {item.assumption}
                                    </div>
                                </div>
                                <div>
                                    {getConclusionBadge(item.conclusion)}
                                </div>
                            </div>

                            {/* Red-Team Falsifier */}
                            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>{isVi ? 'Dấu hiệu phủ định (Soạn bởi Red-Team độc lập):' : 'Falsifier (Red-Team):'}</span>
                                </div>
                                <p className="text-xs text-rose-200/90 leading-relaxed">
                                    {item.falsifier}
                                </p>
                            </div>

                            {/* Evidence & Risk Tag */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                                <div className="text-slate-300">
                                    <span className="font-bold text-slate-400">{isVi ? 'Dữ kiện thực tế: ' : 'Evidence: '}</span>
                                    {item.evidence}
                                </div>

                                {item.riskLabel && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                        <AlertTriangle className="w-3 h-3" />
                                        {item.riskLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Metric Validity Conclusion */}
            {evidence.metricValidityConclusion && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            {isVi ? 'Kết luận về tính hợp lệ của chỉ số đo ở Bước S:' : 'Metric Validity Conclusion:'}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {evidence.metricValidityConclusion}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
