
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroLongTermThreeScene } from '../../components/ServiceDataManagement/HydroLongTerm/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-3]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-3';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';
import { 
  Clock, Activity, CalendarDays, History, TrendingDown, 
  AlertOctagon, Play, Pause, FastForward, Rewind, Info, Zap
} from 'lucide-react';

export const HydroLongTermOperationView: React.FC = () => {
  const [timeProgress, setTimeProgress] = useState(1.0); // 0.0 - 1.0
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Simulation Data (Long-term)
  const [lifespanData, setLifespanData] = useState({
    runHours: 35420,
    starts: 2450,
    availability: 99.4, // %
    mtbf: 4500, // Hours
    healthScore: 88
  });

  const fatigueData = [
    { component: '转轮叶片', stress: 85, cycle: 1.2e7, limit: 1.5e7 },
    { component: '主轴法兰', stress: 42, cycle: 1.2e7, limit: 5.0e7 },
    { component: '导叶连杆', stress: 65, cycle: 8.5e6, limit: 2.0e7 },
    { component: '定子线棒', stress: 92, cycle: 3.5e5, limit: 5.0e5 }, // Thermal cycles
  ];

  const degradationTrend = Array.from({length: 20}, (_, i) => ({
    year: 2005 + i,
    efficiency: 94 - (i * 0.15) - (Math.random() * 0.2), // Slow decay
    vibration: 2.0 + (i * 0.1) + (Math.random() * 0.5), // Increasing vibration
    limit: 90
  }));

  const operationModes = [
    { subject: '发电工况', A: 120, fullMark: 150 },
    { subject: '抽水工况', A: 45, fullMark: 150 },
    { subject: '调相运行', A: 30, fullMark: 150 },
    { subject: '停机备用', A: 80, fullMark: 150 },
    { subject: '黑启动', A: 10, fullMark: 150 },
  ];

  const eventDetails: Record<string, any> = {
    'ev-01': { title: '首次并网发电', date: '2005-06-12', desc: '机组完成72小时试运行，正式移交商业运行。' },
    'ev-02': { title: 'A级检修 (第一次)', date: '2012-03-15', desc: '全机解体大修，更换推力瓦及上导轴瓦。' },
    'ev-03': { title: '突发剪断销故障', date: '2016-08-20', desc: '异物进入导叶区域，导致2个剪断销剪断，紧急停机。' },
    'ev-04': { title: '转轮升级改造', date: '2021-01-10', desc: '更换为新型抗空蚀转轮，效率提升1.5%。' },
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeProgress(prev => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 0.005;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Dynamic Health based on time slider
    const decay = (1 - timeProgress) * 5 + (timeProgress > 0.8 ? -5 : 0); // Mock logic
    setLifespanData(prev => ({
        ...prev,
        healthScore: Math.min(100, Math.max(0, 88 + decay))
    }));
  }, [timeProgress]);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#041d1a] p-2 overflow-hidden select-none">
      
      {/* 顶部：全生命周期指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-950/60 via-slate-900/60 to-transparent border-b border-teal-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-teal-600/20 border border-teal-500/50 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <History className="text-teal-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电设备长期连续运行工况服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-teal-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Clock size={12}/> TOTAL RUN: {lifespanData.runHours.toLocaleString()} H</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Activity size={12}/> CYCLES: {lifespanData.starts}</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">LIFECYCLE STATUS: MATURE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/60 border border-teal-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-teal-500 uppercase font-bold">Reliability (MTBF)</div>
              <div className="text-xl font-mono font-black text-white">{lifespanData.mtbf} <span className="text-xs text-slate-500">h</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/60 border border-teal-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-teal-500 uppercase font-bold">Availability Factor</div>
              <div className="text-xl font-mono font-black text-emerald-400">{lifespanData.availability}%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Stress & Fatigue */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="部件累积疲劳损伤" subtitle="FATIGUE LIFE" className="bg-[#061816]/80 border-teal-800/50">
              <div className="space-y-4 pt-2">
                 {fatigueData.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                       <div className="flex justify-between text-xs text-slate-300">
                          <span>{item.component}</span>
                          <span className={item.stress > 90 ? 'text-red-400' : 'text-teal-400'}>{item.stress}% Life Used</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${item.stress > 90 ? 'bg-red-500' : item.stress > 70 ? 'bg-amber-500' : 'bg-teal-500'}`} 
                             style={{width: `${item.stress}%`}}
                          ></div>
                       </div>
                       <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>Cycles: {(item.cycle/1e6).toFixed(1)}M</span>
                          <span>Limit: {(item.limit/1e6).toFixed(1)}M</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="运行工况谱" subtitle="OPERATION MODES" className="flex-1 border-teal-800/50">
              <div className="h-full flex flex-col items-center justify-center">
                 <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={operationModes}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar name="Frequency" dataKey="A" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="text-[10px] text-slate-400 text-center px-4">
                    高频次的<span className="text-white font-bold">启停与调相</span>转换是导致转子磁极松动和定子线棒绝缘老化的主要应力源。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Chrono Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#022c22] to-[#020617] border border-teal-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(20,184,166,0.1)]">
              {/* HUD: Time Machine */}
              <div className="absolute top-6 left-6 z-10 w-64 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-teal-500/30 p-3 rounded-xl shadow-2xl">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                       <CalendarDays className="text-teal-400" size={16} />
                       <span className="text-xs font-bold text-white uppercase">Historical Timeline</span>
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                       {Math.floor(2005 + timeProgress * 20)} <span className="text-sm font-normal text-slate-400">YEAR</span>
                    </div>
                    {selectedEvent && (
                       <div className="mt-2 p-2 bg-teal-900/40 rounded border border-teal-500/40 animate-in fade-in slide-in-from-left-2">
                          <div className="text-xs font-bold text-teal-200">{eventDetails[selectedEvent]?.title}</div>
                          <div className="text-[9px] text-slate-300 mt-1 leading-tight">{eventDetails[selectedEvent]?.desc}</div>
                          <div className="text-[8px] text-slate-500 mt-1 font-mono text-right">{eventDetails[selectedEvent]?.date}</div>
                       </div>
                    )}
                 </div>
              </div>

              {/* Health Halo */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
                 <div className={`px-4 py-2 rounded-full border backdrop-blur shadow-lg flex items-center gap-3 ${
                    lifespanData.healthScore > 80 ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' :
                    lifespanData.healthScore > 60 ? 'bg-amber-900/80 border-amber-500/50 text-amber-100' :
                    'bg-red-900/80 border-red-500/50 text-red-100'
                 }`}>
                    <Activity size={18} />
                    <div>
                       <div className="text-[9px] uppercase font-bold opacity-70">Health Index</div>
                       <div className="text-xl font-mono font-black">{lifespanData.healthScore}</div>
                    </div>
                 </div>
              </div>

              <HydroLongTermThreeScene
                 timeProgress={timeProgress}
                 healthIndex={lifespanData.healthScore}
                 onEventSelect={setSelectedEvent}
              />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Timeline Controls */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-2">
                 <div className="flex items-center gap-4 bg-black/60 px-4 py-3 rounded-xl border border-teal-500/30 backdrop-blur">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-teal-400 hover:text-white transition-colors">
                       {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <input 
                       type="range" min="0" max="1" step="0.001" 
                       value={timeProgress}
                       onChange={(e) => setTimeProgress(parseFloat(e.target.value))}
                       className="flex-1 accent-teal-500 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer"
                    />
                    
                    <span className="text-xs font-mono text-slate-300 w-12 text-right">{(timeProgress*100).toFixed(0)}%</span>
                 </div>
                 <div className="flex justify-between px-2 text-[9px] text-slate-400 font-mono">
                    <span>2005 (Commissioning)</span>
                    <span>2025 (Projected)</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Degradation & Prediction */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Performance Decay */}
           <SciFiCard title="性能衰减趋势" subtitle="EFFICIENCY LOSS" className="h-[280px] border-teal-800/50">
              <div className="w-full h-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={degradationTrend}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="left" stroke="#0d9488" tick={{fontSize: 9}} domain={[85, 96]} label={{ value: 'Eff %', angle: -90, position: 'insideLeft', fill: '#0d9488', fontSize: 9 }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 9}} domain={[0, 6]} label={{ value: 'Vib mm/s', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 9 }} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="efficiency" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} name="Efficiency" />
                       <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration" />
                       <ReferenceLine yAxisId="left" x={2005 + timeProgress * 20} stroke="#fff" strokeDasharray="3 3" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Predictive Maintenance */}
           <SciFiCard title="预测性维护排程" subtitle="AI FORECAST" className="flex-1 border-teal-800/50">
              <div className="space-y-3">
                 <div className="flex gap-3 p-2 bg-slate-900/60 rounded border border-slate-800 border-l-4 border-l-amber-500">
                    <AlertOctagon className="text-amber-500 mt-1" size={16} />
                    <div>
                       <div className="text-xs font-bold text-slate-200">绝缘老化临界点</div>
                       <div className="text-[9px] text-slate-400 mt-1">预计 <span className="text-white font-mono">2026-Q2</span> 定子绝缘指数降至 3.0MΩ 以下，建议安排 B 级检修。</div>
                    </div>
                 </div>
                 <div className="flex gap-3 p-2 bg-slate-900/60 rounded border border-slate-800 border-l-4 border-l-blue-500">
                    <Zap className="text-blue-500 mt-1" size={16} />
                    <div>
                       <div className="text-xs font-bold text-slate-200">空蚀修复窗口</div>
                       <div className="text-[9px] text-slate-400 mt-1">转轮叶片空蚀深度预测将在 <span className="text-white font-mono">8,500h</span> 后达到 5mm 补焊标准。</div>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-teal-700/20 hover:bg-teal-600/30 border border-teal-600/40 rounded text-[10px] text-teal-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                 <Info size={12} /> 生成长期服役评估报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
