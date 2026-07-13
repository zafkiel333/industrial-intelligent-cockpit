
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-power-ram]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-power-ram';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, TrendingDown, Activity, 
  Wrench, BarChart2, Clock, Zap, Target
} from 'lucide-react';

// --- MOCK DATA ---

// Reliability Growth Curve (Duane Model)
const GROWTH_DATA = Array.from({length: 24}, (_, i) => {
    const t = (i + 1) * 1000; // Operating Hours
    // MTBF increases as early failures are fixed
    const mtbf = 2000 + 500 * Math.log(t/500) + Math.random() * 200;
    return { hours: t, mtbf: Math.round(mtbf) };
});

// Bathtub Curve (Failure Rate vs Time)
const BATHTUB_DATA = Array.from({length: 50}, (_, i) => {
    const t = i;
    // Early failure (Infant Mortality)
    const infant = 5 * Math.exp(-0.5 * t);
    // Random failure (Constant)
    const random = 0.5;
    // Wear-out (Aging)
    const wear = 0.001 * Math.pow(Math.max(0, t - 30), 2.5);
    
    return { time: t, rate: infant + random + wear };
});

// Failure Mode Distribution
const FAILURE_MODES = [
    { name: 'Insulation', value: 35, fill: '#8b5cf6' },
    { name: 'Bearing', value: 25, fill: '#06b6d4' },
    { name: 'Cooling', value: 20, fill: '#ef4444' },
    { name: 'Control', value: 15, fill: '#f59e0b' },
    { name: 'Other', value: 5, fill: '#64748b' },
];

