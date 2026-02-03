
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroIncidentThreeScene } from '../../components/ServiceDataManagement/HydroIncident/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { 
  AlertOctagon, Activity, FileWarning, ClipboardList, 
  History, Play, Pause, Rewind, FastForward, 
  Siren, Stethoscope, Microscope, ShieldAlert, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const HydroIncidentView: React.FC = () => {
  const [activeIncident, setActiveIncident] = useState<string>('inc-shear-pin');
  const [playbackState, setPlaybackState] = useState({ isPlaying: false, progress: 0 }); // 0 to 1

  // Mock SOE Data (Sequence of Events)
  const soeData = [
    { time: '14:20:05.012', device: '导叶位置传感器', event: '反馈值突变', val: '85% -> 0%', type: 'trigger' },
    { time: '14:20:05.045', device: '剪断销信号器', event: '信号动作', val: '1', type: 'alarm' },
    { time: '14:20:05.120', device: '机组保护屏', event: '紧急停机指令下发', val: 'TRIP', type: 'action' },
    { time: '14:20:05.250', device: '导叶接力器', event: '油压急剧下降', val: '2.5MPa', type: 'response' },
    { time: '14:20:06.000', device: '机组转速', event: '开始飞逸趋势', val: '145 rpm', type: 'warning' },
    { time: '14:20:08.500', device: '主进水阀', event: '动水关闭启动', val: 'START', type: 'action' },
  ];

  // Correlation Data (Vibration vs Load during event)
  const correlationData = Array.from({length: 50}, (_, i) => {
      // Simulate incident at index 35
      const isIncident = i > 35;
      return {
          time: i,
          load: isIncident ? 0 : 580 + Math.random() * 5,
          vibration: isIncident ? 1.5 + Math.random() * 2 : 0.1 + Math.random() * 0.05,
          pressure: isIncident ? 1.5 : 2.5
      };
  });

  // Fault Tree Data (Simplified for UI)
  const faultTree = [
    { id: 'ROOT', label: '剪断销剪断', prob: '100%', status: 'confirmed' },
    { id: 'L1-1', label: '异物卡阻', prob: '85%', status: 'likely' },
    { id: 'L1-2', label: '液压冲击', prob: '12%', status: 'unlikely' },
    { id: 'L1-3', label: '材料疲劳', prob: '3%', status: 'unlikely' },
  ];

  // Playback Animation Loop
  useEffect(() => {
    let interval: any;
    if (playbackState.isPlaying) {
      interval = setInterval(() => {
        setPlaybackState(prev => {
          if (prev.progress >= 1) {
             return { isPlaying: false, progress: 1 };
          }
          return { ...prev, progress: prev.progress + 0.01 };
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [playbackState.isPlaying]);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#050000] p-2 overflow-hidden select-none">
      
      {/* 顶部：事故指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900/60 to-transparent border-b border-red-600/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
              <Siren className="text-red-500" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电站设备异常与事故处置服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-red-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><AlertOctagon size={12}/> INCIDENT ID: INC-2024-05-20-A01</span>
                 <span>|</span>
                 <span className="text-white font-bold">STATUS: INVESTIGATION OPEN</span>
                 <span>|</span>
                 <span>LEVEL: CLASS I (MAJOR)</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <button className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded border border-red-400 shadow-[0_0_15px_red] transition-all flex items-center gap-2">
              <FileWarning size={14} /> 生成事故快报
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：SOE 与 告警流 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="SOE 事件序列 (毫秒级)" subtitle="SEQUENCE OF EVENTS" className="flex-1 bg-red-950/5 border-red-900/40">
              <div className="relative pl-4 border-l border-slate-800 space-y-4 overflow-y-auto custom-scrollbar h-full pr-2">
                 {soeData.map((evt, i) => (
                    <div key={i} className={`relative group ${evt.type === 'alarm' ? 'bg-red-900/10' : ''} p-2 rounded transition-all hover:bg-slate-800/50`}>
                       {/* Timeline dot */}
                       <div className={`absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 ${
                           evt.type === 'trigger' ? 'bg-white border-white' : 
                           evt.type === 'alarm' ? 'bg-red-500 border-red-500 animate-pulse' :
                           evt.type === 'action' ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-500'
                       }`}></div>
                       
                       <div className="flex justify-between items-start text-[10px] text-slate-500 font-mono mb-1">
                          <span>{evt.time}</span>
                          <span className="uppercase">{evt.type}</span>
                       </div>
                       <div className="text-xs font-bold text-white mb-1">{evt.event}</div>
                       <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">{evt.device}</span>
                          <span className="text-red-300 font-mono">{evt.val}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="关联参数特征" subtitle="CORRELATION" className="h-48 border-red-900/40">
              <div className="w-full h-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={correlationData}>
                       <defs>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331111" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#050000', border: '1px solid #ef4444', fontSize: '10px'}} />
                       <Area type="step" dataKey="vibration" stroke="#ef4444" fill="url(#colorVib)" strokeWidth={2} />
                       <Line type="monotone" dataKey="load" stroke="#3b82f6" dot={false} strokeWidth={1} strokeDasharray="3 3" />
                    </AreaChart>
                 </ResponsiveContainer>
                 <div className="text-[9px] text-slate-500 text-center -mt-4 relative z-10">
                    <span className="text-red-400">■ 振动</span> vs <span className="text-blue-400">-- 负荷</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息事故重构 */}
        <div className="w-full lg:w-[46%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#1a0505] to-[#020000] border border-red-500/30 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(220,38,38,0.1)]">
              
              {/* HUD: Replay Status */}
              <div className="absolute top-6 left-6 z-10">
                 <div className="bg-black/80 backdrop-blur-md border border-red-500/40 p-4 rounded-xl shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-red-500/20 pb-2 mb-2">
                       <History className="text-red-400" size={18} />
                       <span className="text-xs font-bold text-white uppercase">Incident Replay</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mb-2">T-Minus: {(playbackState.progress * 10).toFixed(2)}s</div>
                    <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-red-600" style={{width: `${playbackState.progress * 100}%`}}></div>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <HydroIncidentThreeScene 
                 activeIncidentId={activeIncident}
                 onIncidentSelect={setActiveIncident}
                 isReplaying={playbackState.isPlaying}
                 playbackTime={playbackState.progress}
              />

              {/* Playback Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <button className="p-3 rounded-full bg-slate-900/80 border border-slate-700 hover:border-white text-slate-300 hover:text-white transition-all">
                    <Rewind size={20} />
                 </button>
                 <button 
                    onClick={() => setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_red] transition-all transform hover:scale-110"
                 >
                    {playbackState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
                 </button>
                 <button className="p-3 rounded-full bg-slate-900/80 border border-slate-700 hover:border-white text-slate-300 hover:text-white transition-all">
                    <FastForward size={20} />
                 </button>
              </div>

              {/* Incident Overlay Label */}
              <div className="absolute bottom-6 right-6 z-10">
                 <div className="text-[10px] bg-red-950/80 border border-red-500/50 px-3 py-2 rounded text-red-200 max-w-[200px]">
                    <div className="font-bold mb-1 flex items-center gap-2"><AlertTriangle size={12}/> {activeIncident}</div>
                    故障特征：导叶连杆剪断销剪断，导致导叶失去控制，机组振动急剧增大。
                 </div>
              </div>
           </div>

           {/* Diagnosis Log */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    <Stethoscope size={14} /> AI Diagnostic Log
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">[00:00.0]</span>
                    <span className="text-blue-400 font-bold">ANALYSIS:</span>
                    <span>振动频谱出现低频 0.2X 分量，特征匹配库 ID: #MEC-04.</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">[00:00.5]</span>
                    <span className="text-yellow-400 font-bold">ROOT CAUSE:</span>
                    <span>初步判定为 3# 导叶剪断销疲劳断裂。置信度 92%。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">[00:01.2]</span>
                    <span className="text-green-500 font-bold">SOP:</span>
                    <span>推荐执行预案：紧急停机 -&gt 关闭进水阀 -&gt 启动排空泵。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：故障树与处置 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Fault Tree */}
           <SciFiCard title="故障树根因分析 (RCA)" subtitle="FAULT TREE" className="flex-1 border-red-900/40">
              <div className="flex flex-col h-full gap-2 relative">
                 {faultTree.map((node, i) => (
                    <div key={i} className="flex items-center gap-2 relative z-10">
                       <div className="w-6 border-t border-l border-slate-600 h-full absolute -left-2 top-3 -z-10" style={{display: i===0?'none':'block'}}></div>
                       <div className={`
                          flex-1 p-2 rounded border flex justify-between items-center
                          ${node.status === 'confirmed' ? 'bg-red-600/20 border-red-500 text-white' : 
                            node.status === 'likely' ? 'bg-orange-600/20 border-orange-500 text-orange-200' : 
                            'bg-slate-800 border-slate-700 text-slate-400 opacity-60'}
                       `}>
                          <span className="text-xs font-bold">{node.label}</span>
                          <span className="text-[10px] font-mono">{node.prob}</span>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-auto p-3 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 leading-tight">
                    <span className="text-red-400 font-bold block mb-1">结论:</span>
                    排除液压冲击可能性，主要原因为长期运行导致的材料疲劳累积。
                 </div>
              </div>
           </SciFiCard>

           {/* Emergency SOP Checklist */}
           <SciFiCard title="应急处置预案 (SOP)" subtitle="CHECKLIST" className="border-red-900/40">
              <div className="space-y-2">
                 <div className="flex items-center gap-3 p-2 bg-green-900/20 border border-green-800/30 rounded opacity-60">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs text-slate-300 line-through">1. 确认停机指令</span>
                 </div>
                 <div className="flex items-center gap-3 p-2 bg-green-900/20 border border-green-800/30 rounded opacity-60">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs text-slate-300 line-through">2. 关闭主进水阀</span>
                 </div>
                 <div className="flex items-center gap-3 p-2 bg-red-900/20 border border-red-500/50 rounded animate-pulse">
                    <div className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center">
                       <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                    </div>
                    <span className="text-xs text-white font-bold">3. 启动顶盖排水泵</span>
                 </div>
                 <div className="flex items-center gap-3 p-2 bg-slate-900/50 border border-slate-800 rounded">
                    <div className="w-4 h-4 border-2 border-slate-600 rounded"></div>
                    <span className="text-xs text-slate-500">4. 现场人工确认</span>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-red-700/20 hover:bg-red-600/30 border border-red-500/40 rounded text-[10px] text-red-300 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <ShieldAlert size={12} /> 广播全厂警报
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
