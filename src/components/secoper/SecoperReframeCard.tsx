import React from 'react';
import { HelpCircle, Sparkles, Radar, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import type { SecoperReframe } from '@/types';

interface Props {
    reframe: SecoperReframe;
    lang: 'vi' | 'en';
}

export const SecoperReframeCard: React.FC<Props> = ({ reframe, lang }) => {
    const isVi = lang === 'vi';

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                            {isVi ? 'Giai đoạn II — Bước R' : 'Stage II — Step R'}
                        </span>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {isVi ? 'REFRAME — CÂU HỎI ĐỊNH HÌNH BÀI TOÁN' : 'REFRAME — PROBLEM FORMULATION'}
                        </h3>
                    </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {isVi ? 'ĐÃ QUA 5 CỔNG KIỂM TRA VÀNG' : 'PASSED 5 GOLDEN GATES'}
                </span>
            </div>

            {/* Reframe Question Hero Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950/30 to-cyan-950/30 border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>{isVi ? 'Câu hỏi bài toán phát biểu chuẩn (Cài mồi DNA TRIZ):' : 'Formulated Problem Question:'}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {isVi ? 'TỰ + Nguồn lực sẵn có' : 'SELF + Available Resources'}
                    </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {reframe.reframeQuestion}
                </p>
            </div>

            {/* Resource Radar (5 Invisible Resource Zones) */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                        <Radar className="w-4 h-4 text-violet-400" />
                        <span>{isVi ? 'Radar Nguồn Lực (Quét 5 vùng tài nguyên tiềm ẩn):' : 'Resource Radar (5 Hidden Resource Zones):'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                        {isVi ? 'Chống bẫy "không có nguồn lực"' : 'Anti-Resource Scarcity Trap'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 space-y-1">
                        <span className="font-bold text-cyan-400">1. {isVi ? 'Không gian trống' : 'Empty Space'}</span>
                        <p className="text-slate-300 leading-relaxed">{reframe.resourceRadar?.emptySpace}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 space-y-1">
                        <span className="font-bold text-indigo-400">2. {isVi ? 'Thời gian nhàn rỗi / chờ' : 'Idle / Waiting Time'}</span>
                        <p className="text-slate-300 leading-relaxed">{reframe.resourceRadar?.idleTime}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 space-y-1">
                        <span className="font-bold text-violet-400">3. {isVi ? 'Thông tin / Phế thải' : 'Waste Info / Materials'}</span>
                        <p className="text-slate-300 leading-relaxed">{reframe.resourceRadar?.wasteInfo}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 space-y-1">
                        <span className="font-bold text-amber-400">4. {isVi ? 'Chênh lệch vật lý / dữ liệu' : 'Physical Differentials'}</span>
                        <p className="text-slate-300 leading-relaxed">{reframe.resourceRadar?.physicalDifferential}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 space-y-1 sm:col-span-2 lg:col-span-2">
                        <span className="font-bold text-rose-400">5. {isVi ? 'Biến hại thành lợi (TRIZ 22)' : 'Turn Harm into Benefit'}</span>
                        <p className="text-slate-300 leading-relaxed">{reframe.resourceRadar?.turnHarmIntoBenefit}</p>
                    </div>
                </div>
            </div>

            {/* Five Golden Gates Checklist */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isVi ? 'Cổng Ra: 5 Câu Hỏi Vàng (Five Golden Gates):' : 'Output Gate: Five Golden Questions:'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isVi ? 'Câu 1: Không chứa lời giải ngầm (Đã soi Parking Lot)' : 'Gate 1: No implicit solution'}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isVi ? 'Câu 2: Sai lệch đo/quan sát được rõ ràng' : 'Gate 2: Measurable & observable'}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isVi ? 'Câu 3: Chủ thể có đầy đủ thẩm quyền quyết định' : 'Gate 3: Subject has authority'}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isVi ? 'Câu 4: Đọc vào hiểu duy nhất một nghĩa' : 'Gate 4: Unambiguous interpretation'}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 sm:col-span-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isVi ? 'Câu 5: Đã thanh lọc ràng buộc giả, chỉ giữ lại ràng buộc thật' : 'Gate 5: Filtered fake constraints, real constraints only'}</span>
                    </div>
                </div>
            </div>

            {/* Living Hypothesis & Boomerang Notice (Edge 8) */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                    <div className="font-bold text-indigo-300 uppercase tracking-wider">
                        {isVi ? 'Cạnh quay lui 8 — Boomerang (Giả thuyết sống):' : 'Edge 8 — Boomerang (Living Hypothesis):'}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                        {reframe.livingHypothesisNotice || (isVi
                            ? 'Bài toán chuẩn là một Giả thuyết sống. Khi nhóm giải pháp làm prototype nếu phát hiện giả định gốc bị gãy, được quyền ném trả hồ sơ dội về Bước P hoặc Bước R để tái định khung.'
                            : 'The formulated problem is a Living Hypothesis. If solution prototyping reveals invalid root assumptions, the team is empowered to boomerang back to Step P or R.')}
                    </p>
                </div>
            </div>
        </div>
    );
};
