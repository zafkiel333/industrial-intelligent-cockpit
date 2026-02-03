
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-fault-propagation/ThreeScene';
import { SystemNode, SimStatus } from '../../components/predictive/ship-fault-propagation/three-types';
import * as THREE from 'three';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, Cell, Legend
} from 'recharts';
import { 
  Network, Activity, AlertOctagon, GitMerge, ShieldAlert, 
  TrendingUp, Play, Pause, RotateCcw, Zap, Droplet, 
  Anchor, Wind, Cpu, Database, Share2, Workflow,
  ArrowRight, AlertTriangle, ShieldCheck, Siren, Timer, Target
} from 'lucide-react';

// --- MOCK DATA ---

// 1. Initial Topology
const INITIAL_NODES: SystemNode[] = [
    // Power Generation
    { id: 'dg1', label: 'DG-1 (发电机)', type: 'electrical', position: { x: -10, y: 5, z: 0 }, status: 'normal', connections: ['msb'] },
    { id: 'dg2', label: 'DG-2 (发电机)', type: 'electrical', position: { x: -10, y: -5, z: 0 }, status: 'normal', connections: ['msb'] },
    
    // Distribution
    { id: 'msb', label: 'MSB (主配电板)', type: 'electrical', position: { x: -2, y: 0, z: 0 }, status: 'normal', connections: ['prop-ctrl', 'pump-sw', 'automation'] },
    
    // Consumers
    { id: 'prop-ctrl', label: '推进控制', type: 'control', position: { x: 5, y: 5, z: 0 }, status: 'normal', connections: ['propulsion'] },
    { id: 'pump-sw', label: '泵组配电', type: 'electrical', position: { x: 5, y: -5, z: 0 }, status: 'normal', connections: ['cooling-pump', 'fuel-pump'] },
    { id: 'automation', label: 'AMS (监测)', type: 'control', position: { x: 0, y: 8, z: 5 }, status: 'normal', connections: [] },
    
    // Mechanical / Fluid
    { id: 'propulsion', label: '主推进电机', type: 'mechanical', position: { x: 12, y: 5, z: 0 }, status: 'normal', connections: [] },
    { id: 'cooling-pump', label: '海水泵', type: 'fluid', position: { x: 10, y: -8, z: 2 }, status: 'normal', connections: ['heat-exchanger'] },
    { id: 'fuel-pump', label: '燃油泵', type: 'fluid', position: { x: 10, y: -3, z: 2 }, status: 'normal', connections: ['propulsion'] },
    { id: 'heat-exchanger', label: '冷却器', type: 'fluid', position: { x: 15, y: -8, z: 0 }, status: 'normal', connections: ['propulsion'] },
];

// 2. Fault Scenarios
const FAULT_SCENARIOS = [
    { id: 'sc1', name: 'DG-1 突发短路', root: 'dg1', severity: 'Critical' },
    { id: 'sc2', name: '海水泵电机过载', root: 'cooling-pump', severity: 'High' },
    { id: 'sc3', name: 'MSB 母线失压', root: 'msb', severity: 'Catastrophic' },
];

