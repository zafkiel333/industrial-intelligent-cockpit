
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-sedi]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-sedi';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Layers, Waves, ArrowDownUp, Settings, 
  Play, Pause, RotateCcw, AlertTriangle, 
  TrendingDown, TrendingUp, Filter, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';

// --- MOCK DATA ---

// Reservoir Capacity Curve (Elevation vs Volume)
const CAPACITY_CURVE = Array.from({length: 20}, (_, i) => {
    const el = 100 + i * 5;
    const originalVol = Math.pow((el - 80)/10, 3) * 10;
    // Loss due to sediment
    const siltedVol = originalVol * 0.85; 
    return { elevation: el, original: originalVol, current: siltedVol };
});

// Sediment Balance (In/Out/Trap)
const SEDIMENT_BALANCE = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    inflow: 500 + Math.random() * 200, // tons
    outflow: 0 // to be calc
})).map(d => ({
    ...d,
    outflow: d.inflow * 0.3, // Baseline flushing
    trapped: d.inflow * 0.7
}));

export const HydroSedimentSimView: React.FC = () => {
  // --- STATE ---
  const [waterLevel, setWaterLevel] = useState(60); // % (Visual scale 0-100)
  const [sedimentLoad, setSedimentLoad] = useState(0.5); // 0-1 concentration
  const [isFlushing, setIsFlushing] = useState(false);
  const [years, setYears] = useState(0);
  
  const [metrics, setMetrics] = useState({
    trapEfficiency: 75.2, // %
    capacityLoss: 12.5, // %
    deltaAdvancement: 1.2, // km/yr
    siltThickness: 4.5, // m at dam
    sluicingEff: 0
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Physics Logic
        let eff = isFlushing ? 20 : 75 + sedimentLoad * 10; // Trap efficiency drops when flushing
        
        // Capacity loss grows
        const lossRate = isFlushing ? -0.01 : 0.05 * sedimentLoad;
        
        setMetrics(prev => ({
            trapEfficiency: eff + (Math.random()-0.5)*2,
            capacityLoss: Math.min(50, Math.max(0, prev.capacityLoss + lossRate)),
            deltaAdvancement: 1.2 + sedimentLoad,
            siltThickness: isFlushing ? Math.max(0, prev.siltThickness - 0.1) : Math.min(20, prev.siltThickness + 0.02),
            sluicingEff: isFlushing ? 85 : 0
        }));

        if (isFlushing) setYears(y => y + 0.01);

    }, 200);
    return () => clearInterval(interval);
  }, [isFlushing, sedimentLoad]);

  return (
    <div className="h-full w-full relative bg-[#1c170d] text-amber-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-sedi" 
            simData={{ 
                waterLevel,
                flushing: isFlushing,
                sedimentLoad
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#1c170d_100%)] pointer-events-none"></div>
          {/* Muddy Water Overlay if high sediment */}
          {sedimentLoad > 0.7 && (
             <div className="absolute inset-0 bg-yellow-900/10 pointer-events-none mix-blend-overlay"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#2a2418]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Layers size={14} /> MORPHOLOGY LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水库泥沙 <span className="text-amber-500">淤积与调沙仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Capacity Loss</div>
                   <div className="text-3xl font-mono font-bold text-red-400">{metrics.capacityLoss.toFixed(2)} %</div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Trap Efficiency</div>
                   <div className={`text-3xl font-mono font-bold ${isFlushing ? 'text-green-400' : 'text-yellow-400'}`}>
                       {metrics.trapEfficiency.toFixed(1)} %
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#1a150f]/90 backdrop-blur-md border border-amber-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-amber-900/30 pb-2">
                  <Settings size={16} className="text-amber-500"/> 运行调度控制
              </h3>
              
              <div className="space-y-6">
                  {/* Water Level */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Waves size={12}/> Operating Level</span>
                          <span className="font-mono text-cyan-300">{waterLevel}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1" 
                        value={waterLevel} onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Sediment Load */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Filter size={12}/> Inflow Turbidity</span>
                          <span className="font-mono text-amber-400">{(sedimentLoad * 10).toFixed(1)} kg/m³</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={sedimentLoad} onChange={(e) => setSedimentLoad(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                  </div>

                  {/* Flushing Mode */}
                  <div className="pt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 font-bold">Sediment Flushing (Drawdown)</span>
                      </div>
                      <button 
                         onClick={() => { setIsFlushing(!isFlushing); if(!isFlushing) setWaterLevel(20); }}
                         className={`w-full py-3 font-bold text-xs rounded border transition-all flex items-center justify-center gap-2
                             ${isFlushing ? 'bg-green-600 border-green-500 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}
                         `}
                      >
                         <ArrowDownUp size={16}/> {isFlushing ? 'FLUSHING ACTIVE' : 'INITIATE FLUSHING'}
                      </button>
                      <div className="mt-2 text-[10px] text-slate-500 text-center">
                          *Flushing requires lowering water level to &lt; 30%
                      </div>
                  </div>
              </div>
          </div>

          {/* Quick Stats */}
          <SciFiCard title="泥沙淤积状态" subtitle="DELTA" className="flex-1 border-amber-900/50 bg-[#1a150f]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Silt Thickness</div>
                          <div className="text-lg font-bold text-white">{metrics.siltThickness.toFixed(2)} m</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Delta Adv.</div>
                          <div className="text-lg font-bold text-yellow-500">{metrics.deltaAdvancement.toFixed(1)} km</div>
                      </div>
                  </div>
                  
                  {metrics.capacityLoss > 20 && (
                      <div className="mt-auto p-3 bg-red-900/20 border border-red-900/50 rounded flex items-center gap-2 text-red-300 text-xs">
                          <AlertTriangle size={16}/> Warning: Capacity Loss &gt; 20%
                      </div>
                  )}
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Capacity Curve */}
          <SciFiCard title="库容曲线变化 (Capacity Loss)" subtitle="H-V Curve" className="h-[280px] border-amber-900/50 bg-[#1a150f]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CAPACITY_CURVE}>
                          <defs>
                              <linearGradient id="origFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
                          <XAxis dataKey="elevation" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Elevation (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Area type="monotone" dataKey="original" name="Original" stroke="#3b82f6" fill="url(#origFill)" />
                          <Area type="monotone" dataKey="current" name="Current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Sediment Balance */}
          <SciFiCard title="泥沙收支分析" subtitle="BALANCE" className="flex-1 border-amber-900/50 bg-[#1a150f]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SEDIMENT_BALANCE}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
                          <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Bar dataKey="inflow" name="Inflow" fill="#78350f" stackId="a" />
                          <Bar dataKey="outflow" name="Flushed" fill="#22c55e" stackId="b" />
                          <Bar dataKey="trapped" name="Deposited" fill="#f59e0b" stackId="b" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* CENTER HUD: Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
           <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-amber-900/50 flex gap-6 text-[10px] text-slate-300">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Water Surface</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-600"></div> Sediment Delta</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Sluicing Plume</div>
           </div>
      </div>

    </div>
  );
};
