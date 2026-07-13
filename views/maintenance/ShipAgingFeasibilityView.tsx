
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-aging/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-32]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-32';
import { AssessmentPhase } from '../../components/maintenance/ship-aging/three-types';
import { 
  History, ShieldAlert, BarChart3, Settings, 
  Search, FileText, AlertTriangle, TrendingUp,
  Cpu, Zap, Anchor, Info, Microscope,
  CheckCircle2, XCircle, ArrowRight, Layers,
  Timer, DollarSign, Scale, MessageSquare,
  // Added missing imports to fix "Cannot find name" errors on lines 167, 170, and 260
  Activity, Wrench, Save
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---
const LIFESPAN_DECAY = Array.from({length: 20}, (_, i) => ({
    year: 2005 + i,
    reliability: Math.max(10, 98 - Math.pow(i, 1.5) * 1.2),
    maintCost: Math.pow(i, 1.2) * 10 + 20
}));

const DECISION_MATRIX = [
    { name: '修理 (Repair)', score: 42, risk: 'High', cost: '120k', roi: 'Low' },
    { name: '改造 (Upgrade)', score: 85, risk: 'Medium', cost: '350k', roi: 'High' },
    { name: '更换 (Replace)', score: 98, risk: 'Low', cost: '850k', roi: 'Medium' },
];

const TECHNICAL_RISKS = [
  { subject: '结构强度', A: 45, fullMark: 100 },
  { subject: '备件可获得性', A: 20, fullMark: 100 },
  { subject: '能效标准', A: 35, fullMark: 100 },
  { subject: '自动化程度', A: 15, fullMark: 100 },
  { subject: '合规性', A: 50, fullMark: 100 },
];

export const ShipAgingFeasibilityView: React.FC = () => {
  const [phase, setPhase] = useState<AssessmentPhase>('BASELINE');
  const [logs, setLogs] = useState<string[]>(['[System] 正在初始化 15年船龄主发电组评估模型...']);
  const [budget, setBudget] = useState(500);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const handlePhaseChange = (p: AssessmentPhase) => {
      setPhase(p);
      addLog(`>>> 切换评估阶段: ${p}`);
      if (p === 'NDT_SCAN') addLog('!! 警报：检测到曲轴箱 3号轴承座微裂纹 (长度 12mm)');
      if (p === 'STRESS_TEST') addLog('!! 警告：110% 负荷下机身振动幅值超标 (12.4mm/s)');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative">
      {/* 科技背景背景装饰 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#f59e0b_0%,_transparent_60%)]"></div>

      {/* --- HEADER: System Identity --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-amber-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded flex items-center justify-center relative group shadow-[0_0_15px_rgba(245,158,11,0.2)]">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <History size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-400 mb-0.5 uppercase tracking-[0.4em] font-black">
               Vessel Asset Analytics V2.0
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               船舶老旧设备 <span className="text-amber-500">维修可行性评估模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Asset Lifecycle Stage</div>
                <div className="text-3xl font-mono font-black text-red-500 animate-pulse">CRITICAL (END-OF-LIFE)</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Risk Score</div>
                <div className="text-3xl font-mono font-black text-white">74.2 / 100</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Historical & Technical Decay --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="可靠性衰减趋势" subtitle="RELIABILITY DECAY" className="h-[220px] border-amber-900/30" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={LIFESPAN_DECAY}>
                          <defs>
                              <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="year" stroke="#475569" tick={{fontSize: 10}} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <Area type="monotone" dataKey="reliability" stroke="#f59e0b" fill="url(#decayGrad)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="技术风险雷达" subtitle="TECH RISK" className="flex-1 border-slate-800">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={TECHNICAL_RISKS}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Risk" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded text-[10px] text-red-400 leading-tight">
                    * 关键风险：备件停产，原厂技术支持已于2018年终止。
                </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Diagnostic Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] group">
               {/* HUD Information */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-amber-500 p-4 rounded-sm shadow-xl animate-in slide-in-from-left-4">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Simulation Mode</div>
                       <div className="text-2xl font-black text-white italic">{phase.replace('_', ' ')}</div>
                       <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                           正在评估：发电机组 B-Unit 主体结构疲劳及维修经济可行性。
                       </p>
                   </div>
               </div>

               {/* Right HUD: Parameters */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-amber-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase tracking-widest">Wear Factor</div>
                       <div className="text-lg font-mono font-bold text-white">88.5%</div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-red-500 h-full w-[88%] shadow-[0_0_5px_red]"></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Comp Efficiency</div>
                       <div className="text-lg font-mono font-bold text-white">72.4%</div>
                   </div>
               </div>

               {/* 3D Scene Component */}
               <ThreeScene phase={phase} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Phase Navigation Bar */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   {[
                       { id: 'BASELINE', label: '基准', icon: <Activity size={14}/> },
                       { id: 'NDT_SCAN', label: '探伤', icon: <Microscope size={14}/> },
                       { id: 'STRESS_TEST', label: '应力', icon: <Zap size={14}/> },
                       { id: 'REPAIR_SIM', label: '修理', icon: <Wrench size={14}/> },
                       { id: 'UPGRADE_SIM', label: '改造', icon: <Cpu size={14}/> },
                   ].map((item) => (
                       <button 
                         key={item.id}
                         onClick={() => handlePhaseChange(item.id as AssessmentPhase)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all
                           ${phase === item.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 scale-105' : 'text-slate-500 hover:text-slate-200'}
                         `}
                       >
                           {item.icon} {item.label}
                       </button>
                   ))}
               </div>
           </div>

           {/* Console Terminal */}
           <div className="h-36 bg-[#020617] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar shadow-lg">
               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="ml-2 text-[10px] text-slate-600 uppercase font-black tracking-widest tracking-tighter">Diagnostic Analytics Pipeline</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className={`mb-1 pl-2 border-l-2 transition-all duration-300 ${log.includes('!!') ? 'border-red-500 text-red-400 font-bold' : 'border-amber-800 text-slate-400 hover:text-amber-200'}`}>
                       {log}
                   </div>
               ))}
               <div className="text-amber-500 mt-2 animate-pulse">_</div>
           </div>
        </div>

        {/* --- RIGHT: Decision Matrix & Economics --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="投资回报模拟 (ROI)" subtitle="ECONOMIC ANALYSIS" className="h-[240px] border-amber-900/30" noPadding>
              <div className="w-full h-full p-2">
                  <div className="flex justify-between px-4 mt-2">
                      <div className="text-center">
                          <div className="text-[10px] text-slate-500">Budget ($k)</div>
                          <div className="text-xl font-bold text-white font-mono">{budget}</div>
                      </div>
                      <input 
                        type="range" min="100" max="1000" step="50" 
                        value={budget} onChange={(e) => setBudget(parseInt(e.target.value))}
                        className="w-1/2 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 mt-3"
                      />
                  </div>
                  <ResponsiveContainer width="100%" height="70%">
                      <BarChart data={DECISION_MATRIX} margin={{top: 20, right: 20, bottom: 0, left: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={30}>
                              {DECISION_MATRIX.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 1 ? '#0ea5e9' : '#334155'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="最终决策推荐" subtitle="RECOMMENDATION" className="flex-1 border-amber-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded flex items-start gap-4">
                       <Info size={24} className="text-blue-400 shrink-0 mt-1" />
                       <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "基于历史数据与当前仿真，<strong className="text-white">【现代化改造】</strong> 具备最高的可行性评分。虽然初始成本较高，但可将设备服务寿命延长 8-10 年，并降低 35% 的燃油消耗。"
                       </p>
                   </div>

                   <div className="space-y-2">
                       {DECISION_MATRIX.map((item, i) => (
                           <div key={i} className={`flex items-center justify-between p-2.5 rounded border ${i === 1 ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
                               <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 1 ? 'bg-cyan-500 text-black' : 'bg-slate-800'}`}>0{i+1}</div>
                                   <span className="text-xs font-bold">{item.name}</span>
                               </div>
                               <div className="text-right">
                                   <div className="text-[9px] text-slate-500 uppercase">Risk: {item.risk}</div>
                                   <div className="text-[10px] font-mono font-bold text-white">Est: {item.cost}</div>
                               </div>
                           </div>
                       ))}
                   </div>

                   <button className="mt-auto w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-900/20">
                      <Save size={16} /> 导出可行性评估报告
                   </button>
               </div>
           </SciFiCard>

           <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg flex items-start gap-3">
               <AlertTriangle size={20} className="text-red-500 shrink-0" />
               <div className="text-[10px] text-red-300/70 leading-relaxed">
                   <span className="font-bold text-red-200 uppercase block mb-1">Alert: Safety Margin Breach</span>
                   检测到 5 号缸套厚度低于 12mm 极限值，继续修理风险不可控。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
