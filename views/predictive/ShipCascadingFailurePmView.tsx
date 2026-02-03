
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-cascading-failure/ThreeScene';
import { SystemNode, FailureMode } from '../../components/predictive/ship-cascading-failure/three-types';
import * as THREE from 'three';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import { 
  GitBranch, AlertOctagon, Activity, Zap, Server, 
  Database, Network, ShieldAlert, RefreshCw, Play, 
  Pause, RotateCcw, TrendingUp, AlertTriangle, Workflow,
  Thermometer, Droplet
} from 'lucide-react';

// --- MOCK DATA ---

// 1. Initial Nodes for Cascading Failure
const INITIAL_NODES: SystemNode[] = [
  { id: 'sw-pump-1', name: '海水泵 #1', type: 'source', position: new THREE.Vector3(-10, -5, 5), status: 'normal', connections: ['heat-exchanger'] },
  { id: 'sw-pump-2', name: '海水泵 #2', type: 'source', position: new THREE.Vector3(-10, -5, -5), status: 'normal', connections: ['heat-exchanger'] },
  { id: 'heat-exchanger', name: '中央冷却器', type: 'processor', position: new THREE.Vector3(-5, 0, 0), status: 'normal', connections: ['lt-cooling', 'ht-cooling'] },
  { id: 'lt-cooling', name: '低温淡水回路', type: 'processor', position: new THREE.Vector3(0, -2, 4), status: 'normal', connections: ['gen-1', 'gen-2', 'automation'] },
  { id: 'ht-cooling', name: '高温淡水回路', type: 'processor', position: new THREE.Vector3(0, 2, -4), status: 'normal', connections: ['main-engine'] },
  { id: 'gen-1', name: '发电机 #1', type: 'consumer', position: new THREE.Vector3(8, -5, 5), status: 'normal', connections: ['msb'] },
  { id: 'gen-2', name: '发电机 #2', type: 'consumer', position: new THREE.Vector3(8, -5, -5), status: 'normal', connections: ['msb'] },
  { id: 'main-engine', name: '主机 (ME)', type: 'consumer', position: new THREE.Vector3(5, 5, 0), status: 'normal', connections: [] },
  { id: 'msb', name: '主配电板', type: 'processor', position: new THREE.Vector3(12, 0, 0), status: 'normal', connections: ['sw-pump-1', 'sw-pump-2'] }, // Feedback loop power
  { id: 'automation', name: '自动化系统', type: 'consumer', position: new THREE.Vector3(0, 8, 0), status: 'normal', connections: [] },
];

// 2. Cascade Scenarios
const SCENARIOS = [
  { id: 'cooling_loss', name: '冷却水丧失', root: 'sw-pump-1', description: '海水泵故障导致全船冷却失效' },
  { id: 'power_blackout', name: '电站失电', root: 'msb', description: '配电板故障导致泵组停机，进而影响主机' },
  { id: 'fuel_cut', name: '燃油中断', root: 'gen-1', description: '发电机燃油中断导致单机跳闸' },
];

// 3. Impact Severity Trend
const IMPACT_TREND = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    severity: 0
}));

// 4. Node Criticality Ranking
const CRITICALITY_DATA = [
  { name: '主机 (ME)', score: 95 },
  { name: '主配电板', score: 92 },
  { name: '中央冷却器', score: 88 },
  { name: '海水泵组', score: 75 },
  { name: '自动化系统', score: 60 },
];

