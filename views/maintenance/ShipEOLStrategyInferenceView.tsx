
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-eol/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-38]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-38';
import { EOLStrategy, AgingMetrics } from '../../components/maintenance/ship-eol/three-types';
import { 
  History, ShieldAlert, TrendingUp, Zap, Clock, 
  Settings, DollarSign, Activity, AlertTriangle, 
  Cpu, FileText, ChevronRight, Play, RotateCcw,
  Info, BarChart3, Microscope, LifeBuoy,
  MessageSquare, Anchor, BrainCircuit, Terminal,
  // Added CheckCircle2 and Save to fix missing name errors on lines 260, 301, and 339
  CheckCircle2, Save
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend, LineChart, Line
} from 'recharts';

// --- MOCK DATA ---
const RELIABILITY_DECAY = Array.from({length: 12}, (_, i) => ({
    year: 2024 + i,
    reliability: Math.max(5, 95 - Math.pow(i, 1.8) * 1.5),
    maintCost: 20 + i * 15 + Math.random() * 10
}));

const STRATEGY_DATA: Record<EOLStrategy, { label: string; risk: string; cost: string; roi: string; desc: string; color: string }> = {
    'PATCH': {
        label: '应急维持 (Patch)',
        risk: 'VERY HIGH', cost: '¥15w', roi: '12%', color: '#ef4444',
        desc: '仅针对当前渗漏点进行局部补焊和密封。这是短期权宜之计，无法解决主轴疲劳，预计 6 个月内会发生二次停机。'
    },
    'OVERHAUL': {
        label: '性能大修 (Overhaul)',
        risk: 'MEDIUM', cost: '¥185w', roi: '65%', color: '#f59e0b',
        desc: '完全拆解主机，更换磨损缸套和轴瓦，恢复至额定功率的 95%。可延长服务寿命 5 年。'
    },
    'RETROFIT': {
        label: '现代化改造 (Retrofit)',
        risk: 'LOW', cost: '¥420w', roi: '92%', color: '#0ea5e9',
        desc: '升级为电控喷射系统并加装 EEDI 优化装置。初始投入高，但能通过燃油节省在 3 年内收回成本。'
    },
    'DECOMMISSION': {
        label: '资产拆解 (Scrap)',
        risk: 'N/A', cost: '¥-150w (Recover)', roi: '100%', color: '#64748b',
        desc: '停止运行，进入绿色拆解程序。回收金属残值并转让航线份额，是降低当前财务亏损的最快途径。'
    }
};

const ASSESSMENT_KPI = [
  { subject: '结构余量', A: 45, fullMark: 100 },
  { subject: '能效标准', A: 32, fullMark: 100 },
  { subject: '环境合规', A: 28, fullMark: 100 },
  { subject: '备件可用', A: 55, fullMark: 100 },
  { subject: '资产残值', A: 70, fullMark: 100 },
];

