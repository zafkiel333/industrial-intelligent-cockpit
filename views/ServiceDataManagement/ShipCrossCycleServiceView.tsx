
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipCrossCycleThreeScene } from '../../components/ServiceDataManagement/ShipCrossCycle/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-13]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-13';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter
} from 'recharts';
import { 
  History, Clock, TrendingUp, DollarSign, Award, 
  FileText, Anchor, PenTool, AlertTriangle, CheckCircle, 
  CalendarDays, Recycle, ArrowRight, Play, Pause, SkipForward
} from 'lucide-react';

export const ShipCrossCycleServiceView: React.FC = () => {
  const [year, setYear] = useState(12); // Current ship age
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRetrofit, setShowRetrofit] = useState(true);

  // Mock Data
  const valuationData = Array.from({length: 30}, (_, i) => ({
    year: i,
    marketValue: Math.max(5, 100 * Math.pow(0.92, i)), // Exponential decay
    scrapValue: 15 + i * 0.5, // Steel price fluctuation trend
    retrofitValue: i > 10 ? 100 * Math.pow(0.92, i) + 15 : null // Value bump after retrofit
  }));

  const thicknessData = Array.from({length: 30}, (_, i) => ({
    year: i,
    actual: 22 - (i * 0.15) - (Math.random() * 0.1), // mm
    limit: 16 // replacement limit
  }));

  const events = [
    { year: 0, title: '交付运营', type: 'milestone' },
    { year: 5, title: '第1次特检 (SS1)', type: 'survey' },
    { year: 10, title: '第2次特检 (SS2)', type: 'survey' },
    { year: 12, title: '脱硫塔改造', type: 'retrofit' },
    { year: 15, title: '第3次特检 (SS3)', type: 'survey' },
    { year: 20, title: '第4次特检 (SS4)', type: 'survey' },
    { year: 25, title: '退役拆解评估', type: 'end' },
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setYear(prev => (prev >= 30 ? 0 : prev + 0.5));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentEvent = events.find(e => Math.abs(e.year - year) < 1);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0f172a] p-2 overflow-hidden select-none">
      
      {/* 顶部：资产全生命周期概览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/40 via-blue-950/40 to-transparent border-b border-amber-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-amber-600/20 border border-amber-500/40 rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.2)]">
              <History className="text-amber-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">航运装备跨周期服役服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-amber-200/70 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-2"><Anchor size={12}/> HULL_ID: N9982-VLCC</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Clock size={12}/> SERVICE AGE: {year.toFixed(1)} YEARS</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">LIFECYCLE STATUS: ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Current Valuation</div>
              <div className="text-xl font-mono font-black text-amber-400">$ {(100 * Math.pow(0.92, year)).toFixed(1)} M</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Total Distance</div>
              <div className="text-xl font-mono font-black text-blue-400">{(year * 8.5).toFixed(1)}k <span className="text-xs text-slate-600">NM</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：数字履历与合规 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Timeline Events */}
           <SciFiCard title="船舶数字履历" subtitle="TIMELINE" className="flex-1 overflow-hidden border-amber-900/50">
              <div className="relative h-full overflow-y-auto custom-scrollbar pr-2 pl-4 border-l border-slate-800 ml-2">
                 {events.map((ev, i) => {
                    const isPast = year >= ev.year;
                    const isCurrent = Math.abs(year - ev.year) < 1;
                    return (
                        <div key={i} className={`mb-6 relative ${isPast ? 'opacity-100' : 'opacity-40'}`}>
                           <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                               isCurrent ? 'bg-amber-500 border-amber-300 shadow-[0_0_10px_orange] scale-125' : 
                               isPast ? 'bg-blue-500 border-blue-900' : 'bg-slate-800 border-slate-600'
                           }`}></div>
                           <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-slate-300'}`}>Year {ev.year}</span>
                              <span className="text-[9px] px-1.5 rounded bg-slate-900 text-slate-500 border border-slate-800">{ev.type}</span>
                           </div>
                           <div className="text-sm font-bold text-white">{ev.title}</div>
                           <div className="text-[10px] text-slate-500 mt-1">数据包 ID: #ARC-{2024+ev.year}-00{i}</div>
                        </div>
                    );
                 })}
              </div>
           </SciFiCard>

           {/* Compliance Status */}
           <SciFiCard title="合规性档案" subtitle="CERTIFICATES" className="border-amber-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                    <div className="flex items-center gap-2">
                       <Award size={16} className="text-yellow-500" />
                       <div>
                          <div className="text-xs text-white font-bold">Class Certificate</div>
                          <div className="text-[9px] text-slate-500">Valid until: {2024 + Math.floor(year) + 5}-05</div>
                       </div>
                    </div>
                    <CheckCircle size={14} className="text-green-500" />
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                    <div className="flex items-center gap-2">
                       <FileText size={16} className="text-blue-500" />
                       <div>
                          <div className="text-xs text-white font-bold">IAPP Certificate</div>
                          <div className="text-[9px] text-slate-500">EEXI / CII Compliant</div>
                       </div>
                    </div>
                    <CheckCircle size={14} className="text-green-500" />
                 </div>
                 
                 <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
                    <AlertTriangle size={12} className="text-amber-500" /> Next Special Survey in {(5 - (year % 5)).toFixed(1)} years
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：时空孪生与演化 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0c0a09] to-[#020617] border border-amber-500/20 rounded-2xl relative overflow-hidden group">
              {/* HUD: Time Control */}
              <div className="absolute top-6 left-6 z-10">
                 <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 p-4 rounded-xl shadow-2xl">
                    <div className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">Timeline Simulation</div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                       Year {year.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 30</span>
                    </div>
                    {currentEvent && (
                        <div className="mt-2 px-2 py-1 bg-amber-900/40 border border-amber-500/50 rounded text-amber-200 text-xs font-bold animate-pulse">
                           EVENT: {currentEvent.title}
                        </div>
                    )}
                 </div>
              </div>

              {/* 3D Scene */}
              <ShipCrossCycleThreeScene currentYear={year} showRetrofit={showRetrofit} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-3">
                 
                 {/* Slider */}
                 <div className="w-full h-12 bg-black/40 backdrop-blur border border-slate-700 rounded-lg flex items-center px-4 gap-4">
                    <button 
                       onClick={() => setIsPlaying(!isPlaying)}
                       className="text-amber-400 hover:text-white transition-colors"
                    >
                       {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <input 
                       type="range" min="0" max="30" step="0.1" 
                       value={year}
                       onChange={(e) => setYear(parseFloat(e.target.value))}
                       className="flex-1 accent-amber-500 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer"
                    />
                    
                    <span className="text-xs font-mono text-slate-300 w-12 text-right">{year.toFixed(1)}Y</span>
                 </div>

                 {/* Toggles */}
                 <div className="flex justify-center gap-4">
                    <button 
                       onClick={() => setShowRetrofit(!showRetrofit)}
                       className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                          showRetrofit ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'bg-slate-900/50 border-slate-600 text-slate-400'
                       }`}
                    >
                       <Recycle size={12} /> 显示技改方案 (Retrofit)
                    </button>
                 </div>
              </div>
           </div>

           {/* Performance Decay Chart */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    <TrendingUp size={14} /> Performance Degradation Model
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={thicknessData}>
                       <defs>
                          <linearGradient id="colorThick" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis domain={[14, 24]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Plate mm', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <ReferenceLine x={year} stroke="#fff" strokeDasharray="3 3" />
                       <ReferenceLine y={16} stroke="red" strokeDasharray="3 3" label={{ value: 'Replace Limit', fill: 'red', fontSize: 9 }} />
                       <Area type="monotone" dataKey="actual" stroke="#d97706" fill="url(#colorThick)" name="Hull Thickness" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：价值评估与决策 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Asset Valuation */}
           <SciFiCard title="资产价值评估" subtitle="VALUATION" className="flex-1 border-amber-900/50">
              <div className="h-48 w-full mb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valuationData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                       <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} width={30} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706', fontSize: '10px'}} />
                       <ReferenceLine x={year} stroke="#fff" />
                       <Line type="monotone" dataKey="marketValue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Market Val" />
                       <Line type="monotone" dataKey="scrapValue" stroke="#64748b" strokeWidth={1} dot={false} name="Scrap Val" />
                       <Line type="monotone" dataKey="retrofitValue" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="w/ Retrofit" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center">
                 <div className="text-[10px] text-slate-500 uppercase">Retrofit ROI Analysis</div>
                 <div className="text-sm text-white mt-1">
                    预计改造投资 <span className="text-amber-400">$2.5M</span>，回收期 <span className="text-green-400">3.2 年</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Maintenance Strategy */}
           <SciFiCard title="延寿服务决策" subtitle="LIFE EXTENSION" className="border-amber-900/50">
              <div className="space-y-3">
                 <div className="flex gap-3 p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer">
                    <div className="mt-1"><Recycle size={16} className="text-emerald-500" /></div>
                    <div>
                       <div className="text-xs font-bold text-white">加装节能装置 (ESD)</div>
                       <div className="text-[9px] text-slate-400">预期降低油耗 5-8%，提升 CII 评级至 B+</div>
                    </div>
                 </div>
                 <div className="flex gap-3 p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer">
                    <div className="mt-1"><PenTool size={16} className="text-blue-500" /></div>
                    <div>
                       <div className="text-xs font-bold text-white">船体结构加强</div>
                       <div className="text-[9px] text-slate-400">针对高应力区 (Midship) 进行局部换板，延长结构寿命 5 年</div>
                    </div>
                 </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 rounded text-[10px] text-amber-200 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <DollarSign size={12} /> 生成资产处置报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
