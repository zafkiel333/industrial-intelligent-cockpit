import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-5]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-5';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Droplets, Wind, Activity, Zap, Recycle, Filter, 
  FlaskConical, Gauge, AlertCircle, TrendingDown 
} from 'lucide-react';

export const WastewaterView: React.FC = () => {
  // --- STATE ---
  const [processData, setProcessData] = useState({
    influentFlow: 2450, // m3/h
    effluentFlow: 2380, // m3/h
    doLevel: 2.5, // Dissolved Oxygen mg/L
    mlss: 3500, // Mixed Liquor Suspended Solids mg/L
    orp: 120, // Oxidation-Reduction Potential mV
    svi: 110, // Sludge Volume Index mL/g
    energyIntensity: 0.32, // kWh/m3
  });

  const [pollutants, setPollutants] = useState([
    { name: 'COD', in: 350, out: 28, limit: 50, unit: 'mg/L' },
    { name: 'BOD5', in: 180, out: 8, limit: 10, unit: 'mg/L' },
    { name: 'SS', in: 220, out: 12, limit: 10, unit: 'mg/L' },
    { name: 'TN', in: 45, out: 12, limit: 15, unit: 'mg/L' },
    { name: 'TP', in: 6.5, out: 0.3, limit: 0.5, unit: 'mg/L' },
  ]);

  const [trendData, setTrendData] = useState<any[]>([]);

  // Equipment Status
  const [equipment, setEquipment] = useState([
    { id: 'BL-101', name: 'Aeration Blower A', status: 'running', load: 85 },
    { id: 'BL-102', name: 'Aeration Blower B', status: 'standby', load: 0 },
    { id: 'RP-201', name: 'Return Pump A', status: 'running', load: 60 },
    { id: 'MX-301', name: 'Anoxic Mixer', status: 'running', load: 45 },
  ]);

  useEffect(() => {
    // Init Trend Data (24 Hours)
    const initTrend = Array.from({length: 24}, (_, i) => ({
        time: `${i}:00`,
        do: 2 + Math.random(),
        airflow: 15000 + Math.random() * 2000,
        codRem: 90 + Math.random() * 5
    }));
    setTrendData(initTrend);

    const interval = setInterval(() => {
      // 1. Process Data Simulation
      setProcessData(prev => ({
        influentFlow: 2400 + (Math.random() - 0.5) * 200,
        effluentFlow: 2350 + (Math.random() - 0.5) * 200,
        doLevel: Math.max(1.5, Math.min(4.0, prev.doLevel + (Math.random() - 0.5) * 0.2)),
        mlss: 3500 + (Math.random() - 0.5) * 50,
        orp: 100 + (Math.random() - 0.5) * 10,
        svi: 110 + (Math.random() - 0.5) * 2,
        energyIntensity: 0.32 + (Math.random() - 0.5) * 0.01
      }));

      // 2. Pollutant Fluctuation
      setPollutants(prev => prev.map(p => ({
          ...p,
          in: p.in + (Math.random() - 0.5) * 5,
          out: Math.max(0, p.out + (Math.random() - 0.5) * 0.5)
      })));

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-blue-50 selection:bg-blue-500/30">
      
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Recycle size={12} className="animate-spin" style={{animationDuration: '10s'}} />
             BIO-REACTORS & PURIFICATION
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-blue-400 text-shadow-glow">污水处理</span> 智能运维驾驶舱
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">WTP-ZONE-B</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Daily Treatment</div>
                <div className="text-2xl font-mono font-bold text-blue-300">58,400 <span className="text-sm text-slate-500">m³</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Avg Removal Eff</div>
                <div className="text-2xl font-mono font-bold text-green-400">96.2 <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Energy Intensity</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{processData.energyIntensity.toFixed(2)} <span className="text-sm text-slate-500">kWh/m³</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Water Quality & Efficiency */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Pollutant Removal Chart */}
           <SciFiCard title="污染物去除效率对比" subtitle="IN vs OUT" className="flex-1 border-blue-900/50">
              <div className="h-full w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pollutants} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" hide />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={40} tick={{fontSize: 12, fontWeight: 'bold'}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                        contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#e2e8f0'}} 
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                      <Bar dataKey="in" name="Influent (进水)" fill="#334155" barSize={12} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="out" name="Effluent (出水)" fill="#10b981" barSize={12} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="limit" name="Limit (标准)" fill="#ef4444" barSize={2} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Quick Stats */}
           <SciFiCard title="关键生化指标" className="border-blue-900/50">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400">MLSS</span>
                          <FlaskConical size={14} className="text-yellow-500" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">{processData.mlss.toFixed(0)}</div>
                      <div className="text-[10px] text-slate-500">mg/L (Normal)</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400">Sludge Vol (SVI)</span>
                          <Filter size={14} className="text-amber-500" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">{processData.svi.toFixed(0)}</div>
                      <div className="text-[10px] text-slate-500">mL/g (Good Settling)</div>
                  </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#020610] border border-blue-800/40 relative rounded overflow-hidden shadow-[inset_0_0_50px_rgba(59,130,246,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-black/60 p-2 rounded border border-blue-500/30 backdrop-blur">
                    <div className="text-[10px] text-blue-400 mb-1 uppercase font-bold">Aeration Tank DO Control</div>
                    <div className="flex items-center gap-3">
                        <Wind size={20} className="text-blue-200" />
                        <div>
                            <div className="text-2xl font-bold text-white leading-none">{processData.doLevel.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-400">mg/L (Target: 2.0-3.0)</div>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-green-400" style={{width: `${(processData.doLevel/5)*100}%`}}></div>
                    </div>
                 </div>
              </div>
              
              <div className="absolute top-4 right-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-slate-600">
                    <Activity className="text-green-500 animate-pulse" size={14} />
                    <span className="text-xs text-white font-mono">BIO-PROCESS ACTIVE</span>
                 </div>
              </div>

              {/* Simulation visual */}
              <ThreeScene type="wastewater" color="#3b82f6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Trend Chart (DO & Airflow) */}
           <SciFiCard title="曝气控制回路分析" subtitle="DO vs AIRFLOW" className="h-[250px] border-blue-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData}>
                       <defs>
                          <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'DO (mg/L)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Airflow (m³/h)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', color: '#fff'}} />
                       <Area yAxisId="right" type="monotone" dataKey="airflow" fill="url(#colorAir)" stroke="#3b82f6" strokeWidth={2} />
                       <Line yAxisId="left" type="monotone" dataKey="do" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Equipment & Energy */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Equipment Cluster */}
           <SciFiCard title="核心设备状态" className="flex-1 border-blue-900/50">
              <div className="flex flex-col gap-3">
                 {equipment.map(eq => (
                    <div key={eq.id} className="flex flex-col bg-slate-900/40 p-2 rounded border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-white font-bold">{eq.name}</span>
                           <span className={`text-[10px] px-1.5 rounded uppercase ${eq.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                              {eq.status}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${eq.status === 'running' ? 'bg-blue-500' : 'bg-slate-600'}`} style={{width: `${eq.load}%`}}></div>
                           </div>
                           <span className="text-xs font-mono text-slate-300 w-8 text-right">{eq.load}%</span>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Energy Consumption */}
           <SciFiCard title="能耗分析" subtitle="REAL-TIME" className="border-blue-900/50">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Zap size={18} className="text-yellow-400" />
                       <div className="text-xs text-slate-300">Total Power</div>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">485 <span className="text-xs text-slate-500">kW</span></div>
                 </div>

                 <div className="p-3 bg-blue-900/10 rounded border border-blue-800/30">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Carbon Footprint</span>
                        <span className="text-green-400">-12% vs Avg</span>
                     </div>
                     <div className="text-lg font-bold text-slate-200">142.5 <span className="text-xs font-normal">kgCO₂/h</span></div>
                 </div>
              </div>
           </SciFiCard>

           {/* Return Sludge Control */}
           <SciFiCard title="回流比控制 (R)" className="border-blue-900/50">
               <div className="flex flex-col items-center justify-center py-2">
                   <div className="relative w-32 h-16 overflow-hidden">
                       <Gauge size={64} className="text-slate-700 absolute top-0 left-1/2 -translate-x-1/2" />
                       {/* Simplified Gauge Needle Logic */}
                       <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-red-500 origin-bottom transform -translate-x-1/2 rotate-[-20deg]"></div>
                   </div>
                   <div className="text-2xl font-bold text-white mt-[-10px]">85%</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">Return Ratio</div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};