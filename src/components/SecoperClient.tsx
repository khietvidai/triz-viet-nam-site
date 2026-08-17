import React, { useState } from 'react';
import { actions } from 'astro:actions';
import {
    Sparkles,
    Search,
    Loader2,
    AlertCircle,
    Copy,
    Check,
    Download,
    ArrowRight,
    Lock,
    Plus,
    X,
    RotateCcw,
    Layers,
    Target,
    Activity,
    SearchCheck,
    GitBranch,
    Building2,
    Zap,
    FileText
} from 'lucide-react';
import type { FullSecoperResult, Dictionary } from '@/types';
import { SecoperTriageCard } from '@/components/secoper/SecoperTriageCard';
import { SecoperSituationCard } from '@/components/secoper/SecoperSituationCard';
import { SecoperEvidenceCard } from '@/components/secoper/SecoperEvidenceCard';
import { SecoperCoreGapCard } from '@/components/secoper/SecoperCoreGapCard';
import { SecoperObstacleCard } from '@/components/secoper/SecoperObstacleCard';
import { SecoperPerspectiveCard } from '@/components/secoper/SecoperPerspectiveCard';
import { SecoperEssenceCard } from '@/components/secoper/SecoperEssenceCard';
import { SecoperReframeCard } from '@/components/secoper/SecoperReframeCard';
import { DownloadPDFButton } from '@/components/DownloadPDFButton';

interface SecoperClientProps {
    lang: 'en' | 'vi';
    dict: Dictionary;
}

