
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroStructureThreeScene } from '../../components/ServiceDataManagement/HydroStructure/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, ComposedChart, Line, LineChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  ScanEye, Ruler, Activity, Waves, ShieldCheck, 
  AlertTriangle, Database, FileSearch, ArrowRight,
  Target, Crosshair, Droplets
} from 'lucide-react';

export const HydroStructureHealthView: React.FC = () => {
  const [activeSensor, setActiveSensor] = useState<string>('s-plumb');
  const [hydrology, setHydrology] = useState({
    level: 85, // %
    upliftPressure: 0.4, // coefficient
    stressIndex: 0.6 // 0-1
  });

  // Mock Data
  const upliftTrend = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    level: 140 + Math.sin(i*0.2)*5,
    pressure: 25 + Math.sin(i*0.2)*2 + Math.random(),
    limit: 35
  }));

  const displacementData = Array.from({length: 30}, (_, i) => ({
    day: i+1,
    x: Math.sin(i*0.5) * 0.5,
    y: Math.cos(i*0.5) * 0.2 + (i/30)*0.1 // Slight creep trend
  }));

  const defects = [
    { id: 'D-001', type: '裂缝', loc: '坝段#12 245m高程', severity: '一般', status: '跟踪中' },
    { id: 'D-002', type: '渗水', loc: '廊道 3-5 伸缩缝', severity: '严重', status: '待处理' },
    { id: 'D-003', type: '剥蚀', loc: '消能池底板', severity: '轻微', status: '已修复' },
  ];

  const healthRadar = [
    { subject: '抗滑稳定', A: 95, fullMark: 100 },
    { subject: '渗透破坏', A: 82, fullMark: 100 },
    { subject: '应力强度', A: 88, fullMark: 100 },
    { subject: '变形性态', A: 90, fullMark: 100 },
    { subject: '外观完整', A: 75, fullMark: 100 },
  ];

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setHydrology(prev => ({
            ...prev,
            level: 85 + Math.sin(Date.now()/5000) * 5,
            stressIndex: 0.6 + Math.sin(Date.now()/3000) * 0.1
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0f172a] p-2 overflow-hidden select-none">
      
      {/* 顶部：结构安全监测中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-blue-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <ShieldCheck className="text-blue-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水工建筑物巡检与结构健康服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-blue-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Ruler size={12}/> DAM TYPE: GRAVITY CONCRETE</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Activity size={12}/> SAFETY FACTOR: 1.45 (Stable)</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">MONITORING: REAL-TIME</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Total Sensors</div>
              <div className="text-xl font-mono font-black text-white">482</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Health Score</div>
              <div className="text-xl font-mono font-black text-emerald-400">92.5</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：巡检与缺陷 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Inspection Tasks */}
           <SciFiCard title="智能巡检任务流" subtitle="INSPECTION" className="flex-1 bg-slate-900/40 border-blue-900/50">
              <div className="space-y-4">
                 <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-lg flex items-center gap-3">
                    <ScanEye className="text-blue-400 animate-pulse" size={24} />
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">UAV-Air Patrol</span>
                          <span className="text-[9px] bg-blue-900 text-blue-200 px-1.5 rounded">Running</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[65%]"></div>
                       </div>
                       <div className="text-[9px] text-slate-400 mt-1">Target: Downstream Face</div>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-3 opacity-70">
                    <Waves className="text-slate-400" size={24} />
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-300">ROV-Underwater</span>
                          <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 rounded">Scheduled</span>
                       </div>
                       <div className="text-[9px] text-slate-500">Next: Tomorrow 09:00</div>
                    </div>
                 </div>
              </div>

              <div className="mt-6">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">Defect Library</div>
                 <div className="space-y-2">
                    {defects.map((d, i) => (
                       <div key={i} className="flex justify-between items-center p-2 bg-slate-800/30 rounded border border-slate-700 hover:border-red-500/50 transition-colors cursor-pointer">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-white flex items-center gap-2">
                                <AlertTriangle size={10} className={d.severity === '严重' ? 'text-red-500' : 'text-yellow-500'} />
                                {d.type}
                             </span>
                             <span className="text-[9px] text-slate-500">{d.loc}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 rounded ${
                             d.status === '待处理' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                          }`}>{d.status}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           {/* AI Recognition */}
           <SciFiCard title="AI 缺陷识别统计" className="border-blue-900/50">
              <div className="grid grid-cols-2 gap-3 text-center">
                 <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500">Crack Detection</div>
                    <div className="text-lg font-bold text-white">12</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500">Spalling Area</div>
                    <div className="text-lg font-bold text-white">2.5 m²</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：大坝数字孪生 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(59,130,246,0.1)]">
              {/* HUD: Structure Status */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 p-4 rounded-xl shadow-2xl min-w-[200px]">
                    <div className="flex items-center gap-3 border-b border-blue-500/20 pb-2 mb-2">
                       <Target className="text-blue-400" size={16} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Area</div>
                          <div className="text-sm font-black text-white uppercase">{activeSensor}</div>
                       </div>
                    </div>
                    <div className="space-y-1 text-[10px] font-mono text-slate-300">
                       <div>Stress Level: <span className="text-white">{(hydrology.stressIndex * 100).toFixed(0)}%</span></div>
                       <div>Uplift Press: <span className="text-red-400">{hydrology.upliftPressure.toFixed(2)} MPa</span></div>
                    </div>
                 </div>
              </div>

              {/* HUD: Hydrology */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-none">
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Droplets className="text-cyan-400" size={14} />
                    <span className="text-xs font-mono text-white">WL: 145.2 m</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Activity className="text-purple-400" size={14} />
                    <span className="text-xs font-mono text-white">Load: 82%</span>
                 </div>
              </div>

              <HydroStructureThreeScene 
                 waterLevel={hydrology.level}
                 stressLoad={hydrology.stressIndex}
                 crackGrowth={0.1}
                 activeSensorId={activeSensor}
                 onSensorSelect={setActiveSensor}
              />

              <div className="absolute bottom-6 right-6 z-10">
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-[10px] font-bold shadow-lg transition-all flex items-center gap-2">
                    <FileSearch size={12} /> 生成体检报告
                 </button>
              </div>
           </div>

           {/* Seepage Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Activity size={14} /> 渗流与扬压力监测 (Seepage & Uplift)
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={upliftTrend}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="level" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" name="Water Level" />
                       <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#f59e0b" strokeWidth={2} dot={false} name="Uplift Press" />
                       <ReferenceLine yAxisId="right" y={35} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:9}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：健康诊断与变形 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Health Radar */}
           <SciFiCard title="结构健康综合指数" subtitle="SHM INDEX" className="border-blue-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={healthRadar}>
                       <PolarGrid stroke="#1e3a8a" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                 <div className="inline-block px-3 py-1 bg-blue-900/30 border border-blue-800 rounded text-[10px] text-blue-300">
                    整体评价: <span className="text-emerald-400 font-bold">A级 (优)</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Displacement Trend */}
           <SciFiCard title="大坝变形趋势 (Displacement)" subtitle="PLUMB LINE" className="flex-1 border-blue-900/50">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displacementData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                       <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[-1, 1]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none', fontSize: '10px'}} />
                       <ReferenceLine y={0} stroke="#fff" strokeDasharray="3 3" />
                       <Line type="monotone" dataKey="x" stroke="#f59e0b" strokeWidth={2} dot={false} name="Horizontal (mm)" />
                       <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} name="Vertical (mm)" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-slate-900/50 rounded border border-slate-800 mt-2 text-[9px] text-slate-400 leading-tight">
                 变形速率收敛，未发现突变。当前偏移量在设计允许范围 (±5mm) 内。
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
