import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/ground-pressure/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-ground-pressure]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-ground-pressure';
import { PressureSimState } from '../../components/knowledge-manage/ground-pressure/three-types';
import { 
  Activity, AlertTriangle, Layers, Search, 
  TrendingUp, Radio, Volume2, Database,
  ArrowRight, ShieldAlert, Zap, FileText, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

const PRECURSOR_PATTERNS = [
  { id: 'P01', title: '缺震现象 (Seismic Gap)', desc: '大震前微震频次显著降低，能量积聚。', risk: 'High' },
  { id: 'P02', title: 'V型反转 (V-Pattern)', desc: '能量释放先降后升，预示破坏临近。', risk: 'Critical' },
  { id: 'P03', title: 'b值下降 (b-value drop)', desc: '小震减少大震增多，岩体破裂尺度增大。', risk: 'High' },
  { id: 'P04', title: '空间集中 (Spatial Conc.)', desc: '微震事件向某一区域高度集中。', risk: 'Med' },
];

const AE_WAVEFORM = Array.from({length: 100}, (_, i) => ({
    time: i,
    amp: Math.sin(i * 0.5) * Math.exp(-i * 0.05) * 50 + (Math.random()-0.5)*10
}));

const ENERGY_TREND = Array.from({length: 30}, (_, i) => ({
    day: i + 1,
    energy: 1000 + Math.random() * 500 + (i > 20 ? i * 200 : 0), // Increasing trend at end
    freq: 50 + Math.random() * 20 - (i > 25 ? i : 0) // Decreasing freq (Gap)
}));

const STRESS_CLOUD_DATA = Array.from({length: 20}, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 1000 // Stress value
}));

