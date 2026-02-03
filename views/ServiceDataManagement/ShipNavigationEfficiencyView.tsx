
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipNavigationThreeScene } from '../../components/ServiceDataManagement/ShipNavigation/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { 
  Navigation, Wind, Droplets, Zap, Anchor, 
  Map as MapIcon, Compass, Gauge, TrendingDown, 
  Activity, AlertTriangle, Leaf, Ship, LocateFixed
} from 'lucide-react';

export const ShipNavigationEfficiencyView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('wind-vec');
  const [navState, setNavState] = useState({
    heading: 145,
    speed: 18.2, // kn
    roll: 1.2,
    pitch: 0.5,
    rudder: 0,
    eta: '2024-06-12 08:00 UTC',
    dtg: 1240, // Distance to Go (nm)
    fuelRate: 2.4, // t/h
    ciiRating: 'B', // Carbon Intensity Indicator
    eexi: 4.8 // gCO2/t.nm
  });

  // Mock Data
  const ciiTrend = [
    { year: 2020, val: 5.2, limit: 6.0 },
    { year: 2021, val: 5.0, limit: 5.8 },
    { year: 2022, val: 4.9, limit: 5.6 },
    { year: 2023, val: 4.8, limit: 5.4 },
    { year: 2024, val: 4.8, limit: 5.2 }, // Current
  ];

  const sfocCurve = Array.from({length: 20}, (_, i) => {
      const load = 10 + i * 5; // 10% to 105%
      // Bathtub curveish
      const sfoc = 180 + Math.pow(load - 80, 2) * 0.05 + Math.random();
      return { load, sfoc };
  });

  const voyageLog = [
    { time: '12:00', event: '进入排放控制区 (ECA)', type: 'alert' },
    { time: '11:45', event: '接收气象导航建议：航向 +2°', type: 'info' },
    { time: '10:30', event: '纵倾优化系统激活：-0.5m', type: 'success' },
    { time: '09:15', event: '主机负荷限制模式启动', type: 'warning' }
  ];

  // Simulation
  useEffect(() => {
    const timer = setInterval(() => {
        setNavState(prev => ({
            ...prev,
            speed: 18.2 + Math.sin(Date.now()/2000) * 0.2,
            roll: Math.sin(Date.now()/1500) * 2,
            pitch: Math.sin(Date.now()/2500) * 1,
            fuelRate: 2.4 + Math.random() * 0.05
        }));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 全景导航指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 rounded-2xl shadow-lg relative overflow-hidden">
         {/* 背景扫描线 */}
         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] w-[200%] animate-[slide_4s_linear_infinite]"></div>
         
         <div className="flex items-center gap-6 z-10">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <Ship size={32} className="text-cyan-400" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-wide text-white uppercase italic drop-shadow-md">船舶航行状态与能效服务数据管理</h1>
               <div className="flex items-center gap-6 mt-1 text-[11px] font-mono text-cyan-200/70 tracking-widest">
                  <span className="flex items-center gap-2"><Anchor size={12}/> VESSEL: ATLANTIC_VOYAGER_09</span>
                  <span>|</span>
                  <span className="flex items-center gap-2"><MapIcon size={12}/> ROUTE: CNSHA -&gt NLRTM</span>
                  <span>|</span>
                  <span className="text-emerald-400 font-bold">STATUS: UNDERWAY_USING_ENGINE</span>
               </div>
            </div>
         </div>

         <div className="flex gap-8 z-10">
            <div className="text-right">
               <div className="text-[10px] text-slate-400 uppercase font-bold">Distance To Go</div>
               <div className="text-2xl font-mono font-black text-white">{navState.dtg.toFixed(1)} <span className="text-sm font-normal text-slate-500">NM</span></div>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="text-right">
               <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Time Arrival</div>
               <div className="text-xl font-mono font-bold text-cyan-400">{navState.eta}</div>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
         
         {/* 左侧：航行态势与气象 */}
         <div className="w-full lg:w-[26%] flex flex-col gap-4">
            
            {/* 实时航行参数卡片 */}
            <SciFiCard title="航行姿态遥测" subtitle="TELEMETRY" className="bg-slate-900/40">
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50"></div>
                     <Compass size={20} className="mx-auto text-cyan-500 mb-2 group-hover:rotate-45 transition-transform" />
                     <div className="text-[10px] text-slate-500 uppercase">航向 (COG)</div>
                     <div className="text-2xl font-mono font-bold text-white">{navState.heading}°</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                     <Gauge size={20} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                     <div className="text-[10px] text-slate-500 uppercase">航速 (SOG)</div>
                     <div className="text-2xl font-mono font-bold text-white">{navState.speed.toFixed(1)} kn</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
                     <Activity size={20} className="mx-auto text-purple-500 mb-2" />
                     <div className="text-[10px] text-slate-500 uppercase">横摇 (ROLL)</div>
                     <div className="text-xl font-mono font-bold text-white">{Math.abs(navState.roll).toFixed(1)}°</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50"></div>
                     <TrendingDown size={20} className="mx-auto text-orange-500 mb-2" />
                     <div className="text-[10px] text-slate-500 uppercase">纵摇 (PITCH)</div>
                     <div className="text-xl font-mono font-bold text-white">{Math.abs(navState.pitch).toFixed(1)}°</div>
                  </div>
               </div>
               
               <div className="p-3 border border-dashed border-slate-700 rounded-lg bg-slate-900/20">
                  <div className="flex justify-between items-center text-xs mb-2">
                     <span className="text-slate-400 flex items-center gap-2"><Wind size={14} /> 相对风速</span>
                     <span className="text-cyan-300 font-mono">12.5 m/s</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 flex items-center gap-2"><Droplets size={14} /> 浪高监测</span>
                     <span className="text-blue-300 font-mono">2.8 m</span>
                  </div>
               </div>
            </SciFiCard>

            {/* 气象导航建议 */}
            <SciFiCard title="智能气象导航建议" subtitle="WEATHER ROUTING" className="flex-1">
               <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-lg mb-3">
                     <LocateFixed size={24} className="text-indigo-400 shrink-0" />
                     <div>
                        <div className="text-xs font-bold text-indigo-200 uppercase mb-1">航线优化建议 #8802</div>
                        <div className="text-[10px] text-slate-400 leading-relaxed">
                           前方 200 海里处生成低压气旋，建议航向调整至 148° 以规避 4m 以上浪区，预计增加航程 12 海里，但节省燃油 1.5%。
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 overflow-hidden relative rounded-lg border border-slate-700 bg-slate-950">
                     {/* 模拟地图路径 */}
                     <svg className="w-full h-full opacity-60" viewBox="0 0 200 100">
                        <path d="M 20 80 Q 100 20 180 50" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                        <path d="M 20 80 Q 100 40 180 50" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                        <circle cx="20" cy="80" r="3" fill="white" />
                        <circle cx="180" cy="50" r="3" fill="#0ea5e9" />
                        <text x="100" y="30" fill="#ef4444" fontSize="8">STORM</text>
                        <circle cx="100" cy="20" r="15" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                     </svg>
                     <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[9px] text-cyan-400 border border-cyan-900">
                        ETA 偏差: +45min
                     </div>
                  </div>
               </div>
            </SciFiCard>
         </div>

         {/* 中间：3D数字孪生与航行日志 */}
         <div className="w-full lg:w-[48%] flex flex-col gap-4">
            <div className="flex-1 bg-gradient-to-b from-[#082f49]/20 to-[#020617] border border-cyan-500/20 rounded-3xl relative overflow-hidden group">
               {/* 3D 场景 */}
               <ShipNavigationThreeScene 
                  heading={navState.heading}
                  speed={navState.speed}
                  roll={navState.roll}
                  pitch={navState.pitch}
                  rudderAngle={navState.rudder}
                  activeNodeId={activeNode}
                  onNodeSelect={setActiveNode}
               />

               {/* 悬浮HUD */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-xl shadow-2xl">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">LIVE DATA LINK</span>
                     </div>
                     <div className="text-[10px] text-slate-400 font-mono">
                        {activeNode === 'wind-vec' ? '正在监测: 相对风矢量' : 
                         activeNode === 'curr-vec' ? '正在监测: 洋流矢量' : 
                         activeNode === 'prop-sens' ? '正在监测: 推进轴系负荷' : '正在监测: 船体运动响应'}
                     </div>
                  </div>
               </div>

               {/* 底部能效标签 */}
               <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                  <div className="px-4 py-2 bg-emerald-900/80 backdrop-blur border border-emerald-500/40 rounded-lg flex items-center gap-3 shadow-lg">
                     <Leaf className="text-emerald-400" size={18} />
                     <div>
                        <div className="text-[9px] text-emerald-200 uppercase font-bold">EEXI 合规性</div>
                        <div className="text-sm font-mono font-bold text-white">4.8 gCO₂/t.nm (Pass)</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 航行事件日志 */}
            <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
               <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                     <Navigation size={14} /> 航行与能效事件日志 (Voyage Log)
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">LOG_ID: VOY-2024-05A</div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                  {voyageLog.map((log, i) => (
                     <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors items-center">
                        <span className="text-slate-600 w-12">[{log.time}]</span>
                        <div className={`w-2 h-2 rounded-full ${
                           log.type === 'alert' ? 'bg-red-500' : 
                           log.type === 'warning' ? 'bg-amber-500' : 
                           log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-slate-300 flex-1">{log.event}</span>
                        <button className="text-cyan-600 hover:text-cyan-400">详情</button>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 右侧：能效CII与燃油经济性 */}
         <div className="w-full lg:w-[26%] flex flex-col gap-4">
            
            {/* CII 评级看板 */}
            <SciFiCard title="碳强度指标 (CII) 管理" subtitle="CARBON INTENSITY">
               <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-800/50">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                     {/* 动态圆环 */}
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#facc15" strokeWidth="8" strokeDasharray="351" strokeDashoffset="100" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 leading-none">B</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Rating</div>
                     </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 text-center w-3/4">
                     当前航次 CII 预估值优于年度基线 4.2%，保持航速 &lt; 18.5kn 可维持 B 级。
                  </div>
               </div>
               
               <div className="h-32 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={ciiTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 9}} />
                        <YAxis hide domain={[0, 8]} />
                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', border: 'none', fontSize: '10px'}} />
                        <Bar dataKey="val" fill="#facc15" radius={[2, 2, 0, 0]} barSize={12} name="Actual" />
                        <Bar dataKey="limit" fill="#334155" radius={[2, 2, 0, 0]} barSize={12} name="Limit" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </SciFiCard>

            {/* 燃油经济性 SFOC */}
            <SciFiCard title="主机燃油消耗特性 (SFOC)" subtitle="ECONOMY" className="flex-1">
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={sfocCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="load" type="number" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load %', position: 'insideBottom', offset: -5, fontSize: 10 }} domain={[0, 100]} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[170, 220]} label={{ value: 'g/kWh', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#3b82f6', fontSize: '10px'}} />
                        <ReferenceLine x={85} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Current', fill: '#10b981', fontSize: 9 }} />
                        <Line type="monotone" dataKey="sfoc" stroke="#3b82f6" strokeWidth={2} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-blue-950/20 p-2 rounded border border-blue-900/30">
                     <div className="text-[9px] text-slate-500 uppercase">瞬时油耗</div>
                     <div className="text-lg font-mono font-bold text-blue-300">{navState.fuelRate.toFixed(2)} t/h</div>
                  </div>
                  <div className="bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                     <div className="text-[9px] text-slate-500 uppercase">滑失率 (Slip)</div>
                     <div className="text-lg font-mono font-bold text-emerald-300">-2.5%</div>
                  </div>
               </div>
            </SciFiCard>

         </div>

      </div>
    </div>
  );
};
