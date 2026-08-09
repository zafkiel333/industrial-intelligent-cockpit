
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/port-weather/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-44]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-44';
import { WeatherType, WeatherMetrics } from '../../components/maintenance/port-weather/three-types';
import { 
  CloudRain, Wind, CloudFog, Moon, Sun, 
  Activity, Zap, ShieldAlert, Clock,
  Anchor, Wrench, Siren, Terminal,
  Cpu, BarChart3, TrendingUp, AlertTriangle,
  FileText, Share2, ClipboardCheck, Box,
  // Added RotateCcw, Play, and BrainCircuit to fix "Cannot find name" errors
  RotateCcw, Play, BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const WEATHER_METRICS_MAP: Record<WeatherType, WeatherMetrics> = {
  'CLEAR': { windSpeed: 2.4, visibility: 8000, precipitation: 0, lux: 50000 },
  'RAIN': { windSpeed: 8.5, visibility: 1200, precipitation: 15.2, lux: 5000 },
  'FOG': { windSpeed: 1.2, visibility: 350, precipitation: 0, lux: 8000 },
  'STORM': { windSpeed: 22.4, visibility: 800, precipitation: 45.0, lux: 2000 },
  'NIGHT': { windSpeed: 3.5, visibility: 500, precipitation: 0, lux: 10 },
};

const FEASIBILITY_DATA = [
  { subject: '高空作业', A: 85, fullMark: 100 },
  { subject: '精密对中', A: 92, fullMark: 100 },
  { subject: '电气检修', A: 75, fullMark: 100 },
  { subject: '吊装稳定性', A: 60, fullMark: 100 },
  { subject: '视线遮蔽度', A: 90, fullMark: 100 },
];

const WINDOW_FORECAST = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    risk: 10 + Math.sin(i * 0.3) * 40 + (i > 18 ? 40 : 0),
    wind: 5 + Math.cos(i * 0.3) * 15
}));

