
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/scraper-chain/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-scraper-chain]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-scraper-chain';
import { ScraperSimState } from '../../components/knowledge-manage/scraper-chain/three-types';
import { 
  Activity, Scale, Settings, Zap, 
  AlertTriangle, RotateCcw, Link as LinkIcon,
  Play, Pause, GitBranch, ArrowRight, Gauge,
  Database, Info, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, ReferenceLine, Legend, ComposedChart
} from 'recharts';

// --- MOCK DATA ---
const TENSION_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    left: 450 + Math.random() * 20,
    right: 450 + Math.random() * 20,
    diff: 0
}));

const ELONGATION_DATA = [
  { cycle: '1000h', stretch: 0.2 },
  { cycle: '2000h', stretch: 0.5 },
  { cycle: '3000h', stretch: 0.9 },
  { cycle: '4000h', stretch: 1.4 }, // Accel
  { cycle: '5000h', stretch: 2.1 },
];

const CONTROL_STRATEGIES = [
    { id: 'PID', label: 'PID 自动平衡', desc: '基于张力差的快速响应控制', active: true },
    { id: 'FUZZY', label: '模糊逻辑控制', desc: '适应煤量波动的非线性调节', active: false },
    { id: 'MANUAL', label: '人工干预模式', desc: '检修或紧急情况下的手动操作', active: false },
];

