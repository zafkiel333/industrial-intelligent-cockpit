
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-comparison-v2/ThreeScene';
import { MaintenanceScenario } from '../../components/maintenance/mining-comparison-v2/three-types';
// Added missing Terminal and CheckCircle2 imports from lucide-react to fix missing name errors.
import { 
  Activity, AlertTriangle, ShieldAlert, Cpu, 
  Zap, Clock, Target, BarChart3, Database, 
  ClipboardList, Play, RotateCcw, Info, 
  ArrowRight, Gauge, Scale, TrendingUp,
  BrainCircuit, LayoutGrid, ListFilter,
  FileText, Thermometer, Waveform, Terminal, CheckCircle2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---
const VIB_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 5,
    actual: (i === 12 ? 14.5 : Math.random() * 2), // Abnormal peak at 60Hz
    baseline: 0.5 + Math.random() * 0.5
}));

const THERMAL_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    temp: 65 + Math.sin(i * 0.3) * 5 + (i > 18 ? 25 : 0), // Heat spike
    limit: 95
}));

const SCENARIO_DETAILS: Record<MaintenanceScenario, { label: string; risk: string; cost: string; time: string; roi: string; desc: string }> = {
    'PATCH_REPAIR': { 
        label: '局部修复 (Patch)', 
        risk: 'HIGH', cost: '12w', time: '8h', roi: 'LOW',
        desc: '针对受损表面进行打磨补焊。耗时极短，成本最低，但无法解决内部疲劳问题。'
    },
    'COMPONENT_SWAP': { 
        label: '部件更换 (Swap)', 
        risk: 'LOW', cost: '145w', time: '72h', roi: 'MED',
        desc: '整体更换轴承座组件。标准工业流程，可靠性高，但涉及较长物流与停机周期。'
    },
    'SYSTEM_UPGRADE': { 
        label: '系统升级 (Upgrade)', 
        risk: 'LOW', cost: '210w', time: '96h', roi: 'HIGH',
        desc: '升级至自润滑复合轴承座并加装在线监测系统。初始投入最高，但全寿命周期成本最优。'
    },
    'DEGRADED_RUN': { 
        label: '降额运行 (Degraded)', 
        risk: 'CRITICAL', cost: '0w', time: '0h', roi: 'N/A',
        desc: '维持运行但降低 40% 负荷。存在突发恶性故障风险，仅作为生产排产缓冲。'
    }
};

const RADAR_DATA: Record<MaintenanceScenario, any[]> = {
    'PATCH_REPAIR': [
        { subject: '可靠性', value: 30 }, { subject: '经济性', value: 95 }, { subject: '时效性', value: 90 }, { subject: '技术成熟度', value: 80 }, { subject: '风险规避', value: 20 }
    ],
    'COMPONENT_SWAP': [
        { subject: '可靠性', value: 95 }, { subject: '经济性', value: 40 }, { subject: '时效性', value: 45 }, { subject: '技术成熟度', value: 98 }, { subject: '风险规避', value: 95 }
    ],
    'SYSTEM_UPGRADE': [
        { subject: '可靠性', value: 100 }, { subject: '经济性', value: 25 }, { subject: '时效性', value: 35 }, { subject: '技术成熟度', value: 85 }, { subject: '风险规避', value: 100 }
    ],
    'DEGRADED_RUN': [
        { subject: '可靠性', value: 10 }, { subject: '经济性', value: 100 }, { subject: '时效性', value: 100 }, { subject: '技术成熟度', value: 100 }, { subject: '风险规避', value: 5 }
    ],
};

