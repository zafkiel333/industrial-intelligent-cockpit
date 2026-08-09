import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-cross-regional/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-29]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-29';
import { CollabStep } from '../../components/maintenance/ship-cross-regional/three-types';
import { 
  Globe, Wifi, Activity, Share2, 
  MessageSquare, UserCheck, Settings, 
  Zap, Clock, ShieldCheck, MapPin,
  ChevronRight, ArrowRight, Video,
  Mic, Info, Maximize2, Terminal,
  AlertTriangle, Database, Workflow, Compass,
  Satellite, Cast, Users
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';

const LINK_LATENCY = Array.from({length: 20}, (_, i) => ({
    time: i,
    sh: 120 + Math.random() * 15,
    rd: 180 + Math.random() * 20,
    sp: 95 + Math.random() * 10
}));

const COLLAB_STEPS: { id: CollabStep; label: string; desc: string }[] = [
  { id: 'SAT_LINK', label: '链路建立', desc: '锁定海事卫星 L-Band 通道，建立 256-bit 加密隧道。' },
  { id: 'DATA_SYNC', label: '孪生同步', desc: '全船传感器 TB 级数据实时映射至全球协同中心。' },
  { id: 'MULTI_EXPERT', label: '全球会诊', desc: '上海、鹿特丹、新加坡三地坐席进入同步虚拟空间。' },
  { id: 'REMOTE_OPS', label: '远程操控', desc: '主控权转移至上海中心，执行动力系统参数调优。' },
  { id: 'VAL_CLOSE', label: '验证归档', desc: '执行联合试车验证，归档数字维修日志与区块链存证。' },
];

const EXPERT_NODES = [
    { name: '上海中心 (Asia-East)', status: 'Online', latency: '124ms', lead: '王教授 (系统总师)' },
    { name: '鹿特丹 (EU-West)', status: 'Online', latency: '185ms', lead: 'Dr. Hans (轮机专家)' },
    { name: '新加坡 (SEA)', status: 'Online', latency: '92ms', lead: 'Tan Beng (自动化专家)' },
];

export const ShipCrossRegionalCollabView: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 全球远程协作系统初始化...', '[Link] 正在扫描最近的低轨卫星节点']);
  const [syncRate, setSyncRate] = useState(0);

  const currentStep = COLLAB_STEPS[stepIdx];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const nextStep = () => {
    if (stepIdx < COLLAB_STEPS.length - 1) {
      setStepIdx(prev => prev + 1);
      addLog(`>>> 任务阶段推进：${COLLAB_STEPS[stepIdx+1].label}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
        setSyncRate(prev => Math.min(100, prev + Math.random() * 2.5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 动态光流背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-cyan-500/50 shadow-[0_0_20px_cyan]"></div>
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-blue-500/50 shadow-[0_0_20px_blue]"></div>
      </div>

      {/* --- TOP HUD --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/70 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-sm flex items-center justify-center border-2 border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
             <Globe size={32} className="text-cyan-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Cross-Ocean High-Latency Link / v4.0
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               跨区域 <span className="text-cyan-500">远程维修协同模拟系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">平均同步偏置</div>
                <div className="text-2xl font-mono font-black text-white">0.024 <span className="text-sm">ms</span></div>
            </div>
            <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">数据一致性</div>
                <div className="text-2xl font-mono font-bold text-green-400">99.99%</div>
            </div>
            <div className="px-6 py-2 bg-cyan-900/30 rounded-sm border border-cyan-500/30 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                <span className="text-xs font-bold font-mono tracking-widest uppercase">Global Mesh Active</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Global Expert Nodes --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="全球坐席节点" subtitle="EXPERT NODES" className="flex-1 border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-4 h-full">
                 {EXPERT_NODES.map((node, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/40 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                           <div className="text-xs font-bold text-white group-hover:text-cyan-400">{node.name}</div>
                           <span className="text-[9px] px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full border border-green-800/30 uppercase font-black">Online</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-2 font-mono">
                            <div className="flex items-center gap-1"><MapPin size={10} /> LATENCY</div>
                            <div className="text-white">{node.latency}</div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <UserCheck size={12} className="text-cyan-500" />
                            </div>
                            <span className="text-[10px] text-slate-400">{node.lead}</span>
                        </div>
                    </div>
                 ))}
                 <button className="mt-auto w-full py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-3">
                     <Share2 size={16} /> 邀请多方会诊
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="链路延迟监测" subtitle="LINK QUALITY" className="h-[220px] border-slate-800">
                <div className="w-full h-full p-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={LINK_LATENCY}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                            <Line type="step" dataKey="sh" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line type="step" dataKey="rd" stroke="#f59e0b" strokeWidth={1} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Collaboration Workspace --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] group">
               {/* 3D Scene */}
               <ThreeScene step={currentStep.id} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* HUD Components */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/90 backdrop-blur border border-cyan-500/30 p-5 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Satellite size={12} className="animate-pulse" /> Active Task Phase
                       </div>
                       <div className="text-3xl font-black text-white italic">{currentStep.label}</div>
                       <p className="text-xs text-slate-400 mt-3 max-w-[240px] leading-relaxed italic border-t border-slate-800 pt-3">
                           {currentStep.desc}
                       </p>
                   </div>
               </div>

               <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 items-end">
                   <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-white/10 text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">
                       Sync Protocol: <span className="text-white font-mono">QUIC_V2</span>
                   </div>
               </div>

               {/* Interaction Controls */}
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 bg-slate-900/90 p-4 rounded-full border border-slate-700 shadow-2xl backdrop-blur-2xl scale-110">
                   <div className="flex gap-5 px-4">
                       <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><Video size={22}/></button>
                       <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><Mic size={22}/></button>
                       <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><Cast size={22}/></button>
                   </div>
                   <div className="w-[1px] h-10 bg-slate-700"></div>
                   <button 
                     onClick={nextStep}
                     disabled={stepIdx === COLLAB_STEPS.length - 1}
                     className="px-12 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-[0.2em] uppercase">推进阶段 (NEXT)</span>
                       <ArrowRight size={22} />
                   </button>
               </div>
           </div>

           {/* Bottom Console Terminal */}
           <div className="h-[140px] flex gap-4">
               <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col">
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                       <Terminal size={14}/> Collaborative Operation Terminal
                   </div>
                   <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar">
                       {logs.map((log, i) => (
                           <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300">
                               <span className="text-cyan-800">[{logs.length - i}]</span>
                               <span className="text-slate-400">{log}</span>
                           </div>
                       ))}
                   </div>
               </div>
               
               <div className="w-[320px] bg-slate-950/80 border border-slate-800 rounded-lg p-4 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                       <Zap size={140} className="text-cyan-500" />
                   </div>
                   <div className="text-center z-10">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">多端数据一致性检查</div>
                       <div className="text-3xl font-mono font-bold text-white">{syncRate.toFixed(2)}%</div>
                       <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3 border border-slate-700">
                           <div className="h-full bg-cyan-500 shadow-[0_0_15px_cyan] transition-all duration-700" style={{width: `${syncRate}%`}}></div>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Strategy --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="协同决策矩阵" subtitle="STRATEGY" className="h-[240px] border-slate-800 bg-[#0c0e14]/90">
               <div className="flex flex-col gap-5 h-full justify-center px-1">
                   <div className="bg-slate-900/70 p-3 rounded border border-slate-800 flex items-center gap-4">
                       <div className="p-2.5 bg-cyan-900/20 rounded-full text-cyan-400 border border-cyan-500/20"><Workflow size={24}/></div>
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase font-black">协同权重计算</div>
                           <div className="text-sm font-bold text-white tracking-tight">AI Multi-Node Voter</div>
                       </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">当前主控节点</span>
                          <span className="text-cyan-400 font-bold tracking-widest">SHANGHAI</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">参与会诊专家</span>
                          <span className="text-white font-bold font-mono">03 NODES</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">安全性验证</span>
                          <span className="text-green-500 font-bold uppercase">Passed</span>
                      </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="关联知识建议" subtitle="AI INSIGHTS" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-blue-900/20 border border-blue-900/40 rounded flex items-start gap-4">
                       <Info size={24} className="text-blue-400 shrink-0 mt-1" />
                       <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "基于鹿特丹节点的实时波形交叉分析，建议降低 2 号辅机负载 12%，以抵消跨时区采样偏置带来的微小频率干扰，确保同步成功率。"
                       </p>
                   </div>

                   <div className="space-y-3 mt-2">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                          <Database size={14}/> Shared Knowledge Docs
                      </div>
                      <div className="flex flex-col gap-2">
                          {['Global_Sync_Protocol_V3.pdf', 'Vessel_Model_S14.obj', 'Expert_Consensus_Log.csv'].map(doc => (
                              <div key={doc} className="p-2.5 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-800 flex items-center justify-between group cursor-pointer transition-all border-l-2 border-l-transparent hover:border-l-cyan-500">
                                  <span className="text-[10px] text-slate-400 group-hover:text-white truncate max-w-[200px]">{doc}</span>
                                  <ChevronRight size={12} className="text-slate-700 group-hover:text-cyan-500" />
                              </div>
                          ))}
                      </div>
                   </div>

                   <div className="mt-auto p-3 bg-red-950/20 border border-red-900/30 rounded flex items-center gap-3">
                       <AlertTriangle size={18} className="text-red-500 shrink-0" />
                       <div className="text-[9px] text-red-300 leading-tight">
                          链路风险提示：欧亚卫星通道负载已达 85%，建议非关键数据流降采样运行。
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
               <MessageSquare size={20} /> 发起全员实时研讨
           </button>
        </div>

      </div>
    </div>
  );
};
