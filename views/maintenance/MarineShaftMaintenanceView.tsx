
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/marine-shaft/ThreeScene';
import { ShaftMaintenancePhase } from '../../components/maintenance/marine-shaft/three-types';
import { 
  Anchor, Activity, Settings, 
  AlertTriangle, Play, RotateCcw, 
  Crosshair, Search, Wrench, 
  AlignJustify, ArrowRightLeft, FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ReferenceLine, AreaChart, Area
} from 'recharts';

// --- MOCK DATA ---
const VIBRATION_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 5,
    amp: (i===5 ? 8.5 : i===10 ? 3.2 : Math.random() * 0.5) // 1X and 2X peaks
}));

const ORBIT_DATA = Array.from({length: 36}, (_, i) => {
    const angle = (i * 10) * Math.PI / 180;
    // Elliptical orbit characteristic of misalignment
    return {
        x: Math.cos(angle) * 1.5 + (Math.random()-0.5)*0.1,
        y: Math.sin(angle) * 0.8 + (Math.random()-0.5)*0.1
    };
});

const STEPS: { id: ShaftMaintenancePhase; label: string; desc: string }[] = [
  { id: 'RUNNING', label: '运行监测', desc: '监测轴系振动、轴承温度及油膜状态。' },
  { id: 'FAULT_VIB', label: '故障报警', desc: '检测到艉轴承振动超标 (8.5mm/s)，疑似不对中。' },
  { id: 'STOP_LOCK', label: '停机锁定', desc: '停车、盘车锁定，安装盘车机，准备检修。' },
  { id: 'DIAGNOSIS', label: '诊断分析', desc: '安装激光对中仪，采集轴心轨迹与拐挡差数据。' },
  { id: 'ALIGNMENT', label: '激光对中', desc: '调整中间轴承位置，消除垂向与水平偏差。' },
  { id: 'REPAIR', label: '轴承修复', desc: '顶升轴系，研磨下瓦，调整轴承间隙。' },
  { id: 'TEST_RUN', label: '试运行', desc: '恢复运行，验证振动与温度指标。' },
];

