
import React, { useState, useEffect } from 'react';
import { HoistRopeThreeScene } from '../../../components/predictive/mining-hoist-rope/ThreeScene';
import { RopeDefect } from '../../../components/predictive/mining-hoist-rope/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, Bar, BarChart, Cell, Legend, ScatterChart, Scatter
} from 'recharts';
import { 
  Scan, Activity, ShieldAlert, Zap, 
  Settings, Binary, TrendingUp, History,
  Info, AlertOctagon, CheckCircle2, ChevronRight,
  Database, Microscope, Scissors, Droplets,
  AlertTriangle, FileText, Layout, Maximize2,
  Disc, Eye, Compass
} from 'lucide-react';

// --- 模拟数据 ---

const MFL_DATA = Array.from({length: 120}, (_, i) => {
    const dist = i * 0.5;
    let signal = 0.5 + Math.random() * 0.2;
    // 模拟断丝处的波峰
    if (Math.abs(dist - 15.2) < 0.3) signal = 4.5 + Math.random();
    if (Math.abs(dist - 42.5) < 0.4) signal = 6.2 + Math.random();
    return { dist, signal, limit: 5.0 };
});

const FATIGUE_CYCLES = Array.from({length: 30}, (_, i) => ({
    time: `T-${30-i}d`,
    stress: 400 + Math.sin(i * 0.5) * 50,
    wear: i * 0.05 + Math.random() * 0.1
}));

const DEFECTS_REGISTRY: RopeDefect[] = [
    { id: 'DP-01', position: 15.2, count: 2, severity: 'low' },
    { id: 'DP-02', position: 42.5, count: 6, severity: 'high' },
    { id: 'DP-03', position: 68.1, count: 3, severity: 'medium' },
];

