
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mine-ventilation/ThreeScene';
import { VentilationSimState } from '../../components/maintenance/mine-ventilation/three-types';
import { 
  Fan, Wind, Activity, AlertTriangle, 
  RotateCcw, Play, Wrench, Settings, 
  Thermometer, Gauge, ShieldAlert, FileText,
  ArrowLeftRight, Power
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter
} from 'recharts';

// --- MOCK DATA ---
const PQ_DATA = Array.from({length: 20}, (_, i) => ({
    q: i * 500, // m3/min
    pStatic: 3000 - Math.pow(i, 2) * 5, // Pa
    pDynamic: Math.pow(i, 2) * 2,
    surgeLine: 2800 - i * 100 // Visual ref
}));

const VIBRATION_DATA = Array.from({length: 40}, (_, i) => ({
    freq: i * 2.5,
    amp: 0.2 + Math.random() * 0.1
}));

const GAS_DATA = [
    { name: 'CH4', val: 0.35, unit: '%', limit: 1.0 },
    { name: 'CO', val: 12, unit: 'ppm', limit: 24 },
    { name: 'O2', val: 20.8, unit: '%', limit: 19.5 },
];

const SOP_STEPS: { id: VentilationSimState; label: string; desc: string; type: string }[] = [
  { id: 'RUNNING', label: '运行监测', desc: '监测风机工况点，确认无喘振迹象。', type: 'info' },
  { id: 'SURGE_ALARM', label: '喘振报警', desc: '检测到风压剧烈脉动 (±500Pa)，振动值超标。', type: 'alert' },
  { id: 'STOP_BRAKE', label: '停机闭锁', desc: '执行紧急停机程序，合上抱闸，挂牌锁定(LOTO)。', type: 'action' },
  { id: 'OPEN_CASING', label: '开盖检修', desc: '液压开启风机扩散塔检修门，进入流道。', type: 'action' },
  { id: 'BLADE_REPAIR', label: '叶片维护', desc: '检查叶片裂纹与磨损，调整叶片安装角。', type: 'repair' },
  { id: 'CLOSE_TEST', label: '回装测试', desc: '关闭风门，启动风机进行动平衡测试。', type: 'test' },
  { id: 'REVERSE_WIND', label: '反风演习', desc: '全矿井反风测试，确保10分钟内风流逆转。', type: 'drill' },
];

