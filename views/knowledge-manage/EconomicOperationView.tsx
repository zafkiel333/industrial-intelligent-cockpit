
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  TrendingUp, Coins, Zap, BarChart4, 
  Activity, ArrowRight, Settings, Sliders,
  PieChart, DollarSign, RefreshCw, Layers,
  ChevronRight, Calculator, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, Bar, Cell, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

// 电价曲线 (Spot Market Price)
const PRICE_CURVE = Array.from({length: 24}, (_, i) => {
    let price = 300;
    if (i >= 8 && i <= 11) price = 850; // Morning Peak
    else if (i >= 18 && i <= 21) price = 920; // Evening Peak
    else if (i >= 0 && i <= 6) price = 250; // Valley
    else price = 550; // Flat
    
    return {
        hour: `${i}:00`,
        price: price + Math.random() * 50,
        load: 400 + Math.sin((i-6)*0.25) * 300
    };
});

// 机组耗水率特性曲线 (Q-P Curve approx)
// X: Output (MW), Y: Water Rate (m3/kWh)
const EFFICIENCY_CURVES = Array.from({length: 20}, (_, i) => {
    const mw = i * 5 + 10; // 10% to 100%
    // U-shaped curve, optimized around 85% load
    const g1 = 2.4 + Math.pow((mw - 85)/50, 2) * 0.5; 
    const g2 = 2.35 + Math.pow((mw - 90)/50, 2) * 0.55; 
    return { mw, g1, g2 };
});

// 策略库
const STRATEGIES = [
    { id: 'S-001', name: '多维动态规划 (DP)', type: 'Algorithm', tags: ['耗水极小', '全厂'], status: 'Active', gain: '+2.4%' },
    { id: 'S-002', name: '避振区运行策略', type: 'Safety', tags: ['稳定性', 'G2/G3'], status: 'Active', gain: 'N/A' },
    { id: 'S-003', name: '现货高价时段冲峰', type: 'Economy', tags: ['收益最大', '短期'], status: 'Ready', gain: '+5.1%' },
    { id: 'S-004', name: '龙头水库蓄能对冲', type: 'Storage', tags: ['跨期优化', '梯级'], status: 'Review', gain: '+1.8%' },
];

const UNIT_CONFIG = [
    { id: 'G1', cap: 200, type: 'Francis', status: 'Running', eff: 94.5 },
    { id: 'G2', cap: 200, type: 'Francis', status: 'Running', eff: 93.8 },
    { id: 'G3', cap: 150, type: 'Francis', status: 'Standby', eff: 91.2 },
    { id: 'G4', cap: 150, type: 'Francis', status: 'Running', eff: 92.5 },
];

// --- COMPONENTS ---

