import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { SecoperTriage } from '@/types';

interface Props {
    triage: SecoperTriage;
    lang: 'vi' | 'en';
}

export const SecoperTriageCard: React.FC<Props> = ({ triage, lang }) => {
    const isVi = lang === 'vi';

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold">
                            {isVi ? 'Giai đoạn 0' : 'Stage 0'}
                        </span>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {isVi ? 'TRIAGE & BÃI ĐỖ XE GIẢI PHÁP' : 'TRIAGE & SOLUTION PARKING LOT'}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {triage.isQualified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isVi ? 'Đạt chuẩn SECOPER 3.0' : 'SECOPER Qualified'}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {isVi ? 'Luồng Just-Do-It (Đơn biến)' : 'Just-Do-It Stream'}
                        </span>
                    )}
                </div>
            </div>

            {/* Triage Decision */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? 'Kết quả Sàng lọc Đầu vào (Triage Gate)' : 'Triage Assessment'}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                    {triage.triageReason}
                </p>
            </div>

            {/* Solution Parking Lot */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <Lock className="w-4 h-4" />
                        <span>{isVi ? 'Bãi đỗ xe giải pháp đã niêm phong' : 'Sealed Preconceptions (Parking Lot)'}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        {isVi ? 'Chống bẫy kỹ sư ngược' : 'Anti-Reverse Engineering'}
                    </span>
                </div>

                {triage.parkingLotSolutions && triage.parkingLotSolutions.length > 0 ? (
                    <div className="space-y-2">
                        {triage.parkingLotSolutions.map((sol, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                                <span className="font-mono text-indigo-400 font-bold">#{idx + 1}</span>
                                <span>{sol}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 italic py-1">
                        {isVi ? 'Không có giải pháp định kiến nào được niêm phong trước. Tâm trí phân tích hoàn toàn khách quan.' : 'No preconceived solutions sealed. Unbiased objective diagnosis.'}
                    </div>
                )}
            </div>
        </div>
    );
};