export const HoistRopeHealthView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'thermal'>('standard');
  const [isScanning, setIsScanning] = useState(true);
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setScanPos(prev => (prev + 1) % 150);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 头部：全通磁探伤 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-4 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_30px_rgba(56,189,248,0.4)] animate-pulse">
                <Scan size={32} className="text-cyan-400" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldAlert size={14} /> MFL Magnetic Flux Leakage Audit
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    提升钢丝绳 <span className="text-cyan-400 font-extrabold text-shadow-glow">疲劳与断丝预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合安全系数 (SF)</div>
                <div className="text-4xl font-mono font-bold text-green-400">6.42</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">当前有效绳径</div>
                <div className="text-3xl font-mono font-bold text-white">42.8 <span className="text-sm text-slate-500">mm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">实时探测状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    <Activity size={20} className="text-green-500 animate-pulse" /> SCANNING_ON
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左侧：损伤列表与疲劳演化 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="断丝缺陷位置清单" subtitle="DEFECT REGISTRY" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {DEFECTS_REGISTRY.map(d => (
                       <div key={d.id} className={`p-4 rounded border bg-slate-900/60 border-slate-800 hover:border-red-500 transition-all cursor-pointer group`}>
                           <div className="flex justify-between items-center mb-3">
                               <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${d.severity === 'high' ? 'bg-red-500 animate-ping' : 'bg-yellow-500'}`}></div>
                                   <span className="text-sm font-bold text-white font-mono">{d.id}</span>
                               </div>
                               <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${d.severity === 'high' ? 'bg-red-900 text-red-100' : 'bg-yellow-900/40 text-yellow-200'}`}>
                                   {d.severity} Risk
                               </span>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-xs">
                               <div>
                                   <div className="text-slate-500 mb-1">绳长坐标</div>
                                   <div className="font-mono text-white">{d.position} m</div>
                               </div>
                               <div>
                                   <div className="text-slate-500 mb-1">断丝数量</div>
                                   <div className="font-mono text-red-400">{d.count} Wires</div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="弯曲疲劳应力累积" subtitle="BENDING STRESS" className="h-[250px] border-cyan-900/50">
               <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={FATIGUE_CYCLES}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       <Area yAxisId="left" type="monotone" dataKey="stress" fill="#0ea5e922" stroke="#0ea5e9" name="等效应力" />
                       <Line yAxisId="right" type="monotone" dataKey="wear" stroke="#ef4444" dot={false} name="磨损深度" />
                   </ComposedChart>
               </ResponsiveContainer>
           </SciFiCard>

        </div>

        {/* 中间：超大3D视口与全息扫描 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative pointer-events-auto">
           
           <div className="flex-1 min-h-[450px] bg-[#020205] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_150px_rgba(56,189,248,0.2)] group">
               
               {/* 视口浮层 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-6 py-4 rounded-lg flex flex-col gap-3 shadow-2xl">
                       <div className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Microscope size={16} /> 3D Rope Vision Analysis
                       </div>
                       <div className="flex items-center gap-12">
                           <div>
                               <div className="text-[10px] text-slate-500 uppercase">最大单捻距断丝</div>
                               <div className="text-3xl font-mono font-bold text-red-500">6 <span className="text-xs">Crit</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[10px] text-slate-500 uppercase">预计剩余循环</div>
                               <div className="text-3xl font-mono font-bold text-cyan-400">12,500+</div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧控制栏 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
                   <div className="bg-slate-900/80 p-2 rounded border border-slate-700 flex flex-col gap-2">
                       <button 
                         onClick={() => setViewMode('standard')}
                         className={`p-2 rounded transition-all ${viewMode === 'standard' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layout size={20} />
                       </button>
                       <button 
                         onClick={() => setViewMode('xray')}
                         className={`p-2 rounded transition-all ${viewMode === 'xray' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Maximize2 size={20} />
                       </button>
                   </div>
                   <button className="bg-slate-900 p-3 rounded-full border border-slate-700 text-cyan-400 hover:bg-cyan-600 hover:text-white shadow-xl">
                       <Settings size={20} />
                   </button>
               </div>

               {/* 底部实时位置扫描条 */}
               <div className="absolute bottom-6 left-6 right-6 z-10">
                   <div className="bg-black/60 backdrop-blur border border-slate-700 p-4 rounded-lg flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Compass className="text-cyan-400 animate-spin-slow" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Scanning Pos</span>
                        </div>
                        <div className="flex-1 h-2 bg-slate-900 rounded-full relative overflow-hidden">
                             <div 
                                className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]" 
                                style={{width: `${(scanPos/150)*100}%`}}
                             ></div>
                        </div>
                        <div className="font-mono text-xl text-cyan-400">{scanPos.toFixed(1)}m</div>
                   </div>
               </div>

               <HoistRopeThreeScene 
                   ropeExtension={0.45}
                   loadKn={1420}
                   defects={DEFECTS_REGISTRY}
                   scanPos={scanPos}
                   isScanning={isScanning}
                   viewMode={viewMode}
               />
           </div>

           {/* 漏磁扫描图谱 */}
           <SciFiCard title="MFL 漏磁在线扫描图谱" subtitle="REAL-TIME SPECTROGRAM" className="h-[200px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={MFL_DATA}>
                           <defs>
                               <linearGradient id="mflGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="5 5" label={{value: '报废阈值', fill: '#ef4444', fontSize: 10}} />
                           <Area type="monotone" dataKey="signal" stroke="#0ea5e9" fill="url(#mflGrad)" strokeWidth={1} isAnimationActive={false} />
                           <ReferenceLine x={scanPos} stroke="#fff" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：决策建议与报废基准 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="报废基准比对 (ISO 4309)" subtitle="DISCARD AUDIT" className="border-cyan-900/50 bg-[#0a1a1f]/30">
               <div className="space-y-5 py-2">
                   <div>
                       <div className="flex justify-between text-xs mb-2">
                           <span className="text-slate-400">单捻距断丝率 (Max)</span>
                           <span className="text-red-500 font-bold">85%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500 animate-pulse" style={{width: '85%'}}></div>
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between text-xs mb-2">
                           <span className="text-slate-400">绳径缩减量 (ΔD)</span>
                           <span className="text-yellow-400 font-bold">42%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-yellow-500" style={{width: '42%'}}></div>
                       </div>
                   </div>

                   <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Droplets size={16} className="text-blue-400" />
                           <span className="text-xs text-slate-300">润滑油脂残余度</span>
                       </div>
                       <span className="font-bold text-white">65%</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="智能辅助决策" className="flex-1 border-cyan-900/50 bg-[#1a0f05]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-950/30 border border-red-500/40 rounded flex items-start gap-3 shadow-inner">
                       <AlertOctagon className="text-red-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">高风险预警：42.5m 处</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                               检测到该段钢丝绳内部断丝呈“集聚性”增长，推断内部股线已发生疲劳断裂。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">下一步行动清单 (Priority)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <Scissors size={14} className="text-orange-500" /> T+12h: 截掉滚筒端 2m 绳段
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <TrendingUp size={14} className="text-blue-400" /> T+24h: 重新校准探测头灵敏度
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1">
                           <AlertTriangle size={14} className="animate-pulse" /> 预计15日内全绳强制报废
                       </div>
                   </div>

                   <button className="mt-auto w-full py-4 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded-lg text-xs text-cyan-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <FileText size={18} /> 导出钢丝绳NDT检测报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_MFL: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SAMPLE_RATE: 2.5kHz</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> ISO_4309_COMPLIANCE: PASS</div>
          <div className="flex-1 text-right font-bold text-cyan-900">SYSTEM_MODEL_VER: WIREROPE_PRO_2024</div>
      </div>
    </div>
  );
};