// 动态分配引擎组件
const AllocationEngine = ({ totalLoad }: { totalLoad: number }) => {
    // Simple mock logic for load splitting based on "Optimization"
    // G1/G2 are more efficient, prioritize them.
    
    const capG1 = 200;
    const capG2 = 200;
    const capG4 = 150;
    
    let rem = totalLoad;
    
    // Strategy: Base load on most efficient, peak on others
    const loadG1 = Math.min(capG1, rem * 0.45); 
    const loadG2 = Math.min(capG2, rem * 0.40); 
    const loadG4 = Math.min(capG4, Math.max(0, rem - loadG1 - loadG2));
    
    const units = [
        { id: 'G1', load: loadG1, cap: 200, color: '#10b981' }, // Emerald
        { id: 'G2', load: loadG2, cap: 200, color: '#3b82f6' }, // Blue
        { id: 'G3', load: 0, cap: 150, color: '#64748b' },      // Slate (Off)
        { id: 'G4', load: loadG4, cap: 150, color: '#f59e0b' }, // Amber
    ];

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="flex justify-between items-end px-4">
                <div className="text-xs text-slate-400">AGC 指令总负荷</div>
                <div className="text-3xl font-mono font-bold text-white">
                    {totalLoad.toFixed(1)} <span className="text-sm font-normal text-slate-500">MW</span>
                </div>
            </div>

            {/* Visual Bars */}
            <div className="space-y-4 px-2">
                {units.map((u) => (
                    <div key={u.id} className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-300">{u.id} 机组</span>
                            <span className="font-mono text-slate-200">{u.load.toFixed(1)} / {u.cap} MW</span>
                        </div>
                        <div className="h-4 bg-slate-800/50 rounded-sm overflow-hidden border border-slate-700 relative">
                            {/* Background Grid */}
                            <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(90deg, transparent 95%, #000 95%)', backgroundSize: '10% 100%'}}></div>
                            {/* Bar */}
                            <div 
                                className="h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                                style={{width: `${(u.load/u.cap)*100}%`, backgroundColor: u.color}}
                            >
                                {u.load > 0 && <span className="text-[9px] text-black font-bold mix-blend-screen">{((u.load/u.cap)*100).toFixed(0)}%</span>}
                            </div>
                        </div>
                        {/* Efficiency Point Indicator */}
                        {u.load > 0 && (
                            <div className="absolute -right-2 top-6 text-[9px] text-green-400 flex items-center">
                                <Zap size={8} className="mr-1"/> Best Eff.
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-400">当前水耗率 (q)</span>
                <span className="text-cyan-400 font-mono font-bold">2.34 m³/kWh</span>
            </div>
        </div>
    );
};

export const EconomicOperationView: React.FC = () => {
  const [totalLoadRequest, setTotalLoadRequest] = useState(380);
  const [activeStrategy, setActiveStrategy] = useState('S-001');
  const [timeStep, setTimeStep] = useState(0);

  // Clock effect
  useEffect(() => {
      const timer = setInterval(() => {
          setTimeStep(prev => (prev + 1) % 24);
      }, 2000);
      return () => clearInterval(timer);
  }, []);

  const currentPrice = PRICE_CURVE[timeStep].price;
  const revenueRate = (totalLoadRequest * currentPrice) / 1000; // kRMB/h

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#05080f] p-2 relative overflow-hidden">
      
      {/* Background Gold Texture for Wealth/Economy */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_#f59e0b_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-amber-600/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/20 border-2 border-amber-500 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
             <Coins size={30} className="text-amber-400" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 border border-amber-500 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <TrendingUp size={12} /> Economic Optimization
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水电站 <span className="text-amber-500 italic">经济运行策略库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Real-time Price</div>
                <div className="text-2xl font-mono font-black text-white">{currentPrice.toFixed(1)} <span className="text-sm font-normal text-slate-500">RMB/MWh</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Instant Revenue</div>
                <div className="text-2xl font-mono font-black text-green-400">¥ {revenueRate.toFixed(1)} <span className="text-sm font-normal text-slate-500">k/h</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Efficiency Gain</div>
                <div className="text-2xl font-mono font-black text-cyan-400">+1.85 <span className="text-sm font-normal text-slate-500">%</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Market & Constraints --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="电力市场实时看板" subtitle="SPOT MARKET" className="h-[280px] border-amber-900/30 bg-[#0a0c14]/90">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PRICE_CURVE}>
                          <defs>
                              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 1000]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <ReferenceLine x={PRICE_CURVE[timeStep].hour} stroke="#fff" strokeDasharray="3 3" />
                          <Area type="step" dataKey="price" stroke="#f59e0b" fill="url(#priceGrad)" strokeWidth={2} name="Price" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="水力边界条件" subtitle="CONSTRAINTS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 p-1">
                   <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex justify-between items-center">
                       <div>
                           <div className="text-[10px] text-slate-400">Net Head (净水头)</div>
                           <div className="text-xl font-bold text-white font-mono">145.2 m</div>
                       </div>
                       <div className="h-8 w-1 bg-blue-500 rounded"></div>
                   </div>
                   <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex justify-between items-center">
                       <div>
                           <div className="text-[10px] text-slate-400">Inflow (入库流量)</div>
                           <div className="text-xl font-bold text-white font-mono">1,250 m³/s</div>
                       </div>
                       <div className="h-8 w-1 bg-cyan-500 rounded"></div>
                   </div>

                   <div className="space-y-2 mt-2">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Min Eco Flow</span>
                           <span className="text-red-400 font-mono">120 m³/s</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-red-500 h-full w-[15%]"></div>
                       </div>
                       
                       <div className="flex justify-between text-xs text-slate-400 mt-2">
                           <span>Available Capacity</span>
                           <span className="text-green-400 font-mono">550 MW</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full w-[70%]"></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* --- CENTER: Optimization Engine --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           <div className="flex-1 bg-[#0b101b] border border-cyan-800/30 rounded-lg relative overflow-hidden shadow-2xl flex flex-col">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-cyan-500 z-20"></div>
               
               {/* Header HUD */}
               <div className="p-4 flex justify-between items-start z-10 bg-gradient-to-b from-[#0b101b] to-transparent">
                   <div>
                       <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Calculator size={12} /> Optimization Engine
                       </div>
                       <div className="text-xl font-bold text-white">厂内负荷最优分配</div>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-[10px] text-slate-300">SOLVER: CONVERGED</span>
                   </div>
               </div>

               {/* Main Interactive Area */}
               <div className="flex-1 flex flex-col px-8 pb-4 justify-center">
                   
                   {/* Interactive Slider */}
                   <div className="mb-8">
                       <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                           <span>全厂总负荷设定 (Total Load Setpoint)</span>
                           <span className="text-amber-400 font-mono">{totalLoadRequest} MW</span>
                       </div>
                       <input 
                         type="range" 
                         min="50" max="550" step="5"
                         value={totalLoadRequest}
                         onChange={(e) => setTotalLoadRequest(parseInt(e.target.value))}
                         className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                       />
                       <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                           <span>0 MW</span>
                           <span>275 MW</span>
                           <span>550 MW</span>
                       </div>
                   </div>

                   {/* The Engine Viz */}
                   <AllocationEngine totalLoad={totalLoadRequest} />

               </div>
           </div>

           {/* Efficiency Curves */}
           <div className="h-[240px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>微增率 / 耗水率特性曲线 (Incremental Rate)</span>
                   <span className="text-cyan-500">Optimum Zone</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={EFFICIENCY_CURVES}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="mw" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load (%)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[2.2, 3.0]} label={{ value: 'm³/kWh', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                       <Legend wrapperStyle={{fontSize: '10px'}} />
                       <ReferenceLine x={85} stroke="#10b981" strokeDasharray="3 3" label={{value:'Best G1', fill:'#10b981', fontSize:9}} />
                       <Line type="monotone" dataKey="g1" stroke="#10b981" strokeWidth={2} dot={false} name="G1 (High Head)" />
                       <Line type="monotone" dataKey="g2" stroke="#3b82f6" strokeWidth={2} dot={false} name="G2 (Normal)" />
                   </LineChart>
               </ResponsiveContainer>
           </div>

        </div>

        {/* --- RIGHT: Strategy Library & Results --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="经济运行策略库" subtitle="STRATEGIES" className="flex-1 border-amber-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
                   {STRATEGIES.map((s) => (
                       <div 
                         key={s.id}
                         onClick={() => setActiveStrategy(s.id)}
                         className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                            ${activeStrategy === s.id 
                                ? 'bg-amber-900/20 border-amber-500/50' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <span className={`text-xs font-bold ${activeStrategy === s.id ? 'text-white' : 'text-slate-300'}`}>{s.name}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                   ${s.status === 'Active' ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-slate-500'}
                               `}>{s.status}</span>
                           </div>
                           <div className="flex gap-2 mb-2">
                               {s.tags.map(t => (
                                   <span key={t} className="text-[9px] text-slate-500 bg-slate-900 px-1 rounded">{t}</span>
                               ))}
                           </div>
                           <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                               <span className="text-[10px] text-slate-500 font-mono">{s.id}</span>
                               <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                   <DollarSign size={10} /> {s.gain}
                               </div>
                           </div>
                           {activeStrategy === s.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                       </div>
                   ))}
               </div>
               <button className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                   <Settings size={12} /> 自定义策略参数
               </button>
           </SciFiCard>

           <div className="p-4 bg-gradient-to-br from-green-900/20 to-slate-900 border border-green-900/30 rounded-lg">
               <div className="flex items-center gap-2 mb-3">
                   <CheckCircle2 size={16} className="text-green-500" />
                   <span className="text-xs font-bold text-green-200 uppercase tracking-wider">Projected Savings</span>
               </div>
               <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] text-slate-400">Water Saved</span>
                   <span className="text-lg font-mono font-bold text-white">45.2 <span className="text-xs font-normal text-slate-500">k m³</span></span>
               </div>
               <div className="flex justify-between items-end">
                   <span className="text-[10px] text-slate-400">Revenue Inc.</span>
                   <span className="text-lg font-mono font-bold text-amber-400">+¥ 12.8k</span>
               </div>
               <div className="mt-3 text-[9px] text-slate-500 text-center border-t border-slate-800 pt-2">
                   Based on 24h simulation window vs baseline
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
