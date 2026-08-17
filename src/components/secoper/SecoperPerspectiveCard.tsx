import React from 'react';
import { UserCheck, Building2, Cpu, Globe, ArrowUpRight, Handshake, Clock, ShieldCheck } from 'lucide-react';
import type { SecoperPerspective } from '@/types';

interface Props {
    perspective: SecoperPerspective;
    lang: 'vi' | 'en';
}

export const SecoperPerspectiveCard: React.FC<Props> = ({ perspective, lang }) => {
    const isVi = lang === 'vi';

    const getLocusInfo = (locus: string) => {
        switch (locus) {
            case 'INDIVIDUAL':
                return {
                    label: isVi ? 'Tầng Cá nhân' : 'Individual Level',
                    desc: isVi ? 'Do năng lực, hành vi cá nhân' : 'Individual behavior or competency',
                    icon: <UserCheck className="w-5 h-5 text-cyan-400" />
                };
            case 'DEPARTMENT':
                return {
                    label: isVi ? 'Tầng Phòng ban' : 'Department Level',
                    desc: isVi ? 'Do cách tổ chức công việc (SOP, workflow)' : 'Workflow, SOP, departmental coordination',
                    icon: <Building2 className="w-5 h-5 text-indigo-400" />
                };
            case 'SYSTEM':
                return {
                    label: isVi ? 'Tầng Hệ thống' : 'System Level',
                    desc: isVi ? 'Do thiết kế hệ thống, cơ chế khuyến khích, công cụ' : 'System architecture, tools, incentives',
                    icon: <Cpu className="w-5 h-5 text-violet-400" />
                };
            case 'MARKET':
                return {
                    label: isVi ? 'Tầng Thị trường' : 'Market Level',
                    desc: isVi ? 'Yếu tố ngoại cảnh ngoài tầm kiểm soát' : 'External market forces',
                    icon: <Globe className="w-5 h-5 text-rose-400" />
                };
            default:
                return {
                    label: locus,
                    desc: '',
                    icon: <UserCheck className="w-5 h-5 text-slate-400" />
                };
        }
    };

    const locusData = getLocusInfo(perspective.locus);

    return (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                            {isVi ? 'Bước P' : 'Step P'}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {isVi ? 'PERSPECTIVE — CẤP ĐỘ & THẨM QUYỀN' : 'PERSPECTIVE — LOCUS & AUTHORITY'}
                        </h3>
                    </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {isVi ? 'Tách rõ Vị trí & Thẩm quyền' : 'Locus vs Authority'}
                </span>
            </div>

            {/* Locus & Authority Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Locus Box */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {isVi ? '1. Vị trí điểm nghẽn (Locus):' : '1. Bottleneck Locus:'}
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {locusData.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        {locusData.icon}
                        <div className="text-sm font-semibold text-white">
                            {locusData.label}
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {locusData.desc}
                    </p>
                </div>

                {/* Authority Box */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isVi ? '2. Thẩm quyền & Người quyết định:' : '2. Authority & Decision Maker:'}
                    </div>
                    <div className="text-sm font-semibold text-cyan-300">
                        {perspective.keyDecisionMaker}
                    </div>
                    <div className="text-xs text-slate-300">
                        <span className="text-slate-400">{isVi ? 'Cấp thẩm quyền: ' : 'Level: '}</span>
                        {perspective.authorityLevelNeeded}
                    </div>
                    <div className="text-xs text-slate-300 pt-1">
                        <span className="text-slate-400 font-bold">{isVi ? 'Quyết định cần thay đổi: ' : 'Decision required: '}</span>
                        {perspective.decisionToChange}
                    </div>
                </div>
            </div>

            {/* Escalation Business Case & Safety Valves */}
            {perspective.escalationCase && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{isVi ? 'Nhánh Leo Thang (Bản đề xuất Business Case)' : 'Escalation Business Case'}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {isVi ? 'Chống gọt chân cho vừa giày' : 'Anti-Downgrading'}
                        </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                        {perspective.escalationCase.businessCaseSummary}
                    </p>

                    {/* Default to Action Clause */}
                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isVi ? 'Điều khoản Mặc định Hành động (Default-to-Action) — Chống hố đen đệ trình:' : 'Default-to-Action Clause:'}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {perspective.escalationCase.defaultToActionNotice}
                        </p>
                    </div>

                    {/* Horizontal Handshake if cross-department */}
                    {perspective.escalationCase.horizontalHandshakeCoSignDepartment && (
                        <div className="flex items-center gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                            <Handshake className="w-4 h-4 text-cyan-400" />
                            <span>
                                <strong className="text-slate-200">{isVi ? 'Cú bắt tay ngang: ' : 'Co-sign Required: '}</strong>
                                {isVi ? `Bắt buộc có chữ ký đồng thuận của đại diện ` : 'Requires co-sign from '}
                                <span className="text-cyan-300 font-bold">{perspective.escalationCase.horizontalHandshakeCoSignDepartment}</span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