export const MineVentilationView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿井主通风机监控系统就绪...']);
  const [airflow, setAirflow] = useState(8500); // m3/min
  const [pressure, setPressure] = useState(2400); // Pa
  const [vibrationSpec, setVibrationSpec] = useState(VIBRATION_DATA);

  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        // Dynamic chart data update
        setVibrationSpec(prev => prev.map((p, i) => ({
            ...p,
            amp: currentState === 'SURGE_ALARM' 
                ? (i === 15 ? 5.0 + Math.random() : 0.5 + Math.random() * 0.2) 
                : (currentState === 'RUNNING' ? 0.2 + Math.random() * 0.1 : 0.05)
        })));

        if (currentState === 'RUNNING') {
            setAirflow(8500 + Math.random() * 100);
            setPressure(2400 + Math.random() * 50);
        } else if (currentState === 'SURGE_ALARM') {
            setAirflow(8500 + Math.sin(Date.now()/200) * 1000); // Surge flow fluctuation
            setPressure(2400 + Math.cos(Date.now()/200) * 800); // Pressure pulsation
        } else if (currentState === 'REVERSE_WIND') {
            setAirflow(-5000 + Math.random() * 100);
            setPressure(1800 + Math.random() * 50);
        } else {
            setAirflow(0);
            setPressure(0);
        }

    }, 200);

    return () => clearInterval(interval);
  }, [currentState]);

  useEffect(() => {
      if (currentState === 'SURGE_ALARM') {
          addLog('!! 严重警报：风机进入喘振区，可能导致叶片断裂！');
      } else if (currentState === 'REVERSE_WIND') {
          addLog('>> 启动反风程序，风门切换中...');
      }
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`流程推进: ${SOP_STEPS[currentStepIdx + 1].label}`);
    } else {
        // Loop back for demo? Or just reset
        setCurrentStepIdx(0);
        addLog('演练重置');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-cyan-500/30 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Wind size={14} /> Main Ventilation System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山主通风机 <span className="text-cyan-500">虚拟检修与反风演练</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded border border-slate-700">
                 <Activity size={18} className={currentState === 'SURGE_ALARM' ? 'text-red-500 animate-pulse' : 'text-green-500'} />
                 <div>
                     <div className="text-[10px] text-slate-500 uppercase">System Status</div>
                     <div className={`text-sm font-bold ${currentState === 'SURGE_ALARM' ? 'text-red-400' : 'text-white'}`}>
                         {currentState}
                     </div>
                 </div>
             </div>
             <div className="h-8 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Current Step</div>
                <div className="text-xl font-bold text-white">{currentStep.label}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Performance Charts */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="风机性能曲线 (P-Q)" subtitle="AERODYNAMICS" className="h-[260px] border-cyan-900/50 bg-[#0c1220]" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PQ_DATA}>
                          <defs>
                              <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="q" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 4000]} label={{ value: 'Pressure (Pa)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}/>
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4'}} />
                          
                          {/* Surge Line */}
                          <Line type="monotone" dataKey="surgeLine" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Surge Limit" />
                          
                          <Area type="monotone" dataKey="pStatic" stroke="#06b6d4" fill="url(#colorP)" name="Static Pressure" />
                          
                          {/* Operating Point */}
                          {currentState === 'RUNNING' && <ReferenceLine x={12} stroke="white" strokeDasharray="3 3" label={{value: 'OP', fill:'white', fontSize: 10}} />}
                          {currentState === 'SURGE_ALARM' && <ReferenceLine x={4} stroke="red" label={{value: 'STALL', fill:'red', fontSize: 10}} />}
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="电机振动频谱" subtitle="VIBRATION (mm/s)" className="h-[200px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vibrationSpec}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="freq" tick={{fontSize: 10}} hide />
                          <YAxis hide domain={[0, 6]} />
                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#f59e0b'}} />
                          <Bar dataKey="amp" fill={currentState === 'SURGE_ALARM' ? '#ef4444' : '#f59e0b'} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="回风流气体分析" className="flex-1 border-cyan-900/50">
               <div className="space-y-3">
                   {GAS_DATA.map((g, i) => (
                       <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                           <span className="text-xs font-bold text-slate-300">{g.name}</span>
                           <div className="flex items-center gap-2">
                               <span className="font-mono text-white">{g.val} <span className="text-[10px] text-slate-500">{g.unit}</span></span>
                               <div className={`w-2 h-2 rounded-full ${g.val > g.limit ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050b14] border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-[inset_0_0_60px_rgba(6,182,212,0.15)] group">
               {/* HUD: Airflow Meter */}
               <div className="absolute top-4 left-4 z-20 flex gap-4">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded flex flex-col min-w-[120px]">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center gap-2">
                           <Gauge size={12}/> AIRFLOW Q
                       </div>
                       <div className="text-2xl font-mono font-bold text-white">
                           {Math.abs(airflow).toFixed(0)} <span className="text-sm font-normal text-slate-500">m³/min</span>
                       </div>
                       {airflow < 0 && <div className="text-xs text-orange-500 font-bold animate-pulse">REVERSE FLOW</div>}
                   </div>
                   
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded flex flex-col min-w-[120px]">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center gap-2">
                           <Activity size={12}/> STATIC PRESS
                       </div>
                       <div className="text-2xl font-mono font-bold text-white">
                           {pressure.toFixed(0)} <span className="text-sm font-normal text-slate-500">Pa</span>
                       </div>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={currentState} />
               
               {/* Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-xl">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('系统复位');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
                   >
                       <RotateCcw size={20} className="text-slate-400"/>
                   </button>
                   
                   <div className="h-10 w-[1px] bg-slate-700"></div>

                   <button 
                     onClick={nextStep}
                     className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-2 transition-all hover:scale-105"
                   >
                       <Play size={20} fill="currentColor" />
                       {currentStepIdx === SOP_STEPS.length - 1 ? '完成演练' : '下一步 (Next)'}
                   </button>
               </div>
           </div>

           {/* Console Log */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-cyan-800 pl-2">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT: SOP & Tools */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="检修作业指导书 (SOP)" subtitle="GUIDE" className="flex-1 border-cyan-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   {/* Current Step */}
                   <div className="relative">
                       <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></div>
                       <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                           {currentStep.label}
                           <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${currentStep.type === 'alert' ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
                               {currentStep.type}
                           </span>
                       </h4>
                       <div className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700 leading-relaxed">
                           {currentStep.desc}
                       </div>
                   </div>

                   {/* Next Step Preview */}
                   {currentStepIdx < SOP_STEPS.length - 1 && (
                       <div className="relative opacity-50">
                           <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-slate-700 border border-slate-500"></div>
                           <h4 className="text-xs font-bold text-slate-400 mb-1">Next: {SOP_STEPS[currentStepIdx + 1].label}</h4>
                       </div>
                   )}
               </div>

               <div className="mt-6 pt-4 border-t border-slate-800">
                   <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Safety Check</div>
                   <div className="grid grid-cols-2 gap-2">
                       <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-900/10 px-2 py-1 rounded border border-green-900/30">
                           <ShieldAlert size={10} /> Gas Check OK
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-yellow-400 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-900/30">
                           <Power size={10} /> HV Isolated
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="备品备件库存" subtitle="SPARES" className="border-cyan-900/50">
               <div className="space-y-2">
                   <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                       <span className="text-xs text-slate-300">Fan Blade (2.4m)</span>
                       <span className="text-xs font-bold text-green-400">2 Sets</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                       <span className="text-xs text-slate-300">Motor Bearing</span>
                       <span className="text-xs font-bold text-green-400">4 Pcs</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                       <span className="text-xs text-slate-300">Vibration Sensor</span>
                       <span className="text-xs font-bold text-yellow-400">1 Pc (Low)</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
