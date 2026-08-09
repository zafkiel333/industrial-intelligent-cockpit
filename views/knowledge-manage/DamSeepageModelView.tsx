
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/dam-seepage/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-dam-seepage]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-dam-seepage';
import { SeepageSimState } from '../../components/knowledge-manage/dam-seepage/three-types';
import { 
  Thermometer, Droplets, Activity, GitCompare, 
  Play, RotateCcw, Database, ScanLine, 
  ArrowRight, Layers, FileText, Sigma
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

// DTS Temperature Profile along the fiber
const DTS_DATA = Array.from({length: 100}, (_, i) => {
    // Simulate a leak anomaly at index 65
    const baseTemp = 15 + Math.sin(i * 0.1) * 2;
    const anomaly = i > 60 && i < 70 ? 5 * Math.exp(-Math.pow(i - 65, 2) / 10) : 0;
    return {
        dist: i, // meters
        temp: baseTemp + anomaly,
        baseline: 15 + Math.sin(i * 0.1) * 2
    };
});

// Inversion Convergence (Residual Error over Iterations)
const CONVERGENCE_DATA = Array.from({length: 50}, (_, i) => ({
    iter: i,
    error: 10 * Math.exp(-0.1 * i) + Math.random() * 0.1
}));

// Permeability Coefficient Distribution (K)
const PERMEABILITY_DATA = [
    { zone: 'Upper', k: 1.2e-5, target: 1.0e-5 },
    { zone: 'Core', k: 0.5e-7, target: 0.5e-7 },
    { zone: 'Lower', k: 3.5e-5, target: 2.0e-5 }, // Anomaly here
    { zone: 'Grout', k: 0.1e-7, target: 0.1e-7 },
];

export const DamSeepageModelView: React.FC = () => {
  const [simState, setSimState] = useState<SeepageSimState>('IDLE');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 热力学反演模型库加载完毕...']);
  const [kValue, setKValue] = useState(3.5); // Dynamic K value for UI

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (simState === 'INVERSION') {
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setSimState('LEAK_DETECT');
                    addLog('>> 反演收敛完成。检测到局部渗透系数异常 (K > 3.0e-5)。');
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    } else if (simState === 'LEAK_DETECT') {
        setTimeout(() => {
            setSimState('RESULT');
            addLog('>> 渗漏通道定位完成：高程 EL.125m, 桩号 0+150.');
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [simState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const startInversion = () => {
      setSimState('THERMAL_SCAN');
      setProgress(0);
      addLog('>> 启动温度场重构...');
      setTimeout(() => {
          setSimState('INVERSION');
          addLog('>> 开始多物理场耦合反演计算...');
      }, 2000);
  };

  const reset = () => {
      setSimState('IDLE');
      setProgress(0);
      addLog('>> 模型重置');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#04060c] p-2 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_#0ea5e9_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-900/30 border-2 border-cyan-500 rounded flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
             <Thermometer size={30} className="text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Thermodynamics Inverse Analysis
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               大坝渗流 <span className="text-cyan-500 italic">热力学反演模型库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model Precision</div>
                <div className="text-2xl font-mono font-black text-white">98.5<span className="text-sm font-normal text-slate-600">%</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Calculation State</div>
                <div className={`text-2xl font-mono font-black ${simState === 'INVERSION' ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`}>
                    {simState}
                </div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Parameters & Control --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="反演参数配置 (Parameters)" subtitle="INPUT" className="border-cyan-900/30 bg-[#080c14]/80">
              <div className="space-y-4 p-1">
                 <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>初始导热系数 (λ)</span>
                         <span className="font-mono text-cyan-300">2.5 W/(m·K)</span>
                     </div>
                     <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                         <div className="h-full bg-cyan-600 w-[60%]"></div>
                     </div>
                 </div>
                 <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>比热容 (c)</span>
                         <span className="font-mono text-cyan-300">0.92 kJ/(kg·K)</span>
                     </div>
                     <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                         <div className="h-full bg-cyan-600 w-[75%]"></div>
                     </div>
                 </div>
                 <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>水库水位 (H)</span>
                         <span className="font-mono text-cyan-300">145.2 m</span>
                     </div>
                     <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                         <div className="h-full bg-blue-500 w-[85%]"></div>
                     </div>
                 </div>
                 
                 <div className="pt-2 border-t border-slate-800">
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Boundary Conditions</div>
                     <div className="grid grid-cols-2 gap-2">
                         <div className="bg-slate-900 border border-slate-700 p-2 rounded text-center text-xs text-slate-300">Adiabatic Base</div>
                         <div className="bg-slate-900 border border-slate-700 p-2 rounded text-center text-xs text-slate-300">Conv. Surface</div>
                     </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="DTS 温度分布曲线" subtitle="SENSOR DATA" className="flex-1 border-slate-800 bg-black/40">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={DTS_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[10, 25]} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#ef4444'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                           <Line type="monotone" dataKey="baseline" stroke="#334155" strokeWidth={1} dot={false} name="Baseline" />
                           <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Current" />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
               <Database size={14} /> 导出监测数据集
           </button>
        </div>

        {/* --- CENTER: 3D Visualization & Engine --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#010205] border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(8,145,178,0.1)] group">
               {/* HUD: Status Overlay */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded flex items-center gap-3">
                       <ScanLine size={16} className={simState === 'INVERSION' ? 'text-yellow-400 animate-spin' : 'text-cyan-400'} />
                       <div>
                           <div className="text-[10px] text-slate-400 uppercase">Analysis Status</div>
                           <div className="text-sm font-bold text-white">{simState === 'IDLE' ? 'READY' : simState}</div>
                       </div>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={simState} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Bottom Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={reset}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-90deg]"
                   >
                       <RotateCcw size={20} />
                   </button>
                   <div className="h-10 w-[1px] bg-slate-700 mx-1"></div>
                   <button 
                     onClick={startInversion}
                     disabled={simState !== 'IDLE'}
                     className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <Play size={18} fill="currentColor" />
                       执行反演计算
                   </button>
               </div>
           </div>

           {/* Console Log */}
           <div className="h-32 bg-[#020305] border border-slate-800/60 rounded-lg p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar shadow-inner">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 pl-2 border-l-2 border-cyan-800 text-slate-500 hover:text-cyan-300 transition-colors">
                       {log}
                   </div>
               ))}
               <div className="text-cyan-500 mt-1 animate-pulse">_</div>
           </div>
        </div>

        {/* --- RIGHT: Results & Validation --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="反演收敛曲线" subtitle="RESIDUALS" className="h-[240px] border-cyan-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={CONVERGENCE_DATA}>
                           <defs>
                               <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="iter" hide />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Error', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#10b981'}} />
                           <Area type="monotone" dataKey="error" stroke="#10b981" fill="url(#errorGrad)" strokeWidth={2} name="Residual Error" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="渗透系数反演结果 (K)" subtitle="PERMEABILITY" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 py-1">
                   {PERMEABILITY_DATA.map((item, i) => (
                       <div key={i} className="flex flex-col gap-1 p-2 rounded bg-slate-900/40 border border-slate-800">
                           <div className="flex justify-between text-xs">
                               <span className="font-bold text-slate-300">{item.zone}</span>
                               <span className={`font-mono ${item.zone === 'Lower' && simState === 'RESULT' ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                                   {item.zone === 'Lower' && simState === 'RESULT' ? '3.5e-5' : item.target.toExponential(1)}
                               </span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                               <div 
                                 className={`h-full ${item.zone === 'Lower' && simState === 'RESULT' ? 'bg-red-500' : 'bg-cyan-600'}`} 
                                 style={{width: item.zone === 'Lower' && simState === 'RESULT' ? '90%' : '60%'}}
                               ></div>
                           </div>
                           <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                               <span>Design: {item.target.toExponential(1)}</span>
                               <span>m/s</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded flex items-center gap-3">
               <Sigma size={20} className="text-cyan-500" />
               <div className="text-[10px] text-cyan-200/70 leading-relaxed">
                   结果分析：坝基下部渗透系数偏大，热交换速率异常，提示潜在集中渗漏通道。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
