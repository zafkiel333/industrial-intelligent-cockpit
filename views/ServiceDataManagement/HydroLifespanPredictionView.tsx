
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroLifespanThreeScene } from '../../components/ServiceDataManagement/HydroLifespan/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Hourglass, TrendingDown, CalendarClock, History, AlertOctagon, 
  Play, Pause, FastForward, Activity, Microscope, ArrowRight, Zap,
  Wrench, FileText
} from 'lucide-react';

export const HydroLifespanPredictionView: React.FC = () => {
  const [currentYearOffset, setCurrentYearOffset] = useState(0); // 0 = Now
  const [activePart, setActivePart] = useState<string>('part-runner');
  const [isPlaying, setIsPlaying] = useState(false);

  // Constants
  const START_YEAR = 2024;
  const MAX_OFFSET = 20; // Forecast 20 years

  // Mock Data
  const degradationData = Array.from({length: MAX_OFFSET + 1}, (_, i) => {
    const year = START_YEAR + i;
    // Exponential decay curve
    const health = 100 * Math.pow(0.95, i);
    const failureProb = (100 - health) * 1.5;
    return {
      year,
      health: health,
      failureProb: failureProb,
      limit: 30 // Replacement threshold
    };
  });

  const stressFactors = [
    { subject: '空蚀磨损', A: 85, fullMark: 100 },
    { subject: '泥沙磨蚀', A: 40, fullMark: 100 },
    { subject: '热疲劳', A: 60, fullMark: 100 },
    { subject: '机械振动', A: 75, fullMark: 100 },
    { subject: '绝缘老化', A: 55, fullMark: 100 },
  ];

  const maintenanceSuggestions = [
    { year: 2026, type: 'C级检修', action: '密封条更换', status: 'upcoming' },
    { year: 2029, type: 'B级检修', action: '推力瓦研磨', status: 'future' },
    { year: 2034, type: 'A级大修', action: '转轮修复/更换', status: 'critical' },
  ];

  const partDetails: Record<string, any> = {
    'part-runner': { name: '水轮机转轮', rul: 12.5, criticalFactor: '空蚀', status: 'Good' },
    'part-stator': { name: '发电机定子', rul: 18.2, criticalFactor: '绝缘热老化', status: 'Excellent' },
    'part-bearing': { name: '推力轴承', rul: 8.4, criticalFactor: '磨损', status: 'Fair' },
    'part-shaft': { name: '主轴系统', rul: 25.0, criticalFactor: '疲劳', status: 'Excellent' },
  };

  // Animation Loop
  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYearOffset(prev => {
          if (prev >= MAX_OFFSET) {
            setIsPlaying(false);
            return MAX_OFFSET;
          }
          return parseFloat((prev + 0.2).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activePartData = partDetails[activePart] || partDetails['part-runner'];
  // Adjust RUL display based on slider
  const dynamicRul = Math.max(0, activePartData.rul - currentYearOffset);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0a0510] p-2 overflow-hidden select-none">
      
      {/* 顶部：寿命预测引擎 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-950/60 via-indigo-950/60 to-transparent border-b border-violet-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse">
              <Hourglass className="text-violet-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电站设备寿命预测服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-violet-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Activity size={12}/> MODEL: WEIBULL_HYBRID_V4</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Microscope size={12}/> PHYSICS_INFORMED_ML</span>
                 <span>|</span>
                 <span className="text-amber-400 font-bold">SIMULATION MODE: T+{currentYearOffset.toFixed(1)} YEARS</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/60 border border-violet-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-violet-400 uppercase font-bold">System RUL</div>
              <div className="text-xl font-mono font-black text-white">{Math.max(0, 15 - currentYearOffset).toFixed(1)} <span className="text-xs text-slate-500">Years</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/60 border border-violet-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-violet-400 uppercase font-bold">Confidence Interval</div>
              <div className="text-xl font-mono font-black text-emerald-400">92.4%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：3D 预测沙盘 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#1e1b4b] to-[#0a0510] border border-violet-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(139,92,246,0.15)]">
              {/* HUD: Time Control */}
              <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-2">
                 <div className="flex justify-between items-end">
                    <div className="text-sm font-bold text-violet-200 uppercase">Temporal Projection Control</div>
                    <div className="text-3xl font-black text-white font-mono">
                       {Math.floor(START_YEAR + currentYearOffset)} <span className="text-sm text-slate-400 font-normal">YEAR</span>
                    </div>
                 </div>
                 
                 {/* Interactive Slider */}
                 <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-violet-500/30">
                    <button 
                       onClick={() => setIsPlaying(!isPlaying)}
                       className="p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg"
                    >
                       {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <input 
                       type="range" min="0" max={MAX_OFFSET} step="0.1"
                       value={currentYearOffset}
                       onChange={(e) => setCurrentYearOffset(parseFloat(e.target.value))}
                       className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-400"
                    />
                    <button onClick={() => setCurrentYearOffset(0)} className="text-slate-400 hover:text-white"><History size={16}/></button>
                    <span className="font-mono text-xs text-violet-300 w-12 text-right">+{currentYearOffset.toFixed(1)}Y</span>
                 </div>
              </div>

              {/* HUD: Component RUL */}
              <div className="absolute top-32 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-violet-500/30 p-4 rounded-xl shadow-2xl min-w-[200px] animate-in fade-in slide-in-from-left-4">
                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Target Component</div>
                    <div className="text-lg font-bold text-white mb-2">{activePartData.name}</div>
                    
                    <div className="space-y-3">
                       <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                             <span>Remaining Life</span>
                             <span className={dynamicRul < 5 ? 'text-red-500 font-bold' : 'text-emerald-400'}>
                                {dynamicRul.toFixed(1)} Years
                             </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${dynamicRul < 5 ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-300`} 
                                  style={{width: `${Math.min(100, (dynamicRul/activePartData.rul)*100)}%`}}></div>
                          </div>
                       </div>
                       
                       <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div>
                             <div className="uppercase">Critical Factor</div>
                             <div className="text-violet-300 font-bold">{activePartData.criticalFactor}</div>
                          </div>
                          <div>
                             <div className="uppercase">Condition</div>
                             <div className="text-white">{dynamicRul < 2 ? 'Replace' : 'Monitor'}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <HydroLifespanThreeScene 
                 currentYearOffset={currentYearOffset}
                 activePartId={activePart}
                 onPartSelect={setActivePart}
              />
           </div>
        </div>

        {/* 右侧：寿命分析数据面板 */}
        <div className="w-full lg:w-[52%] flex flex-col gap-4">
           
           {/* Top Row: Decay Curve & Factors */}
           <div className="flex-1 flex gap-4 min-h-0">
              {/* Degradation Curve */}
              <SciFiCard title="全生命周期健康度衰减曲线 (Degradation Model)" subtitle="HEALTH vs TIME" className="w-[60%] border-violet-900/50">
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={degradationData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                          <defs>
                             <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 9}} />
                          <YAxis yAxisId="left" stroke="#8b5cf6" tick={{fontSize: 9}} domain={[0, 100]} label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#8b5cf6', fontSize: 9 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 9}} domain={[0, 100]} label={{ value: 'Failure Prob %', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 9 }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #8b5cf6', fontSize: '10px'}} />
                          <ReferenceLine x={START_YEAR + currentYearOffset} stroke="#fff" strokeDasharray="3 3" label={{ value: 'Current Sim', fill: '#fff', fontSize: 10 }} />
                          <ReferenceLine yAxisId="left" y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Replace Limit', fill: '#f59e0b', fontSize: 10 }} />
                          <Area yAxisId="left" type="monotone" dataKey="health" stroke="#8b5cf6" fill="url(#colorHealth)" name="Health" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="failureProb" stroke="#ef4444" dot={false} strokeWidth={2} name="Failure Risk" />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>

              {/* Stress Factors Radar */}
              <SciFiCard title="寿命影响因子权重" subtitle="STRESSORS" className="flex-1 border-violet-900/50">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stressFactors}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Impact" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                       </RadarChart>
                    </ResponsiveContainer>
                    <div className="text-center text-[10px] text-slate-500 mt-[-10px]">
                       主要衰减源: <span className="text-amber-400 font-bold">空蚀磨损 (85%)</span>
                    </div>
                 </div>
              </SciFiCard>
           </div>

           {/* Bottom Row: Maintenance Schedule & Strategy */}
           <div className="h-44 flex gap-4">
              {/* Timeline */}
              <SciFiCard title="全寿命维护决策时间轴" subtitle="DECISION POINTS" className="flex-1 border-violet-900/50">
                 <div className="relative h-full flex items-center px-4 overflow-x-auto custom-scrollbar">
                    {/* Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
                    
                    <div className="flex gap-12 z-10 w-full min-w-max">
                       {maintenanceSuggestions.map((item, i) => {
                          const isPassed = (START_YEAR + currentYearOffset) > item.year;
                          return (
                             <div key={i} className={`flex flex-col items-center gap-2 group cursor-pointer ${isPassed ? 'opacity-50 grayscale' : ''}`}>
                                <div className={`text-[10px] font-mono ${item.status === 'critical' ? 'text-red-400' : 'text-violet-300'}`}>{item.year}</div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#0a0510] ${
                                   item.status === 'critical' ? 'border-red-500 bg-red-900/20' : 
                                   item.status === 'upcoming' ? 'border-emerald-500 bg-emerald-900/20 animate-pulse' : 'border-slate-600'
                                }`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'critical' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                </div>
                                <div className="text-center">
                                   <div className="text-xs font-bold text-white">{item.type}</div>
                                   <div className="text-[9px] text-slate-500">{item.action}</div>
                                </div>
                             </div>
                          );
                       })}
                       
                       {/* End of Life Marker */}
                       <div className="flex flex-col items-center gap-2 opacity-80">
                          <div className="text-[10px] font-mono text-slate-500">2045</div>
                          <div className="w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                             <AlertOctagon size={10} className="text-slate-500"/>
                          </div>
                          <div className="text-center">
                             <div className="text-xs font-bold text-slate-500">退役</div>
                             <div className="text-[9px] text-slate-600">EOL</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </SciFiCard>
              
              {/* Action Panel */}
              <div className="w-64 flex flex-col gap-3">
                 <SciFiCard title="数据服务与报告" className="flex-1 bg-violet-900/10 border-violet-800/30">
                    <div className="flex flex-col gap-2 h-full justify-center">
                       <button className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-violet-600/30 border border-slate-700 hover:border-violet-500 rounded transition-all group">
                          <div className="p-1.5 bg-violet-900/30 rounded text-violet-400 group-hover:text-white"><Wrench size={14}/></div>
                          <div className="text-left">
                             <div className="text-[10px] text-slate-300 font-bold">优化检修策略</div>
                             <div className="text-[8px] text-slate-500">基于 RUL 调整计划</div>
                          </div>
                          <ArrowRight size={12} className="ml-auto text-slate-600 group-hover:text-white"/>
                       </button>
                       <button className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 rounded transition-all group">
                          <div className="p-1.5 bg-emerald-900/30 rounded text-emerald-400 group-hover:text-white"><FileText size={14}/></div>
                          <div className="text-left">
                             <div className="text-[10px] text-slate-300 font-bold">导出评估报告</div>
                             <div className="text-[8px] text-slate-500">PDF / JSON 格式</div>
                          </div>
                          <ArrowRight size={12} className="ml-auto text-slate-600 group-hover:text-white"/>
                       </button>
                    </div>
                 </SciFiCard>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
