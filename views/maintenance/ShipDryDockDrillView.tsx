
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-drydock/ThreeScene';
import { DockingPhase } from '../../components/maintenance/ship-drydock/three-types';
import { 
  Anchor, Activity, Wrench, ShieldAlert, 
  Layers, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Droplets, ClipboardList,
  ArrowRight, Search, Scan, Power, Info,
  Ship, Waves, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';

// --- 模拟数据 ---
const DOCK_PRESSURE = Array.from({length: 30}, (_, i) => ({
    time: i,
    val: 45 + Math.sin(i*0.3) * 5 + (i > 15 ? 40 : 0) // 抽水时的压力突增
}));

const REPAIR_RESOURCES = [
  { subject: '钳工', A: 85, fullMark: 100 },
  { subject: '电焊工', A: 92, fullMark: 100 },
  { subject: '涂装工', A: 78, fullMark: 100 },
  { subject: '起重工', A: 95, fullMark: 100 },
  { subject: '质检员', A: 88, fullMark: 100 },
];

const DRILL_STEPS: { id: DockingPhase; label: string; risk: string; time: string; desc: string }[] = [
  { id: 'ENTRY', label: '船舶进坞 (Entry)', risk: '中', time: '1.5h', desc: '控制航速 < 0.5节，引航员配合拖轮精准对中。' },
  { id: 'BLOCK_POSITION', label: '墩木对位 (Blocking)', risk: '高', time: '2.0h', desc: '确认龙骨墩与侧墩位置符合船舶坞修图纸。' },
  { id: 'DEWATERING', label: '抽水坐墩 (Dewatering)', risk: '极高', time: '4.0h', desc: '根据排水速率调整吃水平衡，防止侧倾。' },
  { id: 'CLEANING', label: '船体清洗 (Cleaning)', risk: '低', time: '6.0h', desc: '高压水枪去除附着生物，检查防腐涂层。' },
  { id: 'MAINTENANCE', label: '部件检修 (Maintenance)', risk: '中', time: '12h', desc: '拆解螺旋桨及轴系，检查海底阀及艉轴密封。' },
  { id: 'FLOODING', label: '注水出坞 (Flooding)', risk: '中', time: '3.0h', desc: '检查海底门关闭情况，平稳注水至浮起。' },
  { id: 'COMPLETED', label: '演练评估 (Archive)', risk: '-', time: '-', desc: '自动生成坞修质量报告及数字化资产档案。' },
];

export const ShipDryDockDrillView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 坞修指挥中心已在线...', '[Asset] 远洋货轮 IMO 9553201 数据已同步']);
  const [pumpingRate, setPumpingRate] = useState(0);

  const currentStep = DRILL_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // 模拟数据行为
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentState === 'DEWATERING') {
            setPumpingRate(Math.min(100, pumpingRate + 0.5));
        } else {
            setPumpingRate(0);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState, pumpingRate]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const handleNext = () => {
    if (currentStepIdx < DRILL_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`任务切换：${DRILL_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 科技背景装饰 */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500 rounded flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
             <Ship size={32} className="text-blue-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-500 mb-0.5 uppercase tracking-[0.4em] font-black">
               <ShieldAlert size={12} className="animate-pulse" /> Strategic Docking Control
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               船舶坞修全过程 <span className="text-blue-500 italic">虚拟演练系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-12 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Docking ID</div>
                <div className="text-2xl font-mono font-black text-white tracking-widest">DRY-DK-2024-B8</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Estimated Completion</div>
                <div className="text-3xl font-mono font-black text-cyan-400">
                    24.5 <span className="text-sm font-normal text-slate-600">days</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Drill Directives --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="演练指令序列" subtitle="DIRECTIVES" className="border-blue-900/30 bg-[#0c0e14]/90">
              <div className="space-y-3 relative pl-4 mt-2">
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {DRILL_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                             <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-blue-500 border-white shadow-[0_0_15px_blue]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-900/20 border-slate-800'}
                             `}>
                                 <div className="flex justify-between items-center">
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                     {active && <span className="text-[9px] px-1 bg-red-900/40 text-red-400 rounded">RISK: {step.risk}</span>}
                                 </div>
                                 {active && <p className="text-[11px] text-slate-400 leading-tight mt-1">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="指挥终端日志" className="flex-1 border-slate-800 bg-black/40">
               <div className="h-full overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`pb-1 border-b border-white/5 transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-blue-300'}`}>
                           {log}
                       </div>
                   ))}
                   <div className="text-blue-600 animate-pulse">_</div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-blue-900/20 rounded-lg overflow-hidden relative shadow-inner group">
               {/* 3D Scene */}
               <ThreeScene phase={currentState} />

               {/* Floating HUD */}
               <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
                   <div className="bg-black/60 backdrop-blur border border-blue-500/30 p-3 rounded flex flex-col">
                       <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-widest">Dock Dewatering</div>
                       <div className="text-2xl font-mono font-bold text-white">{pumpingRate.toFixed(1)} <span className="text-xs text-slate-500">m³/s</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Hull Integrity</div>
                       <div className="text-2xl font-mono font-bold text-white">99.8%</div>
                   </div>
               </div>

               {/* Action Console */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重新启动演练程序');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-45deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={handleNext}
                     disabled={currentStepIdx === DRILL_STEPS.length - 1}
                     className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full shadow-lg shadow-blue-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === DRILL_STEPS.length - 1 ? '演练已完成' : '下达后续指令 (Next)'}
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Engineering Metrics (Bottom center) */}
           <div className="h-[200px] grid grid-cols-2 gap-4">
               <SciFiCard title="坞内压力与载荷" subtitle="LOAD CURVES" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={DOCK_PRESSURE}>
                               <defs>
                                   <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                               <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#pressGrad)" name="P-kPa" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="水下部件检修状态" subtitle="COMPONENT HEALTH" className="border-slate-800" noPadding>
                   <div className="grid grid-cols-2 h-full p-3 gap-3">
                       <div className="bg-slate-900/50 rounded p-2 border border-slate-800 flex flex-col justify-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">螺旋桨空蚀度</div>
                           <div className="text-xl font-bold text-white">0.05 <span className="text-xs font-normal text-slate-600">mm</span></div>
                           <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                               <div className="bg-green-500 h-full w-[10%]"></div>
                           </div>
                       </div>
                       <div className="bg-slate-900/50 rounded p-2 border border-slate-800 flex flex-col justify-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">海底门开度</div>
                           <div className="text-xl font-bold text-red-500 uppercase">Closed</div>
                           <div className="flex gap-1 mt-2">
                               <div className="w-2 h-2 rounded-full bg-red-500"></div>
                               <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                           </div>
                       </div>
                       <div className="bg-slate-900/50 rounded p-2 border border-slate-800 flex flex-col justify-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">艉轴密封压力</div>
                           <div className="text-xl font-bold text-white">0.45 <span className="text-xs font-normal text-slate-600">MPa</span></div>
                       </div>
                       <div className="bg-slate-900/50 rounded p-2 border border-slate-800 flex flex-col justify-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">除锈完成率</div>
                           <div className="text-xl font-bold text-blue-400">82%</div>
                       </div>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Personnel & Project Management --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="施工人员配置" subtitle="RESOURCES" className="h-[280px] border-blue-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={REPAIR_RESOURCES}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Staffing" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="工程物料动态" subtitle="BOM STATUS" className="flex-1 border-slate-800">
               <div className="space-y-3">
                   {[
                       { name: '防腐涂料 (海虹)', stock: '4.2', unit: 't', status: 'Optimal' },
                       { name: '锌块组件 (A-Type)', stock: '124', unit: 'pcs', status: 'Warning' },
                       { name: '螺旋桨密封圈', stock: '2', unit: 'sets', status: 'Optimal' },
                       { name: '高压淡水管', stock: '500', unit: 'm', status: 'Optimal' },
                   ].map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2.5 rounded flex justify-between items-center group hover:border-blue-500/30 transition-all">
                           <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                               <span className="text-xs font-bold text-slate-300">{item.name}</span>
                           </div>
                           <div className="text-right">
                               <div className="text-sm font-bold text-white">{item.stock} <span className="text-[10px] text-slate-500">{item.unit}</span></div>
                               <div className={`text-[9px] uppercase ${item.status === 'Optimal' ? 'text-green-500' : 'text-yellow-500'}`}>{item.status}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="数字专家AI推理" subtitle="EXPERT ADVICE" className="border-blue-900/20 bg-blue-950/10">
               <div className="flex items-start gap-3">
                   <Cpu size={24} className="text-blue-500 shrink-0 mt-1" />
                   <div className="text-[11px] text-slate-400 leading-relaxed italic">
                      根据历史相似船型分析，建议在“抽水坐墩”阶段关注第14#侧墩受力平衡。预测未来3天坞内湿度波动，建议调整涂装作业排班。
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