export const PowerRamView: React.FC = () => {
  // --- STATE ---
  const [activeComponent, setActiveComponent] = useState('Generator');
  const [simulationDays, setSimulationDays] = useState(0);
  
  const [metrics, setMetrics] = useState({
    reliability: 98.5, // %
    availability: 99.2, // %
    mtbf: 4520, // hours
    mttr: 4.5, // hours
    riskLevel: 'LOW'
  });

  // Monte Carlo Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setSimulationDays(prev => prev + 1);
        
        setMetrics(prev => {
            const noise = (Math.random() - 0.5) * 0.1;
            // Simulated degradation
            const relDrop = simulationDays > 100 ? 0.05 : 0;
            
            return {
                ...prev,
                reliability: Math.max(90, prev.reliability + noise - relDrop * 0.01),
                mtbf: Math.round(prev.mtbf + noise * 100),
                availability: Math.max(95, prev.availability + noise)
            };
        });
    }, 100); // Fast simulation
    return () => clearInterval(interval);
  }, [simulationDays]);

  const resetSim = () => {
      setSimulationDays(0);
      setMetrics(prev => ({ ...prev, reliability: 99.9, riskLevel: 'LOW' }));
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c0816] text-violet-50 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"></div>

      {/* HEADER: Sci-Fi Style */}
      <div className="relative z-10 flex items-center justify-between border-b border-violet-900/50 pb-4 px-4 bg-gradient-to-r from-violet-950/80 to-transparent pt-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider font-bold">
             <ShieldCheck size={14} /> Reliability Engineering Center
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             发电设备 <span className="text-violet-500 text-shadow-glow">可靠性 (RAM) 指数分析</span>
          </h1>
        </div>
        
        {/* Top Scorecards */}
        <div className="flex gap-6">
            <div className="flex flex-col items-center bg-slate-900/60 p-2 rounded border border-violet-800/30 w-32">
                <div className="text-[10px] text-slate-400 uppercase">Availability</div>
                <div className="text-2xl font-bold text-green-400">{metrics.availability.toFixed(1)}%</div>
            </div>
            <div className="flex flex-col items-center bg-slate-900/60 p-2 rounded border border-violet-800/30 w-32">
                <div className="text-[10px] text-slate-400 uppercase">MTBF (Hrs)</div>
                <div className="text-2xl font-bold text-blue-400">{metrics.mtbf}</div>
            </div>
            <div className="flex flex-col items-center bg-slate-900/60 p-2 rounded border border-violet-800/30 w-32">
                <div className="text-[10px] text-slate-400 uppercase">Reliability</div>
                <div className="text-2xl font-bold text-violet-400">{metrics.reliability.toFixed(2)}%</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Models & Config */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="威布尔分布模型 (Weibull)" subtitle="FAILURE PROBABILITY" className="h-[280px] border-violet-900/50 bg-[#120b21]/80">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={BATHTUB_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (t)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'λ(t)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0816', borderColor: '#8b5cf6', color: '#fff'}} />
                              <Line type="basis" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={false} name="Failure Rate" />
                              <ReferenceLine x={30} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Wear Out', fill: '#ef4444', fontSize: 10}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              <SciFiCard title="蒙特卡洛模拟 (Monte Carlo)" className="flex-1 border-violet-900/50">
                  <div className="flex flex-col h-full gap-4">
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-slate-300 flex items-center gap-2"><Clock size={12}/> Simulation Time</span>
                              <span className="font-mono text-violet-300">{simulationDays} Days</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-violet-600 h-full transition-all duration-100" style={{width: `${(simulationDays % 365) / 365 * 100}%`}}></div>
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
                          <div className="flex justify-between p-2 bg-slate-900/30 rounded">
                              <span className="text-slate-400">Iterations</span>
                              <span className="text-white">10,000</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-900/30 rounded">
                              <span className="text-slate-400">Confidence Level</span>
                              <span className="text-white">95%</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-900/30 rounded">
                              <span className="text-slate-400">Next Predicted Fail</span>
                              <span className="text-orange-400">Day 452</span>
                          </div>
                      </div>

                      <button onClick={resetSim} className="mt-auto w-full py-2 bg-violet-800 hover:bg-violet-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-900/20">
                          <Activity size={14} /> RESET SIMULATION
                      </button>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Exploded System View */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#05020b] border border-violet-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(139,92,246,0.15)] group">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-violet-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Zap size={16} className="text-violet-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">System Health</div>
                              <div className="text-sm font-bold text-white">OPTIMAL</div>
                          </div>
                      </div>
                  </div>

                  {/* Component Selector Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {['Exciter', 'Generator', 'Turbine'].map(comp => (
                          <button 
                             key={comp}
                             onClick={() => setActiveComponent(comp)}
                             className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${activeComponent === comp ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_10px_#8b5cf6]' : 'bg-black/50 text-slate-400 border-slate-700 hover:border-slate-500'}
                             `}
                          >
                             {comp}
                          </button>
                      ))}
                  </div>

                  <ThreeScene type="power-ram-analysis" color="#8b5cf6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  
                  {/* Grid Floor Overlay Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              {/* Bottom: Reliability Growth Chart */}
              <SciFiCard title="可靠性增长趋势 (Reliability Growth)" subtitle="DUANE MODEL" className="h-[220px] border-violet-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={GROWTH_DATA}>
                              <defs>
                                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                              <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Operating Hours', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'MTBF', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0816', borderColor: '#8b5cf6', color: '#fff'}} />
                              <Area type="monotone" dataKey="mtbf" stroke="#8b5cf6" fill="url(#growthGrad)" strokeWidth={2} name="MTBF Trend" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Failure Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Pareto Analysis */}
              <SciFiCard title="故障模式分析 (FMEA)" subtitle="PARETO" className="h-[280px] border-violet-900/50">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={FAILURE_MODES}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {FAILURE_MODES.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#0c0816', borderColor: '#8b5cf6'}} />
                              <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] text-slate-400 bg-slate-900/50 px-2 rounded">
                          Top Cause: Insulation
                      </div>
                  </div>
              </SciFiCard>

              {/* Maintenance Strategy */}
              <SciFiCard title="RCM 维护策略" subtitle="OPTIMIZED" className="flex-1 border-violet-900/50">
                  <div className="flex flex-col gap-3 h-full justify-center">
                      <div className="flex items-center gap-3 p-3 border-l-2 border-green-500 bg-slate-900/30 rounded">
                          <Target size={16} className="text-green-400" />
                          <div>
                              <div className="text-xs font-bold text-white">Condition Based</div>
                              <div className="text-[10px] text-slate-400">Bearings monitoring active</div>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border-l-2 border-yellow-500 bg-slate-900/30 rounded">
                          <Wrench size={16} className="text-yellow-400" />
                          <div>
                              <div className="text-xs font-bold text-white">Preventive (PM)</div>
                              <div className="text-[10px] text-slate-400">Filter change in 48h</div>
                          </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border-l-2 border-red-500 bg-slate-900/30 rounded">
                          <AlertTriangle size={16} className="text-red-400" />
                          <div>
                              <div className="text-xs font-bold text-white">Corrective (CM)</div>
                              <div className="text-[10px] text-slate-400">0 Active Defects</div>
                          </div>
                      </div>
                      
                      <div className="mt-2 text-center">
                          <div className="text-[10px] text-slate-500">Predicted MTTR</div>
                          <div className="text-xl font-bold text-white">{metrics.mttr} h</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