// 3. Propagation Log Template
const PROPAGATION_LOGS: Record<string, any[]> = {
    'dg1': [
        { time: 'T+0s', event: 'DG-1 绕组短路跳闸', target: 'dg1', type: 'Trigger' },
        { time: 'T+0.2s', event: 'MSB 母线电压跌落 15%', target: 'msb', type: 'Propagation' },
        { time: 'T+2s', event: 'PMS 启动备用 DG-2 (失败)', target: 'dg2', type: 'Failure' },
        { time: 'T+5s', event: '非重要负载卸载 (第一级)', target: 'automation', type: 'Action' },
        { time: 'T+12s', event: '推进系统限功率运行', target: 'propulsion', type: 'Impact' },
    ],
    'cooling-pump': [
        { time: 'T+0s', event: '海水泵 #1 轴承抱死', target: 'cooling-pump', type: 'Trigger' },
        { time: 'T+5s', event: '冷却水流量低报警', target: 'heat-exchanger', type: 'Propagation' },
        { time: 'T+45s', event: '主机高温报警', target: 'propulsion', type: 'Impact' },
        { time: 'T+60s', event: '主机自动降速保护 (Slowdown)', target: 'prop-ctrl', type: 'Action' },
    ],
    'msb': [
        { time: 'T+0s', event: 'MSB 绝缘击穿弧光短路', target: 'msb', type: 'Trigger' },
        { time: 'T+0.1s', event: '全船失电 (Blackout)', target: 'ALL', type: 'Catastrophe' },
        { time: 'T+45s', event: '应急发电机启动', target: 'ESB', type: 'Action' },
    ]
};

// 4. Vulnerability Data
const VULNERABILITY_DATA = [
    { name: '推进系统', score: 85, impact: 90 },
    { name: '冷却系统', score: 62, impact: 75 },
    { name: '电力分配', score: 45, impact: 98 },
    { name: '自动化', score: 92, impact: 60 },
];

// 5. Probability Evolution (Added missing data)
const PROB_EVOLUTION = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    prob: i < 5 ? 10 : i < 15 ? 10 + (i-5)*8 : 90 + Math.random()*5,
}));

