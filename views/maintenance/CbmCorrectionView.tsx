import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CbmThreeScene } from '../../components/maintenance_cbm/ThreeScene';
import { 
  Activity, 
  Sliders, 
  Zap, 
  BrainCircuit, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  RefreshCcw,
  ArrowRight,
  Target,
  Waves,
  History,
  Maximize,
  Cpu
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const CBM_TRIGGERS = [
  { id: 'TRG-092', asset: '#2 循环泵电机', metric: '振动位移 (P-P)', current: '128 μm', limit: '100 μm', status: 'critical', time: '10:42:05' },
  { id: 'TRG-093', asset: '伺服阀 V-401', metric: '响应滞后', current: '450 ms', limit: '300 ms', status: 'warning', time: '11:15:30' },
  { id: 'TRG-094', asset: '变频器 INV-B', metric: '输出谐波 (THD)', current: '5.2 %', limit: '4.0 %', status: 'warning', time: '12:05:12' },
];

const SIGNAL_HISTORY = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  raw: 0, 
  corrected: 0,
  limit: 80
}));

export const CbmCorrectionView: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState(CBM_TRIGGERS[0].id);
  const [stability, setStability] = useState(0.3); // 0.3 = Unstable, 1.0 = Stable
  const [params, setParams] = useState({ gain: 1.4, offset: 15, filter: 20 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [simData, setSimData] = useState(SIGNAL_HISTORY);
  
  const activeTrigger = CBM_TRIGGERS.find(t => t.id === selectedTrigger) || CBM_TRIGGERS[0];
  const isOptimal = stability > 0.95;

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimData(prev => {
        const t = (prev[prev.length - 1].time + 1);
        
        // Simulate Raw Signal (Noisy & Drifting based on stability)
        // If stability is low, noise and drift are high
        const chaosFactor = 1 - stability;
        const baseSignal = 60;
        const noise = (Math.random() - 0.5) * 40 * chaosFactor; 
        const drift = Math.sin(t * 0.1) * 30 * chaosFactor;
        const glitch = Math.random() > 0.95 ? 20 * chaosFactor : 0;
        
        const rawVal = baseSignal + drift + noise + glitch + (activeTrigger.status === 'critical' ? 20 : 10);
        
        // Simulate Corrected Signal (Filtered & Adjusted)
        // As stability increases (via tuning), the corrected signal approaches the ideal flat line
        // We simulate the effect of the params here conceptually
        const ideal = 60;
        const currentVal = rawVal;
        const correctedVal = currentVal * (1 - (params.gain - 1) * 0.5) - (params.offset * 0.5);
        
        // Smooth it out based on filter "param"
        const smoothedVal = correctedVal * (params.filter / 100) + ideal * (1 - params.filter / 100);

        const newPoint = {
          time: t,
          raw: rawVal,
          corrected: isCalibrating || stability > 0.8 ? smoothedVal : rawVal * 0.9, // Show raw-ish until tuned
          limit: 100
        };
        return [...prev.slice(1), newPoint];
      });
    }, 50);
    return () => clearInterval(interval);
  }, [stability, params, activeTrigger, isCalibrating]);

  const handleAutoTune = () => {
    setIsCalibrating(true);
    // Simulate AI tuning process over time
    const tuneInterval = setInterval(() => {
      setStability(prev => {
        const next = Math.min(1, prev + 0.02);
        if (next >= 0.98) {
          clearInterval(tuneInterval);
          setIsCalibrating(false);
          return 1;
        }
        return next;
      });
      
      // Converge parameters to ideal
      setParams(prev => ({
        gain: prev.gain > 1.0 ? Math.max(1.0, prev.gain - 0.01) : 1.0,
        offset: prev.offset > 0 ? Math.max(0, prev.offset - 0.5) : 0,
        filter: Math.min(95, prev.filter + 1)
      }));
    }, 50);
  };

  const handleManualChange = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    // Manual tuning slightly affects stability visually
    if (!isCalibrating) {
       // Simple logic: if params are close to ideal, stability is high
       const idealGain = 1.0;
       const idealOffset = 0;
       const dist = Math.abs(value - (key === 'gain' ? idealGain : idealOffset));
       // This is just for visual feedback
       setStability(Math.max(0.3, 1 - dist / 50)); 
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部标题 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-purple-600/20 border-2 border-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              <Activity size={32} className="text-purple-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Condition Based Maintenance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 设备状态修正 <span className="text-purple-500 italic">CBM 触发响应</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">待处理触发</div>
              <div className="text-xl font-mono font-bold text-white">03</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI 算力负载</div>
              <div className="text-xl font-mono font-bold text-cyan-400">42%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：触发队列 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="异常触发队列" subtitle="TRIGGER_QUEUE" highlight className="border-purple-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {CBM_TRIGGERS.map(trigger => (
                    <div 
                      key={trigger.id}
                      onClick={() => {
                          setSelectedTrigger(trigger.id);
                          setStability(0.3); // Reset stability on switch
                          setParams({ gain: 1.4, offset: 15, filter: 20 });
                      }}
                      className={`p-4 rounded border cursor-pointer transition-all relative overflow-hidden group
                         ${selectedTrigger === trigger.id 
                            ? 'bg-purple-950/30 border-purple-500 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       {selectedTrigger === trigger.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                       
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-slate-500">{trigger.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${trigger.status === 'critical' ? 'bg-red-900/40 text-red-400 border border-red-500/30' : 'bg-amber-900/40 text-amber-400 border border-amber-500/30'}
                          `}>{trigger.status}</span>
                       </div>
                       
                       <div className="text-sm font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{trigger.asset}</div>
                       
                       <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded border border-white/5">
                          <div>
                             <div className="text-slate-500">Metric</div>
                             <div className="text-slate-300">{trigger.metric}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-slate-500">Current / Limit</div>
                             <div className="font-mono">
                                <span className={trigger.status === 'critical' ? 'text-red-400 font-bold' : 'text-amber-400'}>{trigger.current}</span>
                                <span className="text-slate-600 mx-1">/</span>
                                <span className="text-slate-400">{trigger.limit}</span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-2 text-[9px] text-slate-600 text-right font-mono">Timestamp: {trigger.time}</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                 <History size={14} className="text-purple-500" /> 修正历史记录
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                    <span>#1 机组振动</span>
                    <span className="text-green-500">已闭环</span>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                    <span>#3 泵温度漂移</span>
                    <span className="text-green-500">已闭环</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 中间：可视化诊断工作台 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           
           {/* 3D 核心视窗 */}
           <div className="flex-1 min-h-[350px] relative bg-[#020205] border border-purple-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs">
                          <Cpu size={14} className="animate-pulse" />
                          DIGITAL TWIN: SENSOR NODE
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Signal <span className="text-purple-500">Reconstruction</span>
                       </div>
                    </div>
                    <div className="bg-black/60 border border-purple-500/30 p-2 rounded backdrop-blur">
                       <div className="text-[10px] text-slate-500 uppercase text-right">Stability Index</div>
                       <div className={`text-xl font-mono font-bold text-right ${isOptimal ? 'text-green-400' : 'text-amber-400'}`}>
                          {(stability * 100).toFixed(1)}%
                       </div>
                    </div>
                 </div>

                 {/* 中间提示 */}
                 {isCalibrating && (
                    <div className="self-center bg-black/70 border border-purple-500 text-purple-400 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse backdrop-blur">
                       AI Auto-Tuning In Progress...
                    </div>
                 )}

                 {/* 底部状态 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-cyan-500"></div> Raw Input
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-purple-500"></div> Corrected Output
                        </div>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <CbmThreeScene 
                    status={isOptimal ? 'optimal' : (stability > 0.6 ? 'warning' : (isCalibrating ? 'calibrating' : 'critical'))}
                    stability={stability}
                    pulseSpeed={isCalibrating ? 4 : 1}
                 />
              </div>
           </div>

           {/* 信号示波器 */}
           <SciFiCard title="实时信号示波器" subtitle="OSCILLOSCOPE" className="h-64 border-purple-900/30" noPadding>
              <div className="w-full h-full p-4 pt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 140]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6', fontSize: '10px'}} />
                       <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                       <Line type="monotone" dataKey="raw" stroke="#64748b" strokeWidth={1} dot={false} strokeOpacity={0.5} name="Raw Signal" />
                       <Line 
                          type="monotone" 
                          dataKey="corrected" 
                          stroke={isOptimal ? '#10b981' : '#8b5cf6'} 
                          strokeWidth={2} 
                          dot={false} 
                          name="Corrected" 
                          animationDuration={300}
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：修正控制台 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="参数修正控制台" subtitle="TUNING" className="border-slate-800">
              <div className="flex flex-col gap-6">
                 
                 {/* Gain Slider */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Signal Gain</span>
                       <span className="font-mono text-purple-300">{params.gain.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.01" 
                      value={params.gain}
                      onChange={(e) => handleManualChange('gain', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 {/* Offset Slider */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Bias Offset</span>
                       <span className="font-mono text-purple-300">{params.offset.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="-20" max="20" step="0.5" 
                      value={params.offset}
                      onChange={(e) => handleManualChange('offset', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 {/* Filter Slider */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Filter Bandwidth</span>
                       <span className="font-mono text-purple-300">{params.filter}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="1" 
                      value={params.filter}
                      onChange={(e) => handleManualChange('filter', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <button 
                      onClick={handleAutoTune}
                      disabled={isCalibrating || isOptimal}
                      className={`w-full py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                         ${isOptimal 
                            ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'}
                         ${isCalibrating ? 'opacity-80 cursor-wait' : ''}
                      `}
                    >
                       {isCalibrating ? <RefreshCcw className="animate-spin" size={14}/> : (isOptimal ? <CheckCircle2 size={14}/> : <BrainCircuit size={14}/>)}
                       {isCalibrating ? 'Optimizing...' : (isOptimal ? 'Optimal State Reached' : 'AI Auto-Tune')}
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="诊断结论与建议" subtitle="REPORT" className="flex-1">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900/50 border border-slate-800 rounded flex gap-3 items-start">
                    <Target className="text-purple-500 shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-slate-300 leading-relaxed">
                       检测到传感器零点漂移。信号包含周期性高频噪声，特征频率符合外部电源干扰。
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                       <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
                       <span className="text-xs font-bold text-green-400">98.2%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                       <span className="text-[10px] text-slate-500 uppercase">Est. Deviation</span>
                       <span className="text-xs font-bold text-amber-400">+12.5%</span>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                       <Zap size={14} /> 应用修正参数 (Apply)
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
