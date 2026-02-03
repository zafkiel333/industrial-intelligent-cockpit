import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/knowledge-manage/channel-shoal/ThreeScene';
import { ShoalSimMode } from '../../components/knowledge-manage/channel-shoal/three-types';
import { SciFiCard } from '../../components/SciFiCard';
// Add missing Zap and FileText imports
import { 
  Waves, Activity, Anchor, Ship, 
  Database, Compass, Ruler, Settings,
  AlertTriangle, CheckCircle2, Search,
  Navigation, Maximize2, Share2, Filter,
  History, Droplets, Target, Wind,
  Zap, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, BarChart, Bar, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- 模拟数据 ---
const EVOLUTION_TIMELINE = [
  { year: '2000', depth: -4.2, vol: 450, risk: 'Low' },
  { year: '2005', depth: -3.8, vol: 580, risk: 'Low' },
  { year: '2010', depth: -3.2, vol: 820, risk: 'Med' },
  { year: '2015', depth: -2.5, vol: 1250, risk: 'High' },
  { year: '2020', depth: -1.8, vol: 1840, risk: 'Critical' },
  { year: '2024', depth: -1.2, vol: 2450, risk: 'Critical' },
];

const CROSS_SECTION_DATA = Array.from({length: 40}, (_, i) => ({
    dist: i * 5,
    actual: 8 + Math.sin(i * 0.4) * 3 - (i > 15 && i < 25 ? 6 : 0),
    design: 8.5
}));

const DREDGE_EFFICIENCY = [
  { subject: '绞吸式', A: 95, fullMark: 100 },
  { subject: '耙吸式', A: 85, fullMark: 100 },
  { subject: '抓斗式', A: 60, fullMark: 100 },
  { subject: '铲斗式', A: 75, fullMark: 100 },
  { subject: '爆破开挖', A: 40, fullMark: 100 },
];

export const ChannelShoalDredgingKbView: React.FC = () => {
  const [simMode, setSimMode] = useState<ShoalSimMode>('EVOLUTION');
  const [activeYear, setActiveYear] = useState('2024');
  const [logs, setLogs] = useState<string[]>(['[System] 航道数字孪生系统在线', '[Info] 正在加载 B-42 浅滩段多波束扫测数据...']);

  // 模拟日志
  useEffect(() => {
    const interval = setInterval(() => {
        const msgs = [
            '监测到左岸崩岸风险指数上升 +0.02',
            '疏浚土方量估算完成：45.2万方',
            '水位变动系数同步中: 1.15m (Rising)',
            '河床底部切应力分布已重构'
        ];
        addLog(msgs[Math.floor(Math.random()*msgs.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 relative overflow-hidden">
      
      {/* --- 全景光效背景 --- */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(14,165,233,0.05)_0%,_transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full"></div>
      </div>

      {/* --- 顶部 HUD 概览 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-xl flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-xl"></div>
             <Waves size={36} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Navigation size={12} /> Channel Bathymetry Engine
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               航道浅滩演变 <span className="text-blue-500 italic">& 疏浚知识库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">碍航区段数</div>
              <div className="text-3xl font-mono font-black text-white leading-none">14 <span className="text-xs text-red-500 font-normal">CRITICAL</span></div>
           </div>
           <div className="text-right border-l border-slate-800 pl-10">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">年度疏浚土方量</div>
              <div className="text-3xl font-mono font-black text-cyan-400 leading-none">425.8 <span className="text-xs font-normal text-slate-600">k m³</span></div>
           </div>
           <div className="text-right border-l border-slate-800 pl-10">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">通航保证率</div>
              <div className="text-3xl font-mono font-black text-green-400 leading-none">98.2%</div>
           </div>
        </div>
      </header>

      {/* --- 主体交互区 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* 左侧：演变矩阵 */}
        <section className="w-[360px] flex flex-col gap-4">
           <SciFiCard title="浅滩历史演变矩阵" subtitle="EVOLUTION MATRIX" className="flex-1 border-blue-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {EVOLUTION_TIMELINE.map((item) => (
                    <div 
                      key={item.year}
                      onClick={() => setActiveYear(item.year)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative group
                        ${activeYear === item.year ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-white group-hover:text-blue-400">{item.year}年度断面</span>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-black 
                              ${item.risk === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                {item.risk}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                            <div className="flex flex-col">
                                <span className="text-slate-600 uppercase">Min Depth</span>
                                <span className="text-white text-sm font-bold">{item.depth}m</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-slate-600 uppercase">Volume</span>
                                <span className="text-cyan-400 text-sm font-bold">{item.vol}k m³</span>
                            </div>
                        </div>
                        {activeYear === item.year && (
                            <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full"></div>
                        )}
                    </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="流场动力分析" subtitle="HYDRODYNAMICS" className="h-[220px] border-blue-900/30">
               <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">平均流速</div>
                          <div className="text-lg font-bold text-white">1.45 <span className="text-[10px] font-normal text-slate-500">m/s</span></div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">底部剪切力</div>
                          <div className="text-lg font-bold text-white">12.5 <span className="text-[10px] font-normal text-slate-500">Pa</span></div>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">泥沙输运饱和度</span>
                          <span className="text-blue-400">82%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[82%]"></div>
                      </div>
                  </div>
               </div>
           </SciFiCard>
        </section>

        {/* 中央：3D 全息河床 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0 relative">
           <div className="flex-1 bg-black border border-white/5 rounded-3xl overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
              <ThreeScene mode={simMode} />
              
              {/* 3D 浮层 HUD */}
              <div className="absolute top-6 left-6 pointer-events-none z-20">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-blue-500 p-5 rounded shadow-2xl flex flex-col">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Target size={14} /> Holographic Bathymetry View
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase">{simMode} MODE</h2>
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                       <div>
                          <span className="text-[9px] text-slate-500 uppercase">Scan Confidence</span>
                          <div className="text-lg font-mono text-white">99.2%</div>
                       </div>
                       <div>
                          <span className="text-[9px] text-slate-500 uppercase">Data Sources</span>
                          <div className="text-lg font-mono text-white">MBES / LiDAR</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 模式选择 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full p-2 gap-2 shadow-2xl z-20">
                  {[
                    { id: 'EVOLUTION', label: '演变模拟', icon: <History size={14}/> },
                    { id: 'DREDGING', label: '疏浚作业', icon: <Anchor size={14}/> },
                    { id: 'ANALYSIS', label: '剖面分析', icon: <Maximize2 size={14}/> },
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSimMode(m.id as any)}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2
                        ${simMode === m.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-transparent text-slate-500 hover:text-slate-300'}
                      `}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
              </div>

              {/* 右下角：地理坐标 */}
              <div className="absolute bottom-8 right-8 text-right font-mono text-[10px] text-slate-500 pointer-events-none">
                  <div>LAT: 30.5842° N</div>
                  <div>LON: 114.2714° E</div>
                  <div className="text-blue-400 mt-1">REF: WGS84-GEO-42</div>
              </div>
           </div>

           {/* 底部：横断面示波分析 */}
           <div className="h-[200px] bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-6 overflow-hidden shadow-inner">
               <div className="flex-1 flex flex-col">
                  <div className="text-[10px] text-slate-500 uppercase font-black mb-2 flex items-center gap-2">
                    <Ruler size={12} /> Cross-Section Profile (桩号 K42+500)
                  </div>
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={CROSS_SECTION_DATA}>
                            <defs>
                                <linearGradient id="bedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="dist" hide />
                            <YAxis stroke="#475569" tick={{fontSize: 10}} reversed />
                            <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                            <Area type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} fill="url(#bedGrad)" />
                            <Line type="step" dataKey="design" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
                         </AreaChart>
                      </ResponsiveContainer>
                  </div>
               </div>
               <div className="w-[220px] border-l border-slate-800 pl-6 flex flex-col justify-center gap-4">
                   <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">浅点最小水深</div>
                       <div className="text-2xl font-mono font-bold text-red-500 tracking-tighter">1.15 <span className="text-xs">m</span></div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">设计通航深度</div>
                       <div className="text-2xl font-mono font-bold text-white tracking-tighter">4.50 <span className="text-xs">m</span></div>
                   </div>
               </div>
           </div>
        </section>

        {/* 右侧：疏浚方案与效能 */}
        <section className="w-[340px] flex flex-col gap-4">
           <SciFiCard title="疏浚设备效能对比" subtitle="DREDGING SPECS" className="h-[280px] border-blue-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DREDGE_EFFICIENCY}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Efficiency" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="智能疏浚决策" subtitle="AI ADVISORY" className="flex-1 border-blue-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl">
                       <div className="flex items-center gap-2 mb-2">
                           <Zap size={14} className="text-yellow-400" />
                           <span className="text-xs font-bold text-blue-200">推荐工艺: 绞吸式施工</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          "基于河床底部沉积物 analysis，该区域主要为中粗砂。建议使用 4500m³/h 绞吸船，配合 1.2km 排泥管至 14# 弃土区，预计可减少 15% 回淤率。"
                       </p>
                   </div>

                   <div className="space-y-3">
                      <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1">工况适配检测</div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">底质硬度系数</span>
                          <span className="text-green-400 font-mono">f=1.2 (Soft)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">排泥距离评估</span>
                          <span className="text-yellow-400 font-mono">Moderate</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">环保敏感度</span>
                          <span className="text-red-400 font-mono">HIGH</span>
                      </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                       <FileText size={14} /> 生成完整疏浚施工方案
                   </button>
               </div>
           </SciFiCard>

           {/* 实时通讯日志 */}
           <div className="h-[120px] bg-slate-900/40 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
               <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                   <span>System Logs</span>
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className="text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
                           {log}
                       </div>
                   ))}
               </div>
           </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .text-shadow-glow { text-shadow: 0 0 15px rgba(59,130,246,0.5); }
      `}</style>
    </div>
  );
};
