
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Hourglass, TrendingUp, GitBranch, Calculator, 
  RefreshCw, AlertTriangle, PlayCircle, FastForward, 
  RotateCcw, History, Scale, Coins, Zap,
  Thermometer, Gauge, Activity, ArrowRight,
  Clock, CheckCircle2, FileText
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Scatter, Cell, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface AssetLifeProfile {
  id: string;
  name: string;
  installDate: string;
  designLife: number; // years
  currentAge: number; // years
  predictedRUL: number; // Remaining Useful Life (days)
  healthIndex: number; // 0-100
  agingRate: 'Slow' | 'Normal' | 'Accelerated';
}

interface StressFactor {
  factor: string;
  currentLoad: number; // 0-100%
  impactWeight: number; // 0-1
}

interface SimulationScenario {
  id: string;
  name: string;
  action: string;
  cost: number;
  extensionGain: number; // days
  roi: number; // ratio
}

// --- Mock Data ---

const ASSETS: AssetLifeProfile[] = [
  { id: 'EQ-GT-202', name: '#2 燃气轮机 (Gas Turbine)', installDate: '2015-06', designLife: 20, currentAge: 8.8, predictedRUL: 2450, healthIndex: 82, agingRate: 'Normal' },
  { id: 'EQ-TR-505', name: '主变压器 (Main Transformer)', installDate: '2010-03', designLife: 30, currentAge: 14.1, predictedRUL: 4200, healthIndex: 94, agingRate: 'Slow' },
  { id: 'EQ-PMP-101', name: '高压给水泵 (Feed Pump)', installDate: '2018-11', designLife: 15, currentAge: 5.4, predictedRUL: 360, healthIndex: 65, agingRate: 'Accelerated' },
];

const STRESS_FACTORS: StressFactor[] = [
  { factor: '热应力 (Thermal)', currentLoad: 85, impactWeight: 0.9 },
  { factor: '机械疲劳 (Fatigue)', currentLoad: 60, impactWeight: 0.7 },
  { factor: '电气老化 (Dielectric)', currentLoad: 40, impactWeight: 0.4 },
  { factor: '环境腐蚀 (Corrosion)', currentLoad: 30, impactWeight: 0.3 },
  { factor: '启停循环 (Start/Stop)', currentLoad: 90, impactWeight: 0.8 },
];

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  { id: 'SIM-A', name: '保守运行策略', action: '降负荷至 85%', cost: 50000, extensionGain: 450, roi: 3.5 },
  { id: 'SIM-B', name: '核心部件翻新', action: '更换叶片/轴承', cost: 800000, extensionGain: 1800, roi: 2.1 },
  { id: 'SIM-C', name: '冷却系统升级', action: '优化散热效率', cost: 150000, extensionGain: 600, roi: 4.8 },
];

// --- Components ---