export default function SecoperClient({ lang, dict }: SecoperClientProps) {
    const isVi = lang === 'vi';
    const [situation, setSituation] = useState('');
    const [parkingLotInput, setParkingLotInput] = useState('');
    const [parkingLotSolutions, setParkingLotSolutions] = useState<string[]>([]);
    const [showParkingLot, setShowParkingLot] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<FullSecoperResult | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [isCopied, setIsCopied] = useState(false);

    const examples = isVi ? [
        {
            label: 'Vận hành E-Commerce',
            text: 'Doanh thu online giảm 35% trong quý 2 dù đã tăng 50% chi phí quảng cáo và chạy khuyến mãi giảm giá 20%. Lượng truy cập cao nhưng tỷ lệ bỏ giỏ hàng tại bước thanh toán lên đến 78%.',
            parking: ['Tuyển thêm nhân viên telesale', 'Đổi đối tác cổng thanh toán']
        },
        {
            label: 'Chất lượng Sản xuất',
            text: 'Tỷ lệ phế phẩm tại dây chuyền cơ khí tăng vọt từ 1.2% lên 6.8% trong 2 tháng qua sau khi tăng tốc độ sản xuất lên 120% để đáp ứng đơn hàng xuất khẩu, gây thiệt hại lớn về chi phí nguyên vật liệu.',
            parking: ['Giảm tốc độ dây chuyền', 'Đầu tư mua máy CNC mới']
        },
        {
            label: 'Ứng dụng Phần mềm / SaaS',
            text: 'Phần mềm ERP mới triển khai 4 tháng nhưng chỉ 22% nhân sự sử dụng thường xuyên (mục tiêu 90%). Nhân viên các phòng ban vẫn nhập song song file Excel thủ công khiến dữ liệu tồn kho bị lệch lạc nghiêm trọng.',
            parking: ['Xử phạt hành chính nhân viên dùng Excel', 'Tổ chức thêm khóa đào tạo 3 ngày']
        }
    ] : [
        {
            label: 'E-Commerce Funnel',
            text: 'Online revenue dropped 35% in Q2 despite a 50% increase in ad spend and a 20% discount promotion. Traffic is high, but the checkout abandonment rate reached 78%.',
            parking: ['Hire more live support reps', 'Switch payment gateway provider']
        },
        {
            label: 'Manufacturing Defect',
            text: 'Defect rate on the assembly line surged from 1.2% to 6.8% over the past 2 months after conveyor speed was accelerated by 120% to meet export deadlines, leading to high scrap costs.',
            parking: ['Reduce line speed', 'Buy new robotic machinery']
        },
        {
            label: 'Digital Transformation Adoption',
            text: 'New ERP system deployed 4 months ago currently has only 22% active daily adoption (target 90%). Staff continue to maintain shadow Excel sheets, leading to severe inventory discrepancies.',
            parking: ['Mandate penalties for using Excel', 'Schedule additional mandatory training']
        }
    ];

    const handleAddParkingLot = () => {
        if (!parkingLotInput.trim()) return;
        setParkingLotSolutions([...parkingLotSolutions, parkingLotInput.trim()]);
        setParkingLotInput('');
    };

    const handleRemoveParkingLot = (index: number) => {
        setParkingLotSolutions(parkingLotSolutions.filter((_, i) => i !== index));
    };

    const handleSelectExample = (ex: typeof examples[0]) => {
        setSituation(ex.text);
        setParkingLotSolutions(ex.parking);
        setShowParkingLot(true);
    };

    const handleDiagnose = async () => {
        if (!situation.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await actions.solveSecoperProblem({
                situation,
                parkingLotSolutions,
                lang
            });

            if (response.error) {
                throw new Error(response.error.message || (isVi ? 'Đã có lỗi xảy ra trong quá trình chẩn đoán.' : 'An error occurred during diagnosis.'));
            }

            const data = response.data;
            if (!data) {
                throw new Error(isVi ? 'Không nhận được dữ liệu phản hồi từ AI.' : 'No data returned from AI.');
            }

            setResult(data as FullSecoperResult);
            setActiveTab('all');

        } catch (err: unknown) {
            console.error('SECOPER Diagnosis Error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(isVi ? 'Chẩn đoán thất bại. Vui lòng thử lại.' : 'Diagnosis failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleHandoffToTriz = () => {
        if (!result?.reframe?.reframeQuestion && !result?.essence?.statement) return;
        const problemStatement = result.reframe?.reframeQuestion || result.essence?.statement;
        const targetUrl = `/${lang}/triz?prompt=${encodeURIComponent(problemStatement)}`;
        window.location.href = targetUrl;
    };

    const handleCopyMarkdown = () => {
        if (!result) return;
        const md = `# BÁO CÁO CHẨN ĐOÁN SECOPER 3.0
- **Ngày:** ${new Date().toLocaleDateString()}
- **Tình huống ban đầu:** ${situation}

---
## GIAI ĐOẠN 0: TRIAGE & BÃI ĐỖ XE GIẢI PHÁP
- **Sàng lọc:** ${result.triage?.triageReason}
- **Giải pháp đã niêm phong:** ${result.triage?.parkingLotSolutions?.join(', ') || 'None'}

---
## GIAI ĐOẠN I: DIAGNOSE (HIỂU ĐÚNG VẤN ĐỀ)
### 1. S - SITUATION (Thực trạng & Mục tiêu)
- **Thực trạng:** ${result.situation?.situationStatement}
- **Mục tiêu:** ${result.situation?.targetStatement}
- **Chỉ số đối trọng (Guardrail):** ${result.situation?.guardrailMetric?.name} (Ngưỡng: ${result.situation?.guardrailMetric?.threshold}) - ${result.situation?.guardrailMetric?.rationale}
- **Chỉ số bóng (Shadow Metric):** ${result.situation?.shadowMetric?.name || 'N/A'} - ${result.situation?.shadowMetric?.rationale || ''}
- **S-Curve Check:** ${result.situation?.sCurveSanityCheck?.status} - ${result.situation?.sCurveSanityCheck?.analysis}

### 2. E - EVIDENCE (Kiểm giả định)
${result.evidence?.assumptions?.map((a, i) => `${i + 1}. **Giả định:** ${a.assumption}\n   - **Falsifier (Red-Team):** ${a.falsifier}\n   - **Dữ kiện:** ${a.evidence}\n   - **Kết luận:** ${a.conclusion}`).join('\n\n')}
- **Đánh giá chỉ số:** ${result.evidence?.metricValidityConclusion}

### 3. C - CORE GAP (Sai lệch chính)
- **Sai lệch chính được chọn:** ${result.coreGap?.selectedCoreGap?.statement} (${result.coreGap?.selectedCoreGap?.type})
- **Căn cứ:** ${result.coreGap?.selectedCoreGap?.rationale}
- **Nhánh tái cấu trúc (Đòn bẩy 5/5):** ${result.coreGap?.parallelBranch?.statement || 'None'}

### 4. OR - ROOT OBSTACLE (Điểm nghẽn)
- **Điểm nghẽn:** ${result.obstacle?.selectedObstacle}
- **Căn cứ:** ${result.obstacle?.impactRationale}
- **Vòng lặp gia cường:** ${result.obstacle?.reinforcingLoopCheck?.isReinforcingLoop ? 'CÓ' : 'KHÔNG'} - ${result.obstacle?.reinforcingLoopCheck?.analysis}
- **Incentive Check:** ${result.obstacle?.incentiveCheck?.hasVestedInterest ? 'CÓ LỢI ÍCH NGẦM' : 'KHÔNG'} - ${result.obstacle?.incentiveCheck?.cobraEffectAnalysis}

### 5. P - PERSPECTIVE (Cấp độ & Thẩm quyền)
- **Vị trí (Locus):** ${result.perspective?.locus}
- **Thẩm quyền cần có:** ${result.perspective?.authorityLevelNeeded} (${result.perspective?.keyDecisionMaker})
- **Quyết định cần đổi:** ${result.perspective?.decisionToChange}
- **Đề xuất leo thang:** ${result.perspective?.escalationCase?.businessCaseSummary || 'N/A'}

---
## GIAI ĐOẠN II: DEFINE (ĐỊNH NGHĨA BÀI TOÁN)
### 6. E - ESSENCE (Bản chất vấn đề)
- **Mẫu nhánh:** ${result.essence?.branchType}
- **Phát biểu lõi:** ${result.essence?.statement}

### 7. R - REFRAME (Câu hỏi định hình bài toán chuẩn)
> **${result.reframe?.reframeQuestion}**

#### Radar Nguồn lực:
1. Không gian: ${result.reframe?.resourceRadar?.emptySpace}
2. Thời gian: ${result.reframe?.resourceRadar?.idleTime}
3. Dữ liệu/Phế thải: ${result.reframe?.resourceRadar?.wasteInfo}
4. Chênh lệch vật lý: ${result.reframe?.resourceRadar?.physicalDifferential}
5. Biến hại thành lợi: ${result.reframe?.resourceRadar?.turnHarmIntoBenefit}
`;

        navigator.clipboard.writeText(md);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const tabs = [
        { id: 'all', label: isVi ? 'Toàn bộ Báo cáo' : 'Full Report', icon: <FileText className="w-4 h-4" /> },
        { id: '0', label: isVi ? '0. Triage' : '0. Triage', icon: <Lock className="w-4 h-4" /> },
        { id: 'S', label: isVi ? 'S. Thực trạng' : 'S. Situation', icon: <Activity className="w-4 h-4" /> },
        { id: 'E', label: isVi ? 'E. Giả định' : 'E. Evidence', icon: <SearchCheck className="w-4 h-4" /> },
        { id: 'C', label: isVi ? 'C. Core Gap' : 'C. Core Gap', icon: <Layers className="w-4 h-4" /> },
        { id: 'OR', label: isVi ? 'OR. Điểm nghẽn' : 'OR. Obstacle', icon: <GitBranch className="w-4 h-4" /> },
        { id: 'P', label: isVi ? 'P. Quyền hạn' : 'P. Perspective', icon: <Building2 className="w-4 h-4" /> },
        { id: 'E2', label: isVi ? 'E. Bản chất' : 'E. Essence', icon: <Target className="w-4 h-4" /> },
        { id: 'R', label: isVi ? 'R. Reframe' : 'R. Reframe', icon: <Zap className="w-4 h-4" /> },
    ];

    return (
        <main className="min-h-screen bg-[#07090E] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Hero Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono font-bold">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        <span>SECOPER 3.0 DIAGNOSTIC FRAMEWORK</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        {isVi ? 'Phát Biểu ' : 'Formulate the '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                            {isVi ? 'Đúng Bài Toán' : 'Right Problem'}
                        </span>
                        {isVi ? ' Trước Khi Giải' : ' Before Solving'}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                        {dict.secoper?.subtitle || (isVi
                            ? 'Quy trình 7 bước bóc tách dữ liệu, diệt thiên kiến, tìm đúng điểm nghẽn và phát biểu chuẩn bài toán trước khi giải bằng TRIZ.'
                            : '7-step diagnostic framework to decouple facts from assumptions, isolate root bottlenecks, and formulate the exact problem before TRIZ solving.')}
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-violet-500/5 space-y-6">
                    {/* Examples Bar */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {dict.secoper?.examplesLabel || (isVi ? 'Tình huống mẫu thực chiến:' : 'Example Scenarios:')}
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {examples.map((ex, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectExample(ex)}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
                                >
                                    ✨ {ex.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                            <span>{isVi ? 'Mô tả tình huống thực tế cần chẩn đoán:' : 'Describe the Real-World Situation:'}</span>
                            <span className="text-[11px] font-normal text-slate-500">
                                {situation.length} {isVi ? 'ký tự' : 'chars'}
                            </span>
                        </label>
                        <textarea
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder={dict.secoper?.inputPlaceholder || (isVi
                                ? 'Mô tả rõ điều đang xảy ra (có số liệu, thời gian, phòng ban bị ảnh hưởng)...'
                                : 'Describe what is actually happening (with numbers, baseline, timeline, and affected units)...')}
                            rows={4}
                            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/70 border border-slate-700/80 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500 text-sm leading-relaxed transition-all resize-y outline-none"
                        />
                    </div>

                    {/* Collapsible Solution Parking Lot */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowParkingLot(!showParkingLot)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>{dict.secoper?.parkingLotLabel || (isVi ? 'BÃI ĐỖ XE GIẢI PHÁP (PARKING LOT)' : 'SOLUTION PARKING LOT')}</span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                    {parkingLotSolutions.length}
                                </span>
                            </button>
                            <span className="text-[11px] text-slate-500 hidden sm:inline">
                                {isVi ? 'Niêm phong định kiến trước khi chẩn đoán' : 'Seal preconceptions before analysis'}
                            </span>
                        </div>

                        {showParkingLot && (
                            <div className="p-4 rounded-2xl bg-slate-950/50 border border-indigo-500/20 space-y-3">
                                <p className="text-xs text-slate-400">
                                    {dict.secoper?.parkingLotPlaceholder || (isVi
                                        ? 'Ghi các giải pháp bạn đang nghĩ sẵn trong đầu để niêm phong (chống bẫy định kiến kỹ sư ngược):'
                                        : 'Write preconceived solutions in your mind to seal them (anti-reverse-engineering bias):')}
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={parkingLotInput}
                                        onChange={(e) => setParkingLotInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddParkingLot(); } }}
                                        placeholder={isVi ? 'Ví dụ: Mua thêm máy móc, Tuyển thêm người...' : 'e.g. Buy new machines, hire more people...'}
                                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddParkingLot}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {isVi ? 'Thêm' : 'Add'}
                                    </button>
                                </div>

                                {parkingLotSolutions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {parkingLotSolutions.map((sol, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                                            >
                                                <Lock className="w-3 h-3 text-indigo-400" />
                                                <span>{sol}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveParkingLot(index)}
                                                    className="hover:text-rose-400 ml-1 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => { setSituation(''); setParkingLotSolutions([]); setResult(null); setError(null); }}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 px-3 py-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {isVi ? 'Làm mới' : 'Reset'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDiagnose}
                            disabled={isLoading || !situation.trim()}
                            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-cyan-500/30 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                                    <span>{dict.secoper?.diagnosing || (isVi ? 'DeepSeek đang suy luận đa tầng...' : 'DeepSeek Deep Reasoning...')}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                                    <span>{dict.secoper?.diagnoseButton || (isVi ? 'Chẩn đoán SECOPER 3.0' : 'Diagnose with SECOPER 3.0')}</span>
                                    <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error Box */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                            <div>{error}</div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div id="secoper-report-container" className="space-y-8 animate-in fade-in duration-500">
                        {/* Results Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                                    {isVi ? 'BÁO CÁO CHẨN ĐOÁN HOÀN TẤT' : 'DIAGNOSTIC REPORT READY'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Handoff to TRIZ AI Solver */}
                                <button
                                    type="button"
                                    onClick={handleHandoffToTriz}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                                    <span>{dict.secoper?.handoffToTriz || (isVi ? 'Giải Bằng TRIZ AI' : 'Solve with TRIZ AI')}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                                </button>

                                {/* Copy Markdown */}
                                <button
                                    type="button"
                                    onClick={handleCopyMarkdown}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                                >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{isCopied ? (dict.secoper?.copied || 'Đã chép') : (dict.secoper?.copyMarkdown || 'Copy MD')}</span>
                                </button>

                                {/* Download PDF */}
                                <DownloadPDFButton
                                    targetId="secoper-report-container"
                                    fileName={`SECOPER_3.0_Diagnosis_${Date.now()}.pdf`}
                                />
                            </div>
                        </div>

                        {/* Stage Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        activeTab === tab.id
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold'
                                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Stage Cards Display */}
                        <div className="space-y-6">
                            {(activeTab === 'all' || activeTab === '0') && (
                                <SecoperTriageCard triage={result.triage} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'S') && (
                                <SecoperSituationCard situation={result.situation} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'E') && (
                                <SecoperEvidenceCard evidence={result.evidence} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'C') && (
                                <SecoperCoreGapCard coreGap={result.coreGap} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'OR') && (
                                <SecoperObstacleCard obstacle={result.obstacle} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'P') && (
                                <SecoperPerspectiveCard perspective={result.perspective} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'E2') && (
                                <SecoperEssenceCard essence={result.essence} lang={lang} />
                            )}

                            {(activeTab === 'all' || activeTab === 'R') && (
                                <SecoperReframeCard reframe={result.reframe} lang={lang} />
                            )}
                        </div>

                        {/* Bottom CTA Handoff */}
                        <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-900 border border-cyan-500/30 text-center space-y-4 shadow-xl">
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                {isVi ? 'Bài toán đã được phát biểu chuẩn mực!' : 'The Problem Has Been Formulated!'}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                {isVi
                                    ? 'SECOPER đã hoàn thành sứ mệnh phát biểu đúng bài toán. Hãy chuyển ngay sang TRIZ AI Solver để tìm lời giải đột phá từ 40 Nguyên lý Sáng tạo của Genrich Altshuller.'
                                    : 'SECOPER has fulfilled its mission to formulate the exact right problem. Proceed to TRIZ AI Solver to generate breakthrough inventive solutions.'}
                            </p>
                            <button
                                type="button"
                                onClick={handleHandoffToTriz}
                                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-black text-sm shadow-xl shadow-cyan-500/20 hover:shadow-violet-500/30 transition-all cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
                                <span>{isVi ? 'CHUYỂN SANG TRIZ AI SOLVER NGAY' : 'PROCEED TO TRIZ AI SOLVER NOW'}</span>
                                <ArrowRight className="w-4 h-4 text-cyan-200" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