export const ShipCascadingFailurePmView: React.FC = () => {
    const [nodes, setNodes] = useState<SystemNode[]>(INITIAL_NODES);
    const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [propagationLevel, setPropagationLevel] = useState(0); // 0-1
    const [logs, setLogs] = useState<string[]>([]);
    const [chartData, setChartData] = useState(IMPACT_TREND);

    // Simulation Loop
    useEffect(() => {
        let interval: any;
        if (isSimulating) {
            // Resume from current progress or start fresh
            let step = Math.floor(propagationLevel * 100);
            if (step === 0) setLogs([`[00:00] 模拟开始: ${activeScenario.name}`]);
            
            interval = setInterval(() => {
                step++;
                const progress = step / 100;
                setPropagationLevel(progress);

                // Update Chart
                setChartData(prev => {
                    const newData = [...prev];
                    const idx = Math.floor(step / 3.3); // Map 100 steps to 30 data points
                    if (idx < 30) {
                        newData[idx] = { ...newData[idx], severity: progress * 100 };
                    }
                    return newData;
                });

                // Logic for "Cooling Loss" Scenario
                if (activeScenario.id === 'cooling_loss') {
                    setNodes(prev => prev.map(n => {
                        const newNode = { ...n };
                        if (step > 5 && n.id === 'sw-pump-1') newNode.status = 'failed';
                        if (step > 20 && n.id === 'heat-exchanger') newNode.status = 'warning';
                        if (step > 40 && (n.id === 'lt-cooling' || n.id === 'ht-cooling')) newNode.status = 'warning';
                        if (step > 60 && n.id === 'main-engine') newNode.status = 'warning';
                        if (step > 80 && n.id === 'main-engine') newNode.status = 'critical'; // Overheat
                        if (step > 90 && n.id === 'automation') newNode.status = 'warning'; // Electronics overheat
                        return newNode;
                    }));

                    if (step === 5) setLogs(l => [...l, `[00:05] 故障触发: 海水泵 #1 轴承抱死`]);
                    if (step === 20) setLogs(l => [...l, `[00:20] 影响传播: 中央冷却器换热效率下降`]);
                    if (step === 40) setLogs(l => [...l, `[00:40] 级联效应: 淡水回路温度升高`]);
                    if (step === 60) setLogs(l => [...l, `[01:00] 系统告警: 主机排温高预警`]);
                    if (step === 80) setLogs(l => [...l, `[01:20] 临界状态: 主机自动降速 (Slowdown)`]);
                }

                if (step >= 100) {
                    clearInterval(interval);
                    setIsSimulating(false);
                    setLogs(l => [...l, `[01:40] 模拟结束: 系统进入保护模式`]);
                }
            }, 100);
        } else if (propagationLevel === 0) {
             // Reset state when level is 0
             setNodes(INITIAL_NODES);
             setChartData(IMPACT_TREND);
             setLogs([]);
        }

        return () => clearInterval(interval);
    }, [isSimulating, activeScenario]);

    const handleStartSim = () => {
        // If simulation finished, reset first
        if (propagationLevel >= 1) {
            setPropagationLevel(0);
            setNodes(INITIAL_NODES);
            setChartData(IMPACT_TREND);
            setLogs([]);
        }
        setIsSimulating(true);
    };

    const resetSimulation = () => {
        setIsSimulating(false);
        setPropagationLevel(0);
        setNodes(INITIAL_NODES);
        setChartData(IMPACT_TREND);
        setLogs([]);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-red-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.2)_50%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_4s_linear_infinite]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-red-600/20 rounded border border-red-500/50 shadow-[0_0_25px_rgba(220,38,38,0.3)]">
                        <AlertTriangle className="text-red-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            关键航运设备级联失效预测
                            <span className="text-xs not-italic font-bold bg-red-950/50 text-red-300 px-2 py-0.5 rounded border border-red-800 uppercase">Cascade-Sim</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>拓扑节点: {nodes.length} Active</span>
                            <span>耦合模型: Directed Graph Dependency</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前影响范围</div>
                        <div className={`text-4xl font-mono font-bold ${propagationLevel > 0.5 ? 'text-rose-500' : 'text-emerald-400'} drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]`}>
                            {(propagationLevel * 100).toFixed(0)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计恢复时间</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                            {isSimulating ? 'calculating...' : '4.5 HRS'}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：场景控制与日志 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 场景选择器 */}
                    <SciFiCard title="失效情景设定 (Scenario)" subtitle="INPUT" highlight className="bg-[#0c1221]">
                        <div className="space-y-2 py-2">
                            {SCENARIOS.map(scenario => (
                                <div 
                                    key={scenario.id} 
                                    onClick={() => { if(!isSimulating) setActiveScenario(scenario); }}
                                    className={`p-3 rounded border cursor-pointer transition-all ${activeScenario.id === scenario.id ? 'bg-red-900/30 border-red-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'} ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white">{scenario.name}</span>
                                        <GitBranch size={14} className={activeScenario.id === scenario.id ? 'text-red-400' : 'text-slate-500'} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight">{scenario.description}</p>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 演化日志 */}
                    <SciFiCard title="事件传播日志" subtitle="EVENT LOG" className="flex-1">
                        <div className="h-full overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 p-2 bg-black/40 rounded border border-slate-800/50">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-slate-500">{log.split(' ')[0]}</span>
                                    <span className={log.includes('故障') ? 'text-red-400' : log.includes('告警') ? 'text-orange-400' : 'text-slate-300'}>
                                        {log.substring(log.indexOf(' ')+1)}
                                    </span>
                                </div>
                            ))}
                            {logs.length === 0 && <span className="text-slate-600 italic">等待仿真启动...</span>}
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D 拓扑数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-red-500/30">
                                <Activity className="text-red-500 animate-pulse" size={16} />
                                <span className="text-[12px] text-red-400 font-black tracking-widest uppercase">系统依赖关系拓扑仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前触发源</span>
                                    <span className="text-rose-500 font-mono font-bold uppercase">{activeScenario.root}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">受影响节点</span>
                                    <span className="text-white font-mono font-bold">
                                        {nodes.filter(n => n.status !== 'normal').length} / {nodes.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 状态图例 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                             <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-800 text-[10px]">
                                 <div className="w-2 h-2 rounded-full bg-cyan-500"></div> 正常
                             </div>
                             <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-800 text-[10px]">
                                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> 风险波及
                             </div>
                             <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-800 text-[10px]">
                                 <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div> 失效
                             </div>
                        </div>

                        <ThreeScene 
                            nodes={nodes} 
                            activeFaultNode={isSimulating || propagationLevel > 0 ? activeScenario.root : null} 
                            propagationLevel={propagationLevel}
                        />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl items-center">
                             <div className="flex-1 px-4">
                                 <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                     <span>故障扩散进度 (Propagation)</span>
                                     <span className="text-red-400">{Math.floor(propagationLevel * 100)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-emerald-500 via-orange-500 to-red-600 transition-all duration-300" style={{width: `${propagationLevel * 100}%`}}></div>
                                 </div>
                             </div>
                             <div className="h-8 w-[1px] bg-slate-600 mx-2"></div>
                             <div className="flex gap-2">
                                 <button 
                                     onClick={isSimulating ? () => setIsSimulating(false) : handleStartSim}
                                     className={`px-6 py-2 text-white text-xs font-black rounded flex items-center gap-2 transition-all ${isSimulating ? 'bg-orange-600 hover:bg-orange-500' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'}`}
                                 >
                                     {isSimulating ? <Pause size={14} /> : <Play size={14} />} {isSimulating ? '暂停' : '开始推演'}
                                 </button>
                                 <button 
                                     onClick={resetSimulation}
                                     className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 transition-all"
                                 >
                                     <RotateCcw size={14} />
                                 </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(220,38,38,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 影响严重度曲线 */}
                    <SciFiCard title="级联失效影响严重度趋势 (Severity Impact)" subtitle="IMPACT CURVE" className="h-[200px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #ef4444'}} />
                                    <Area type="monotone" dataKey="severity" stroke="#f43f5e" fill="url(#sevGrad)" strokeWidth={2} name="严重度指数" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：节点脆弱性与应对 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 节点脆弱性排名 */}
                    <SciFiCard title="节点脆弱性评估" subtitle="VULNERABILITY">
                        <div className="space-y-3 py-2">
                             {CRITICALITY_DATA.map((item, i) => (
                                 <div key={i} className="flex flex-col gap-1">
                                     <div className="flex justify-between items-center text-[10px] font-bold">
                                         <span className="text-slate-400">{item.name}</span>
                                         <span className={item.score > 90 ? 'text-rose-500' : item.score > 70 ? 'text-orange-400' : 'text-slate-200'}>
                                             Crit: {item.score}
                                         </span>
                                     </div>
                                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                         <div 
                                             className={`h-full ${item.score > 90 ? 'bg-rose-600' : item.score > 70 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                             style={{width: `${item.score}%`}}
                                         ></div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* 阻断策略 */}
                    <SciFiCard title="级联阻断策略" subtitle="MITIGATION" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldAlert size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">自动切断非重要负载</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">预计降低电网压力 35%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-80">
                                <RefreshCw size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200 font-bold">备用泵组自动投切</div>
                                    <div className="text-[9px] text-slate-600">需确认备泵预热状态</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-800">
                             <div className="text-[10px] text-slate-500 text-center mb-2">人工干预建议</div>
                             <div className="grid grid-cols-2 gap-2">
                                 <button className="py-2 bg-slate-800 border border-slate-700 hover:border-red-500/50 text-[10px] rounded text-slate-300 hover:text-white transition-all">
                                     隔离故障区
                                 </button>
                                 <button className="py-2 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-[10px] rounded text-slate-300 hover:text-white transition-all">
                                     启动应急电源
                                 </button>
                             </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-red-950/10 border-t border-red-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">拓扑引擎: 就绪</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">风险传播计算: 50ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-red-800 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <AlertTriangle size={12} /> Cascade-Failure-Simulator v2.4 - Analysis Mode
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
