
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-expert/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-28]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-28';
import { ExpertSimStep } from '../../components/maintenance/hydro-expert/three-types';
import { 
  Wifi, Video, Mic, MessageSquare, 
  User, Shield, Activity, Cpu, 
  Zap, Wrench, Scan, FileText, 
  CheckCircle2, AlertTriangle, 
  ArrowRight, Maximize2, Share2, 
  Settings, Clock, Compass, PhoneCall
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';

// --- 模拟数据 ---
const TELEMETRY_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    val: 60 + Math.sin(i * 0.5) * 10 + Math.random() * 5
}));

const EXPERT_ROSTER = [
    { name: '王利民', title: '特级水机专家', location: '北京中心', online: true },
    { name: 'Sarah Chen', title: '调速器高级工程师', location: '上海实验室', online: true },
    { name: 'David Wilson', title: '液压系统架构师', location: '慕尼黑总控', online: false },
];

const TASK_CHECKLIST = [
    { label: '建立远程加密链路', done: true },
    { label: '同步多维度传感器数据', done: true },
    { label: '专家执行全息诊断扫描', done: false },
    { label: 'AR引导执行阀组更换', done: false },
    { label: '系统综合压力联动测试', done: false },
];

export const HydroRemoteExpertSimView: React.FC = () => {
  const [step, setStep] = useState<ExpertSimStep>('CONNECTING');
  const [latency, setLatency] = useState(12);
  const [logs, setLogs] = useState<string[]>(['[System] 一线AR眼镜就绪，请求远程专家连线...']);
  const [isMuted, setIsMuted] = useState(false);

  // 阶段推进逻辑
  useEffect(() => {
    let timers: any[] = [];
    if (step === 'CONNECTING') {
        timers.push(setTimeout(() => {
            setStep('STREAMING');
            addLog('>> [连线成功] 专家 王利民 (北京) 已接入指挥链路');
        }, 3000));
    }
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const handleNextStep = () => {
      const phases: ExpertSimStep[] = ['CONNECTING', 'STREAMING', 'DIAGNOSING', 'GUIDING', 'VERIFYING', 'COMPLETED'];
      const nextIdx = phases.indexOf(step) + 1;
      if (nextIdx < phases.length) {
          setStep(phases[nextIdx]);
          addLog(`>> 执行流推进至：${phases[nextIdx]}`);
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 全屏扫描线特效 (AR视角感) */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,255,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* --- TOP HUD (Connection Status) --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500
            ${step === 'CONNECTING' ? 'border-yellow-500 animate-pulse' : 'border-cyan-500 shadow-[0_0_10px_cyan]'}
          `}>
             <PhoneCall size={24} className={step === 'CONNECTING' ? 'text-yellow-500' : 'text-cyan-400'} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Secure Multi-Channel Node / AR-Link
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               远程专家 <span className="text-cyan-500">协同维修指挥台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">传输延迟 (Latency)</div>
                <div className="text-2xl font-mono font-black text-green-400">{latency} <span className="text-xs">ms</span></div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">带宽占用 (BW)</div>
                <div className="text-2xl font-mono font-bold text-white">45.2 <span className="text-xs">Gbps</span></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/20 rounded border border-cyan-500/30">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                <span className="text-xs font-bold font-mono">ENCRYPTED</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Expert & Telemetry --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="远端专家视角" subtitle="LIVE FEED" className="h-[240px] border-slate-800 bg-black" noPadding>
               <div className="w-full h-full relative overflow-hidden group">
                  {/* Mock Video Feed */}
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                     <User size={64} className="text-slate-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  
                  {/* Video HUD */}
                  <div className="absolute bottom-3 left-3 flex flex-col">
                      <span className="text-xs font-bold text-white">王利民 (特级专家)</span>
                      <span className="text-[9px] text-cyan-400">北京中心 • 调速器故障分析组</span>
                  </div>
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                      <div className="p-1.5 bg-black/60 rounded-sm text-cyan-400 hover:text-white cursor-pointer"><Maximize2 size={12}/></div>
                  </div>

                  <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none group-hover:border-cyan-500/50 transition-colors"></div>
               </div>
           </SciFiCard>

           <SciFiCard title="现场遥测指标" subtitle="REAL-TIME" className="flex-1 border-slate-800">
                <div className="w-full h-full flex flex-col gap-4">
                    <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={TELEMETRY_DATA}>
                                <defs>
                                    <linearGradient id="expertGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip contentStyle={{backgroundColor: '#0c0a09'}} />
                                <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="url(#expertGrad)" strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase">Oil Pressure</span>
                            <span className="text-lg font-bold text-white font-mono">16.4 MPa</span>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase">Servo Pos</span>
                            <span className="text-lg font-bold text-cyan-400 font-mono">42.5 %</span>
                        </div>
                    </div>

                    <div className="mt-auto p-3 bg-red-900/10 border border-red-900/20 rounded flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={20} />
                        <div>
                            <div className="text-xs font-bold text-red-200">故障指征</div>
                            <div className="text-[10px] text-red-400/70">频率给定偏置异常 (-0.5Hz)</div>
                        </div>
                    </div>
                </div>
           </SciFiCard>

           <div className="h-[140px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2">
                   <MessageSquare size={12}/> 专家指导指令 (Secure Chat)
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 mt-2 pr-1 custom-scrollbar">
                   <div className="flex gap-2 text-cyan-600">
                       <span>[Expert]</span>
                       <span className="text-slate-300 italic">"王利民：请尝试在AR图层引导下，检查PLC背板第二组端子排的接线是否松动。"</span>
                   </div>
                   <div className="flex gap-2 text-slate-500">
                       <span>[System]</span>
                       <span>已将该位置全息高亮显示在您的AR视野中。</span>
                   </div>
               </div>
           </div>
        </div>

        {/* --- CENTER: AR Digital Twin Workspace --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] group">
               {/* 3D Scene */}
               <ThreeScene step={step} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* AR HUD Overlay Components */}
               <div className="absolute inset-0 pointer-events-none p-6">
                   {/* HUD Corner - Compass */}
                   <div className="absolute bottom-6 left-6 w-24 h-24 border-2 border-cyan-500/20 rounded-full flex items-center justify-center">
                       <Compass className="text-cyan-500/40" size={40} />
                       <div className="absolute top-0 text-[8px] text-cyan-500/40 font-bold">N</div>
                   </div>

                   {/* HUD Corner - System Info */}
                   <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                       <div className="bg-cyan-500/10 backdrop-blur px-3 py-1 rounded border border-cyan-500/30 flex items-center gap-2">
                           <Activity size={12} className="text-cyan-400" />
                           <span className="text-[10px] text-white font-bold">AR ENGINE: READY</span>
                       </div>
                   </div>

                   {/* Stage Status Display */}
                   <div className="absolute top-6 left-6">
                       <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-xl">
                           <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest">
                               Collaborative Phase
                           </div>
                           <div className="text-3xl font-black text-white italic">
                               {step}
                           </div>
                       </div>
                   </div>
               </div>

               {/* Interaction Controls */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   <div className="flex gap-2 px-2">
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-2 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            {isMuted ? <Mic size={20} /> : <Mic size={20} />}
                        </button>
                        <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><Video size={20} /></button>
                        <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><Share2 size={20} /></button>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>
                   <button 
                     onClick={handleNextStep}
                     className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                   >
                       <span className="tracking-widest">下一推演阶段</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Timeline & Audit Logs */}
           <div className="h-[140px] bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[10px] flex flex-col gap-1 shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center">
                   <span>REMOTE_COLLABORATION_LOG_V2.0</span>
                   <span className="animate-pulse text-cyan-800">STREAMING_AES256</span>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-cyan-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Checklist --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="AR 引导任务单" subtitle="CHECKLIST" className="border-slate-800 bg-[#0c0e14]/90">
               <div className="space-y-3 py-1">
                   {TASK_CHECKLIST.map((item, i) => (
                       <div key={i} className={`p-2.5 rounded border flex items-center justify-between transition-colors
                          ${item.done ? 'bg-green-900/10 border-green-800/30 text-green-500/80' : 'bg-slate-900/50 border-slate-800 text-slate-400'}
                       `}>
                           <span className="text-[11px] font-bold">{item.label}</span>
                           {item.done ? <CheckCircle2 size={14}/> : <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="关联数字化档案" subtitle="DOCUMENTS" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {[
                            { id: 'DWG-042', name: '控制柜接线原理图 (2023)', type: 'PDF' },
                            { id: 'MAN-102', name: '调速器PLC模组维护手册', type: 'DOC' },
                            { id: 'HIS-88', name: '同型号机组历史故障报告', type: 'CASE' },
                            { id: 'BOM-A3', name: '电气备件采购明细表', type: 'BOM' },
                        ].map((doc, i) => (
                            <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center gap-3 group">
                                <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-cyan-400">
                                    <FileText size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-[9px] text-slate-500 font-mono">{doc.id}</div>
                                    <div className="text-xs font-bold text-slate-300 truncate">{doc.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                        <Settings size={14} /> 调取专家共享桌面
                    </button>
               </div>
           </SciFiCard>

           <div className="bg-cyan-900/10 border border-cyan-800/30 p-3 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                   <Activity size={14} className="text-cyan-500" />
                   <span className="text-[11px] font-black text-cyan-200">系统自诊断状态</span>
               </div>
               <div className="text-[10px] text-slate-400 leading-relaxed italic">
                   边缘侧分析已完成，同步误差补偿值已发送至专家终端。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
