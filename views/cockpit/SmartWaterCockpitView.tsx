
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-city-water]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-city-water';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Droplets, Activity, AlertTriangle, Waves, 
  MapPin, Settings, ShieldCheck, TrendingDown, 
  TrendingUp, Zap, Filter, Navigation, CloudRain
} from 'lucide-react';

// --- MOCK DATA ---

// 24H Supply & Demand Forecast
const SUPPLY_DEMAND_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    demand: 18000 + Math.sin((i-8)*0.3) * 6000 + Math.random() * 1000,
    supply: 18500 + Math.sin((i-8)*0.3) * 6000, // Slight oversupply buffer
    pressure: 0.32 - Math.sin((i-8)*0.3) * 0.04
}));

// Regional Leakage (NRW) Status
const DMA_STATUS = [
    { name: 'CBD Zone', nrw: 8.5, status: 'Good' },
    { name: 'Industrial N', nrw: 12.2, status: 'Fair' },
    { name: 'Old Town S', nrw: 28.4, status: 'Critical' },
    { name: 'Resid. West', nrw: 15.6, status: 'Warning' },
];

const ALERTS = [
    { time: '10:24:32', type: '管道爆裂', loc: 'Node-452（主街道）', level: 'High' },
    { time: '10:15:10', type: '压力偏低', loc: 'DMA-03传感器', level: 'Med' },
    { time: '09:48:22', type: '水泵跳闸', loc: 'B站2号设备', level: 'High' },
];

export const SmartWaterCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    dailySupply: 425800, // m3
    avgTurbidity: 0.42, // NTU
    avgCl: 0.65, // mg/L
    networkPressure: 0.34, // MPa
    leakIndex: 14.2, // %
    activeAlerts: 3
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            dailySupply: prev.dailySupply + 200 + Math.random() * 50,
            networkPressure: 0.34 + (Math.random()-0.5)*0.01,
            avgTurbidity: 0.42 + (Math.random()-0.5)*0.01
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020617] text-cyan-50 relative overflow-hidden">
      
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-cyan-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Droplets size={14} className="animate-bounce" /> Urban Water Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             城市智慧水务 <span className="text-cyan-500">全网驾驶舱</span>
          </h1>
        </div>
        
        {/* Top Stats */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Waves size={10}/> Daily Supply</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{metrics.dailySupply.toLocaleString()} <span className="text-sm text-slate-500">m³</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><AlertTriangle size={10}/> NRW Rate</div>
                <div className={`text-2xl font-mono font-bold ${metrics.leakIndex > 15 ? 'text-red-500' : 'text-green-400'}`}>
                    {metrics.leakIndex.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Avg Pressure</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.networkPressure.toFixed(3)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Source & Production */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="水厂生产监控" subtitle="PRODUCTION" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                              <div className="text-[10px] text-slate-500">Outflow Turbidity</div>
                              <div className="text-lg font-bold text-cyan-300">{metrics.avgTurbidity.toFixed(2)} NTU</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                              <div className="text-[10px] text-slate-500">Residual Cl</div>
                              <div className="text-lg font-bold text-green-400">{metrics.avgCl.toFixed(2)} mg/L</div>
                          </div>
                      </div>
                      
                      <div className="space-y-3 mt-2">
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Pump Station A Load</span>
                              <span className="text-white font-bold">85%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full w-[85%]"></div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Clear Water Tank</span>
                              <span className="text-white font-bold">6.5m / 8m</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full w-[81%]"></div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="分区漏损指数 (DMA)" subtitle="LEAKAGE" className="h-[250px] border-cyan-900/50">
                  <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                      {DMA_STATUS.map((dma, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-slate-900/30 border border-slate-800 rounded">
                              <div>
                                  <div className="text-xs text-white font-bold">{dma.name}</div>
                                  <div className="text-[10px] text-slate-500">{dma.status}</div>
                              </div>
                              <div className={`text-sm font-mono font-bold ${dma.nrw > 20 ? 'text-red-500' : dma.nrw > 12 ? 'text-yellow-500' : 'text-green-500'}`}>
                                  {dma.nrw}%
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Network */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* 3D Map Container */}
              <div className="flex-1 bg-[#050910] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.15)]">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <MapPin size={16} className="text-cyan-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">GIS Nodes</div>
                              <div className="text-sm font-bold text-white">4,250 Active</div>
                          </div>
                      </div>
                  </div>

                  {/* Burst Alert Overlay */}
                  <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="flex flex-col items-center animate-pulse">
                          <div className="w-12 h-12 rounded-full border-4 border-red-500 bg-red-500/20 flex items-center justify-center">
                              <AlertTriangle size={24} className="text-red-500" />
                          </div>
                          <div className="mt-2 bg-red-900/80 px-2 py-1 rounded text-xs text-white font-bold border border-red-500">
                              BURST DETECTED
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="city-smart-water" color="#06b6d4" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Demand/Supply Chart */}
              <SciFiCard title="供需平衡预测 (24H)" subtitle="AI FORECAST" className="h-[220px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={SUPPLY_DEMAND_DATA}>
                              <defs>
                                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                              <YAxis yAxisId="left" stroke="#06b6d4" tick={{fontSize: 10}} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} domain={[0.2, 0.5]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Area yAxisId="left" type="monotone" dataKey="supply" name="Supply (m³/h)" stroke="#06b6d4" fill="url(#supplyGrad)" />
                              <Line yAxisId="left" type="monotone" dataKey="demand" name="Demand (m³/h)" stroke="#64748b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                              <Line yAxisId="right" type="monotone" dataKey="pressure" name="Pressure (MPa)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Alerts & Service */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Real-time Alerts */}
              <SciFiCard title="实时告警中心" subtitle="LIVE ALERTS" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ALERTS.map((alert, i) => (
                          <div key={i} className={`p-3 rounded border-l-2 ${alert.level === 'High' ? 'bg-red-900/10 border-red-500' : 'bg-yellow-900/10 border-yellow-500'}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`text-xs font-bold ${alert.level === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>
                                      {alert.type}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{alert.time}</span>
                              </div>
                              <div className="text-[10px] text-slate-300 flex items-center gap-1">
                                  <MapPin size={10} /> {alert.loc}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Service Stats */}
              <SciFiCard title="管网服务指标" className="h-[200px] border-cyan-900/50">
                  <div className="grid grid-cols-2 gap-3 h-full content-center">
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-xs text-slate-400 mb-1">Pressure Pass</div>
                          <div className="text-xl font-bold text-green-400">99.2%</div>
                      </div>
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-xs text-slate-400 mb-1">Repair Time</div>
                          <div className="text-xl font-bold text-white">2.5h</div>
                      </div>
                      <div className="col-span-2 text-center p-2 border border-slate-800 rounded bg-slate-900/30 flex justify-between items-center px-4">
                          <span className="text-xs text-slate-400">Smart Meters Online</span>
                          <span className="text-lg font-mono text-cyan-300">98.5%</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