export const ShipSystemFaultPropagationPmView: React.FC = () => {
    const [nodes, setNodes] = useState<SystemNode[]>(JSON.parse(JSON.stringify(INITIAL_NODES)));
    const [simStatus, setSimStatus] = useState<SimStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [activeScenario, setActiveScenario] = useState(FAULT_SCENARIOS[0]);
    const [logs, setLogs] = useState<any[]>([]);
    
    // Simulation Timer
    useEffect(() => {
        let interval: any;
        if (simStatus === 'propagating') {
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 1;
                    if (next > 100) {
                        setSimStatus('contained');
                        return 100;
                    }
                    
                    // Dynamic Node Updates based on scenario
                    setNodes(currentNodes => {
                        const newNodes = [...currentNodes];
                        const scenarioLogs = PROPAGATION_LOGS[activeScenario.root];
                        
                        // Simple progression logic based on progress %
                        // 0-20%: Root Failure
                        if (next > 5) {
                            const root = newNodes.find(n => n.id === activeScenario.root);
                            if (root) root.status = 'critical';
                        }
                        
                        // 20-50%: First Level Propagation
                        if (next > 30) {
                            const root = newNodes.find(n => n.id === activeScenario.root);
                            if (root) {
                                root.connections.forEach(connId => {
                                    const child = newNodes.find(n => n.id === connId);
                                    if (child) child.status = 'warning';
                                });
                            }
                        }

                        // 50-80%: Secondary Cascading
                        if (next > 60) {
                             const root = newNodes.find(n => n.id === activeScenario.root);
                             if (root) {
                                 root.connections.forEach(connId => {
                                     const child = newNodes.find(n => n.id === connId);
                                     if (child) {
                                         child.connections.forEach(grandChildId => {
                                             const gc = newNodes.find(n => n.id === grandChildId);
                                             if (gc) gc.status = 'warning';
                                         });
                                         child.status = 'critical'; // Intermediate node fails
                                     }
                                 });
                             }
                        }

                        return newNodes;
                    });
                    
                    return next;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [simStatus, activeScenario]);

    const handleStartSim = () => {
        setNodes(JSON.parse(JSON.stringify(INITIAL_NODES))); // Reset
        setProgress(0);
        setSimStatus('propagating');
        setLogs(PROPAGATION_LOGS[activeScenario.root] || []);
    };

    const handleReset = () => {
        setNodes(JSON.parse(JSON.stringify(INITIAL_NODES)));
        setProgress(0);
        setSimStatus('idle');
        setLogs([]);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部指挥看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-red-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.2)_50%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[pulse_4s_linear_infinite]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-red-900/20 rounded-full border border-red-500/50 shadow-[0_0_25px_rgba(220,38,38,0.4)]">
                        <Network className="text-red-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            船舶系统故障传播预测中心
                            <span className="text-xs not-italic font-bold bg-red-950/50 text-red-300 px-2 py-0.5 rounded border border-red-800 uppercase">CASCADING SIMULATOR</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>拓扑节点: {nodes.length} Active</span>
                            <span>耦合强度: High Coupling</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全局级联风险指数 (CRI)</div>
                        <div className={`text-4xl font-mono font-bold ${progress > 50 ? 'text-red-500 animate-pulse' : 'text-emerald-400'} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                            {(15 + (progress / 100) * 80).toFixed(1)}
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">至系统崩溃倒计时 (TTC)</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                            {simStatus === 'propagating' ? Math.max(0, 320 - (progress / 100) * 320).toFixed(0) : '---'} <span className="text-sm text-slate-500">SEC</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* LEFT: Root Cause & Timeline */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Root Cause Card */}
                    <SciFiCard title="失效根因识别" subtitle="ROOT CAUSE" highlight className="bg-[#0c1221]">
                        <div className="p-3 bg-red-950/20 border-l-4 border-red-500 rounded mb-3">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-red-200 uppercase">Primary Trigger</span>
                                <AlertOctagon size={16} className="text-red-500" />
                            </div>
                            <div className="text-lg font-bold text-white mt-1">海水泵流量异常</div>
                            <div className="text-[10px] text-red-400 mt-1">检测到出口压力跌落 45%</div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">潜在诱因</div>
                            {[
                                { name: '海底阀箱堵塞', prob: '85%' },
                                { name: '叶轮气蚀损坏', prob: '12%' },
                                { name: '电机联轴器断裂', prob: '3%' }
                            ].map((cause, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                                    <span className="text-xs text-slate-300">{cause.name}</span>
                                    <span className="text-xs font-mono text-orange-400">{cause.prob}</span>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* Timeline */}
                    <SciFiCard title="故障传播时序预测" subtitle="TIMELINE" className="flex-1">
                        <div className="relative space-y-0 pl-4 py-2 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                            {logs.map((log, i) => {
                                // Simple logic: show log if progress enough
                                const isPast = true; 
                                return (
                                    <div key={i} className={`relative pl-6 pb-6 last:pb-0 transition-all duration-500 ${isPast ? 'opacity-100' : 'opacity-30 blur-[1px]'}`}>
                                        <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 ${log.type === 'Trigger' ? 'bg-red-500 border-red-300 shadow-[0_0_10px_red]' : 'bg-slate-900 border-slate-600'} z-10`}></div>
                                        
                                        <div className={`text-[10px] font-mono mb-0.5 ${isPast ? 'text-cyan-400' : 'text-slate-500'}`}>{log.time}</div>
                                        <div className="text-xs font-bold text-white mb-1">{log.event}</div>
                                        <div className="text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded inline-block border border-slate-700">
                                            类型: {log.type}
                                        </div>
                                    </div>
                                );
                            })}
                            {logs.length === 0 && <div className="text-xs text-slate-500 italic p-4 text-center">等待故障触发...</div>}
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER: 3D Topology Twin */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(220,38,38,0.1)] group">
                        
                        {/* HUD */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-red-500/30">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_red]"></div>
                                <span className="text-[12px] text-red-400 font-black tracking-widest uppercase">全系统依赖拓扑动态仿真</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 bg-black/60 p-3 rounded border border-slate-800">
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                                <div className="w-3 h-3 border border-cyan-500 bg-cyan-900/30"></div> 正常运行
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                                <div className="w-3 h-3 border border-orange-500 bg-orange-900/30"></div> 风险波及
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                                <div className="w-3 h-3 border border-red-500 bg-red-900/30"></div> 故障失效
                            </div>
                        </div>

                        <ThreeScene 
                            nodes={nodes} 
                            activeFaultNode={activeScenario.root} 
                            propagationTime={progress / 100} 
                            simStatus={simStatus}
                        />

                        {/* Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/70 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl items-center">
                             <div className="flex-1">
                                 <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                     <span>故障扩散模拟 (Propagation)</span>
                                     <span className="text-red-400">{progress.toFixed(0)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-600 transition-all duration-300" style={{width: `${progress}%`}}></div>
                                 </div>
                             </div>
                             
                             <div className="h-8 w-[1px] bg-slate-600 mx-2"></div>

                             <div className="flex gap-2">
                                {simStatus === 'idle' ? (
                                    <button 
                                        onClick={handleStartSim}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    >
                                        <Play size={14} /> 注入故障
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleReset}
                                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded flex items-center gap-2 transition-all"
                                    >
                                        <RotateCcw size={14} /> 重置
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>

                    {/* Chart: Probability Evolution */}
                    <SciFiCard title="级联失效概率动态演化" subtitle="PROBABILITY CURVE" className="h-[200px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PROB_EVOLUTION}>
                                    <defs>
                                        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #ef4444'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#ef4444" fill="url(#riskFill)" strokeWidth={2} name="Risk Index" />
                                    <ReferenceLine x={progress * 24 / 100} stroke="#fff" strokeDasharray="3 3" label={{value: 'NOW', fill: '#fff', fontSize: 10}} />
                                    <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT: Resilience & Mitigation */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Resilience Chart */}
                    <SciFiCard title="系统韧性与影响评估" subtitle="IMPACT MATRIX">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={VULNERABILITY_DATA} layout="vertical" margin={{left: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" tick={{fill: '#94a3b8', fontSize: 11}} width={60} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Bar dataKey="impact" name="潜在损失" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} background={{ fill: '#1e293b' }}>
                                        {/* Dynamic fill based on progress */}
                                        {VULNERABILITY_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fillOpacity={0.2 + (progress/100) * 0.8} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="score" name="剩余韧性" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* Mitigation Strategies */}
                    <SciFiCard title="级联阻断策略建议" subtitle="MITIGATION" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-950/20 border-l-4 border-emerald-500 rounded">
                                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2 mb-1">
                                    <ShieldCheck size={14} /> 推荐阻断点: T+60s
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    在 <span className="text-white font-bold">中央冷却器</span> 性能下降前，立即启动 <span className="text-emerald-400 font-bold">#2 备用海水泵</span> 并切换至高位海底门。
                                    预计成功率: <span className="text-emerald-400">94%</span>
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-emerald-600/40 border border-slate-700 hover:border-emerald-500 text-white text-[11px] rounded transition-all flex items-center justify-center gap-2 group">
                                    <Workflow size={14} className="text-emerald-500 group-hover:text-white" /> 模拟：备用泵投入效果
                                </button>
                                <button className="w-full py-2 bg-slate-800 hover:bg-orange-600/40 border border-slate-700 hover:border-orange-500 text-white text-[11px] rounded transition-all flex items-center justify-center gap-2 group">
                                    <Activity size={14} className="text-orange-500 group-hover:text-white" /> 模拟：主机降速保护
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>
            </div>

            {/* --- BOTTOM STATUS --- */}
            <div className="h-10 bg-red-950/10 border-t border-red-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">故障传播模型: 实时在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">系统脆弱性监测: 高</span>
                    </div>
                </div>
                <div className="text-[10px] text-red-800 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Zap size={12} /> Critical-Chain-Analyzer v2.0 - System Guard Active
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 2px;
                }
                @keyframes scan {
                    from { background-position: 0 0; }
                    to { background-position: 0 100%; }
                }
            `}</style>
        </div>
    );
};
