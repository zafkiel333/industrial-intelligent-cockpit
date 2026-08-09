
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
// Fix: Added missing Droplets, ClipboardCheck, and RefreshCw to the import list
import { 
  ShieldAlert, 
  LifeBuoy, 
  Flame, 
  ArrowUpToLine, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Box, 
  Database,
  History,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  ChevronRight,
  RotateCw,
  Anchor,
  Globe,
  Droplets,
  ClipboardCheck,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, Legend
} from 'recharts';

const SAFETY_INVENTORY = [
  { id: 'SF-LFB-01', name: '全封闭救生艇启动电池', stock: 2, expiry: '2026-05', status: 'normal' },
  { id: 'SF-FIR-DE', name: '二氧化碳灭火系统释放阀', stock: 5, expiry: '2025-11', status: 'warning' },
  { id: 'SF-EEBD-A', name: '紧急逃生呼吸装置 (EEBD)', stock: 24, expiry: '2024-06', status: 'critical' },
  { id: 'SF-GMDSS-B', name: 'GMDSS 应急示位标电池', stock: 1, expiry: '2025-01', status: 'normal' },
];

const COMPLIANCE_RADAR = [
  { subject: '消防系统', A: 100, fullMark: 100 },
  { subject: '救生系统', A: 92, fullMark: 100 },
  { subject: '应急动力', A: 85, fullMark: 100 },
  { subject: '救助通信', A: 98, fullMark: 100 },
  { subject: '人员防护', A: 90, fullMark: 100 },
];

export const ShipSafetyPartsView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('SF-LFB-01');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-4 bg-gradient-to-r from-red-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-400/50 relative group">
              <ShieldAlert size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-red-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-red-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 SOLAS Compliance & Safety Logistics
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船舶关键安全备件 <span className="text-red-500 italic">保障服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">合规达标率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">失效资产报警</div>
              <div className="text-2xl font-mono font-bold text-red-500">02</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：安全备件清单 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="安全备件名录" subtitle="SAFETY_ASSETS" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2 px-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索救生/消防设备..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-red-500 transition-all" />
                 </div>
                 
                 {SAFETY_INVENTORY.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                         ${selectedId === item.id 
                            ? 'bg-red-950/20 border-red-500 shadow-lg' 
                            : 'bg-slate-900 border-slate-800 hover:border-red-500/50'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-red-400 font-bold">{item.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${item.status === 'critical' ? 'bg-red-900/50 text-red-100 animate-pulse' : 
                               item.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{item.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{item.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>有效期至: <span className={item.status === 'critical' ? 'text-red-500 font-bold' : 'text-slate-300'}>{item.expiry}</span></span>
                          <span className="font-mono">Qty: {item.stock}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：全息合规视图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050101] border border-red-900/20 rounded-lg overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="relative z-10 w-full max-w-lg h-full flex flex-col justify-center">
                 <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                       <div className="w-24 h-24 rounded-full border-4 border-red-500/20 flex items-center justify-center relative">
                          <ShieldCheck size={48} className="text-green-500" />
                          <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-20"></div>
                       </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">SOLAS 合规核验矩阵</h3>
                    <p className="text-slate-500 text-xs mt-2">机舱、甲板及生活区安全备件全面审计中</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: '救生筏自动释放器', status: 'Normal', icon: <Anchor size={16}/> },
                      { label: '应急配电板 (EDG)', status: 'Verified', icon: <Zap size={16}/> },
                      { label: '机舱细水雾系统', status: 'Warning', icon: <Droplets size={16}/> },
                      { label: '卫星遇险通信 (GMDSS)', status: 'Normal', icon: <Globe size={16}/> },
                    ].map((m, i) => (
                       <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded flex items-center gap-4 group hover:border-red-500/40 transition-all">
                          <div className="text-slate-500 group-hover:text-red-400">{m.icon}</div>
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold">{m.label}</div>
                             <div className={`text-xs font-bold ${m.status === 'Warning' ? 'text-amber-500' : 'text-green-400'}`}>{m.status}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* 底部详细交互条 */}
              <div className="absolute bottom-6 flex gap-4">
                 <button className="px-8 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded uppercase tracking-widest transition-all shadow-lg shadow-red-900/40">一键生成自检报告</button>
                 <button className="px-8 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded border border-slate-700">同步船级社数据</button>
              </div>
           </div>

           <SciFiCard title="安全合规全景雷达" subtitle="QCDST_AUDIT" className="h-60">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COMPLIANCE_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Status" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：风险管理 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           <SciFiCard title="AI 风险干预建议" subtitle="AI_ADVISORY" className="bg-red-950/5 border-red-900/30">
              <div className="space-y-4">
                 <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-red-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">临期强制更换</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “检测到 <span className="text-white font-bold">24具紧急逃生呼吸装置 (EEBD)</span> 将于本月底失效。系统已自动在 <span className="text-blue-400 font-bold">釜山港 (PUS)</span> 锁定 30 具新件，预计 04-12 抵港完成交付。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ClipboardCheck size={12} className="text-green-500" /> 认证任务流 (Class Audit)
                    </div>
                    {[
                      { label: '救生艇月度试机', status: 'done' },
                      { label: '应急消防泵推量测试', status: 'pending' },
                      { label: '全船报警系统测试', status: 'ready' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : 
                          step.status === 'ready' ? <RefreshCw size={12} className="text-cyan-500 animate-spin-slow" /> :
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-red-500/30 transition-all mt-auto">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">SOLAS 法律法规库</div>
                    <div className="text-xs font-bold text-white">SOLAS_REF_2024.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
           </div>
        </div>
      </div>
    </div>
  );
};