export const ScraperChainTensionView: React.FC = () => {
  const [simState, setSimState] = useState<ScraperSimState>('BALANCED');
  const [tensionStream, setTensionStream] = useState(TENSION_DATA);
  const [currentTension, setCurrentTension] = useState({ left: 450, right: 450 });
  const [balanceRatio, setBalanceRatio] = useState(1.0);
  const [logs, setLogs] = useState<string[]>(['[SYS] 张力监测系统初始化完成...', '[HYD] 液压泵站压力正常 (18MPa)']);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        let l = 450, r = 450;
        
        if (simState === 'UNBALANCED') {
            l = 380 + Math.random() * 30; // Slack
            r = 520 + Math.random() * 30; // Tight
        } else if (simState === 'ADJUSTING') {
            // Converging
            const diff = (r - l) * 0.1;
            l += diff; r -= diff;
        } else if (simState === 'SLACK_CHAIN') {
            l = 200 + Math.random() * 20;
            r = 200 + Math.random() * 20;
        } else {
            // Balanced
            l = 450 + Math.sin(Date.now()/500) * 20;
            r = 450 + Math.cos(Date.now()/500) * 20;
        }

        setCurrentTension({ left: l, right: r });
        setBalanceRatio(l > 0 ? r / l : 0);

        setTensionStream(prev => {
            const next = [...prev.slice(1), { 
                time: prev[prev.length-1].time + 1, 
                left: l, 
                right: r,
                diff: Math.abs(l - r)
            }];
            return next;
        });

        // Random Log
        if (simState === 'UNBALANCED' && Math.random() > 0.9) {
            addLog(`!! 警报：双链张力不平衡度 ${(Math.abs(1-balanceRatio)*100).toFixed(1)}%`);
        }

    }, 200);

    return () => clearInterval(interval);
  }, [simState, balanceRatio]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
  };

  const toggleState = () => {
      if (simState === 'BALANCED') {
          setSimState('UNBALANCED');
          addLog('>> 模拟偏载工况：引发张力失衡');
      } else if (simState === 'UNBALANCED') {
          setSimState('ADJUSTING');
          addLog('>> 启动 PID 自动张紧调节...');
          setTimeout(() => {
              setSimState('BALANCED');
              addLog('>> 张力平衡已恢复');
          }, 3000);
      } else {
          setSimState('BALANCED');
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0a0a0c] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-orange-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-600/20 border-2 border-orange-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(249,115,22,0.3)]">
             <LinkIcon size={30} className="text-orange-400" />
             <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Scale size={12} /> Dynamic Balancing System
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               刮板输送机 <span className="text-orange-500 italic">链条张力平衡策略</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Tension</div>
                <div className="text-2xl font-mono font-black text-white">{(currentTension.left + currentTension.right).toFixed(0)} <span className="text-sm font-normal text-slate-600">kN</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Balance Ratio</div>
                <div className={`text-2xl font-mono font-black ${Math.abs(1-balanceRatio) > 0.1 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {balanceRatio.toFixed(2)}
                </div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Motor Power</div>
                <div className="text-2xl font-mono font-black text-blue-400">
                    850 <span className="text-sm font-normal text-slate-600">kW</span>
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Real-time Data --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="双链张力实时监测" subtitle="kN" className="h-[280px] border-orange-900/30 bg-[#0c0a09]/90">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tensionStream}>
                          <defs>
                              <linearGradient id="gradL" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 600]} stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#333'}} />
                          <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                          <Area type="monotone" dataKey="left" name="Left Chain" stroke="#0ea5e9" fill="url(#gradL)" strokeWidth={2} isAnimationActive={false} />
                          <Area type="monotone" dataKey="right" name="Right Chain" stroke="#f97316" fill="url(#gradR)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="平衡控制策略" subtitle="MODE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3">
                   {CONTROL_STRATEGIES.map(s => (
                       <div key={s.id} className={`p-3 rounded border flex flex-col gap-1 cursor-pointer transition-all
                           ${s.active ? 'bg-orange-900/20 border-orange-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                       `}>
                           <div className="flex justify-between items-center">
                               <span className={`text-xs font-bold ${s.active ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
                               {s.active && <Activity size={14} className="text-orange-400 animate-pulse" />}
                           </div>
                           <div className="text-[10px] text-slate-500">{s.desc}</div>
                       </div>
                   ))}
                   
                   <div className="mt-2 p-2 bg-slate-900/60 border border-slate-700 rounded text-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Target Pre-tension</div>
                       <div className="text-lg font-mono font-bold text-white">450 ± 20 kN</div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Viz --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-orange-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} tension={currentTension} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* HUD Overlay */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-orange-500 p-3 rounded-sm">
                       <div className="text-[10px] text-orange-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={10}/> Dynamic State
                       </div>
                       <div className="text-xl font-black text-white">{simState}</div>
                   </div>
               </div>
               
               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   <button onClick={() => {setSimState('BALANCED'); addLog('系统复位');}} className="p-3 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                       <RotateCcw size={18}/>
                   </button>
                   <div className="h-10 w-[1px] bg-slate-700 mx-1"></div>
                   <button 
                     onClick={toggleState}
                     className={`px-8 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all
                        ${simState === 'BALANCED' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}
                     `}
                   >
                       {simState === 'BALANCED' ? 'TRIGGER IMBALANCE' : 'AUTO BALANCE'}
                       <Zap size={14} fill="currentColor"/>
                   </button>
               </div>
           </div>

           {/* Elongation Analysis */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>链条伸长量趋势 (Elongation Analysis)</span>
                   <span className="text-orange-500 flex items-center gap-1"><AlertTriangle size={10}/> Limit: 2.5%</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={ELONGATION_DATA}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="cycle" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 3]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                       <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Replace', fill:'red', fontSize:10}} />
                       <Line type="monotone" dataKey="stretch" stroke="#f97316" strokeWidth={2} dot={{r:4}} />
                   </LineChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Diagnostics & Logs --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="液压张紧系统状态" subtitle="HYDRAULICS" className="h-[260px] border-orange-900/30">
               <div className="flex flex-col h-full gap-4 pt-2">
                   <div className="flex-1 bg-slate-900/50 rounded border border-slate-800 relative flex items-center justify-center p-4">
                       {/* Simplified Gauge Viz */}
                       <div className="relative w-full h-full max-w-[120px] max-h-[120px]">
                           <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                               <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="10" />
                               <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 * (1 - (currentTension.left/600))} />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className="text-[9px] text-slate-500">SYS PRESS</span>
                               <span className="text-xl font-bold text-white">18.2</span>
                               <span className="text-[9px] text-orange-400">MPa</span>
                           </div>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">油缸行程 (L/R)</span>
                           <span className="text-white font-mono">450 / 480 mm</span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">蓄能器压力</span>
                           <span className="text-green-400 font-mono">Normal</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">电磁阀状态</span>
                           <span className="text-blue-400 font-mono">Active</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="事件日志" subtitle="LOGS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`text-[10px] font-mono border-l-2 pl-2 py-1 ${log.includes('!!') ? 'border-red-500 text-red-300' : 'border-slate-700 text-slate-400'}`}>
                           {log}
                       </div>
                   ))}
                   <div className="text-orange-500 animate-pulse mt-2">_</div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