export const PortWeatherSimView: React.FC = () => {
  const [weather, setWeather] = useState<WeatherType>('CLEAR');
  const [aiAnalysis, setAiAnalysis] = useState('正在利用 Gemini 空间气象引擎生成策略建议...');
  const [logs, setLogs] = useState<string[]>(['[System] 全天候仿真内核 V2.5 启动', '[Info] 已同步港区实时气象档案']);
  const [maintenanceTarget, setMaintenanceTarget] = useState('STS-04 吊具传感器更换');

  const metrics = WEATHER_METRICS_MAP[weather];

  // AI Reasoning with Gemini
  useEffect(() => {
    const fetchAIAudit = async () => {
      setAiAnalysis('AI 专家正在评估极端气象下的物理干涉与风险指数...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `作为一个港口设备运维专家。
        当前气象：${weather} (风速 ${metrics.windSpeed}m/s, 能见度 ${metrics.visibility}m, 降水量 ${metrics.precipitation}mm/h)。
        维修任务：${maintenanceTarget}。
        请给出 3 条硬核的安全操作指令和策略调整建议（针对该特定天气）。要求中文，语言专业精炼。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiAnalysis(response.text || 'AI 建议生成超时。');
      } catch (err) {
        setAiAnalysis('AI 指挥链路延迟。通用策略：大风及暴雨期间，严禁执行 15 米以上高空吊装作业。');
      }
    };
    fetchAIAudit();
  }, [weather, maintenanceTarget]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const handleWeatherChange = (w: WeatherType) => {
      setWeather(w);
      addLog(`仿真环境切换至：${w} 模式`);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-indigo-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600/20 border-2 border-indigo-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
             <Wind size={32} className="text-indigo-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Resilience-First Simulation / Multi-Scenario
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               港口设备 <span className="text-indigo-500">全天候维修策略仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Risk Index</div>
                <div className={`text-3xl font-mono font-black ${metrics.windSpeed > 15 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {(metrics.windSpeed * 4.2).toFixed(1)}<span className="text-sm font-normal text-slate-600">/100</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Simulation Kernel</div>
                <div className="text-xl font-mono font-bold text-white">V2.5 STABLE</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Environment Controller --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="环境模拟控制器" subtitle="WEATHER ENGINE" className="border-indigo-900/30 bg-[#0c0e14]/90">
              <div className="grid grid-cols-2 gap-2 mt-2">
                 {[
                    { id: 'CLEAR', label: '极昼/晴朗', icon: <Sun size={18}/>, color: 'text-yellow-400' },
                    { id: 'RAIN', label: '持续强降雨', icon: <CloudRain size={18}/>, color: 'text-blue-400' },
                    { id: 'FOG', label: '低能见度浓雾', icon: <CloudFog size={18}/>, color: 'text-slate-400' },
                    { id: 'STORM', label: '强对流风暴', icon: <Siren size={18}/>, color: 'text-red-500' },
                    { id: 'NIGHT', label: '黑夜/极低光', icon: <Moon size={18}/>, color: 'text-indigo-400' },
                 ].map((w) => (
                    <button 
                      key={w.id}
                      onClick={() => handleWeatherChange(w.id as WeatherType)}
                      className={`p-3 rounded border flex flex-col items-center gap-2 transition-all
                        ${weather === w.id ? 'bg-indigo-900/40 border-indigo-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-indigo-800'}
                      `}
                    >
                        <div className={weather === w.id ? w.color : ''}>{w.icon}</div>
                        <span className="text-[10px] font-bold">{w.label}</span>
                    </button>
                 ))}
              </div>

              <div className="mt-6 space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800 pb-1">实时环境载荷 (Live)</div>
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-400">平均风速</span>
                      <span className="font-mono text-indigo-300 font-bold">{metrics.windSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-400">有效能见度</span>
                      <span className="font-mono text-indigo-300 font-bold">{metrics.visibility} m</span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-400">降水密度</span>
                      <span className="font-mono text-indigo-300 font-bold">{metrics.precipitation} mm/h</span>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全自动化作业窗口" subtitle="WINDOW PREDICT" className="flex-1 border-slate-800">
                <div className="w-full h-full p-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WINDOW_FORECAST}>
                            <defs>
                                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 8}} interval={4} />
                            <YAxis hide />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#ef4444'}} />
                            <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} name="Risk" />
                            <Line type="monotone" dataKey="wind" stroke="#0ea5e9" strokeWidth={1} dot={false} name="Wind" />
                            <ReferenceLine y={70} stroke="white" strokeDasharray="3 3" label={{value: 'NO-GO', fill: 'white', fontSize: 10}} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization Area --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene weather={weather} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-indigo-500 p-5 rounded-sm flex flex-col border border-slate-800">
                       <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="animate-pulse" /> Live Dynamics Twin
                       </div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">
                          {weather} ENVIRONMENT
                       </div>
                       <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono"><Anchor size={12}/> BERTH: #08</div>
                          <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono font-bold"><Siren size={12}/> ALERT: MONITORING</div>
                       </div>
                   </div>
               </div>

               {/* Right HUD Gauges */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-indigo-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest">Structural Sway</div>
                       <div className="text-2xl font-mono font-bold text-white">{(metrics.windSpeed * 0.12).toFixed(2)} <span className="text-sm">mm</span></div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-indigo-500 h-full transition-all duration-700" style={{width: `${metrics.windSpeed * 4}%`}}></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Lidar Confidence</div>
                       <div className="text-lg font-mono font-bold text-white">{(metrics.visibility / 8000 * 100).toFixed(0)}%</div>
                   </div>
               </div>

               {/* Action Control Dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 bg-slate-900/80 p-4 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   <div className="flex gap-3 px-2">
                        {/* Fixed RotateCcw missing import error */}
                        <button className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Reset Simulation"><RotateCcw size={20}/></button>
                        <button className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Diagnostics"><Cpu size={20}/></button>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>
                   {/* Fixed Play missing import error */}
                   <button 
                     onClick={() => addLog(`执行仿真推演: ${maintenanceTarget}`)}
                     className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                   >
                       <Play size={18} fill="currentColor" />
                       <span className="tracking-widest uppercase text-xs">Run Strategy Simulation</span>
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-40 bg-[#020205] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> weather_sim_kernel_v2.5</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> KERNEL_ACTIVE</div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-indigo-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
               <div className="animate-pulse text-indigo-500 mt-1">_</div>
           </div>
        </div>

        {/* --- RIGHT: Strategy & AI Reasoning --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="环境可行性评估" subtitle="FEASIBILITY" className="h-[280px] border-slate-800 bg-[#0c0e14]/90">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={FEASIBILITY_DATA}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Strategy" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#6366f1'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="Gemini 策略推演报告" subtitle="AI REASONING" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-indigo-900/20 border border-indigo-800/30 rounded flex items-start gap-4 group">
                       {/* Fixed BrainCircuit missing import error */}
                       <BrainCircuit size={48} className="text-indigo-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> Analysis Outcome
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiAnalysis}"
                           </p>
                       </div>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Decision Metrics</span>
                           <TrendingUp size={12} className="text-indigo-500"/>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">平均维修耗时预测</span>
                              <span className="text-white font-mono font-bold">{(12 + metrics.windSpeed * 0.5).toFixed(1)} Hrs</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">气象风险溢价</span>
                              <span className={`font-bold uppercase ${metrics.windSpeed > 15 ? 'text-red-500' : 'text-green-400'}`}>
                                  {metrics.windSpeed > 15 ? 'Severe' : 'Moderate'}
                              </span>
                          </div>
                       </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
                            <ClipboardCheck size={16} /> 批准维修方案
                        </button>
                        <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 transition-all">
                            <Share2 size={16} />
                        </button>
                      </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Cost/Loss Analysis */}
           <SciFiCard title="停机损失与成本估算" className="border-slate-800">
               <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-900/20 rounded-full border border-red-500/30">
                        <DollarSign size={20} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-slate-500 uppercase">Estimated Impact</div>
                        <div className="text-xl font-bold text-white">$ 4,250 <span className="text-sm font-normal text-slate-500">/hr</span></div>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-bold ${metrics.windSpeed > 10 ? 'text-red-400' : 'text-green-400'}`}>
                           {metrics.windSpeed > 10 ? '+25% Over' : 'On Budget'}
                        </div>
                    </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

function DollarSign(props: any) {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
}

function PauseCircle(props: any) {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>;
}
