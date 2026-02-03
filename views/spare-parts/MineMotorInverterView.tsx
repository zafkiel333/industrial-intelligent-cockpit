
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MotorInverterScene } from '../../components/mine_motor/MotorInverterScene';
import { PowerComponentNode } from '../../components/mine_motor/three-types';
import { 
  Activity, 
  Zap, 
  Cpu, 
  Database, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Globe, 
  Box, 
  ChevronRight, 
  Search,
  Settings,
  Flame,
  FileText,
  RotateCw,
  Gauge,
  Maximize2,
  RefreshCw,
  Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  // Fix: Added missing imports for RadarChart components to resolve errors at lines 167-177
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine
} from 'recharts';

// --- 模拟工程数据 ---
const POWER_ASSETS: PowerComponentNode[] = [
  { id: 'MOTOR-01', name: '主提升机同步电机 (6MW)', type: 'motor', health: 88, load: 0.85, temp: 85, position: [-6, 0, 0] },
  { id: 'INV-RACK-01', name: '高压多电平变频器', type: 'inverter_rack', health: 94, load: 0.82, temp: 42, position: [6, 0, 0] },
  { id: 'MOD-A1', name: 'IGBT 功率模块-A1', type: 'power_module', health: 42, load: 0.9, temp: 105, position: [6, 2, 0] },
];

const HARMONIC_DATA = Array.from({length: 15}, (_, i) => ({
  order: i + 1,
  val: i === 0 ? 100 : Math.random() * (15 / (i + 1)) + (i === 4 ? 8 : 0), // 5次谐波偏高
}));

const INSULATION_AGEING = [
  { year: '2020', loss: 0.02 },
  { year: '2021', loss: 0.025 },
  { year: '2022', loss: 0.04 },
  { year: '2023', loss: 0.08 },
  { year: '2024', loss: 0.15 }, // 加速老化
];

