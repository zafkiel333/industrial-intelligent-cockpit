
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-risk/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-41]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-41';
import { 
  ShieldAlert, Activity, Zap, Compass, 
  Wind, Clock, AlertTriangle, Play,
  RotateCcw, Info, ArrowRight, Gauge,
  Cpu, Thermometer, Droplets, UserCheck,
  LifeBuoy, Map, Siren, ChevronRight,
  Database, FileText, CheckCircle2,
  BarChart3, Scale, Layers,
  // Added missing icons from lucide-react to fix name errors
  Terminal, BrainCircuit, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---
const RISK_DISTRIBUTION = [
  { subject: '环境载荷', A: 85, fullMark: 100 },
  { subject: '人因差错', A: 62, fullMark: 100 },
  { subject: '系统冗余', A: 45, fullMark: 100 },
  { subject: '备件可用性', A: 78, fullMark: 100 },
  { subject: '应急保障', A: 92, fullMark: 100 },
];

const ENVIRONMENT_STRESS = Array.from({length: 20}, (_, i) => ({
    time: i,
    waveHeight: 2.5 + Math.sin(i * 0.5) * 1.2,
    windSpeed: 15 + Math.cos(i * 0.3) * 5,
    vibration: 1.2 + Math.random() * 0.5
}));

const HUMAN_FACTORS = [
    { name: '疲劳度', val: 74, color: '#f59e0b' },
    { name: '技能匹配', val: 92, color: '#10b981' },
    { name: '协作频率', val: 45, color: '#3b82f6' },
];

export const ShipRiskAssessmentView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('Heavy Weather Repair');
  const [riskFactor, setRiskFactor] = useState(0.8);
  const [aiReport, setAiReport] = useState('正在初始化专家决策引擎...');
  const [logs, setLogs] = useState<string[]>(['[System] 风险评估内核 V4.2 启动...', '[Asset] 载入 VLCC-99 船体结构拓扑']);

  // AI Inference with Gemini
  useEffect(() => {
    const fetchRiskAnalysis = async () => {
        setAiReport('AI 风险专家正在建模环境因子与人因参数的非线性关联...');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `作为一个资深航运安全专家。当前场景：${activeScenario}。
            环境条件：风速 18m/s, 浪高 3.5m, 机舱温度 42℃。
            作业目标：主机燃油泵高压密封更换。
            人员状态：疲劳度 74%, 协同度 45%。
            请进行简短的风险评估（100字内），列出 3 个关键风险点并给出对冲策略。要求中文，距离硬核、专业。`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setAiReport(response.text || '分析报告生成失败。');
        } catch (e) {
            setAiReport('无法连接至 AI 辅助大脑。基于本地规则库建议：在当前海况下，建议推迟高空及精密液压作业。');
        }
    };
    fetchRiskAnalysis();
  }, [activeScenario]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Command HUD --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-red-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-600/20 border-2 border-red-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
             <ShieldAlert size={32} className="text-red-500 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-red-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Safety Management & Risk Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               船舶设备维修 <span className="text-red-500 italic">风险评估模拟控制台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Aggregate Risk Score</div>
                <div className="text-3xl font-mono font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {(riskFactor * 100).toFixed(1)}<span className="text-sm font-normal text-slate-600">/100</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inference Engine</div>
                <div className="text-xl font-mono font-bold text-cyan-400">GEMINI-3 PRO</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Stressors & Human Factors --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="环境载荷动态响应" subtitle="ENVIRONMENTAL" className="h-[280px] border-slate-800 bg-[#0c0e14]/90">
              <div className="w-full h-full p-1">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ENVIRONMENT_STRESS}>
                          <defs>
                              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={[0, 30]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                          <Area type="monotone" dataKey="windSpeed" stroke="#ef4444" fill="none" strokeWidth={2} name="Wind" />
                          <Area type="monotone" dataKey="waveHeight" stroke="#3b82f6" fill="url(#waveGrad)" strokeWidth={1} name="Wave" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="人员可靠性分析 (HRA)" subtitle="HUMAN FACTORS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-5 py-2">
                   {HUMAN_FACTORS.map((item, i) => (
                       <div key={i} className="space-y-1">
                           <div className="flex justify-between text-[11px] font-bold">
                               <span className="text-slate-400 uppercase">{item.name}</span>
                               <span style={{color: item.color}}>{item.val}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                               <div 
                                 className="h-full transition-all duration-1000 ease-out" 
                                 style={{
                                     width: `${item.val}%`, 
                                     backgroundColor: item.color,
                                     boxShadow: `0 0 10px ${item.color}40`
                                 }}
                               ></div>
                           </div>
                       </div>
                   ))}
                   
                   <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded flex items-center gap-3">
                       <AlertTriangle size={20} className="text-red-500 shrink-0 animate-pulse" />
                       <p className="text-[10px] text-red-200/70 leading-tight italic">
                           注意：维修班组连续作业已达 14 小时，误操作概率 (HEP) 指数进入高风险区间。
                       </p>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Risk Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene globalRiskFactor={riskFactor} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border border-red-500/30 p-4 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-red-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12} className="animate-pulse" /> Risk Scan Active
                       </div>
                       <div className="text-3xl font-black text-white italic uppercase tracking-tighter">
                          {activeScenario}
                       </div>
                       <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono"><Map size={12}/> SECTOR: AFT-ENGINE-ROOM</div>
                          <div className="flex items-center gap-1 text-[10px] text-red-400 font-mono font-bold"><Siren size={12}/> THREAT: DETECTED</div>
                       </div>
                   </div>
               </div>

               {/* Dynamic risk selector dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 bg-slate-950/90 p-5 rounded-full border border-slate-700 shadow-2xl backdrop-blur-2xl scale-105">
                   <button 
                     onClick={() => {setRiskFactor(0.4); addLog('重新校准风险权重基准');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 px-4">
                       <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black mb-3 px-1">
                           <span>Simulation Stress Level (Sea State / Load)</span>
                           <span className="text-red-500">Risk Factor: x{riskFactor.toFixed(2)}</span>
                       </div>
                       <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={riskFactor} 
                         onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             setRiskFactor(val);
                             addLog(`仿真压力载荷调整至: ${(val * 100).toFixed(0)}%`);
                         }}
                         className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500"
                       />
                       <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-mono uppercase tracking-widest px-1">
                           <span>Anchored / Calm</span>
                           <span>Mid-Sea / Steady</span>
                           <span>Extreme / Storm</span>
                       </div>
                   </div>

                   <button className="p-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-full shadow-lg shadow-red-900/40 transition-all hover:scale-110 active:scale-95">
                       <Play size={24} fill="currentColor" />
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-[120px] bg-[#020205] border border-slate-800 rounded-lg p-3 flex flex-col shadow-inner overflow-hidden">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2 text-[10px]"><Terminal size={14} /> risk_simulation_log_v2.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> KERNEL_MONITOR</div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-cyan-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-red-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Risk Matrix & AI reasoning --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="风险多维量化矩阵" subtitle="METRICS" className="h-[300px] border-slate-800 bg-[#0c0e14]/90">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RISK_DISTRIBUTION}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Risk" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="Gemini 专家评估结论" subtitle="AI REASONING" className="flex-1 border-red-900/30 bg-red-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-4 group">
                       <BrainCircuit size={48} className="text-red-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-red-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> Analysis Outcome
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiReport}"
                           </p>
                       </div>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Operational Constraints</span>
                           <TrendingUp size={12} className="text-red-500"/>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">维修作业窗口 (Window)</span>
                              <span className="text-white font-mono font-bold">14.5 Hrs</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">资产价值损失风险</span>
                              <span className="text-orange-400 font-bold uppercase">Severe</span>
                          </div>
                       </div>
                      <button className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded text-sm flex items-center justify-center gap-3 shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95">
                          <CheckCircle2 size={18} /> 生成并签署风险豁免书
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