const AgingCurveChart = ({ currentAge, rul, scenarioEffect = 0 }: { currentAge: number, rul: number, scenarioEffect?: number }) => {
  // Generate curve data: Health vs Time
  const data = [];
  const totalYears = currentAge + (rul / 365) + 5; // Chart range
  
  for (let i = 0; i <= totalYears * 12; i+=6) { // Every 6 months
    const t = i / 12; // years
    let health = 100 * Math.exp(-0.05 * t); // Base decay
    
    // Add noise/events
    if (t > 5) health -= 2; 
    
    // Prediction branching
    let predictedHealth = health;
    let extendedHealth = health;

    if (t > currentAge) {
       // Future prediction
       predictedHealth = 100 * Math.exp(-0.08 * t); // Accelerated aging in future
       
       // Scenario effect
       if (scenarioEffect > 0) {
           const extensionFactor = 0.08 * (1 - (scenarioEffect / 2000)); // Simply flattening the curve
           extendedHealth = 100 * Math.exp(-extensionFactor * t);
       }
    } else {
        predictedHealth = health;
        extendedHealth = health;
    }

    data.push({
      time: t.toFixed(1),
      actual: t <= currentAge ? health : null,
      predicted: t > currentAge ? predictedHealth : null,
      extended: t > currentAge && scenarioEffect > 0 ? extendedHealth : null,
      threshold: 40 // EOL Threshold
    });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
        <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
        <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
        
        {/* EOL Threshold */}
        <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'EOL Limit', fill: '#ef4444', fontSize: 10, position: 'right'}} />
        
        {/* Current Time Line */}
        <ReferenceLine x={currentAge.toFixed(1)} stroke="#fff" label={{value: 'NOW', fill: '#fff', fontSize: 10, position: 'top'}} />

        <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Historical Health" />
        <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeDasharray="5 5" fill="url(#colorPred)" strokeWidth={2} name="Base Prediction" />
        
        {scenarioEffect > 0 && (
            <Area type="monotone" dataKey="extended" stroke="#10b981" strokeWidth={2} fill="url(#colorExt)" name="With Strategy" />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const LifePredictionView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState(ASSETS[0].id);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simulatedExtension, setSimulatedExtension] = useState(0); // days

  const activeAsset = ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0];
  const selectedScenarioData = SIMULATION_SCENARIOS.find(s => s.id === activeScenario);

  useEffect(() => {
    if (selectedScenarioData) {
        setSimulatedExtension(selectedScenarioData.extensionGain);
    } else {
        setSimulatedExtension(0);
    }
  }, [selectedScenarioData]);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#06040d]">
      
      {/* 1. Header: The Chronos Interface */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#160b29] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <Hourglass size={14} className="animate-pulse" /> Predictive Engineering
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             设备寿命预测 <span className="text-purple-500">与延寿评估引擎</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[140px]">
                <span className="text-[10px] text-slate-500 uppercase">Fleet RUL Average</span>
                <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-purple-500" /> 4.2 Years
                </div>
             </div>
             <button className="h-full px-4 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold text-sm shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-colors flex items-center gap-2">
                <Calculator size={16} /> 导出评估报告
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Asset & Stress Analysis */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Asset Selector */}
           <SciFiCard title="评估对象 (Assets)" className="border-purple-900/30">
               <div className="flex flex-col gap-2">
                   {ASSETS.map(asset => (
                       <div 
                         key={asset.id}
                         onClick={() => { setSelectedAssetId(asset.id); setActiveScenario(null); }}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                            ${selectedAssetId === asset.id 
                                ? 'bg-purple-950/30 border-purple-500/50 shadow-[inset_4px_0_0_#a855f7]' 
                                : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-xs font-bold text-white">{asset.name}</span>
                               <span className={`text-[9px] px-1.5 rounded uppercase font-bold
                                  ${asset.agingRate === 'Accelerated' ? 'bg-red-900/30 text-red-400' : 
                                    asset.agingRate === 'Normal' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'}
                               `}>{asset.agingRate} Aging</span>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>Age: {asset.currentAge} yrs</span>
                               <span>RUL: <span className="text-white font-mono">{asset.predictedRUL} days</span></span>
                           </div>
                           {/* Mini Health Bar */}
                           <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                               <div className={`h-full ${asset.healthIndex > 80 ? 'bg-green-500' : asset.healthIndex > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${asset.healthIndex}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Stress Radar */}
           <SciFiCard title="寿命损耗因子 (Stressors)" subtitle="IMPACT ANALYSIS" className="flex-1 border-slate-800">
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={STRESS_FACTORS.map(s => ({...s, full: 100}))}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Load" dataKey="currentLoad" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#f59e0b', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
               <div className="space-y-2 mt-2">
                   {STRESS_FACTORS.sort((a,b) => b.currentLoad - a.currentLoad).slice(0, 3).map((factor, i) => (
                       <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-slate-900/30 rounded border border-slate-800/50">
                           <span className="text-slate-300">{factor.factor}</span>
                           <span className="font-mono text-amber-400 font-bold">{factor.currentLoad}%</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Simulation & Projection */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Main Projection Chart */}
           <SciFiCard title="寿命演变推演 (Evolution Trajectory)" subtitle="AI FORECAST" className="h-[450px] border-purple-900/50 bg-[#080512]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   {/* Top Summary in Chart */}
                   <div className="flex justify-between mb-2">
                       <div className="flex gap-6">
                           <div>
                               <div className="text-[10px] text-slate-500 uppercase">Baseline RUL</div>
                               <div className="text-xl font-mono font-bold text-white">{activeAsset.predictedRUL} <span className="text-xs text-slate-500">Days</span></div>
                           </div>
                           {simulatedExtension > 0 && (
                               <div className="animate-in fade-in slide-in-from-bottom-2">
                                   <div className="text-[10px] text-slate-500 uppercase">Extension Potential</div>
                                   <div className="text-xl font-mono font-bold text-green-400">+{simulatedExtension} <span className="text-xs text-slate-500">Days</span></div>
                               </div>
                           )}
                       </div>
                       
                       <div className="flex gap-2">
                           <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 bg-[#0ea5e9] rounded-full"></div> History</div>
                           <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 bg-[#8b5cf6] rounded-full"></div> Predicted</div>
                           {simulatedExtension > 0 && <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 bg-[#10b981] rounded-full"></div> Extended</div>}
                       </div>
                   </div>

                   <div className="flex-1">
                       <AgingCurveChart currentAge={activeAsset.currentAge} rul={activeAsset.predictedRUL} scenarioEffect={simulatedExtension} />
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Physics Model (3D) */}
           <SciFiCard title="老化机理可视化 (Degradation Physics)" subtitle="DIGITAL TWIN" className="flex-1 border-slate-800" noPadding>
               <div className="w-full h-full relative min-h-[250px] bg-black">
                   <div className="absolute top-4 left-4 z-10 pointer-events-none">
                       <div className="bg-black/60 backdrop-blur border border-red-500/30 px-3 py-1 rounded text-xs text-red-200 flex items-center gap-2">
                           <Thermometer size={14} /> Hotspot Detected: Turbine Blade Root (Stage 1)
                       </div>
                   </div>
                   
                   <ThreeScene type="turbine" color="#f59e0b" />
                   
                   {/* Gradient Overlay for "Aging" effect */}
                   <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Decision Support */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Extension Strategies */}
           <SciFiCard title="延寿策略模拟 (Extension Strategies)" subtitle="WHAT-IF" className="flex-1 border-green-900/30">
               <div className="flex flex-col gap-3">
                   {SIMULATION_SCENARIOS.map(scenario => (
                       <div 
                         key={scenario.id}
                         onClick={() => setActiveScenario(activeScenario === scenario.id ? null : scenario.id)}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                            ${activeScenario === scenario.id 
                                ? 'bg-green-900/20 border-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                   <GitBranch size={16} className={activeScenario === scenario.id ? 'text-green-400' : 'text-slate-500'} />
                                   <span className="font-bold text-sm">{scenario.name}</span>
                               </div>
                               {activeScenario === scenario.id && <CheckCircle2 size={16} className="text-green-500" />}
                           </div>
                           
                           <div className="text-xs text-slate-300 mb-2">{scenario.action}</div>
                           
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-black/20 p-2 rounded">
                               <div>Cost: <span className="text-white">¥{scenario.cost.toLocaleString()}</span></div>
                               <div>Gain: <span className="text-green-400">+{scenario.extensionGain}d</span></div>
                               <div className="col-span-2 flex items-center gap-1">
                                   ROI Ratio: 
                                   <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                       <div className="h-full bg-yellow-500" style={{width: `${(scenario.roi/5)*100}%`}}></div>
                                   </div>
                                   <span className="text-yellow-400 font-bold">{scenario.roi}</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Economic Analysis */}
           <SciFiCard title="经济性评估 (Economics)" subtitle="COST/BENEFIT" className="h-[250px] border-slate-800">
               <div className="flex flex-col h-full justify-center">
                   {activeScenario ? (
                       <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                               <span className="text-xs text-slate-400">Strategy Cost</span>
                               <span className="text-sm font-mono text-red-400">- ¥{selectedScenarioData?.cost.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                               <span className="text-xs text-slate-400">Avoided Downtime</span>
                               <span className="text-sm font-mono text-green-400">+ ¥{(selectedScenarioData!.cost * selectedScenarioData!.roi).toLocaleString()}</span>
                           </div>
                           <div className="h-px bg-slate-700 my-2"></div>
                           <div className="flex justify-between items-center">
                               <span className="text-sm font-bold text-white">Net Benefit</span>
                               <span className="text-xl font-mono font-bold text-yellow-400">
                                   ¥ {((selectedScenarioData!.cost * selectedScenarioData!.roi) - selectedScenarioData!.cost).toLocaleString()}
                               </span>
                           </div>
                           
                           <button className="w-full mt-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg">
                               <FileText size={14} /> Generate Proposal
                           </button>
                       </div>
                   ) : (
                       <div className="text-center text-slate-500 text-xs italic">
                           <Scale size={32} className="mx-auto mb-2 opacity-30"/>
                           Select a strategy above to calculate economic impact.
                       </div>
                   )}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