export const MiningFaultComparisonSimView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<MaintenanceScenario>('COMPONENT_SWAP');
  const [aiInsight, setAiInsight] = useState<string>('正在利用 AI 推理引擎评估方案的可行性...');
  const [logs, setLogs] = useState<string[]>(['[System] 矿山大型破碎站 MB-402 故障模型载入中...', '[Info] 检测到主轴承座位置应力波动异常。']);

  const currentData = SCENARIO_DETAILS[activeScenario];

  // AI Analysis logic using Gemini
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      setAiInsight('AI 专家正在分析当前故障特征并对比各方案收益...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `作为一个矿山机械专家，当前一台大型破碎机轴承座出现疲劳裂纹。
        方案 A (局部修复): 成本 12w, 时间 8h, 风险高。
        方案 B (部件更换): 成本 145w, 时间 72h, 风险低。
        方案 C (系统升级): 成本 210w, 时间 96h, 风险极低。
        当前用户选择了方案：${currentData.label}。
        请简短分析该方案在实际工业场景下的优劣，并给出改进建议。要求使用中文，回答简练。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiInsight(response.text || '分析结果暂不可用。');
      } catch (err) {
        setAiInsight('无法连接至 AI 决策大脑。');
      }
    };

    fetchAIAnalysis();
  }, [activeScenario, currentData.label]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* 扫略特效背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(45deg,#0ea5e9_1px,transparent_1px),linear-gradient(-45deg,#0ea5e9_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-sm flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <Scale size={32} className="text-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Decision Simulation Workbench / v3.1
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿山复杂故障 <span className="text-amber-500 italic">多方案维修对比模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">模拟置信度</div>
                <div className="text-2xl font-mono font-black text-cyan-400">99.2%</div>
            </div>
            <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold">当前故障 ID</div>
                <div className="text-xl font-mono text-red-500 animate-pulse">#FLT-MB-402</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Fault Fingerprints --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="故障频谱指纹" subtitle="DIAGNOSTIC DATA" className="h-[280px] border-slate-800 bg-[#0c0e14]/90">
              <div className="w-full h-full p-2 flex flex-col gap-4">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={VIB_SPECTRUM}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="freq" hide />
                            <YAxis hide domain={[0, 15]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                            <Area type="monotone" dataKey="actual" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                            <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="5 5" strokeWidth={1} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="bg-red-900/10 border border-red-900/30 p-2 rounded flex items-center gap-3">
                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                    <div className="text-[10px] text-red-100/70 leading-tight">
                       特征匹配：检测到 245Hz 处的非周期性冲击脉冲，指示轴承座可能存在微裂纹。
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="温升趋势分析" subtitle="THERMAL PROFILE" className="h-[240px] border-slate-800">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={THERMAL_TREND}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 8}} interval={6} />
                            <YAxis stroke="#475569" tick={{fontSize: 10}} domain={[60, 110]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09'}} />
                            <ReferenceLine y={95} stroke="red" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>

           <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2">
                   <Terminal size={14} /> Simulation Logs
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 mt-2 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 animate-in slide-in-from-left-1 duration-300 ${log.includes('!!') ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-cyan-300'}`}>
                           <span className="text-cyan-600">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-cyan-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- CENTER: 3D Simulator --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene scenario={activeScenario} />

               {/* Overlay HUD */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-amber-500 p-4 rounded-sm shadow-xl flex flex-col border border-slate-800">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Active Simulator</div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{activeScenario.replace('_', ' ')}</div>
                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400"><LayoutGrid size={12}/> VIRTUAL TWIN ACTIVE</div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle2 size={12}/> PHYSICS SYNCED</div>
                       </div>
                   </div>
               </div>

               {/* Central Selection Bar */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   {(Object.keys(SCENARIO_DETAILS) as MaintenanceScenario[]).map((key) => (
                       <button 
                         key={key}
                         onClick={() => { setActiveScenario(key); addLog(`>>> 推演分支切换: ${SCENARIO_DETAILS[key].label}`); }}
                         className={`px-4 py-2 rounded-full text-xs font-bold transition-all
                           ${activeScenario === key ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 scale-105' : 'text-slate-500 hover:text-slate-200'}
                         `}
                       >
                           {SCENARIO_DETAILS[key].label}
                       </button>
                   ))}
               </div>

               {/* Right HUD Widgets */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Reliability Index</div>
                       <div className="text-2xl font-mono font-bold text-white">99.8%</div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-cyan-500 h-full w-[99%]"></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-amber-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase">Est. MTBF</div>
                       <div className="text-xl font-mono font-bold text-white">12,500 <span className="text-xs text-slate-500">hrs</span></div>
                   </div>
               </div>
           </div>

           {/* Scenario Comparison Table */}
           <div className="h-[220px] bg-slate-900/60 border border-slate-800 rounded-lg p-4 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ListFilter size={14}/> 方案多维对比矩阵 (Multi-Criteria Matrix)
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                          <tr>
                              <th className="pb-2">Scenario</th>
                              <th className="pb-2">Risk</th>
                              <th className="pb-2">Cost (Est.)</th>
                              <th className="pb-2">Downtime</th>
                              <th className="pb-2">ROI</th>
                              <th className="pb-2 text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="text-slate-300">
                          {(Object.keys(SCENARIO_DETAILS) as MaintenanceScenario[]).map((key) => {
                              const item = SCENARIO_DETAILS[key];
                              const isActive = activeScenario === key;
                              return (
                                  <tr key={key} className={`border-b border-slate-800/50 transition-colors ${isActive ? 'bg-amber-900/10 text-white' : 'hover:bg-slate-800/30'}`}>
                                      <td className="py-2.5 font-bold flex items-center gap-2">
                                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                                          {item.label}
                                      </td>
                                      <td className={`font-mono text-xs ${item.risk === 'CRITICAL' ? 'text-red-500' : item.risk === 'HIGH' ? 'text-orange-500' : 'text-green-500'}`}>{item.risk}</td>
                                      <td className="font-mono text-xs">{item.cost}</td>
                                      <td className="font-mono text-xs">{item.time}</td>
                                      <td className="font-mono text-xs">{item.roi}</td>
                                      <td className="text-right">
                                          {isActive ? <div className="text-[10px] text-amber-500 font-black animate-pulse">SIMULATING...</div> : <div className="text-[10px] text-slate-600">IDLE</div>}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
           </div>
        </div>

        {/* --- RIGHT: Insights & Decisions --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="仿真效能雷达" subtitle="KPI RADAR" className="h-[280px] border-slate-800 bg-[#0c0e14]/90">
                <div className="w-full h-full p-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_DATA[activeScenario]}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="KPI" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                    {/* Floating Legend */}
                    <div className="absolute top-0 right-0 p-2 bg-slate-900/80 rounded border border-slate-700 flex flex-col gap-1">
                        <div className="text-[8px] text-slate-500 uppercase mb-1">Impact Analysis</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> <span className="text-[10px]">Predicted</span></div>
                    </div>
                </div>
           </SciFiCard>

           <SciFiCard title="AI 辅助决策推演" subtitle="EXPERT AI" className="flex-1 border-amber-900/30 bg-amber-950/5">
                <div className="flex flex-col gap-4 h-full">
                    <div className="p-4 bg-amber-900/20 border border-amber-800/30 rounded flex items-start gap-4 group hover:bg-amber-900/30 transition-all">
                        <BrainCircuit size={48} className="text-amber-500 shrink-0 mt-1 animate-pulse" />
                        <div className="flex-1">
                            <div className="text-xs font-black text-amber-200 mb-2 flex items-center gap-2">
                                <Cpu size={12}/> Gemini Reasoning Core
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed italic">
                               "{aiInsight}"
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Knowledge Sources</span>
                           <ArrowRight size={10}/>
                       </div>
                       <div className="flex flex-col gap-2">
                           {[
                               { label: '破碎机主轴承维护规范.pdf', type: 'PDF', icon: <FileText size={12}/> },
                               { label: '历史停机损失统计分析.xls', type: 'DATA', icon: <Database size={12}/> },
                               { label: '备件库存实时调拨接口', type: 'LINK', icon: <Zap size={12}/> }
                           ].map((doc, i) => (
                               <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded flex items-center gap-3 group cursor-pointer transition-all">
                                   <div className="p-1.5 bg-slate-800 rounded group-hover:text-amber-500 transition-colors">
                                       {doc.icon}
                                   </div>
                                   <span className="text-[11px] text-slate-400 group-hover:text-white truncate">{doc.label}</span>
                               </div>
                           ))}
                       </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-900/40 transition-all hover:scale-[1.02] active:scale-95">
                            <CheckCircle2 size={18} /> 确认并分发此维修方案
                        </button>
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs flex items-center justify-center gap-2 border border-slate-700">
                            <RotateCcw size={16} /> 导出全方案对比报告 (PDF)
                        </button>
                    </div>
                </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