export const GroundPressureKbView: React.FC = () => {
  const [simState, setSimState] = useState<PressureSimState>('MONITORING');
  const [selectedPattern, setSelectedPattern] = useState(PRECURSOR_PATTERNS[0]);
  const [depth, setDepth] = useState(850);
  const [stressVal, setStressVal] = useState(24.5);

  // Simulation loop for dynamic data
  useEffect(() => {
    const interval = setInterval(() => {
        if (simState === 'MONITORING') {
            setStressVal(24.5 + Math.random() * 0.5);
        } else if (simState === 'STRESS_CONC') {
            setStressVal(prev => Math.min(45, prev + 0.5));
        } else if (simState === 'PRECURSOR') {
            setStressVal(prev => Math.min(60, prev + 1.0));
        } else if (simState === 'BURST_EVENT') {
            setStressVal(prev => 20 + Math.random() * 60); // Chaos
        }
    }, 500);
    return () => clearInterval(interval);
  }, [simState]);

  const handleTrigger = (state: PressureSimState) => {
      setSimState(state);
      // Auto reset after burst
      if (state === 'BURST_EVENT') {
          setTimeout(() => setSimState('MONITORING'), 5000);
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#050505] p-2 relative overflow-hidden">
      
      {/* Background Texture: Seismic Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
               backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px)',
               backgroundSize: '100% 20px'
           }}>
      </div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-red-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-900/20 border-2 border-red-600 rounded flex items-center justify-center relative overflow-hidden">
             <Activity size={28} className="text-red-500 animate-pulse" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-red-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldAlert size={12} /> Deep Earth Security
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               深井地压冲击 <span className="text-red-500 italic">前兆特征指纹库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Current Depth</div>
                <div className="text-2xl font-mono font-black text-white">-{depth} <span className="text-sm font-normal text-slate-600">m</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Stress Index</div>
                <div className={`text-3xl font-mono font-black ${stressVal > 40 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {stressVal.toFixed(1)} <span className="text-sm font-normal text-slate-600">MPa</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Pattern Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="前兆模式特征库" subtitle="PATTERNS" className="flex-1 border-red-900/30 bg-[#0a0505]/90">
              <div className="relative mb-3">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="搜索特征关键词..." 
                     className="w-full bg-slate-900 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                   />
              </div>
              
              <div className="flex flex-col gap-2">
                  {PRECURSOR_PATTERNS.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPattern(p)}
                        className={`p-3 rounded border-l-4 cursor-pointer transition-all hover:bg-slate-800
                           ${selectedPattern.id === p.id 
                               ? 'bg-red-900/20 border-red-500' 
                               : 'bg-slate-900/30 border-slate-700'}
                        `}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-bold ${selectedPattern.id === p.id ? 'text-red-300' : 'text-slate-300'}`}>{p.title}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${p.risk==='Critical'?'bg-red-600 text-black':'bg-orange-600 text-black'}`}>
                                  {p.risk}
                              </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{p.desc}</p>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="典型波形指纹" subtitle="WAVEFORM" className="h-[220px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={AE_WAVEFORM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={[-80, 80]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Line type="monotone" dataKey="amp" stroke="#ef4444" strokeWidth={1.5} dot={false} animationDuration={0} />
                       </LineChart>
                   </ResponsiveContainer>
                   <div className="text-center text-[10px] text-red-500 mt-1 flex justify-center gap-4">
                       <span>Freq: 150-300Hz</span>
                       <span>Amp: High</span>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Simulation --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050505] border border-red-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-red-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-red-500 shadow-xl">
                       <div className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Layers size={10}/> Real-time Stress Field
                       </div>
                       <div className="text-xl font-black text-white">{simState}</div>
                   </div>
               </div>

               {/* Simulation Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-slate-950/90 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   {[
                       { id: 'MONITORING', label: '正常监测', color: 'bg-slate-700' },
                       { id: 'STRESS_CONC', label: '应力集中', color: 'bg-yellow-600' },
                       { id: 'PRECURSOR', label: '前兆显现', color: 'bg-orange-600' },
                       { id: 'BURST_EVENT', label: '冲击发生', color: 'bg-red-600' },
                   ].map((mode) => (
                       <button 
                         key={mode.id}
                         onClick={() => handleTrigger(mode.id as PressureSimState)}
                         className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all hover:scale-105
                            ${simState === mode.id ? mode.color + ' text-white shadow-lg' : 'bg-transparent text-slate-400 border border-slate-700 hover:text-white'}
                         `}
                       >
                           {mode.label}
                       </button>
                   ))}
               </div>
           </div>

           {/* Energy-Frequency Trend */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>微震能量-频次关系 (Energy-Frequency Relation)</span>
                   <span className="text-red-400 flex items-center gap-1"><TrendingUp size={10}/> Anomalous Trend</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={ENERGY_TREND}>
                       <defs>
                           <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Energy (J)', angle: -90, position: 'insideLeft', fontSize: 9, fill:'#ef4444' }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: 'Freq (N)', angle: 90, position: 'insideRight', fontSize: 9, fill:'#0ea5e9' }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#333'}} />
                       <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                       
                       <Area yAxisId="left" type="monotone" dataKey="energy" stroke="#ef4444" fill="url(#energyGrad)" name="Total Energy" />
                       <Line yAxisId="right" type="step" dataKey="freq" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Event Freq" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>

        </div>

        {/* --- RIGHT: Analytics & Reports --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="应力集中区云图" subtitle="HEATMAP" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="x" name="X" hide />
                           <YAxis type="number" dataKey="y" name="Y" hide />
                           <ZAxis type="number" dataKey="z" range={[50, 400]} name="Stress" />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0a09'}} />
                           <Scatter name="Stress Points" data={STRESS_CLOUD_DATA} fill="#ef4444" shape="square" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 诊断报告" subtitle="ANALYSIS" className="flex-1 border-red-900/30">
               <div className="flex flex-col gap-3 h-full">
                   <div className="p-3 bg-red-950/20 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <Zap size={16} className="text-yellow-500" />
                           <span className="text-xs font-bold text-yellow-200">当前风险评估</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-relaxed">
                          检测到工作面超前支承压力峰值区存在微震能量集聚，且b值持续走低。符合【{selectedPattern.title}】特征。
                       </p>
                   </div>
                   
                   <div className="flex-1 space-y-2">
                       <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                           <span>Control Measures</span>
                       </div>
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500"/> 实施大直径钻孔卸压
                       </div>
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500"/> 降低推进速度
                       </div>
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500"/> 加强非接触式监测
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                       <FileText size={14} /> 生成防冲专项报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};