export const ShipEOLStrategyInferenceView: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<EOLStrategy>('OVERHAUL');
  const [agingYearOffset, setAgingYearOffset] = useState(0); // 0-10 years in future
  const [aiReport, setAiReport] = useState('正在利用 Gemini 引擎分析资产全寿命收益...');
  const [logs, setLogs] = useState<string[]>(['[System] 船舶资产测绘档案载入完成...', '[Asset] 目标：30万吨级油轮 VLCC-A02']);

  const agingFactor = agingYearOffset / 10;
  const currentStrategy = STRATEGY_DATA[activeStrategy];

  // AI Inference with Gemini
  useEffect(() => {
    const fetchAIReport = async () => {
        setAiReport('AI 专家正在分析该老旧主机的材料疲劳极限与燃油市场波动...');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `作为一个资深航运资产评估专家。当前一艘服役22年的大型油轮主机磨损严重。
            方案 A (应急): 成本 15w, 风险极高。
            方案 B (大修): 成本 185w, 风险中, 延寿5年。
            方案 C (改造): 成本 420w, 节能30%, 风险低。
            方案 D (拆解): 变现 150w。
            当前用户尝试推演方案：${currentStrategy.label}，并将其设置在 ${2024 + agingYearOffset} 年执行。
            请简短给出该决策的专业评价及潜在的黑天鹅风险。要求使用中文，回答精练。`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setAiReport(response.text || '分析报告生成失败。');
        } catch (e) {
            setAiReport('无法连接至 AI 辅助大脑。');
        }
    };
    fetchAIReport();
  }, [activeStrategy, agingYearOffset]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Tactical Control --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-sm flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <History size={32} className="text-amber-400 group-hover:rotate-180 transition-transform duration-1000" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Asset Integrity & Retirement Hub
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               船舶设备寿命末期 <span className="text-amber-500 italic">维修策略推演控制台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Residual Asset Value</div>
                <div className="text-3xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    $1.45<span className="text-sm font-normal text-slate-600">M</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inference Confidence</div>
                <div className="text-3xl font-mono font-black text-green-400">92.8%</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Degradation & History --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="性能退化时序分析" subtitle="DECAY FORECAST" className="h-[260px] border-slate-800 bg-[#0c0e14]/90">
              <div className="w-full h-full p-1">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={RELIABILITY_DECAY}>
                          <defs>
                              <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="year" stroke="#475569" tick={{fontSize: 10}} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                          <Area type="monotone" dataKey="reliability" stroke="#f59e0b" fill="url(#decayGrad)" strokeWidth={2} name="可靠性 %" />
                          <Area type="monotone" dataKey="maintCost" stroke="#3b82f6" fill="none" strokeWidth={1} strokeDasharray="5 5" name="维保成本" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="资产健康多维矩阵" subtitle="ASSESSMENT" className="flex-1 border-slate-800">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ASSESSMENT_KPI}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Current" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#ef4444'}} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>

           <div className="bg-slate-900/40 border border-slate-800 rounded p-3 flex flex-col gap-2">
               <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-widest font-bold">
                   <Microscope size={12}/> Material Scan Results
               </div>
               <div className="space-y-1">
                   <div className="flex justify-between text-[10px]">
                       <span>Crankshaft Micro-Cracks</span>
                       <span className="text-red-400">DETECTED (0.05mm)</span>
                   </div>
                   <div className="flex justify-between text-[10px]">
                       <span>Cylinder Liner Corrosion</span>
                       <span className="text-yellow-400">SIGNIFICANT</span>
                   </div>
               </div>
           </div>
        </div>

        {/* --- CENTER: EOL Digital Twin Display --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
               {/* HUD Overlays */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/90 backdrop-blur border border-amber-500/30 p-4 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12} className="animate-pulse" /> Active Inference Sync
                       </div>
                       <div className="text-3xl font-black text-white italic uppercase">{activeStrategy} PATHway</div>
                       <div className="text-xs text-slate-400 mt-2 font-mono">PROJECTION YEAR: <span className="text-white font-bold">{2024 + agingYearOffset}</span></div>
                   </div>
               </div>

               {/* Right Stats Overlay */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end">
                   <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-red-500/30 flex flex-col items-end shadow-2xl">
                       <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Failure Probability</div>
                       <div className="text-2xl font-mono font-bold text-white">{(agingFactor * 95).toFixed(1)}%</div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500 shadow-[0_0_10px_red]" style={{width: `${agingFactor * 95}%`}}></div>
                       </div>
                   </div>
               </div>

               <ThreeScene strategy={activeStrategy} agingFactor={agingFactor} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Time Scrubber Dock (Floating Bottom) */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-slate-950/90 p-5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-8 backdrop-blur-2xl scale-105 z-30">
                   <button 
                     onClick={() => {setAgingYearOffset(0); addLog('重新校准基准年模型');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 px-4">
                       <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black mb-3 px-1">
                           <span>Simulation Time Machine (Current Year -&gt; EOL)</span>
                           <span className="text-amber-500">Projection: +{agingYearOffset} Years</span>
                       </div>
                       <input 
                         type="range" min="0" max="10" step="1" 
                         value={agingYearOffset} 
                         onChange={(e) => {
                             const val = parseInt(e.target.value);
                             setAgingYearOffset(val);
                             addLog(`推演时间窗口滑动至: ${2024 + val} 年`);
                         }}
                         className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                       />
                       <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-mono uppercase tracking-widest">
                           <span>2024 (Present)</span>
                           <span>2029</span>
                           <span>2034 (EOL)</span>
                       </div>
                   </div>

                   <div className="flex gap-2">
                       <button className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95">
                           <Play size={22} fill="currentColor" />
                       </button>
                   </div>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-[120px] bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest border-b border-slate-800 pb-2 mb-2 flex justify-between items-center">
                   <div className="flex items-center gap-2"><Terminal size={14} /> Inference_Engine_Output_v2.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> KERNEL ACTIVE</div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-amber-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-amber-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Strategy & AI Reasoning --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
           
           <SciFiCard title="推演策略选择" subtitle="DECISION MATRIX" className="border-slate-800 bg-[#0c0e14]/90">
               <div className="flex flex-col gap-3">
                   {(Object.keys(STRATEGY_DATA) as EOLStrategy[]).map((key) => {
                       const s = STRATEGY_DATA[key];
                       const active = activeStrategy === key;
                       return (
                           <div 
                             key={key}
                             onClick={() => { setActiveStrategy(key); addLog(`执行方案比选: ${s.label}`); }}
                             className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                                ${active ? 'bg-amber-900/20 border-amber-500 shadow-xl' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'}
                             `}
                           >
                               {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                               <div className="flex justify-between items-center mb-1">
                                   <span className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
                                   <div className="flex gap-2">
                                       <span className="text-[8px] font-mono opacity-60 uppercase">Cost: {s.cost}</span>
                                       <span className="text-[8px] font-mono opacity-60 uppercase">ROI: {s.roi}</span>
                                   </div>
                               </div>
                               <div className="flex justify-between items-center">
                                   <div className="text-[9px] uppercase tracking-widest">Risk: <span className={s.risk === 'VERY HIGH' ? 'text-red-500' : 'text-green-500'}>{s.risk}</span></div>
                                   {active && <CheckCircle2 size={14} className="text-amber-500" />}
                               </div>
                           </div>
                       );
                   })}
               </div>
           </SciFiCard>

           <SciFiCard title="Gemini 战略推演结论" subtitle="AI REASONING" className="flex-1 border-amber-900/30 bg-amber-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded flex items-start gap-4 group">
                       <BrainCircuit size={48} className="text-amber-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-amber-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> Analysis Outcome
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiReport}"
                           </p>
                       </div>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Decision Metrics</span>
                           <TrendingUp size={12} className="text-amber-500"/>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">预计全生命周期成本 (TCO)</span>
                              <span className="text-white font-mono">¥ 842.5 W</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">方案置信度水平</span>
                              <span className="text-green-400 font-bold">OPTIMAL</span>
                          </div>
                       </div>
                      <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20">
                          <Save size={16} /> 保存当前可行性推演报告
                      </button>
                      <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-900/40 transition-all hover:scale-[1.02] active:scale-95">
                          <CheckCircle2 size={18} /> 确认并签署策略建议书
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
