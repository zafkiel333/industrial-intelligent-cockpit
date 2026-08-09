
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-lifecycle/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-39]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-39';
import { 
  History, DollarSign, TrendingUp, Zap, Clock, 
  Settings, AlertTriangle, ShieldCheck, Cpu, 
  FileText, Activity, Layers, ArrowRight,
  Maximize2, Database, Trash2, Calendar,
  BarChart3, PieChart as PieChartIcon, LifeBuoy,
  // Added BrainCircuit and Terminal to fix missing icon errors
  RotateCcw, Play, BrainCircuit, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA GENERATOR ---
const generateLifecycleData = (years: number) => {
  return Array.from({ length: years + 1 }, (_, i) => {
    const age = i;
    const reliability = Math.max(20, 98 - Math.pow(age, 1.6) * 0.4);
    const failureRisk = 100 - reliability;
    
    // Costs in $k
    const maintenance = age * 15 + Math.random() * 5;
    const fuel = 150 + age * 2; // Inefficient as ages
    const repair = age < 5 ? 5 : Math.pow(age - 4, 2) * 5 + 10;
    
    return {
      year: `Year ${age}`,
      val: age,
      reliability,
      failureRisk,
      maintenance,
      fuel,
      repair,
      total: maintenance + fuel + repair
    };
  });
};

const COMPONENT_WEAR = [
  { name: 'Engine (引擎)', val: 85, color: '#ef4444' },
  { name: 'Hydraulics (液压)', val: 62, color: '#f59e0b' },
  { name: 'Drivetrain (传动)', val: 45, color: '#3b82f6' },
  { name: 'Tires (轮胎)', val: 92, color: '#ef4444' },
  { name: 'Structure (结构)', val: 28, color: '#10b981' },
];

export const MiningLifecycleCostSimView: React.FC = () => {
  const [simYear, setSimYear] = useState(5);
  const [aiAnalysis, setAiAnalysis] = useState('正在利用 Gemini 决策引擎推演资产价值临界点...');
  const [logs, setLogs] = useState<string[]>(['[System] 矿山大型自卸车 797F 数字化档案载入...', '[Init] 全生命周期成本 (LCC) 模型基准已建立']);

  const lifecycleData = useMemo(() => generateLifecycleData(15), []);
  const currentYearData = lifecycleData[simYear];
  const ageFactor = simYear / 15;

  // AI Reasoning Simulator
  useEffect(() => {
    const runAiAnalysis = async () => {
      setAiAnalysis('AI 正在分析浴缸曲线偏移及备件库存策略...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `作为一个矿山资产管理专家。当前设备：大型矿车 797F。当前服役时间：${simYear}年。
          可靠性：${currentYearData.reliability.toFixed(1)}%。年度维护成本：${currentYearData.total.toFixed(0)}k USD。
          当前部件磨损：引擎 85%, 轮胎 92%, 液压 62%。
          请从经济学和工程学角度，给出一个简短的（100字以内）“继续修理 vs 报废更新”的决策建议。要求使用中文。`,
          config: { temperature: 0.7 }
        });
        setAiAnalysis(response.text || 'AI 推理超时。');
      } catch (e) {
        setAiAnalysis('无法连接至 AI 辅助大脑。根据当前数据建议：第8年为经济性临界点。');
      }
    };
    runAiAnalysis();
  }, [simYear, currentYearData.reliability, currentYearData.total]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/60 border border-stone-800 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-sm flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <Calendar size={32} className="text-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Asset Lifecycle Management Hub
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿山设备全生命周期 <span className="text-amber-500 italic">维修成本模拟系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-12 items-center">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Total Cost of Ownership (TCO)</div>
                <div className="text-3xl font-mono font-black text-white">$ {(lifecycleData.slice(0, simYear+1).reduce((acc, curr) => acc + curr.total, 0)).toFixed(0)} <span className="text-sm text-slate-500">k</span></div>
            </div>
             <div className="h-10 w-[1px] bg-stone-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Simulation Confidence</div>
                <div className="text-3xl font-mono font-black text-cyan-400">96.8%</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Cost Aggregation & Metrics --- */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="累计维修成本分解" subtitle="COST BREAKDOWN" className="h-[280px] border-stone-800 bg-[#1c1917]/90">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lifecycleData.slice(0, simYear + 1)}>
                          <defs>
                              <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                          <XAxis dataKey="year" stroke="#57534e" tick={{fontSize: 9}} />
                          <YAxis stroke="#57534e" tick={{fontSize: 9}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #44403c'}} />
                          <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="PM Cost" />
                          <Area type="monotone" dataKey="repair" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Repair Cost" />
                          <Area type="monotone" dataKey="fuel" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.3} name="Fuel Consumption" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="当前部件磨损指纹" subtitle="WEAR ANALYSIS" className="flex-1 border-stone-800">
               <div className="flex flex-col gap-4 py-2">
                   {COMPONENT_WEAR.map((item, i) => (
                       <div key={i} className="space-y-1">
                           <div className="flex justify-between text-[11px] font-bold">
                               <span className="text-stone-400 uppercase tracking-tighter">{item.name}</span>
                               <span style={{color: item.color}}>{(item.val * (1 + (simYear/15))).toFixed(0)}%</span>
                           </div>
                           <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden">
                               <div 
                                 className="h-full transition-all duration-1000 ease-out" 
                                 style={{
                                     width: `${Math.min(100, item.val * (1 + (simYear/15)))}%`, 
                                     backgroundColor: item.color,
                                     boxShadow: `0 0 10px ${item.color}40`
                                 }}
                               ></div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded flex items-center gap-3">
                       <AlertTriangle size={18} className="text-red-500 shrink-0" />
                       <p className="text-[10px] text-red-200/70 leading-tight">
                           警告：第{simYear}年由于主轴承疲劳度达到临界值，突发故障率已提升 240%。
                       </p>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Timeline Control --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-stone-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene year={simYear} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-stone-950/80 backdrop-blur border-l-4 border-amber-500 p-5 rounded-sm shadow-xl flex flex-col border border-stone-800">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Active Sim Cycle</div>
                       <div className="text-3xl font-black text-white tracking-tighter">
                          服役第 <span className="text-amber-500 italic">{simYear}</span> 年 <span className="text-sm font-normal text-stone-500 uppercase tracking-widest ml-2">Digital Age Profile</span>
                       </div>
                       <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400"><Activity size={12}/> VIRTUAL TWIN</div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400"><ShieldCheck size={12}/> RELIABLE</div>
                       </div>
                   </div>
               </div>

               {/* Right HUD Gauges */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Reliability Index</div>
                       <div className="text-2xl font-mono font-bold text-white">{currentYearData.reliability.toFixed(1)}%</div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-cyan-500 h-full transition-all duration-700" style={{width: `${currentYearData.reliability}%`}}></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-red-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-red-400 font-bold mb-1 uppercase">Failure Prob.</div>
                       <div className="text-xl font-mono font-bold text-white">{currentYearData.failureRisk.toFixed(1)}%</div>
                   </div>
               </div>

               {/* Timeline Scrubber (The "Time Machine") */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-stone-900/90 p-5 rounded-full border border-stone-700 shadow-2xl flex items-center gap-8 backdrop-blur-2xl scale-105 z-30">
                   <button 
                     onClick={() => setSimYear(0)}
                     className="p-2.5 bg-stone-800 hover:bg-stone-700 text-slate-400 rounded-full border border-stone-700 transition-all"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 px-4">
                       <div className="flex justify-between text-[10px] text-stone-500 uppercase font-black mb-3 px-1">
                           <span>Simulation Timeline (Current Year -&gt; End of Life)</span>
                           <span className="text-amber-500">Year {simYear} / 15</span>
                       </div>
                       <input 
                         type="range" min="0" max="15" step="1" 
                         value={simYear} 
                         onChange={(e) => {
                             const val = parseInt(e.target.value);
                             setSimYear(val);
                             addLog(`推演时间轴移动至第 ${val} 年`);
                         }}
                         className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                       />
                       <div className="flex justify-between text-[8px] text-slate-600 mt-2 font-mono tracking-widest uppercase px-1">
                           <span>New Delivery</span>
                           <span>Mid-Life</span>
                           <span>Scrap / End</span>
                       </div>
                   </div>

                   <button className="p-4 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-amber-900/40">
                       <Play size={24} fill="currentColor" />
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-32 bg-[#0a0a0c] border border-stone-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-stone-600 border-b border-stone-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={12} /> lifecycle_sim_kernel_v3.1</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> ENGINE_ACTIVE</div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-amber-300'}`}>
                           <span className="text-stone-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-amber-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Replacement Strategy & AI Insights --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="浴缸曲线动态推演" subtitle="BATHTUB CURVE" className="h-[260px] border-stone-800 bg-[#0c0e14]/90">
                <div className="w-full h-full p-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lifecycleData} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                            <XAxis dataKey="year" hide />
                            <YAxis hide />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #333'}} />
                            <Line type="monotone" dataKey="failureRisk" stroke="#ef4444" strokeWidth={2} dot={false} name="故障风险" />
                            {/* Marker for current simulated year */}
                            <ReferenceLine x={`Year ${simYear}`} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-stone-500 uppercase font-black flex gap-6">
                        <span>Infant Mortality</span>
                        <span>Useful Life</span>
                        <span>Wear-out</span>
                    </div>
                </div>
           </SciFiCard>

           <SciFiCard title="AI 资产价值评估报告" subtitle="DECISION ASSIST" className="flex-1 border-amber-900/30 bg-amber-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-amber-900/10 border border-amber-800/30 rounded flex items-start gap-4 group hover:bg-amber-900/20 transition-all">
                       <BrainCircuit size={48} className="text-amber-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-amber-200 mb-2 flex items-center gap-2">
                               <Zap size={12}/> Gemini Reasoning Core
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                               "{aiAnalysis}"
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3 mt-auto">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-stone-800 pb-2">
                           <span>Decision Metrics</span>
                           <TrendingUp size={12} className="text-amber-500"/>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
                               <div className="text-[9px] text-stone-500">NPV (Remaining)</div>
                               <div className="text-sm font-bold text-white">$ {(500 * (1 - ageFactor)).toFixed(0)}k</div>
                           </div>
                           <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
                               <div className="text-[9px] text-stone-500">Upgrade ROI</div>
                               <div className="text-sm font-bold text-green-400">{(125 - simYear*5).toFixed(1)}%</div>
                           </div>
                       </div>
                   </div>

                   <div className="mt-auto space-y-2">
                      <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-xs flex items-center justify-center gap-3 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-95">
                          <Maximize2 size={16} /> 生成完整大修经济性报告
                      </button>
                      <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs flex items-center justify-center gap-2 border border-slate-700">
                          <Trash2 size={16} /> 评估资产退役残值
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
