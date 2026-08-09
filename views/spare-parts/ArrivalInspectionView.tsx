import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { InspectionChamber } from '../../components/spare_parts_arrival/InspectionChamber';
import { InspectionNode } from '../../components/spare_parts_arrival/three-types';
import { 
  Package, 
  Scan, 
  Scale, 
  Ruler, 
  ShieldCheck, 
  Activity, 
  History, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Binary, 
  Cpu, 
  Stamp, 
  FileText,
  Truck,
  RotateCw,
  FlaskConical,
  Zap,
  ChevronRight,
  ClipboardCheck,
  Award
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, ReferenceLine
} from 'recharts';

// --- 模拟到货业务数据 ---
const INBOUND_STREAM = [
  { id: 'LOG-2404-001', part: '进水转轮叶片 (Ti-7)', batch: 'B2210', origin: '瑞典/SKF', status: 'Inspecting', priority: 'High' },
  { id: 'LOG-2404-002', part: '液压伺阀组 V4', batch: 'B2215', origin: '德国/力士乐', status: 'Pending', priority: 'Normal' },
  { id: 'LOG-2404-003', part: '主轴径向轴承', batch: 'B2218', origin: '中国/哈轴', status: 'Pending', priority: 'Normal' },
];

const TOLERANCE_HEATMAP = [
  { subject: '几何中心度', A: 99.8, fullMark: 100 },
  { subject: '表面粗糙度', A: 94.5, fullMark: 100 },
  { subject: '动平衡偏量', A: 98.2, fullMark: 100 },
  { subject: '材质硬度', A: 96.0, fullMark: 100 },
  { subject: '内孔同轴度', A: 99.5, fullMark: 100 },
];

const SPECTRUM_DATA = [
  { nm: 200, val: 12 }, { nm: 300, val: 45 }, { nm: 400, val: 88 }, 
  { nm: 500, val: 32 }, { nm: 600, val: 15 }, { nm: 700, val: 10 }
];

export const ArrivalInspectionView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(INBOUND_STREAM[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Memoize activeBatch to prevent unnecessary recalculations
  const activeBatch = useMemo(() => INBOUND_STREAM.find(b => b.id === selectedId) || INBOUND_STREAM[0], [selectedId]);

  const handleStartInspection = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略准入仪表盘 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] border-2 border-white/20 relative group">
              <ClipboardCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Spare Parts Acceptance Control
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 备件到货 <span className="text-cyan-500 italic">验收与数字化核验</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">今日检验通量</div>
              <div className="text-2xl font-mono font-bold text-white">42 <span className="text-sm font-normal text-slate-600">UNIT</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均合格率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">拦截缺陷件</div>
              <div className="text-2xl font-mono font-bold text-red-500">02</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：到货流控序列 (Logistics Stream) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Truck size={14} className="text-cyan-500" /> 实时到货队列</span>
              <span>Total: 8</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {INBOUND_STREAM.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === item.id 
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0">
                       <div className="text-[9px] font-mono text-cyan-500 uppercase mb-1">{item.id}</div>
                       <h3 className="font-bold text-slate-100 text-sm truncate">{item.part}</h3>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${item.priority === 'High' ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-500'}
                    `}>{item.priority}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-3">
                    <div className="flex items-center gap-1"><Database size={10} /> 批次: {item.batch}</div>
                    <span>{item.origin}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                     <span className={`text-[9px] font-bold ${item.status === 'Inspecting' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`}>
                        {item.status === 'Inspecting' ? '检验中 (Processing)' : '等待核验 (Waiting)'}
                     </span>
                     <ChevronRight size={14} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  {selectedId === item.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="验收合规标准" subtitle="AUDIT_POLICY" className="h-44">
              <div className="space-y-3">
                 {[
                   { label: 'Q/SH 001-2023 机组备件通用规范', status: 'pass' },
                   { label: '材质光谱 (PMI) 强制核验项', status: 'pass' },
                   { label: '3D 几何尺寸偏差阈值: 0.02mm', status: 'pass' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <CheckCircle2 size={12} className="text-emerald-500" />
                       <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：数字化鉴证实验室 (Inspection Hub) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-sm overflow-hidden group">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1">
                          <Scan size={14} className="animate-pulse" />
                          DIGITAL FORENSIC ENGINE: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          到货数字化 <span className="text-cyan-500 italic">验收鉴证室</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">公差吻合度 (Alignment)</div>
                       <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">99.42<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Binary size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">资产数字化标识</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">SN_9022_B2210</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartInspection}
                         disabled={isScanning}
                         className={`px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2
                            ${isScanning ? 'opacity-80 cursor-wait' : ''}
                         `}
                       >
                          {isScanning ? <RotateCw className="animate-spin" size={14}/> : <Scan size={14}/>}
                          {isScanning ? `正在执行 3D 几何核验 ${scanProgress}%` : '启动全量数字化验收'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <InspectionChamber 
                    activeNode={null} 
                    scanProgress={scanProgress}
                    isScanning={isScanning}
                 />
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30"></div>
           </div>

           {/* 底部：材质光谱与包装核验 (Analysis) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-56">
              <SciFiCard title="材质光谱比对 (PMI)" subtitle="SPECTROSCOPY" noPadding>
                 <div className="h-full w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SPECTRUM_DATA}>
                          <defs>
                             <linearGradient id="colorSpecArrival" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="nm" hide />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                          <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#colorSpecArrival)" strokeWidth={2} />
                          <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{value: '标准基准', fill: 'red', fontSize: 10}} />
                       </AreaChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-bold uppercase">镍/铬合金组分匹配正常</div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="包装完整性 AI 识读" subtitle="PACKAGING_AUDIT">
                 <div className="flex flex-col h-full justify-between">
                    <div className="flex gap-4 items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                       <Zap size={20} className="text-yellow-500" />
                       <div className="flex-1">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">震动监视器状态 (Tip-N-Tell)</div>
                          <div className="text-xs font-bold text-green-500">正常 - 无异常倾斜或冲击记录</div>
                       </div>
                    </div>
                    <div className="flex gap-4 items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                       <FlaskConical size={20} className="text-cyan-400" />
                       <div className="flex-1">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">防潮/防锈密封性</div>
                          <div className="text-xs font-bold text-white">等级 A - 充氮包装完好</div>
                       </div>
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：质量结论与 AI 判定 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="公差热力分布雷达" subtitle="GEOMETRIC_ACCURACY">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={TOLERANCE_HEATMAP}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[90, 100]} tick={false} axisLine={false} />
                       <Radar name="实测值" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 验收决策建议" subtitle="AI_ADVISORY" className="flex-1 border-emerald-900/30 bg-emerald-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-emerald-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">验收结论 (Verdict)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “{activeBatch.part} 数字化核验结果优异。几何公差偏离值控制在 <span className="text-white font-bold">±0.005mm</span>，符合精密部件准入要求。建议立即执行 <span className="text-emerald-400 font-bold">入库上架</span> 程序。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Award size={60} className="text-emerald-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-emerald-500" /> 质量区块链存证 (On-Chain)
                    </div>
                    {[
                      { label: '原产地证明书验证', status: 'done' },
                      { label: '三方检测报告映射', status: 'done' },
                      { label: '数字孪生初始镜像', status: 'done' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <CheckCircle2 size={12} className="text-green-500" />
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Stamp size={16} /> 签发到货合格电子证书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出验收技术规格书</div>
                    <div className="text-xs font-bold text-white">INSPECT_SPEC_V2.pdf</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>

      {/* Use dangerouslySetInnerHTML to prevent parsing issues of CSS as TS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.6);
        }
      `}} />
    </div>
  );
};
