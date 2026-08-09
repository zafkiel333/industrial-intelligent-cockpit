
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-green-port]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-green-port';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  Leaf, Zap, Wind, Sun, BatteryCharging, 
  Activity, TrendingDown, Gauge, Plug, 
  Truck, Ship, Cloud, Target
} from 'lucide-react';

// --- MOCK DATA ---

const ENERGY_MIX = [
  { name: 'Wind (风能)', value: 35, fill: '#06b6d4' },
  { name: 'Solar (光伏)', value: 25, fill: '#eab308' },
  { name: 'Grid (电网)', value: 40, fill: '#334155' },
];

const CARBON_TREND = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    actual: 120 - i * 2 + Math.random() * 5,
    target: 125 - i * 2.5
}));

const SHORE_POWER_USAGE = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    kwh: i > 8 && i < 20 ? 800 + Math.random() * 200 : 200 + Math.random() * 100
}));

const EQ_ELECTRIFICATION = [
    { name: 'STS Cranes', value: 100, fill: '#10b981' },
    { name: 'RTG Cranes', value: 65, fill: '#3b82f6' },
    { name: 'AGVs', value: 80, fill: '#8b5cf6' },
    { name: 'Trucks', value: 45, fill: '#f59e0b' }
];

export const GreenPortCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    carbonTotal: 12450, // tons
    carbonIntensity: 0.42, // kg/TEU
    cleanEnergyRate: 58.5, // %
    shorePowerConn: 12, // Active connections
    dailyEnergy: 45200 // kWh
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            dailyEnergy: prev.dailyEnergy + 10 + Math.random() * 5,
            cleanEnergyRate: 58.5 + Math.sin(Date.now()/5000) * 2,
            carbonIntensity: 0.42 - Math.random() * 0.001
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#022c22] text-emerald-50 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#022c22] to-[#020617] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(45deg, #10b981 1px, transparent 1px)',
          backgroundSize: '40px 40px'
      }}></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-emerald-800/50 pb-4 px-2 bg-gradient-to-r from-emerald-950/90 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Leaf size={14} className="animate-pulse" /> Zero Carbon Initiative
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             绿色港口 <span className="text-emerald-500">能耗与碳排驾驶舱</span>
          </h1>
        </div>
        
        {/* KPI Banner */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Cloud size={10}/> Total Carbon (YTD)</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.carbonTotal.toLocaleString()} <span className="text-sm text-slate-500">tCO₂</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Zap size={10}/> Clean Energy Ratio</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{metrics.cleanEnergyRate.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Carbon Intensity</div>
                <div className="text-2xl font-mono font-bold text-green-300">{metrics.carbonIntensity.toFixed(3)} <span className="text-sm text-slate-500">kg/TEU</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Energy Mix & Source */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="能源结构占比 (Energy Mix)" subtitle="REAL-TIME" className="h-[280px] border-emerald-900/50 bg-[#061814]/80">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={ENERGY_MIX}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {ENERGY_MIX.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981', color: '#fff'}} />
                              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                      {/* Center Gauge Value */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                          <span className="text-3xl font-bold text-white">{metrics.cleanEnergyRate.toFixed(0)}%</span>
                          <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Clean</span>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="微电网状态" className="flex-1 border-emerald-900/50">
                  <div className="flex flex-col gap-4 justify-center h-full">
                      <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800/30 rounded">
                          <div className="flex items-center gap-3">
                              <Wind size={20} className="text-cyan-400" />
                              <div>
                                  <div className="text-xs text-slate-400">Wind Output</div>
                                  <div className="text-lg font-bold text-white">4.2 MW</div>
                              </div>
                          </div>
                          <div className="h-8 w-1 bg-cyan-500/50 rounded"></div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800/30 rounded">
                          <div className="flex items-center gap-3">
                              <Sun size={20} className="text-yellow-400" />
                              <div>
                                  <div className="text-xs text-slate-400">Solar Output</div>
                                  <div className="text-lg font-bold text-white">2.8 MW</div>
                              </div>
                          </div>
                          <div className="h-8 w-1 bg-yellow-500/50 rounded"></div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800/30 rounded">
                          <div className="flex items-center gap-3">
                              <BatteryCharging size={20} className="text-green-400" />
                              <div>
                                  <div className="text-xs text-slate-400">Storage (ESS)</div>
                                  <div className="text-lg font-bold text-white">85% SoC</div>
                              </div>
                          </div>
                          <div className="text-xs text-green-300 animate-pulse">Discharging</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin & Shore Power */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-gradient-to-b from-[#022c22] to-[#020617] border border-emerald-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(16,185,129,0.2)] group">
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-emerald-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Target size={16} className="text-emerald-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Carbon Neutrality</div>
                              <div className="text-sm font-bold text-white">Target Year: 2030</div>
                          </div>
                      </div>
                  </div>

                  {/* Ship Connection Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                      <div className="flex flex-col items-end gap-2">
                          <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs text-emerald-200 flex items-center gap-2">
                              <Plug size={12}/> Active Shore Power: <span className="font-bold text-white">{metrics.shorePowerConn} / 15</span>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="green-port-cockpit" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Shore Power Trend */}
              <SciFiCard title="岸电使用负荷趋势 (24H)" subtitle="LOAD PROFILE" className="h-[240px] border-emerald-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SHORE_POWER_USAGE}>
                              <defs>
                                  <linearGradient id="shoreGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load (kWh)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981', color: '#fff'}} />
                              <Area type="monotone" dataKey="kwh" stroke="#10b981" fill="url(#shoreGrad)" strokeWidth={2} name="Power Usage" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Carbon & Electrification */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Electrification Stats */}
              <SciFiCard title="设备电气化率" subtitle="E-RATE" className="h-[280px] border-emerald-900/50">
                  <div className="w-full h-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={EQ_ELECTRIFICATION} layout="vertical" margin={{left: 10, right: 20}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: 'rgba(16, 185, 129, 0.1)'}} contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981'}} />
                              <Bar dataKey="value" name="Electrification %" radius={[0, 4, 4, 0]} barSize={15}>
                                  {EQ_ELECTRIFICATION.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Carbon Reduction Trend */}
              <SciFiCard title="碳减排目标追踪" subtitle="YTD" className="flex-1 border-emerald-900/50">
                  <div className="flex flex-col h-full gap-2">
                      <div className="flex-1 min-h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={CARBON_TREND}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                                  <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                                  <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['dataMin', 'dataMax']} />
                                  <Tooltip contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981'}} />
                                  <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#ef4444" strokeWidth={2} dot={false} />
                                  <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="p-2 bg-emerald-900/20 border border-emerald-800/30 rounded flex items-center justify-between text-xs">
                          <span className="text-slate-400">Current Status</span>
                          <span className="text-green-400 font-bold flex items-center gap-1"><TrendingDown size={12}/> On Track (-4.2%)</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
