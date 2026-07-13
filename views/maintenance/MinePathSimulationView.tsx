
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mine-path/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-33]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-33';
import { SimPathState } from '../../components/maintenance/mine-path/three-types';
import { 
  Workflow, GitBranch, Crosshair, AlertOctagon, 
  Settings2, Play, Pause, RotateCcw, 
  Activity, ShieldAlert, Layers, Box,
  Ruler, Move, Info, CheckCircle2,
  Cpu, Zap, Navigation, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  // Added ReferenceLine to fix "Cannot find name 'ReferenceLine'" error
  ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const PATH_NODES = [
  { id: 'P01', x: 0, y: 0, z: -12, status: 'Safe', gap: 2.4 },
  { id: 'P02', x: 1, y: 0.5, z: -8, status: 'Warning', gap: 0.15 },
  { id: 'P03', x: -1.5, y: -0.5, z: -2, status: 'Safe', gap: 1.8 },
  { id: 'P04', x: 0, y: 0, z: 5, status: 'Safe', gap: 3.2 },
  { id: 'P05', x: 2, y: 1, z: 12, status: 'Safe', gap: 1.5 },
];

const CLEARANCE_TREND = Array.from({length: 20}, (_, i) => ({
    dist: i,
    gap: i === 5 ? 0.1 : 1.5 + Math.random() * 1.5,
    limit: 0.5
}));

const COLLISION_RADAR = [
  { subject: '结构刚度', A: 85, fullMark: 100 },
  { subject: '避障冗余', A: 42, fullMark: 100 },
  { subject: '操作可视性', A: 90, fullMark: 100 },
  { subject: '重力偏移', A: 65, fullMark: 100 },
  { subject: '吊装稳定性', A: 88, fullMark: 100 },
];

export const MinePathSimulationView: React.FC = () => {
  const [simState, setSimState] = useState<SimPathState>('ANALYZING');
  const [logs, setLogs] = useState<string[]>(['[SYS] 空间扫描引擎初始化...', '[SCAN] 正在构建巷道点云图层...']);
  const [progress, setProgress] = useState(0);

  // 模拟生命周期
  useEffect(() => {
    let timer: any;
    if (simState === 'ANALYZING') {
      timer = setTimeout(() => {
        setSimState('PLANNING');
        addLog('>> 空间扫描完成。发现 1 处潜在干涉区域 (P02)。');
        addLog('>> 正在执行路径规划算法：A* 启发式搜索。');
      }, 3000);
    } else if (simState === 'PLANNING') {
        timer = setTimeout(() => {
            setSimState('EXECUTING');
            addLog('>> 路径生成成功。开始动力学仿真演示。');
        }, 2500);
    }
    return () => clearTimeout(timer);
  }, [simState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const toggleInterference = () => {
      setSimState(prev => prev === 'INTERFERENCE' ? 'EXECUTING' : 'INTERFERENCE');
      if (simState !== 'INTERFERENCE') addLog('!! 警报：检测到物理碰撞风险于点 P02 !!');
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#09090b] p-2 relative overflow-hidden">
      
      {/* 顶部状态栏 - 极简高亮 */}
      <div className="flex items-center justify-between bg-slate-900/40 border-b border-purple-900/50 p-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-purple-600/20 border border-purple-500 rounded-sm flex items-center justify-center">
             <Workflow size={24} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] text-purple-400 mb-0.5 uppercase tracking-widest font-black">
               Modification Path Simulation / V2.0
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
               矿山装备改造 <span className="text-purple-500 italic">维修路径仿真平台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center h-10 border-l border-slate-800 pl-8">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">仿真执行进度</div>
                <div className="text-2xl font-mono font-black text-white">
                    {simState === 'ANALYZING' ? 'SCANNING' : simState === 'PLANNING' ? 'CALC' : '42.5%'}
                </div>
            </div>
             <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold">碰撞预测值 (D)</div>
                <div className={`text-2xl font-mono font-black ${simState === 'INTERFERENCE' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {simState === 'INTERFERENCE' ? '0.02' : '1.45'} <span className="text-xs">mm</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Node Hierarchy - 悬浮卡片感 --- */}
        <div className="w-[300px] flex flex-col gap-4">
           <SciFiCard title="路径节点拓扑" subtitle="NODES" className="flex-1 border-purple-900/30 bg-purple-950/5">
              <div className="flex flex-col gap-2 mt-2 h-full">
                 {PATH_NODES.map((node, i) => (
                    <div key={node.id} className={`p-3 rounded border flex flex-col gap-1 transition-all
                        ${node.status === 'Warning' ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/40 border-slate-800'}
                    `}>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-white flex items-center gap-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Warning' ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`}></div>
                               Waypoint {node.id}
                           </span>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${node.status === 'Warning' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>{node.status}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                            <span>X:{node.x} Y:{node.y} Z:{node.z}</span>
                            <span className={node.status === 'Warning' ? 'text-red-400' : 'text-cyan-400'}>Gap: {node.gap}m</span>
                        </div>
                    </div>
                 ))}
                 
                 <div className="mt-auto p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3">
                    <Navigation size={18} className="text-purple-400" />
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold">当前坐标 (Rel)</div>
                       <div className="text-sm font-mono text-white">X: 1.05 | Y: 0.22 | Z: -8.41</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Main Simulation Workspace --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Stage Information HUD */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-purple-500 p-4 rounded-sm shadow-xl">
                       <div className="text-[10px] text-purple-500 font-bold mb-1 uppercase tracking-widest">Active Simulation Phase</div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{simState}</div>
                   </div>
                   
                   <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-sm flex flex-col gap-2">
                       <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Activity size={10}/> Physics Engine Telemetry
                       </div>
                       <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] font-bold text-white">
                          <span className="text-slate-500">MOMENT:</span> 124.5 kNm
                          <span className="text-slate-500">ACCEL:</span> 0.22 m/s²
                          <span className="text-slate-500">FRICTION:</span> 0.12 μ
                       </div>
                   </div>
               </div>

               {/* Action HUD - Floating Round Controls */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 bg-slate-900/90 p-4 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md">
                   <button 
                     onClick={() => {setSimState('ANALYZING'); addLog('系统重置：开始新的空间审计');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="w-[1px] h-10 bg-slate-700 mx-1"></div>
                   <button 
                     onClick={() => setSimState(simState === 'EXECUTING' ? 'PLANNING' : 'EXECUTING')}
                     className={`px-10 py-3 rounded-full font-black shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95
                        ${simState === 'EXECUTING' ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}
                     `}
                   >
                       {simState === 'EXECUTING' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                       <span className="tracking-widest uppercase">{simState === 'EXECUTING' ? 'Pause Sim' : 'Run Path Simulation'}</span>
                   </button>
                   <div className="w-[1px] h-10 bg-slate-700 mx-1"></div>
                   <button 
                     onClick={toggleInterference}
                     className={`p-3 rounded-full border transition-all
                        ${simState === 'INTERFERENCE' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-red-400'}
                     `}
                   >
                       <ShieldAlert size={22} />
                   </button>
               </div>
           </div>

           {/* Event Log Display */}
           <div className="h-32 bg-[#020205] border border-slate-800/60 rounded-lg p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center tracking-widest">
                   <span>SIM_KERNEL_OUTPUT_LOG_V2.0</span>
                   <span className="animate-pulse text-purple-900">PATH_RECON_ACTIVE</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/5' : 'text-slate-400 hover:text-purple-300'}`}>
                       <span className="text-slate-700">[{logs.length - i}]</span>
                       <span>{log}</span>
                   </div>
               ))}
               <div className="text-purple-500 mt-1 animate-pulse">_</div>
           </div>
        </div>

        {/* RIGHT: Interference Analytics */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="物理冲突评估" subtitle="INTERFERENCE" className="h-[280px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COLLISION_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Strategy" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="最小间隙趋势监测" subtitle="GAP ANALYSIS" className="h-[200px] border-slate-800">
               <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CLEARANCE_TREND}>
                          <defs>
                              <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="dist" hide />
                          <YAxis hide domain={[0, 4]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                          <Area type="monotone" dataKey="gap" stroke="#06b6d4" fill="url(#gapGrad)" strokeWidth={2} />
                          <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" />
                      </AreaChart>
                  </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="方案调优专家 AI" subtitle="INSIGHTS" className="flex-1 border-slate-800 bg-slate-900/20">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded">
                      <div className="flex items-center gap-2 mb-2">
                          <Zap size={16} className="text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-200">路径调优方案推荐</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                         "当前 P02 点间隙仅为 0.15m，受限程度高。建议在 P01-P02 阶段将部件绕 X 轴旋转 15°，可避开 4# 支座干涉。路径稳定性将提升 24%。"
                      </p>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 uppercase font-black tracking-tighter">路径安全得分</span>
                          <span className="text-cyan-400 font-bold">82 / 100</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" style={{width: '82%'}}></div>
                      </div>
                   </div>

                   <button className="w-full py-3 bg-purple-600/80 hover:bg-purple-600 text-white font-black rounded text-xs flex items-center justify-center gap-2 transition-all mt-2">
                       <CheckCircle2 size={16} /> 确认并下发施工轨迹
                   </button>
               </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
