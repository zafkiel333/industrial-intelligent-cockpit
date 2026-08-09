
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-transport-connect]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-transport-connect';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Sankey, Cell
} from 'recharts';
import { 
  Network, Activity, Layers, ArrowRightLeft, 
  Truck, Train, Anchor, GitMerge, AlertTriangle,
  Timer, Gauge
} from 'lucide-react';

// --- MOCK DATA ---

// Modal Split (Bar/Line combo for flow)
const FLOW_BALANCE = Array.from({length: 12}, (_, i) => ({
    hour: `${8+i}:00`,
    inboundSea: 450 + Math.sin(i*0.5)*100, // TEU In
    outboundRail: 180 + Math.cos(i*0.3)*50, // TEU Out
    outboundRoad: 250 + Math.sin(i*0.3)*80, // TEU Out
    yardBuffer: 0 // Calc later
})).map(d => ({
    ...d,
    yardBuffer: Math.max(0, d.inboundSea - (d.outboundRail + d.outboundRoad))
}));

// Dwell Time Waterfall
const DWELL_DATA = [
    { process: 'Ship Discharge', time: 45, type: 'Ops' },
    { process: 'Quay Transfer', time: 15, type: 'Ops' },
    { process: 'Yard Dwell', time: 180, type: 'Wait' }, // High wait
    { process: 'Gate/Rail Load', time: 30, type: 'Ops' },
];

export const TransportConnectView: React.FC = () => {
  const [jammed, setJammed] = useState(false);
  
  const [metrics, setMetrics] = useState({
    isiScore: 92.4, // Intermodal Seamless Index
    dwellTime: 4.5, // Hours
    railShare: 35.2, // %
    gateThroughput: 1450 // Trucks/day
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            isiScore: jammed ? 75.2 : 92.4 + Math.random(),
            dwellTime: jammed ? 8.2 : 4.5 + Math.random() * 0.1,
            gateThroughput: jammed ? 800 : 1450 + Math.random() * 50
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [jammed]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0b1016] text-slate-200 relative overflow-hidden">
      
      {/* Background Circuitry */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-sky-800/50 pb-4 px-2 bg-gradient-to-r from-sky-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 mb-1 uppercase tracking-wider">
             <GitMerge size={14} className="animate-pulse" /> Multimodal Logistics Hub
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             集疏运体系 <span className="text-sky-500">衔接效率透视</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> ISI Index</div>
                <div className={`text-2xl font-mono font-bold ${jammed ? 'text-red-500' : 'text-green-400'}`}>{metrics.isiScore.toFixed(1)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-sky-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Timer size={10}/> Avg Dwell</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.dwellTime.toFixed(1)} <span className="text-sm text-slate-500">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-sky-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Train size={10}/> Rail Share</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{metrics.railShare.toFixed(1)}%</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Pulse & Waterfall */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="衔接时效分析 (Dwell Time)" subtitle="MINUTES" className="flex-1 border-sky-900/50 bg-[#060b10]/80">
                  <div className="w-full h-full p-2 flex flex-col justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DWELL_DATA} layout="vertical" margin={{left: 0, right: 20}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis dataKey="process" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020409', borderColor: '#0ea5e9'}} />
                              <Bar dataKey="time" radius={[0, 4, 4, 0]} barSize={20}>
                                  {DWELL_DATA.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.type === 'Wait' ? (jammed ? '#ef4444' : '#f59e0b') : '#0ea5e9'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                      <div className="text-center text-xs text-slate-400 mt-2">
                          {jammed ? 'Yard congestion causing delays.' : 'Operations nominal.'}
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="瓶颈压力测试" subtitle="SIMULATION" className="h-[200px] border-sky-900/50">
                  <div className="flex flex-col gap-4 h-full justify-center px-4">
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                              <AlertTriangle size={16} className={jammed ? 'text-red-500' : 'text-slate-500'} />
                              Simulate Congestion
                          </span>
                          <button 
                            onClick={() => setJammed(!jammed)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${jammed ? 'bg-red-600' : 'bg-slate-700'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${jammed ? 'translate-x-6' : ''}`}></div>
                          </button>
                      </div>
                      <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                          {jammed ? 'SCENARIO ACTIVE: Rail gate failure. Inbound accumulation +25%. ISI dropping.' : 'System running optimal flow logic.'}
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Holographic Hub */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#020305] border border-sky-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(14,165,233,0.15)] group">
                  
                  {/* HUD Labels */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-sky-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Network size={16} className="text-sky-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Hub Status</div>
                              <div className="text-sm font-bold text-white">{jammed ? 'CONGESTED' : 'OPTIMAL'}</div>
                          </div>
                      </div>
                  </div>

                  {/* Mode Legend */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-sky-900">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div> Sea-Rail Link
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-sky-900">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sea-Road Link
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-sky-900">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div> Internal Transfer
                      </div>
                  </div>

                  {/* The Scene */}
                  <ThreeScene type="transport-connect-analysis" color="#0ea5e9" data={{ jammed }} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  
                  {/* Alert Overlay if Jammed */}
                  {jammed && (
                      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-900/80 text-white px-6 py-2 rounded border border-red-500 animate-pulse font-bold tracking-widest z-20">
                          CONNECTION BOTTLENECK DETECTED
                      </div>
                  )}
              </div>

          </div>

          {/* RIGHT: Flow Balance */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* In/Out Balance Chart */}
              <SciFiCard title="流量平衡监测 (Flow Balance)" subtitle="TEU/H" className="h-[320px] border-sky-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={FLOW_BALANCE}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020409', borderColor: '#0ea5e9'}} />
                              <Bar dataKey="inboundSea" name="Inbound (Sea)" fill="#0ea5e9" stackId="in" barSize={10} />
                              <Bar dataKey="outboundRail" name="Out (Rail)" fill="#f59e0b" stackId="out" barSize={10} />
                              <Bar dataKey="outboundRoad" name="Out (Road)" fill="#10b981" stackId="out" barSize={10} />
                              <Line type="monotone" dataKey="yardBuffer" name="Yard Accumulation" stroke="#ef4444" dot={false} strokeWidth={2} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Mode Share */}
              <SciFiCard title="疏运方式占比" className="flex-1 border-sky-900/50">
                  <div className="flex flex-col gap-3 h-full justify-center">
                      <div className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex items-center gap-2">
                              <Train size={16} className="text-amber-500" />
                              <span className="text-sm font-bold text-white">Rail</span>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-mono text-amber-400">{metrics.railShare.toFixed(1)}%</div>
                              <div className="text-[9px] text-slate-500">Target: 40%</div>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex items-center gap-2">
                              <Truck size={16} className="text-emerald-500" />
                              <span className="text-sm font-bold text-white">Road</span>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-mono text-emerald-400">{(100 - metrics.railShare - 5).toFixed(1)}%</div>
                              <div className="text-[9px] text-slate-500">Congestion: Low</div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex items-center gap-2">
                              <Anchor size={16} className="text-blue-500" />
                              <span className="text-sm font-bold text-white">Water</span>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-mono text-blue-400">5.0%</div>
                              <div className="text-[9px] text-slate-500">Feeder</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
