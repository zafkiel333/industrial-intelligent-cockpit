
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-pumped-storage]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-pumped-storage';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Zap, Repeat, ArrowUp, ArrowDown, BatteryCharging, 
  Activity, Gauge, Power, Clock, TrendingUp
} from 'lucide-react';

// --- MOCK DATA ---
const LEVEL_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    upper: 840 + Math.sin(i * 0.3) * 10,
    lower: 320 - Math.sin(i * 0.3) * 10, // Mirror image roughly
}));

const UNITS = [
    { id: 'U1', mode: 'GEN', power: 300, vib: 0.05, temp: 62 },
    { id: 'U2', mode: 'PUMP', power: -310, vib: 0.08, temp: 65 },
    { id: 'U3', mode: 'STOP', power: 0, vib: 0, temp: 25 },
    { id: 'U4', mode: 'GEN', power: 280, vib: 0.04, temp: 60 },
];

export const PumpedStorageCockpitView: React.FC = () => {
  const [stationMode, setStationMode] = useState<'GENERATING' | 'PUMPING' | 'MIXED'>('MIXED');
  const [metrics, setMetrics] = useState({
    totalGen: 580, // MW
    totalPump: 310, // MW
    netPower: 270, // MW (Positive = Gen)
    upperLevel: 845.2,
    lowerLevel: 315.8,
    efficiency: 78.5, // Cycle efficiency
    profit: 125000 // Real-time profit estimate
  });

  useEffect(() => {
    const interval = setInterval(() => {
        // Simulating bi-directional flow based on time
        const time = Date.now() / 5000;
        const modeVal = Math.sin(time);
        const newMode = modeVal > 0.2 ? 'GENERATING' : modeVal < -0.2 ? 'PUMPING' : 'MIXED';
        
        setStationMode(newMode);
        setMetrics(prev => ({
            ...prev,
            upperLevel: 845 + Math.sin(time) * 5,
            lowerLevel: 315 - Math.sin(time) * 5,
            netPower: modeVal * 1200, // +1200 to -1200 MW range
            efficiency: 78 + Math.random(),
            profit: prev.profit + (modeVal > 0 ? 500 : -200) // Profit when gen, cost when pump
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#050f0a] text-green-50 relative overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-[#050f0a] to-[#050f0a] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-green-800/50 pb-4 px-2 bg-gradient-to-r from-green-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-400 mb-1 uppercase tracking-wider">
             <BatteryCharging size={14} className="animate-pulse" /> Energy Storage & Arbitrage
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             抽水蓄能电站 <span className="text-green-500">运行驾驶舱</span>
          </h1>
        </div>
        
        {/* Status Banner */}
        <div className="flex gap-8 items-center">
            <div className={`px-4 py-2 rounded border font-bold text-xl flex items-center gap-2
                ${stationMode === 'GENERATING' ? 'bg-blue-900/40 border-blue-500 text-blue-400' : 
                  stationMode === 'PUMPING' ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-white'}
            `}>
                {stationMode === 'GENERATING' ? <ArrowDown /> : stationMode === 'PUMPING' ? <ArrowUp /> : <Activity />}
                {stationMode}
            </div>
            
            <div className="text-right border-l border-green-900/50 pl-6">
                <div className="text-[10px] text-slate-400 uppercase">Net Power</div>
                <div className={`text-3xl font-mono font-bold ${metrics.netPower > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                    {Math.abs(metrics.netPower).toFixed(0)} <span className="text-sm text-slate-500">MW</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT COLUMN: Upper Reservoir & Units */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="上水库监测 (Upper Res)" subtitle="POTENTIAL ENERGY" className="border-green-900/50">
                  <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Water Level</span>
                          <span className="text-2xl font-bold text-white">{metrics.upperLevel.toFixed(2)} m</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${(metrics.upperLevel - 800) / 100 * 100}%`}}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                              <div className="text-[10px] text-slate-500">Volume</div>
                              <div className="text-sm font-bold text-white">12.5 Mm³</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                              <div className="text-[10px] text-slate-500">Available Energy</div>
                              <div className="text-sm font-bold text-green-400">4500 MWh</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="机组群控状态" className="flex-1 border-green-900/50">
                  <div className="flex flex-col gap-3">
                      {UNITS.map(u => (
                          <div key={u.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                      ${u.mode === 'GEN' ? 'bg-blue-900 text-blue-300' : u.mode === 'PUMP' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}
                                  `}>{u.id}</div>
                                  <div>
                                      <div className="text-xs font-bold text-white">{u.mode}</div>
                                      <div className="text-[10px] text-slate-500">Vib: {u.vib} mm</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-mono font-bold text-white">{u.power} MW</div>
                                  <div className="text-[10px] text-slate-500">{u.temp}°C</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-gradient-to-br from-[#0a1015] to-[#000] border border-green-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(34,197,94,0.1)]">
                  {/* Flow Animation Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30">
                      {/* Decorative grid or flow lines could go here */}
                  </div>

                  {/* Mode Indicator Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-green-500/30 backdrop-blur">
                          <Repeat size={14} className={stationMode !== 'MIXED' ? 'animate-spin' : ''} />
                          <span className="text-xs font-bold text-white">REVERSIBLE TURBINE: {stationMode}</span>
                      </div>
                  </div>

                  <ThreeScene type="pumped-storage" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Water Level Correlation Chart */}
              <SciFiCard title="库水位镜像趋势" subtitle="24H" className="h-[220px] border-green-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={LEVEL_TREND}>
                              <defs>
                                  <linearGradient id="upLevel" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="downLevel" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                              
                              <YAxis yAxisId="up" stroke="#3b82f6" domain={[800, 900]} hide />
                              <YAxis yAxisId="down" stroke="#10b981" orientation="right" domain={[300, 400]} hide />
                              
                              <Tooltip contentStyle={{backgroundColor: '#000'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              <Area yAxisId="up" type="monotone" dataKey="upper" name="Upper Level" stroke="#3b82f6" fill="url(#upLevel)" />
                              <Area yAxisId="down" type="monotone" dataKey="lower" name="Lower Level" stroke="#10b981" fill="url(#downLevel)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT COLUMN: Grid & Economics */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Lower Reservoir Status */}
              <SciFiCard title="下水库监测 (Lower Res)" subtitle="RECOVERY" className="border-green-900/50">
                  <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Water Level</span>
                          <span className="text-2xl font-bold text-white">{metrics.lowerLevel.toFixed(2)} m</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full transition-all duration-1000" style={{width: `${(metrics.lowerLevel - 300) / 50 * 100}%`}}></div>
                      </div>
                      <div className="p-2 bg-green-900/20 border border-green-800/30 rounded text-center">
                          <div className="text-[10px] text-green-300">Recycle Capacity</div>
                          <div className="text-lg font-mono font-bold text-white">Ready</div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Economic Performance */}
              <SciFiCard title="经济效益实时估算" className="flex-1 border-green-900/50">
                  <div className="flex flex-col gap-4 h-full justify-center">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Zap size={12}/> Current Price</span>
                          <span className="text-xl font-bold text-yellow-400">0.85 <span className="text-xs text-slate-500">元/kWh</span></span>
                      </div>
                      
                      <div className="text-center py-4">
                          <div className="text-xs text-slate-500 uppercase mb-1">Cycle Efficiency</div>
                          <div className="relative w-32 h-32 mx-auto">
                              {/* Simple CSS Gauge */}
                              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent border-l-transparent -rotate-45"></div>
                              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
                                  {metrics.efficiency.toFixed(1)}%
                              </div>
                          </div>
                      </div>

                      <div className="mt-auto bg-slate-900/50 p-3 rounded border border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400">Est. Profit (Today)</span>
                              <span className="text-xs text-green-400 flex items-center gap-1"><TrendingUp size={10}/> +12%</span>
                          </div>
                          <div className="text-2xl font-mono font-bold text-white">¥ {metrics.profit.toLocaleString()}</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