export const MineMotorInverterView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>('MOTOR-01');
  const [frequency, setFrequency] = useState(50.0);
  const [viewMode, setViewMode] = useState<'standard' | 'magnetic' | 'thermal'>('standard');

  const activeComp = useMemo(() => 
    POWER_ASSETS.find(p => p.id === activeId) || POWER_ASSETS[0], 
  [activeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：战略能源指控台 (Power Command) */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-slate-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border-2 border-purple-400/50 relative group">
              <Zap size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-purple-500/20 rounded-sm animate-[spin_12s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Mining Electrification & Control Systems
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿山电机与变频器 <span className="text-purple-500 italic">智慧备件中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统功率因数</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">0.98 <span className="text-sm font-normal">Cosφ</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">运行频率</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{frequency.toFixed(2)} <span className="text-sm font-normal text-slate-600 uppercase">Hz</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">总谐波畸变 (THD)</div>
              <div className="text-2xl font-mono font-bold text-amber-500">3.4%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：组件脉冲 (Asset Pulse) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-purple-500" /> 核心服役组件</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {POWER_ASSETS.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setActiveId(asset.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeId === asset.id 
                      ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-purple-500 mb-1 uppercase">{asset.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{asset.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${asset.health > 70 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        {asset.health > 70 ? <ShieldCheck size={16} className="text-emerald-400"/> : <AlertTriangle size={16} className="text-red-400 animate-pulse"/>}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">负载率</div>
                        <div className="text-lg font-mono font-bold text-white">{(asset.load * 100).toFixed(1)}%</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">核心温度</div>
                        <div className={`text-lg font-mono font-bold ${asset.temp > 80 ? 'text-orange-400' : 'text-slate-300'}`}>{asset.temp}°C</div>
                     </div>
                  </div>
                  
                  {activeId === asset.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 shadow-[0_0_10px_#8b5cf6]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="绝缘损耗角正切趋势" subtitle="TAN_DELTA" className="h-48 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={INSULATION_AGEING}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 0.2]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Line type="monotone" dataKey="loss" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} name="损耗因子" />
                       <ReferenceLine y={0.1} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '老化预警', fill: 'red', fontSize: 10, position: 'right' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中轴：全息数字化电力舱 (The Matrix Chamber) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050810] border border-purple-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Electromagnetic Pulse Sync: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          动力系统 <span className="text-purple-500 italic">全息重组室</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-purple-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">仿真频率调节</div>
                          <input 
                            type="range" min="0" max="60" step="0.1" 
                            value={frequency}
                            onChange={(e) => setFrequency(parseFloat(e.target.value))}
                            className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
                          />
                          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">{frequency.toFixed(1)} Hz</div>
                       </div>
                       <div className="flex gap-2">
                          {['standard', 'magnetic', 'thermal'].map(mode => (
                             <button 
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-4 py-1 text-[8px] font-bold uppercase rounded border transition-all 
                                  ${viewMode === mode ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}
                                `}
                             >
                                {mode}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Gauge size={20} className="text-purple-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">气隙磁密 (Flux Density)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">1.24 <span className="text-[10px] text-slate-600">Tesla</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3 group cursor-pointer hover:border-purple-500/30 transition-all">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Digital Twin Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.8%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                          <Maximize2 size={18} className="text-purple-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <MotorInverterScene 
                    components={POWER_ASSETS} 
                    activeId={activeId}
                    onSelect={setActiveId}
                    frequency={frequency}
                    viewMode={viewMode}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b5cf6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：谐波频谱分析 (Harmonic Spectrum) */}
           <SciFiCard title="变频器输出谐波能量分布" subtitle="HARMONIC_SPECTRUM" className="h-60 border-purple-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HARMONIC_DATA}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="order" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: '谐波阶次', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={15}>
                          {HARMONIC_DATA.map((entry, index) => (
                             <Cell key={index} fill={entry.val > 5 && index > 0 ? '#ef4444' : '#8b5cf6'} fillOpacity={0.8} />
                          ))}
                       </Bar>
                       <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'IEEE 519 限制', fill: 'red', fontSize: 10, position: 'right' }} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：智能决策与全球物流 (Global Strategy) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="电机振动频率轨迹" subtitle="ORBIT_ANALYSIS">
              <div className="h-44 w-full flex items-center justify-center relative">
                 {/* 模拟轴心轨迹图 */}
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:10px_10px]"></div>
                 <div className="w-32 h-32 rounded-full border border-slate-700 relative">
                    <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-ping"></div>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                       <path 
                        d="M 50 50 Q 60 40 70 50 T 50 70 T 30 50 T 50 30" 
                        fill="none" 
                        stroke="#8b5cf6" 
                        strokeWidth="1.5" 
                        strokeDasharray="2 1"
                        className="animate-[spin_4s_linear_infinite]"
                       />
                       <circle cx="50" cy="50" r="2" fill="#ef4444" />
                    </svg>
                 </div>
                 <div className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500 uppercase">Orbit Trace: 1X/2X Sync</div>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2">
                 "转子轴心轨迹稳定，未见不平衡或不对中特征。"
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="LOGISTICS_HUB" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { node: '德国西门子中央库', stock: 'IGBT 模块 x12', eta: '4d', status: 'Transit' },
                      { node: '上海临港保税仓', stock: '定子线棒组', eta: '24h', status: 'Ready' },
                      { node: '西安制造基地', stock: '轴承绝缘套', eta: '12h', status: 'Process' },
                    ].map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-purple-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2">
                                <Globe size={14} className="text-purple-500" />
                                <span className="text-xs font-bold text-slate-200">{item.node}</span>
                             </div>
                             <span className="text-[10px] font-mono text-cyan-400">ETA: {item.eta}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mb-2">{item.stock}</div>
                          <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-600" style={{ width: item.status === 'Ready' ? '100%' : '40%' }}></div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-4">
                    <div className="p-3 bg-purple-900/20 border-l-4 border-purple-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-purple-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 替换建议</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “识别到 MOD-A1 模块结温异常波动。判定为 <span className="text-red-400 font-bold">早期热失效</span>。建议在下个 48h 检修期执行冗余替换。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出电力系统运行白皮书
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联电气原理图</div>
                    <div className="text-xs font-bold text-white">E-SCHEM_V9.dwg</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
      `}} />
    </div>
  );
};
