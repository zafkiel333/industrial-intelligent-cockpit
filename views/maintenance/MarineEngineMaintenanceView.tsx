
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/marine-engine/ThreeScene';
import { MaintenanceStep } from '../../components/maintenance/marine-engine/three-types';
import { 
  Anchor, Wrench, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Settings, 
  Gauge, Ruler, Box, ArrowDownCircle,
  ClipboardList
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const PRESSURE_DATA = Array.from({length: 20}, (_, i) => ({ time: i, val: 240 + Math.random() * 10 }));
const TENSION_DATA = [
  { bolt: 'B1', tension: 1550, status: 'OK' },
  { bolt: 'B2', tension: 1520, status: 'OK' },
  { bolt: 'B3', tension: 1480, status: 'Low' },
  { bolt: 'B4', tension: 1560, status: 'OK' },
  { bolt: 'B5', tension: 1540, status: 'OK' },
  { bolt: 'B6', tension: 1530, status: 'OK' },
];

const WORKFLOW: { id: MaintenanceStep; label: string; desc: string; tools: string[] }[] = [
  { id: 'PREP', label: '准备工作', desc: '盘车锁定曲轴，拆除高压油管及排气管。', tools: ['Turning Gear', 'Spanner'] },
  { id: 'MOUNT_JACKS', label: '安装拉伸器', desc: '在缸盖螺栓上安装液压拉伸器，连接油管。', tools: ['Hydraulic Jacks', 'HP Hose'] },
  { id: 'LOOSEN_BOLTS', label: '松开螺栓', desc: '加压至 1500 bar，旋松螺母，卸压。', tools: ['Pump Unit'] },
  { id: 'LIFT_HEAD', label: '吊离缸盖', desc: '使用专用吊具起吊缸盖，注意保护燃烧室密封面。', tools: ['Engine Room Crane', 'Lifting Eye'] },
  { id: 'LIFT_PISTON', label: '吊出活塞', desc: '清理积碳，安装吊环，垂直吊出活塞连杆组件。', tools: ['Piston Ring Expander'] },
  { id: 'MEASURE', label: '测量与检查', desc: '测量缸套磨损量，检查活塞环槽及裙部。', tools: ['Bore Gauge', 'Micrometer'] },
  { id: 'FINISH', label: '回装结束', desc: '按相反顺序回装，按规定力矩预紧螺栓。', tools: ['Torque Wrench'] },
];

export const MarineEngineMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] Main Engine Overhaul Module Loaded.']);
  const [pressure, setPressure] = useState(0);

  const currentStep = WORKFLOW[currentStepIdx];

  // Effect for hydraulic pressure simulation
  useEffect(() => {
    let interval: any;
    if (currentStep.id === 'LOOSEN_BOLTS') {
        interval = setInterval(() => {
            setPressure(prev => Math.min(1500, prev + 50));
        }, 100);
    } else {
        setPressure(0);
    }
    return () => clearInterval(interval);
  }, [currentStep.id]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < WORKFLOW.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`Step Completed. Proceeding to: ${WORKFLOW[currentStepIdx + 1].label}`);
    }
  };

  const reset = () => {
    setCurrentStepIdx(0);
    addLog('Procedure Reset.');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-blue-900/50 p-4 rounded-t-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Marine Engineering
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶主机吊缸 <span className="text-blue-500">虚拟检修演练</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Cylinder Unit</div>
                <div className="text-xl font-bold text-white">No. 4</div>
            </div>
            <div className="text-right border-l border-slate-700 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Engine Model</div>
                <div className="text-xl font-mono font-bold text-blue-400">MAN B&W 6S60ME</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Steps & Tools */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="检修步骤 (Procedure)" className="border-blue-900/50">
              <div className="space-y-0 relative pl-2">
                 <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {WORKFLOW.map((step, idx) => {
                   const isActive = idx === currentStepIdx;
                   const isPast = idx < currentStepIdx;
                   return (
                     <div key={step.id} className="relative pl-8 pb-4 last:pb-0">
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-slate-900 transition-all
                           ${isActive ? 'border-blue-500 text-blue-400 scale-110 shadow-[0_0_10px_blue]' : 
                             isPast ? 'border-green-500 text-green-500' : 'border-slate-700 text-slate-500'}
                        `}>
                           {isPast ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        
                        <div className={`p-2 rounded border transition-all ${isActive ? 'bg-blue-900/20 border-blue-500/50' : 'bg-transparent border-transparent'}`}>
                           <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{step.label}</h3>
                           {isActive && (
                             <div className="mt-1 text-xs text-slate-300">
                               {step.desc}
                             </div>
                           )}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="专用工具箱" className="flex-1 border-blue-900/50">
              <div className="flex flex-wrap gap-2">
                  {currentStep.tools.map(tool => (
                      <div key={tool} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-blue-200 flex items-center gap-1">
                          <Wrench size={10} /> {tool}
                      </div>
                  ))}
              </div>
              <div className="mt-4 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs text-yellow-200">
                  <AlertTriangle size={12} className="inline mr-1 mb-0.5"/> 
                  Safety: Ensure turning gear is engaged and locked before entering crankcase.
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Scene */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-700 rounded-lg overflow-hidden relative shadow-inner">
               {/* HUD: Hydraulic Pressure */}
               {currentStep.id === 'LOOSEN_BOLTS' && (
                   <div className="absolute top-4 right-4 z-20 w-48 bg-black/70 backdrop-blur border border-blue-500/50 p-3 rounded">
                       <div className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-2">
                           <Gauge size={14}/> HYDRAULIC PRESSURE
                       </div>
                       <div className="text-3xl font-mono font-bold text-white text-center">
                           {pressure} <span className="text-sm text-slate-500">bar</span>
                       </div>
                       <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-100" style={{width: `${(pressure/1500)*100}%`}}></div>
                       </div>
                   </div>
               )}

               {/* Step Control */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                   <button 
                     onClick={reset}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-600 transition-colors"
                   >
                       <RotateCcw size={20} />
                   </button>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx >= WORKFLOW.length - 1}
                     className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       <Play size={20} fill="currentColor" />
                       NEXT STEP
                   </button>
               </div>

               <ThreeScene step={currentStep.id} />
           </div>

           {/* Console Log */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-slate-700 pl-2">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT: Data & Checks */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="螺栓拉伸数据" subtitle="TENSION" className="border-blue-900/50">
               <div className="flex flex-col gap-2">
                   {TENSION_DATA.map((t, i) => (
                       <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                           <span className="text-xs font-bold text-slate-300">{t.bolt}</span>
                           <span className="font-mono text-sm text-white">{t.tension} bar</span>
                           <span className={`text-[10px] px-1 rounded ${t.status === 'OK' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                               {t.status}
                           </span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="缸套磨损记录" subtitle="WEAR" className="flex-1 border-blue-900/50">
               <div className="h-40 w-full mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PRESSURE_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                           <XAxis hide />
                           <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={[240, 255]} />
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6'}} />
                           <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="text-center text-xs text-slate-500">Cylinder Liner Diameter (mm)</div>
               </div>
               
               <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                   <div className="text-xs text-slate-400 mb-1">Wear Rate</div>
                   <div className="text-xl font-bold text-white">0.05 <span className="text-xs font-normal">mm/1000h</span></div>
                   <div className="text-[10px] text-green-400">Within Limits</div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