export const MarineShaftMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 推进轴系数字孪生就绪...']);
  const [alignmentData, setAlignmentData] = useState({ vOffset: 0.45, hOffset: -0.12, gap: 0.05 });

  const currentStep = STEPS[currentStepIdx];

  // Simulation
  useEffect(() => {
    if (currentStep.id === 'ALIGNMENT') {
        const interval = setInterval(() => {
            setAlignmentData(prev => ({
                vOffset: Math.max(0, prev.vOffset - 0.01),
                hOffset: Math.min(0, prev.hOffset + 0.005),
                gap: 0.05
            }));
        }, 200);
        return () => clearInterval(interval);
    } else if (currentStep.id === 'RUNNING' || currentStep.id === 'FAULT_VIB') {
        setAlignmentData({ vOffset: 0.45, hOffset: -0.12, gap: 0.05 });
    }
  }, [currentStep.id]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`进入阶段: ${STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-teal-500/30 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Marine Propulsion Systems
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶推进轴系 <span className="text-teal-500">故障模拟与激光对中</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Operation Mode</div>
                <div className={`text-xl font-bold ${currentStep.id.includes('FAULT') ? 'text-red-500 animate-pulse' : 'text-teal-400'}`}>
                    {currentStep.label}
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Shaft Speed</div>
                <div className="text-2xl font-mono font-bold text-white">
                    {currentStep.id === 'RUNNING' ? '125' : currentStep.id === 'FAULT_VIB' ? '118' : '0'} <span className="text-sm text-slate-500">rpm</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Diagnostics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Vibration Analysis */}
           <SciFiCard title="振动频谱分析 (FFT)" subtitle="1X/2X DOMINANT" className="h-[220px] border-teal-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={VIBRATION_SPECTRUM}>
                          <defs>
                              <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="freq" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#14b8a6'}} />
                          <ReferenceLine x={5} stroke="red" label={{value:'1X', fill:'red', fontSize:10}} />
                          <ReferenceLine x={10} stroke="orange" label={{value:'2X', fill:'orange', fontSize:10}} />
                          <Area type="monotone" dataKey="amp" stroke="#14b8a6" fill="url(#colorVib)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Orbit Plot */}
           <SciFiCard title="轴心轨迹 (Shaft Orbit)" subtitle="MISALIGNMENT" className="h-[260px] border-teal-900/50" noPadding>
              <div className="w-full h-full p-4 flex flex-col items-center">
                  <div className="relative w-48 h-48 border border-slate-700 rounded-full bg-slate-900/50">
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 10}}>
                              <XAxis type="number" dataKey="x" domain={[-2, 2]} hide />
                              <YAxis type="number" dataKey="y" domain={[-2, 2]} hide />
                              <Scatter name="Orbit" data={ORBIT_DATA} fill="#f43f5e" line={{stroke: '#f43f5e', strokeWidth: 1}} lineType="fitting" />
                              <ReferenceLine x={0} stroke="#334155" />
                              <ReferenceLine y={0} stroke="#334155" />
                          </ScatterChart>
                      </ResponsiveContainer>
                      {/* Center Mark */}
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <div className="text-xs text-rose-400 mt-2">Pattern: Elliptical (Typical Misalignment)</div>
              </div>
           </SciFiCard>

           {/* Bearing Temps */}
           <SciFiCard title="轴承温度监测" className="flex-1 border-teal-900/50">
              <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                      <span className="text-xs text-slate-400">Aft Stern Tube</span>
                      <span className="text-lg font-bold text-red-400">68.5 °C</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                      <span className="text-xs text-slate-400">Fwd Stern Tube</span>
                      <span className="text-lg font-bold text-white">52.1 °C</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                      <span className="text-xs text-slate-400">Intermediate</span>
                      <span className="text-lg font-bold text-white">48.4 °C</span>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050b14] border border-teal-800/30 rounded-lg overflow-hidden relative shadow-[inset_0_0_60px_rgba(20,184,166,0.1)] group">
               {/* Overlay: Alignment Tool */}
               {currentStep.id === 'ALIGNMENT' && (
                   <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur border border-teal-500 p-3 rounded w-64">
                       <div className="text-xs text-teal-400 font-bold mb-2 flex items-center gap-2">
                           <Crosshair size={14} className="animate-spin-slow"/> LASER ALIGNMENT KIT
                       </div>
                       <div className="space-y-2 font-mono text-sm">
                           <div className="flex justify-between">
                               <span className="text-slate-400">V. Offset:</span>
                               <span className={Math.abs(alignmentData.vOffset) < 0.05 ? 'text-green-400' : 'text-red-400'}>
                                   {alignmentData.vOffset.toFixed(3)} mm
                               </span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-slate-400">H. Offset:</span>
                               <span className={Math.abs(alignmentData.hOffset) < 0.05 ? 'text-green-400' : 'text-red-400'}>
                                   {alignmentData.hOffset.toFixed(3)} mm
                               </span>
                           </div>
                           <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                               <div className="bg-teal-500 h-full transition-all duration-200" style={{width: `${(1 - Math.abs(alignmentData.vOffset))*100}%`}}></div>
                           </div>
                       </div>
                   </div>
               )}

               <ThreeScene step={currentStep.id} />
               
               {/* Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重置模拟');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
                   >
                       <RotateCcw size={20} className="text-slate-400"/>
                   </button>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx >= STEPS.length - 1}
                     className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-full shadow-lg shadow-teal-900/50 flex items-center gap-2 transition-all disabled:opacity-50"
                   >
                       <Play size={20} fill="currentColor" />
                       {currentStepIdx === STEPS.length - 1 ? '完成' : '下一步骤'}
                   </button>
               </div>
           </div>

           {/* Logs */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-teal-800 pl-2">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT: Tools & Knowledge */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="维修工具箱" subtitle="ASSETS" className="border-teal-900/50">
               <div className="grid grid-cols-2 gap-3">
                   {['激光对中仪', '液压千斤顶', '塞尺/百分表', '盘车机', '着色探伤剂', '扭矩扳手'].map((tool, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-700 p-2 rounded text-center text-xs text-slate-300 hover:border-teal-500/50 transition-colors cursor-pointer">
                           <Wrench size={14} className="mx-auto mb-1 text-slate-500"/>
                           {tool}
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="操作指引 (SOP)" subtitle="GUIDE" className="flex-1 border-teal-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   <div className="relative">
                       <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_5px_cyan]"></div>
                       <h4 className="text-sm font-bold text-white mb-1">Step {currentStepIdx + 1}: {currentStep.label}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800">
                           {currentStep.desc}
                       </p>
                   </div>
                   
                   {currentStepIdx < STEPS.length - 1 && (
                       <div className="relative opacity-50">
                           <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-slate-700 border border-slate-500"></div>
                           <h4 className="text-sm font-bold text-slate-400 mb-1">Next: {STEPS[currentStepIdx + 1].label}</h4>
                       </div>
                   )}
               </div>
               
               <div className="mt-auto pt-4">
                   <div className="flex items-start gap-2 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded">
                       <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5"/>
                       <span className="text-[10px] text-yellow-200/80">
                           Notice: Laser alignment requires shaft rotation. Ensure turning gear is engaged properly.
                       </span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
