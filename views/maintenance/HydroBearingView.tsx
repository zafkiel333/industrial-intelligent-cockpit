
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-bearing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-05]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-05';
import { SimPhase } from '../../components/maintenance/hydro-bearing/three-types';
import { 
  Activity, Thermometer, Droplets, RotateCw, 
  AlertTriangle, Wrench, Play, Pause, FastForward,
  ClipboardCheck, TrendingUp, History, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const VIB_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    vib: 0.05 + Math.random() * 0.02,
    limit: 0.15
}));

const OIL_DATA = [
    { name: 'Viscosity', val: 42, unit: 'cSt', status: 'Normal' },
    { name: 'Water', val: 120, unit: 'ppm', status: 'Warning' },
    { name: 'Particles', val: 18, unit: '/ml', status: 'Normal' },
    { name: 'Acid', val: 0.05, unit: 'mgKOH/g', status: 'Normal' },
];

const LIFECYCLE_DATA = [
    { name: 'Pad Set A', life: 85 },
    { name: 'Pad Set B', life: 42 }, // Worn
    { name: 'Runner Plate', life: 92 },
    { name: 'Oil Quality', life: 60 },
];

export const HydroBearingView: React.FC = () => {
  const [simState, setSimState] = useState<SimPhase>('OPERATION');
  const [wearLevel, setWearLevel] = useState(20);
  const [temperature, setTemperature] = useState(45);
  const [vibration, setVibration] = useState(0.05);
  const [autoRun, setAutoRun] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[System] 推力轴承监测系统就绪...']);

  // Simulation Loop
  useEffect(() => {
    let interval: any;
    if (autoRun) {
        interval = setInterval(() => {
            setWearLevel(prev => {
                if (prev >= 100) {
                    setAutoRun(false);
                    setSimState('DEGRADED');
                    addLog('!! 警报：瓦温过高，油膜破裂风险，建议立即停机检修');
                    return 100;
                }
                return prev + 0.5;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [autoRun]);

  // Derived metrics based on wear
  useEffect(() => {
      // Temp rises with wear
      const baseTemp = 45;
      const newTemp = baseTemp + (wearLevel / 100) * 40 + (Math.random()-0.5)*2;
      setTemperature(newTemp);

      // Vibration rises exponentially near end of life
      const baseVib = 0.05;
      const newVib = baseVib + Math.pow(wearLevel / 100, 3) * 0.2 + (Math.random()-0.5)*0.01;
      setVibration(newVib);

      if (wearLevel > 80 && simState === 'OPERATION') {
          setSimState('DEGRADED');
          addLog('>> 警告：轴承磨损进入加速期，请密切关注');
      }
  }, [wearLevel, simState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const startRepair = () => {
      setSimState('JACKING');
      setAutoRun(false);
      addLog('>> 启动检修流程：顶起转子...');
      setTimeout(() => {
          setSimState('SWAP_PADS');
          addLog('>> 抽出磨损瓦片，更换新瓦...');
          setTimeout(() => {
              setSimState('RESET');
              setWearLevel(0);
              addLog('>> 回装完成，落转子，重置寿命计数');
              setTimeout(() => setSimState('OPERATION'), 1000);
          }, 3000);
      }, 3000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-cyan-900/50 p-4 rounded-t-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <RotateCw size={14} /> Rotating Machinery Health
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水电站推力轴承 <span className="text-cyan-500">寿命退化与更换模拟</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Estimated RUL</div>
                <div className={`text-2xl font-mono font-bold ${wearLevel > 80 ? 'text-red-500' : 'text-cyan-400'}`}>
                    {Math.max(0, (100 - wearLevel) * 120).toFixed(0)} <span className="text-sm text-slate-500">hrs</span>
                </div>
            </div>
            <button 
                onClick={() => setAutoRun(!autoRun)}
                className={`p-3 rounded-full border transition-all ${autoRun ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-green-900/20 border-green-500 text-green-400'}`}
                disabled={simState !== 'OPERATION' && simState !== 'DEGRADED'}
            >
                {autoRun ? <Pause size={20} /> : <Play size={20} />}
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Data Analytics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Vibration Spectrum */}
           <SciFiCard title="振动趋势分析 (Vibration)" subtitle="RMS mm/s" className="h-[240px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={VIB_DATA}>
                          <defs>
                              <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 0.2]} stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b'}} />
                          <ReferenceLine y={0.15} stroke="red" strokeDasharray="3 3" label={{value:'Alarm', fill:'red', fontSize:10}} />
                          
                          {/* Dynamic live point */}
                          <ReferenceLine x={29} stroke="none">
                              <text x={200} y={20} fill="#f59e0b" fontSize="12" fontWeight="bold">Current: {vibration.toFixed(3)}</text>
                          </ReferenceLine>

                          <Area type="monotone" dataKey="vib" stroke="#f59e0b" fill="url(#colorVib)" isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Oil Analysis */}
           <SciFiCard title="油样分析报告" subtitle="OIL QUALITY" className="border-cyan-900/50">
               <div className="grid grid-cols-2 gap-3">
                   {OIL_DATA.map((d, i) => (
                       <div key={i} className={`p-2 rounded border ${d.status === 'Warning' ? 'bg-red-900/10 border-red-800' : 'bg-slate-900/50 border-slate-800'}`}>
                           <div className="text-[10px] text-slate-400">{d.name}</div>
                           <div className={`text-lg font-bold font-mono ${d.status === 'Warning' ? 'text-red-400' : 'text-white'}`}>
                               {d.val} <span className="text-[10px] font-normal text-slate-500">{d.unit}</span>
                           </div>
                       </div>
                   ))}
               </div>
               <div className="mt-2 text-xs text-slate-400 bg-slate-900/30 p-2 rounded">
                   Latest Sample: 2024-03-20. Moisture content trending up. Suggest vacuum filtration.
               </div>
           </SciFiCard>

           {/* Lifecycle Bars */}
           <SciFiCard title="组件寿命状态" subtitle="LIFECYCLE" className="flex-1 border-cyan-900/50">
               <div className="space-y-4">
                   {LIFECYCLE_DATA.map((item, i) => (
                       <div key={i}>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-300">{item.name}</span>
                               <span className={item.life < 50 ? 'text-red-400' : 'text-green-400'}>{item.life}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${item.life < 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                                 style={{width: `${item.life}%`}}
                               ></div>
                           </div>
                       </div>
                   ))}
                   {/* Dynamic Wear Bar */}
                   <div>
                       <div className="flex justify-between text-xs mb-1">
                           <span className="text-orange-300 font-bold">Simulated Wear</span>
                           <span className="text-orange-300">{wearLevel.toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                           <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full" style={{width: `${wearLevel}%`}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-inner group">
               {/* HUD: Temp Monitor */}
               <div className="absolute top-4 left-4 z-20">
                   <div className="bg-black/60 backdrop-blur border border-red-500/30 px-4 py-2 rounded flex items-center gap-3">
                       <Thermometer size={20} className={temperature > 70 ? 'text-red-500 animate-pulse' : 'text-green-400'} />
                       <div>
                           <div className="text-[10px] text-slate-400 uppercase">Thrust Pad Temp</div>
                           <div className={`text-2xl font-bold font-mono ${temperature > 70 ? 'text-red-400' : 'text-white'}`}>
                               {temperature.toFixed(1)} °C
                           </div>
                       </div>
                   </div>
               </div>

               {/* Control Overlay */}
               {simState === 'DEGRADED' && (
                   <div className="absolute inset-0 z-30 bg-red-900/20 backdrop-blur-sm flex items-center justify-center">
                       <div className="bg-black/90 border-2 border-red-500 p-6 rounded-lg text-center max-w-md shadow-2xl">
                           <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
                           <h2 className="text-2xl font-bold text-white mb-2">CRITICAL WEAR DETECTED</h2>
                           <p className="text-slate-300 mb-6">Thrust bearing pads have reached end-of-life condition. Continued operation poses severe risk of failure.</p>
                           <button 
                             onClick={startRepair}
                             className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center gap-2 mx-auto transition-colors"
                           >
                               <Wrench size={18} /> INITIATE REPLACEMENT PROCEDURE
                           </button>
                       </div>
                   </div>
               )}

               <ThreeScene phase={simState} wearLevel={wearLevel} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* Console Log */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-slate-700 pl-2">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT COLUMN: Control & Procedures */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="维修操作规程 (SOP)" subtitle="GUIDE" className="flex-1 border-cyan-900/50">
               <div className="space-y-4 relative">
                   <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800"></div>
                   {[
                       { title: '停机与排油', status: simState === 'JACKING' ? 'active' : 'done' },
                       { title: '顶起转子 (Jacking)', status: simState === 'JACKING' ? 'active' : simState === 'SWAP_PADS' || simState === 'RESET' ? 'done' : 'wait' },
                       { title: '拆卸瓦片 (Remove)', status: simState === 'SWAP_PADS' ? 'active' : simState === 'RESET' ? 'done' : 'wait' },
                       { title: '安装新瓦 (Install)', status: simState === 'SWAP_PADS' ? 'active' : simState === 'RESET' ? 'done' : 'wait' },
                       { title: '落转子与盘车', status: simState === 'RESET' ? 'active' : 'wait' },
                   ].map((step, i) => (
                       <div key={i} className="relative pl-10">
                           <div className={`absolute left-2 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 bg-slate-900
                               ${step.status === 'active' ? 'border-cyan-500 bg-cyan-900' : step.status === 'done' ? 'border-green-500 bg-green-900' : 'border-slate-700'}
                           `}>
                               {step.status === 'done' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                               {step.status === 'active' && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
                           </div>
                           <div className={`text-sm font-bold ${step.status === 'active' ? 'text-cyan-300' : step.status === 'done' ? 'text-green-400' : 'text-slate-500'}`}>
                               {step.title}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="成本效益分析" subtitle="ROI" className="border-cyan-900/50">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Current Pad Value</span>
                       <span className="text-white">$ 12,500</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Est. Failure Cost</span>
                       <span className="text-red-400 font-bold">$ 450,000</span>
                   </div>
                   <div className="p-2 bg-green-900/20 border border-green-800/30 rounded text-xs text-green-200">
                       <span className="font-bold">Recommendation:</span> Preventive replacement at 85% wear yields highest ROI.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
