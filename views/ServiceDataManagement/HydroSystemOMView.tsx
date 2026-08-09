
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroSystemThreeScene } from '../../components/ServiceDataManagement/HydroSystem/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-2]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-2';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, Cell
} from 'recharts';
import { 
  Zap, Droplets, Activity, RotateCw, Wind, 
  Thermometer, AlertTriangle, Settings, Disc, 
  ArrowUpRight, Gauge, Layers, Search
} from 'lucide-react';

export const HydroSystemOMView: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('bearing-upper');
  const [unitState, setUnitState] = useState({
    activePower: 605.2, // MW
    reactivePower: 82.5, // MVar
    head: 215.4, // m
    flow: 320.1, // m3/s
    rpm: 142.8, // Rated 142.8
    guideVane: 85.0, // %
    efficiency: 94.2 // %
  });

  // Mock Data: Shaft Runout Orbit (Upper Guide)
  const orbitData = Array.from({length: 72}, (_, i) => {
      const angle = (i * 5) * Math.PI / 180;
      // Elliptical with noise
      const r = 0.12 + Math.cos(angle * 2) * 0.02 + Math.random() * 0.01;
      return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
  });

  // Mock Data: Air Gap (360 degrees)
  const airGapData = Array.from({length: 24}, (_, i) => ({
      angle: i * 15,
      gapTop: 12 + Math.sin(i*0.5) * 0.5,
      gapBottom: 11.8 + Math.cos(i*0.5) * 0.6,
      limit: 10
  }));

  // Mock Data: Stator Temp Heatmap (Slots)
  const statorTemps = Array.from({length: 30}, (_, i) => ({
      slot: i+1,
      temp: 80 + Math.random() * 10 + (i > 10 && i < 15 ? 15 : 0) // Hotspot
  }));

  const omLogs = [
    { time: '10:45', event: '上导轴承油温梯度异常 (+0.5°C/min)', type: 'warning' },
    { time: '10:30', event: 'AGC 负荷指令响应完成', type: 'info' },
    { time: '09:15', event: '定子绝缘局放监测正常', type: 'success' },
    { time: '08:00', event: '冷却水系统自动反冲洗启动', type: 'info' },
  ];

  const componentDetails: Record<string, any> = {
    'stator': { title: '发电机定子', kpi1: 'Max Temp: 98°C', kpi2: 'Insulation: 2GΩ', status: 'Normal' },
    'rotor': { title: '发电机转子', kpi1: 'Air Gap Avg: 12mm', kpi2: 'Vib: 0.05mm', status: 'Normal' },
    'bearing-upper': { title: '上导轴承', kpi1: 'Oil Temp: 62°C', kpi2: 'Vib X/Y: 0.15mm', status: 'Warning' },
    'shaft': { title: '主轴系统', kpi1: 'Runout: 0.18mm', kpi2: 'Seal Leak: 2L/min', status: 'Normal' },
    'bearing-lower': { title: '水导轴承', kpi1: 'Oil Temp: 58°C', kpi2: 'Vib: 0.08mm', status: 'Normal' },
    'runner': { title: '水轮机转轮', kpi1: 'Cavitation: Low', kpi2: 'Pressure: 2.1MPa', status: 'Normal' },
    'volute': { title: '蜗壳/座环', kpi1: 'Inlet Press: 2.4MPa', kpi2: 'Diff Press: 0.1MPa', status: 'Normal' },
  };

  useEffect(() => {
    const timer = setInterval(() => {
        setUnitState(prev => ({
            ...prev,
            activePower: 605 + Math.sin(Date.now()/5000) * 5,
            rpm: 142.8 + (Math.random()-0.5) * 0.1,
            flow: 320 + Math.sin(Date.now()/3000) * 2
        }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020409] p-2 overflow-hidden select-none">
      
      {/* 顶部：机组总览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-transparent border-b border-cyan-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/40 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <RotateCw className="text-cyan-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">水轮机与发电机系统运维服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-2"><Zap size={12}/> UNIT-02: FRANCIS_700MW</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Activity size={12}/> MODE: GRID_CONNECTED</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">HEALTH: 92.4%</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Active Power</div>
              <div className="text-xl font-mono font-black text-white">{unitState.activePower.toFixed(1)} <span className="text-xs text-slate-500">MW</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Net Head</div>
              <div className="text-xl font-mono font-black text-cyan-400">{unitState.head.toFixed(1)} <span className="text-xs text-slate-500">m</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：机械健康特征 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Shaft Orbit */}
           <SciFiCard title="主轴摆度轨迹 (Orbit)" subtitle="GUIDE BEARING" className="bg-[#0a101f]/80 border-blue-900/50">
              <div className="h-56 w-full relative flex items-center justify-center">
                 {/* Background Target */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-32 h-32 rounded-full border border-blue-500"></div>
                    <div className="w-16 h-16 rounded-full border border-blue-500"></div>
                    <div className="w-full h-[1px] bg-blue-800"></div>
                    <div className="h-full w-[1px] bg-blue-800"></div>
                 </div>
                 
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                       <XAxis type="number" dataKey="x" domain={[-0.2, 0.2]} hide />
                       <YAxis type="number" dataKey="y" domain={[-0.2, 0.2]} hide />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020409', border: '1px solid #3b82f6', fontSize: '10px'}} />
                       <Scatter name="Orbit" data={orbitData} fill="#f59e0b" line={{stroke: '#f59e0b', strokeWidth: 1}} lineType="fitting" />
                    </ScatterChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-2 right-2 text-[9px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-bold">X p-p: 0.28mm</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Air Gap */}
           <SciFiCard title="发电机气隙监测" subtitle="AIR GAP" className="flex-1 border-blue-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={airGapData}>
                       <PolarGrid stroke="#1e3a8a" />
                       <PolarAngleAxis dataKey="angle" tick={false} />
                       <PolarRadiusAxis angle={30} domain={[8, 14]} tick={false} axisLine={false} />
                       <Radar name="Top Gap" dataKey="gapTop" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                       <Radar name="Bot Gap" dataKey="gapBottom" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                       <Radar name="Limit" dataKey="limit" stroke="#ef4444" strokeDasharray="3 3" fill="transparent" />
                       <Tooltip contentStyle={{backgroundColor: '#020409', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-1 text-[10px] text-slate-400">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> 上部气隙</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> 下部气隙</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-1 bg-red-500"></div> 报警线</span>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息机组孪生 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#082f49]/30 to-[#020409] border border-cyan-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(6,182,212,0.1)]">
              {/* HUD: Component Details */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-blue-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-blue-500/20 pb-2 mb-2">
                       <Search className="text-cyan-400" size={16} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Node</div>
                          <div className="text-sm font-black text-white uppercase">{componentDetails[activeComponent]?.title}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono">
                       <div>{componentDetails[activeComponent]?.kpi1}</div>
                       <div>{componentDetails[activeComponent]?.kpi2}</div>
                       <div className="mt-1 pt-1 border-t border-white/10 flex justify-between">
                          <span>状态评估</span>
                          <span className={componentDetails[activeComponent]?.status === '正常' ? 'text-green-400' : 'text-yellow-400'}>{componentDetails[activeComponent]?.status}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* HUD: Real-time Params */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-none">
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <RotateCw className="text-white" size={14} />
                    <span className="text-xs font-mono text-white">{unitState.rpm.toFixed(2)} RPM</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Droplets className="text-cyan-400" size={14} />
                    <span className="text-xs font-mono text-white">{unitState.flow.toFixed(1)} m³/s</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Wind className="text-emerald-400" size={14} />
                    <span className="text-xs font-mono text-white">GV: {unitState.guideVane.toFixed(1)} %</span>
                 </div>
              </div>

              <HydroSystemThreeScene
                 rpm={unitState.rpm}
                 wicketGateOpening={unitState.guideVane}
                 waterFlow={unitState.flow}
                 activeNodeId={activeComponent}
                 onNodeSelect={setActiveComponent}
              />
              <div className="absolute bottom-4 left-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                 <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-[10px] font-bold shadow-lg transition-all flex items-center gap-2">
                    <Settings size={12} /> 启动专家诊断
                 </button>
              </div>
           </div>

           {/* O&M Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Layers size={14} /> System O&M Logs
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {omLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                       <span className="text-slate-500">{log.time}</span>
                       <span className={`font-bold ${
                          log.type === 'warning' ? 'text-amber-500' : 
                          log.type === 'success' ? 'text-green-500' : 'text-blue-400'
                       }`}>[{log.type.toUpperCase()}]</span>
                       <span className="text-slate-300">{log.event}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：电气与热工 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Stator Heatmap */}
           <SciFiCard title="定子热像分布" subtitle="THERMAL MAP" className="flex-1 border-blue-900/50">
              <div className="h-full flex flex-col">
                 <div className="flex-1 w-full min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={statorTemps} margin={{top: 10, right: 0, bottom: 0, left: -20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="slot" stroke="#64748b" tick={{fontSize: 8}} interval={4} />
                          <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[60, 110]} />
                          <Tooltip contentStyle={{backgroundColor: '#020409', border: 'none', fontSize: '10px'}} />
                          <Bar dataKey="temp" radius={[2, 2, 0, 0]}>
                             {statorTemps.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.temp > 95 ? '#ef4444' : entry.temp > 85 ? '#f59e0b' : '#3b82f6'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-900/30 rounded mt-2">
                    <Thermometer size={14} className="text-red-400" />
                    <div className="text-[10px] text-red-200">
                       Alert: Slot #12-14 High Temp (&gt95°C)
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Cavitation Monitor */}
           <SciFiCard title="空蚀与效率监测" subtitle="CAVITATION" className="border-blue-900/50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Efficiency</div>
                    <div className="text-xl font-bold text-emerald-400">{unitState.efficiency.toFixed(1)}%</div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Draft Tube Press</div>
                    <div className="text-xl font-bold text-white">-0.05 <span className="text-xs font-normal">MPa</span></div>
                 </div>
              </div>
              
              <div className="p-2 bg-slate-900/30 rounded border border-slate-700">
                 <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">Cavitation Risk Index</span>
                    <span className="text-green-400">Low</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500" style={{width: '25%'}}></div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
