import React from 'react';
import { Target, Anchor, CheckCircle2, AlertCircle } from 'lucide-react';
import type { SecoperEssence } from '@/types';

interface Props {
    essence: SecoperEssence;
    lang: 'vi' | 'en';
}

export const SecoperEssenceCard: React.FC<Props> = ({ essence, lang }) => {
    const isVi = lang === 'vi';
    const isBranchA = essence.branchType === 'A_GAP';

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                            {isVi ? 'Giai đoạn II — Bước E' : 'Stage II — Step E'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'ESSENCE — PHÁT BIỂU VẤN ĐỀ LÕI' : 'ESSENCE — CORE PROBLEM STATEMENT'}
                        </h3>
                    </div>
                </div>

                <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold border ${
                    isBranchA
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                }`}>
                    {isBranchA
                        ? (isVi ? 'MẪU A (SAI LỆCH NĂNG LỰC)' : 'TEMPLATE A (GAP)')
                        : (isVi ? 'MẪU B (MÂU THUẪN TRIZ)' : 'TEMPLATE B (CONTRADICTION)')}
                </span>
            </div>

            {/* Essence Statement Main Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-cyan-500/30 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {isVi ? 'Phát biểu bản chất vấn đề chuẩn mực:' : 'Standard Core Problem Statement:'}
                </div>
                <p className="text-base font-semibold text-white leading-relaxed">
                    {essence.statement}
                </p>
            </div>

            {/* 3 Consistency Anchors */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Anchor className="w-4 h-4 text-cyan-400" />
                    <span>{isVi ? 'Đối soát 3 Neo Nhất Quán (Bắt buộc):' : '3 Mandatory Consistency Anchors:'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-300">{isVi ? 'Neo Sai lệch (C): ' : 'Gap Anchor (C): '}</span>
                            <span className="text-emerald-300">{isVi ? 'Đã khớp' : 'Matched'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-300">{isVi ? 'Neo Điểm nghẽn (OR): ' : 'Obstacle Anchor (OR): '}</span>
                            <span className="text-emerald-300">{isVi ? 'Đã khớp' : 'Matched'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-300">{isVi ? 'Neo Ràng buộc (S): ' : 'Constraint Anchor (S): '}</span>
                            <span className="text-emerald-300">{isVi ? 'Đã khớp' : 'Matched'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
