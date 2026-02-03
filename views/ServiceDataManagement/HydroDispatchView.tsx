
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ReservoirDispatchThreeScene } from '../../components/ServiceDataManagement/ReservoirDispatch/ThreeScene';
import { GateNode } from '../../components/ServiceDataManagement/ReservoirDispatch/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Waves, Activity, Send, CheckCircle2, AlertTriangle, 
  ArrowRight, DownloadCloud, Radio, Settings, MousePointerClick,
  FileCode, Database, RefreshCw, Lock
} from 'lucide-react';

export const HydroDispatchView: React.FC = () => {
  const [activeGate, setActiveGate] = useState<string>('gate-3');
  const [simulationTime, setSimulationTime] = useState(0);

  // --- Mock Data States ---
  const [hydrology, setHydrology] = useState({
    waterLevel: 142.5, // m
    limitLevel: 145.0, // m
    inflow: 2450, // m3/s
    outflow: 2100, // m3/s
    rainfall: 12.5, // mm/h
  });

  const [gates, setGates] = useState<GateNode[]>([
    { id: 'gate-1', index: 1, name: '1号表孔', position: [0,0,0], opening: 0, targetOpening: 0, status: 'static', flowRate: 0 },
    { id: 'gate-2', index: 2, name: '2号表孔', position: [0,0,0], opening: 35, targetOpening: 35, status: 'static', flowRate: 450 },
    { id: 'gate-3', index: 3, name: '3号表孔 (主)', position: [0,0,0], opening: 60, targetOpening: 60, status: 'moving', flowRate: 850 },
    { id: 'gate-4', index: 4, name: '4号表孔', position: [0,0,0], opening: 35, targetOpening: 35, status: 'static', flowRate: 450 },
    { id: 'gate-5', index: 5, name: '5号表孔', position: [0,0,0], opening: 0, targetOpening: 0, status: 'static', flowRate: 0 },
  ]);

  const [instructions, setInstructions] = useState([
    { id: 'CMD-20240520-01', type: '泄洪调度', target: '3号表孔', param: '开度->65%', time: '10:42:05', status: 'EXECUTING', progress: 85 },
    { id: 'CMD-20240520-02', type: '负荷调整', target: '全厂', param: '出库流量+50', time: '10:40:12', status: 'COMPLETED', progress: 100 },
    { id: 'CMD-20240520-03', type: '闸门自检', target: '5号表孔', param: '液压系统', time: '09:15:00', status: 'COMPLETED', progress: 100 },
  ]);

  const flowTrend = Array.from({length: 20}, (_, i) => ({
    time: `${10+i}:00`,
    in: 2000 + Math.sin(i*0.5)*500 + Math.random()*100,
    out: 2100 + Math.random()*50
  }));

  const feedbackLogs = [
    { time: '10:42:06', source: 'GATE-03', msg: '液压启闭机动作开始，油压 16.5MPa', type: 'info' },
    { time: '10:42:08', source: 'GATE-03', msg: '开度传感器反馈：61.2%', type: 'info' },
    { time: '10:42:10', source: 'SCADA', msg: '出库流量计算值更新：2120 m³/s', type: 'success' },
    { time: '10:42:12', source: 'Safety', msg: '下游消能池水位波动正常', type: 'info' },
  ];

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationTime(prev => prev + 1);
      
      // Update Hydrology
      setHydrology(prev => ({
        ...prev,
        waterLevel: 142.5 + Math.sin(Date.now()/5000) * 0.1,
        inflow: 2450 + (Math.random()-0.5)*20,
        outflow: gates.reduce((acc, g) => acc + g.flowRate, 350) // Base flow + gates
      }));

      // Simulate Gate 3 Moving
      setGates(prev => prev.map(g => {
        if (g.id === 'gate-3' && g.opening < 65) {
           return { ...g, opening: Math.min(65, g.opening + 0.1), flowRate: 850 + (g.opening/100)*50 };
        }
        return g;
      }));

    }, 100);
    return () => clearInterval(interval);
  }, []);

  const activeGateInfo = gates.find(g => g.id === activeGate);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#080c14] p-2 overflow-hidden select-none relative">
      
      {/* 背景层：3D 场景作为全屏背景 */}
      <div className="absolute inset-0 z-0">
         <ReservoirDispatchThreeScene 
            waterLevel={2} // Visual relative height
            gates={gates}
            activeGateId={activeGate}
            onGateSelect={setActiveGate}
            dischargeIntensity={1.0}
         />
         {/* 渐变遮罩，确保文字可读 */}
         <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-transparent to-[#080c14] opacity-90 pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-[#080c14] via-transparent to-[#080c14] opacity-80 pointer-events-none"></div>
      </div>

      {/* 顶部：战略指挥头 */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-slate-950/60 backdrop-blur-md border-b border-cyan-500/30 rounded-2xl mx-4 mt-2">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] animate-pulse">
              <Send className="text-cyan-400" size={28} />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic text-shadow-glow">水库调度指令执行与反馈服务管理</h1>
              <div className="flex items-center gap-6 mt-1 text-[11px] font-mono text-cyan-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Radio size={12}/> DISPATCH LINK: ENCRYPTED</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Database size={12}/> FEEDBACK LATENCY: 24ms</span>
                 <span>|</span>
                 <span className="text-amber-400 font-bold">FLOOD SEASON MODE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Current Water Level</div>
              <div className="text-3xl font-mono font-black text-cyan-300">{hydrology.waterLevel.toFixed(2)} <span className="text-sm font-normal text-slate-500">m</span></div>
              <div className="text-[9px] text-red-400">Limit: {hydrology.limitLevel} m</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Outflow</div>
              <div className="text-3xl font-mono font-black text-white">{hydrology.outflow.toFixed(0)} <span className="text-sm font-normal text-slate-500">m³/s</span></div>
           </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 flex-1 min-h-0 px-4 pb-4">
        
        {/* 左侧：指令下发与水情 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           {/* 指令队列 */}
           <SciFiCard title="调度指令流转 (Dispatch Queue)" subtitle="ACTIVE ORDERS" className="bg-slate-900/80 border-cyan-800/50 backdrop-blur-sm">
              <div className="space-y-3 mt-2">
                 {instructions.map((inst, i) => (
                    <div key={i} className="relative p-3 rounded-lg border border-slate-700 bg-black/40 hover:border-cyan-500/50 transition-all group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-cyan-500">{inst.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                             inst.status === 'EXECUTING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-green-500/20 text-green-400'
                          }`}>{inst.status}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded">
                             <FileCode size={16} className="text-slate-300" />
                          </div>
                          <div className="flex-1">
                             <div className="text-xs font-bold text-white">{inst.type} <span className="text-slate-500">/</span> {inst.target}</div>
                             <div className="text-[10px] text-cyan-300 font-mono mt-0.5">{inst.param}</div>
                          </div>
                       </div>
                       {/* Progress Bar */}
                       <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${inst.status === 'EXECUTING' ? 'bg-amber-500' : 'bg-green-500'}`} style={{width: `${inst.progress}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* 入库流量分析 */}
           <SciFiCard title="入库流量与降雨预测" subtitle="INFLOW FORECAST" className="flex-1 bg-slate-900/80 border-cyan-800/50 backdrop-blur-sm">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={flowTrend}>
                       <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #22d3ee', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="in" stroke="#22d3ee" fill="url(#colorIn)" strokeWidth={2} name="Inflow" />
                       <Line type="monotone" dataKey="out" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" name="Outflow" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center gap-3 p-2 bg-blue-900/20 border border-blue-500/20 rounded">
                 <DownloadCloud size={16} className="text-blue-400" />
                 <div className="text-[10px] text-blue-200">
                    上游测站未来 6 小时预计降雨 <span className="font-bold text-white">25mm</span>，入库流量将持续上涨。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：留空给 3D 场景展示，只放少量悬浮按钮 */}
        <div className="w-full lg:w-[44%] flex flex-col justify-end pointer-events-none">
           {/* 底部中央：实时反馈日志 */}
           <div className="h-40 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 flex flex-col pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> 实时执行反馈日志 (Execution Feedback)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">SYNC_RATE: 100Hz</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {feedbackLogs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors items-center">
                       <span className="text-slate-600 w-14">[{log.time}]</span>
                       <span className="text-cyan-500 font-bold w-16">{log.source}:</span>
                       <span className="text-slate-300 flex-1">{log.msg}</span>
                       {log.type === 'success' && <CheckCircle2 size={10} className="text-green-500" />}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：闸门状态与安全反馈 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           {/* 选中闸门详情 */}
           <SciFiCard title="闸门执行单元状态" subtitle="ACTUATOR" className="bg-slate-900/80 border-cyan-800/50 backdrop-blur-sm">
              {activeGateInfo ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/50">
                             <Settings size={20} className="text-cyan-400 animate-spin" style={{animationDuration: '5s'}} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-white">{activeGateInfo.name}</div>
                             <div className="text-[9px] text-slate-400 font-mono">ID: {activeGateInfo.id}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase">Current Flow</div>
                          <div className="text-lg font-mono font-bold text-emerald-400">{activeGateInfo.flowRate.toFixed(0)} <span className="text-xs text-slate-600">m³/s</span></div>
                       </div>
                    </div>

                    {/* Opening Gauge */}
                    <div>
                       <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>开度 (Opening)</span>
                          <span className="text-white font-mono">{activeGateInfo.opening.toFixed(1)}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${activeGateInfo.opening}%`}}></div>
                          {/* Target Marker */}
                          <div className="absolute top-0 w-0.5 h-full bg-red-500 z-10" style={{left: `${activeGateInfo.targetOpening}%`}}></div>
                       </div>
                       <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                          <span>0%</span>
                          <span className="text-red-400">Target: {activeGateInfo.targetOpening}%</span>
                          <span>100%</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="bg-black/40 p-2 rounded border border-slate-700">
                          <div className="text-[9px] text-slate-500">液压油压</div>
                          <div className="text-sm font-mono text-white">16.8 MPa</div>
                       </div>
                       <div className="bg-black/40 p-2 rounded border border-slate-700">
                          <div className="text-[9px] text-slate-500">启闭电流</div>
                          <div className="text-sm font-mono text-white">45.2 A</div>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex items-center justify-center h-40 text-slate-500 text-xs">
                    Select a gate from the scene
                 </div>
              )}
           </SciFiCard>

           {/* 下游安全监测 */}
           <SciFiCard title="下游消能与安全反馈" subtitle="SAFETY CHECK" className="flex-1 bg-slate-900/80 border-cyan-800/50 backdrop-blur-sm">
              <div className="h-full flex flex-col">
                 <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/20 rounded-lg mb-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                       <div className="text-xs font-bold text-red-200">安全泄量预警</div>
                       <div className="text-[9px] text-slate-400 mt-1">当前总泄量接近下游河道警戒水位 (2200 m³/s)，需谨慎增加开度。</div>
                    </div>
                 </div>

                 <div className="flex-1 min-h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                         { subject: '冲刷深度', A: 45, fullMark: 100 },
                         { subject: '雾化范围', A: 80, fullMark: 100 },
                         { subject: '河道水位', A: 92, fullMark: 100 }, // High risk
                         { subject: '流速分布', A: 60, fullMark: 100 },
                         { subject: '振动反馈', A: 30, fullMark: 100 },
                       ]}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar name="Safety" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <button className="w-full mt-2 py-2 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 rounded text-[10px] text-slate-300 transition-all flex items-center justify-center gap-2">
                    <Lock size={12} /> 启动紧急闭门程序 (Emergency Close)
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
