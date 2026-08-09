import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { SubstituteThreeScene } from '../../components/maintenance_substitute/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-parts-substitute]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-parts-substitute';
import { SubstitutePartData } from '../../components/maintenance_substitute/three-types';
import { 
  GitCompare, 
  ArrowRightLeft, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Microscope, 
  FileText,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  Zap,
  Box
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const PENDING_REQUESTS = [
  { 
    id: 'REQ-SUB-2024-001', 
    applicant: '张强 (机械组)', 
    date: '2024-03-22', 
    status: 'Pending',
    equipment: '#2 离心泵',
    partName: '主轴承 (Main Bearing)',
    originalSpec: 'SKF-22312',
    substituteSpec: 'NSK-22312-E',
    type: 'bearing',
    matchScore: 98,
    riskLevel: 'Low'
  },
  { 
    id: 'REQ-SUB-2024-002', 
    applicant: '李明 (液压组)', 
    date: '2024-03-21', 
    status: 'Reviewing',
    equipment: '液压站 A',
    partName: '溢流阀 (Relief Valve)',
    originalSpec: 'Rexroth DBDS',
    substituteSpec: 'Huade DBDS-10',
    type: 'valve',
    matchScore: 85,
    riskLevel: 'Medium'
  },
  { 
    id: 'REQ-SUB-2024-003', 
    applicant: '王工 (传动组)', 
    date: '2024-03-20', 
    status: 'Pending',
    equipment: '皮带机 C4',
    partName: '驱动齿轮 (Drive Gear)',
    originalSpec: 'M=4 Z=24',
    substituteSpec: 'M=4 Z=24 (Hardened)',
    type: 'gear',
    matchScore: 92,
    riskLevel: 'Low'
  },
];

const COMP_DATA = {
  'REQ-SUB-2024-001': {
    radar: [
      { subject: '尺寸匹配', A: 100, fullMark: 100 },
      { subject: '额定载荷', A: 95, fullMark: 100 },
      { subject: '极限转速', A: 90, fullMark: 100 },
      { subject: '材质等级', A: 98, fullMark: 100 },
      { subject: '寿命预测', A: 92, fullMark: 100 },
    ],
    diff: [
      { param: '内径 (ID)', req: '60 mm', act: '60 mm', status: 'match' },
      { param: '外径 (OD)', req: '130 mm', act: '130 mm', status: 'match' },
      { param: '额定动载 (C)', req: '320 kN', act: '315 kN', status: 'deviate' }, // Slightly lower
      { param: '极限转速', req: '4800 rpm', act: '4600 rpm', status: 'deviate' },
      { param: '保持架材料', req: 'Brass', act: 'Steel', status: 'warning' },
    ],
    aiComment: '替代件 NSK 型号在额定动载上略低 (1.5%)，但完全满足 #2 离心泵当前工况负载需求。钢制保持架噪音略大，但不影响功能。建议批准。'
  },
  'REQ-SUB-2024-002': {
    radar: [
      { subject: '压力等级', A: 100, fullMark: 100 },
      { subject: '流量特性', A: 80, fullMark: 100 },
      { subject: '安装尺寸', A: 85, fullMark: 100 },
      { subject: '响应时间', A: 70, fullMark: 100 },
      { subject: '密封性', A: 90, fullMark: 100 },
    ],
    diff: [
      { param: '设定压力', req: '31.5 MPa', act: '31.5 MPa', status: 'match' },
      { param: '最大流量', req: '120 L/min', act: '100 L/min', status: 'warning' },
      { param: '安装接口', req: 'ISO 6264', act: 'ISO 6264', status: 'match' },
      { param: '响应滞后', req: '<10ms', act: '15ms', status: 'deviate' },
    ],
    aiComment: '替代件流量上限较低，若液压站处于满负荷工况可能导致油温升高。建议仅作为临时替代使用，并在低负荷下运行。需总工审批。'
  },
  'REQ-SUB-2024-003': {
    radar: [
      { subject: '模数齿数', A: 100, fullMark: 100 },
      { subject: '硬度', A: 120, fullMark: 100 }, // Better
      { subject: '精度', A: 95, fullMark: 100 },
      { subject: '材质', A: 100, fullMark: 100 },
      { subject: '成本', A: 80, fullMark: 100 },
    ],
    diff: [
      { param: '模数', req: '4', act: '4', status: 'match' },
      { param: '齿数', req: '24', act: '24', status: 'match' },
      { param: '齿面硬度', req: 'HRC 45', act: 'HRC 58', status: 'better' },
      { param: '精度等级', req: 'ISO 7', act: 'ISO 7', status: 'match' },
    ],
    aiComment: '替代件为表面淬火强化版，性能优于原件。虽成本略高，但预计寿命延长 40%。强烈建议批准。'
  }
};

export const PartsSubstituteView: React.FC = () => {
  const [selectedReqId, setSelectedReqId] = useState(PENDING_REQUESTS[0].id);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'approved' | 'rejected'>('idle');

  const activeReq = PENDING_REQUESTS.find(r => r.id === selectedReqId) || PENDING_REQUESTS[0];
  const activeData = COMP_DATA[selectedReqId as keyof typeof COMP_DATA] || COMP_DATA['REQ-SUB-2024-001'];

  const handleApprove = () => {
    setApprovalStatus('approved');
    setTimeout(() => setApprovalStatus('idle'), 2000);
  };

  const handleReject = () => {
    setApprovalStatus('rejected');
    setTimeout(() => setApprovalStatus('idle'), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：标题与核心指标 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-amber-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <GitCompare size={32} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Compatibility & Compliance Lab
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件替换 <span className="text-amber-500 italic">代用审批中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月代用申请</div>
              <div className="text-xl font-mono font-bold text-white">24</div>
           </div>
           <div className="w-[1px] h-8 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">技术通过率</div>
              <div className="text-xl font-mono font-bold text-green-400">88.5%</div>
           </div>
           <div className="w-[1px] h-8 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均耗时</div>
              <div className="text-xl font-mono font-bold text-cyan-400">4.2h</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：申请队列 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                 <ArrowRightLeft size={14} className="text-amber-500" /> 待审批队列
              </span>
              <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-800/50">
                 Pending: {PENDING_REQUESTS.length}
              </span>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {PENDING_REQUESTS.map(req => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`p-4 border rounded cursor-pointer transition-all relative overflow-hidden group
                     ${selectedReqId === req.id 
                        ? 'bg-slate-800 border-amber-500 shadow-lg shadow-amber-900/10' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}
                  `}
                >
                   {/* 侧边指示条 */}
                   {selectedReqId === req.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                   
                   <div className="flex justify-between items-start mb-2 pl-2">
                      <div className="text-[10px] text-slate-500 font-mono">{req.id}</div>
                      <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${req.riskLevel === 'Low' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                         Risk: {req.riskLevel}
                      </div>
                   </div>
                   
                   <div className="pl-2">
                      <div className="text-xs text-slate-400 mb-1">{req.equipment}</div>
                      <div className="text-sm font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{req.partName}</div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded">
                         <div>
                            <div className="text-slate-500">Original</div>
                            <div className="text-cyan-300 truncate">{req.originalSpec}</div>
                         </div>
                         <div>
                            <div className="text-slate-500">Substitute</div>
                            <div className="text-amber-300 truncate">{req.substituteSpec}</div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-3 pl-2 flex justify-between items-center text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><User size={10}/> {req.applicant}</span>
                      <span className="flex items-center gap-1"><Clock size={10}/> {req.date}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 中间：3D 孪生比对实验室 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-sm overflow-hidden flex flex-col">
              
              {/* HUD */}
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-10 pointer-events-none">
                 <div className="flex items-center gap-2">
                    <Box size={14} className="text-cyan-500" />
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Original Spec</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Candidate Spec</span>
                    <Box size={14} className="text-amber-500" />
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="flex-1 relative">
                 <SubstituteThreeScene 
                    originalType={activeReq.type as any}
                    substituteType={activeReq.type as any}
                    matchScore={activeReq.matchScore}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
                 
                 {/* Match Score Overlay */}
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-black/60 backdrop-blur flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="text-[9px] text-slate-400 uppercase font-bold">Match</div>
                       <div className={`text-3xl font-bold font-mono ${activeReq.matchScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {activeReq.matchScore}%
                       </div>
                    </div>
                 </div>
              </div>

              {/* Grid Decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
           </div>

           {/* AI 分析结论 */}
           <SciFiCard title="AI 辅助决策引擎" subtitle="ANALYSIS_RESULT" className="bg-slate-900/30 border-cyan-900/30">
              <div className="flex gap-4 items-start">
                 <div className="p-3 bg-cyan-900/20 rounded-full border border-cyan-500/30 shrink-0">
                    <Microscope size={24} className="text-cyan-400" />
                 </div>
                 <div className="flex-1">
                    <div className="text-xs font-bold text-slate-300 mb-2">综合兼容性评估报告</div>
                    <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-3 rounded border-l-2 border-cyan-500">
                       {activeData.aiComment}
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：工程评审 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden pr-1">
           
           {/* 1. 参数差异矩阵 */}
           <SciFiCard title="关键参数差异核查" subtitle="SPEC_DIFF" className="border-slate-800">
              <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 bg-slate-900/50 uppercase font-bold">
                       <tr>
                          <th className="p-2">参数项</th>
                          <th className="p-2 text-cyan-500">原设计要求</th>
                          <th className="p-2 text-amber-500">代用件实测</th>
                          <th className="p-2 text-right">判定</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {activeData.diff.map((row, i) => (
                          <tr key={i} className="group hover:bg-slate-800/30 transition-colors">
                             <td className="p-2 text-slate-300 font-medium">{row.param}</td>
                             <td className="p-2 text-cyan-200/80 font-mono">{row.req}</td>
                             <td className="p-2 text-amber-200/80 font-mono">{row.act}</td>
                             <td className="p-2 text-right">
                                {row.status === 'match' && <span className="text-green-500 flex justify-end"><CheckCircle2 size={12}/></span>}
                                {row.status === 'deviate' && <span className="text-red-500 flex justify-end"><XCircle size={12}/></span>}
                                {row.status === 'warning' && <span className="text-yellow-500 flex justify-end"><AlertOctagon size={12}/></span>}
                                {row.status === 'better' && <span className="text-cyan-400 flex justify-end items-center gap-1 font-bold text-[9px]">UP<ArrowRight size={8} className="-rotate-45"/></span>}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SciFiCard>

           {/* 2. 风险评估雷达 */}
           <SciFiCard title="多维风险模拟" subtitle="RISK_RADAR" className="flex-1 min-h-[200px]">
              <div className="h-full w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeData.radar}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 120]} tick={false} axisLine={false} />
                       <Radar name="Compatibility" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
                 
                 {/* Risk Label */}
                 <div className="absolute top-0 right-0 flex flex-col items-end">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Predicted Impact</div>
                    <div className={`text-lg font-bold ${activeReq.riskLevel === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>
                       {activeReq.riskLevel} Risk
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* 3. 审批操作区 */}
           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                 <span>Current Approver: <span className="text-white">Tech Lead</span></span>
                 <span>Step: 2/3</span>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={handleReject}
                   disabled={approvalStatus !== 'idle'}
                   className="flex-1 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 font-bold text-xs rounded uppercase tracking-widest transition-all disabled:opacity-50"
                 >
                    {approvalStatus === 'rejected' ? '已驳回' : '驳回申请'}
                 </button>
                 <button 
                   onClick={handleApprove}
                   disabled={approvalStatus !== 'idle'}
                   className="flex-[2] py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded uppercase tracking-widest shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale"
                 >
                    {approvalStatus === 'approved' ? '已批准' : '确认批准代用'}
                 </button>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};