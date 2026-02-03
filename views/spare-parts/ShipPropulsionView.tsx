
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { PropulsionThreeScene } from '../../components/ship_propulsion/ThreeScene';
import { 
  Wind, 
  RotateCw, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Gauge, 
  Waves, 
  Anchor, 
  Search, 
  Settings, 
  TrendingUp, 
  History, 
  Globe, 
  Box, 
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  FileText,
  // Fix: Added missing Droplets, Truck, and Database imports to resolve name errors
  Droplets,
  Truck,
  Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, Bar, Cell
} from 'recharts';

// --- 模拟推进系统数据 ---
const PROPULSION_ASSETS = [
  { id: 'PROP-BLADE-01', name: '螺旋桨叶片 #1 (Ti-Bronze)', health: 85, vibration: 1.4, efficiency: 0.94, status: 'normal' },
  { id: 'PROP-HUB-01', name: '调距桨毂 (CPP Hub)', health: 92, vibration: 0.8, efficiency: 0.98, status: 'normal' },
  { id: 'PROP-POD-01', name: '推进器吊舱 (Thruster Pod)', health: 76, vibration: 4.2, efficiency: 0.88, status: 'warning' },
  { id: 'PROP-SEAL-X', name: '艉轴密封件 (Simplex)', health: 45, vibration: 0.2, efficiency: 1.0, status: 'critical' },
];

const THRUST_EFFICIENCY_DATA = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  thrust: 450 + Math.sin(i * 0.4) * 50 + Math.random() * 10,
  power: 600 + Math.sin(i * 0.4) * 60 + Math.random() * 15,
  slip: 12 + Math.cos(i * 0.4) * 2
}));

const CAVITATION_ANALYSIS = [
  { subject: '吸力面压力', A: 92, fullMark: 100 },
  { subject: '导流均匀性', A: 85, fullMark: 100 },
  { subject: '噪声分贝', A: 70, fullMark: 100 }, // 存在气蚀噪声风险
  { subject: '表面剥蚀率', A: 95, fullMark: 100 },
  { subject: '桨尖旋涡', A: 88, fullMark: 100 },
];

const LOGISTICS_HUB = [
  { city: '新加坡 (SGP)', stock: '充足', delay: '12h', type: '核心保税库' },
  { city: '汉堡 (HAM)', stock: '紧张', delay: '36h', type: '欧洲区域中心' },
  { city: '迪拜 (DXB)', stock: '缺货', delay: '48h', type: '中东中转站' },
];

export const ShipPropulsionView: React.FC = () => {
  const [activePartId, setActivePartId] = useState<string | null>('PROP-BLADE-01');
  const [rpm, setRpm] = useState(120);
  const [pitch, setPitch] = useState(15);
  const [showWake, setShowWake] = useState(true);

  const activePart = useMemo(() => 
    PROPULSION_ASSETS.find(p => p.id === activePartId) || PROPULSION_ASSETS[0], 
  [activePartId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：推进动力态势抬头 */}
      <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/40 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border-2 border-blue-400/50 relative group">
              <RotateCw size={36} className="text-white group-hover:rotate-180 transition-transform duration-[2s]" />
              <div className="absolute -inset-2 border border-dashed border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Propulsion Dynamics & Spare Logistics
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船用推进系统 <span className="text-blue-500 italic">全息备件服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前推力 (Thrust)</div>
              <div className="text-2xl font-mono font-bold text-white">485.2 <span className="text-sm text-slate-600">kN</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">推进效率 (ηp)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">72.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">滑失率 (Slip)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">12.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：组件体系与健康矩阵 (Asset Stack) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="推进系统组件矩阵" subtitle="SYSTEM_STACK" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="检索部件/编码..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500" />
                 </div>
                 
                 {PROPULSION_ASSETS.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => setActivePartId(asset.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                         ${activePartId === asset.id 
                            ? 'bg-blue-950/30 border-blue-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-blue-500 font-bold">{asset.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${asset.status === 'normal' ? 'bg-green-900/30 text-green-400' : 
                               asset.status === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'}
                          `}>{asset.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{asset.name}</div>
                       <div className="flex justify-between items-center text-[10px]">
                          <div className="flex gap-3">
                             <span className="flex items-center gap-1 text-slate-400"><Activity size={10}/> {asset.vibration}</span>
                             <span className="flex items-center gap-1 text-slate-400"><Zap size={10}/> {asset.efficiency * 100}%</span>
                          </div>
                          <div className="font-mono text-blue-400 font-bold">{asset.health}%</div>
                       </div>
                       {activePartId === asset.id && (
                          <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 animate-pulse"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="艉轴密封状态监控" subtitle="SEALING_GENIUS" className="h-56 border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded border border-slate-700 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                       <Droplets className="text-blue-500" size={24} />
                       <div className="absolute bottom-0 w-full bg-blue-500/20 h-1/3 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">滑油泄漏速率</div>
                       <div className="text-lg font-mono font-bold text-red-400">1.2 <span className="text-xs">L/24h</span></div>
                       <div className="text-[9px] text-slate-600 mt-1">Warning: Threshold Exceeded</div>
                    </div>
                 </div>
                 <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-[10px] text-red-200 leading-tight">
                    检测到 #2 艉轴密封主唇口磨损超限。系统已自动在 <span className="text-white font-bold">新加坡 (SGP)</span> 锁定备件库存，预计抵港日期：04-12。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 全息流体场 (Holographic CFD) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-blue-900/20 rounded-lg overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Waves size={14} className="animate-pulse" />
                          Holographic Wake Field v2.4
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          推进单元 <span className="text-blue-500 italic">数字孪生场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-blue-500/30 p-3 rounded backdrop-blur-md w-48">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-2 flex justify-between">
                             <span>转速 (RPM)</span>
                             <span className="text-white font-mono">{rpm}</span>
                          </div>
                          <input 
                            type="range" min="0" max="150" step="5" 
                            value={rpm} 
                            onChange={(e) => setRpm(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                       </div>
                       
                       <div className="bg-black/60 border border-blue-500/30 p-3 rounded backdrop-blur-md w-48">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-2 flex justify-between">
                             <span>螺距角 (Pitch)</span>
                             <span className="text-white font-mono">{pitch}°</span>
                          </div>
                          <input 
                            type="range" min="-30" max="30" step="1" 
                            value={pitch} 
                            onChange={(e) => setPitch(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                       </div>

                       <button 
                         onClick={() => setShowWake(!showWake)}
                         className={`px-6 py-2 rounded-full font-bold text-xs border transition-all
                            ${showWake ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}
                         `}
                       >
                          尾流仿真 {showWake ? 'ON' : 'OFF'}
                       </button>
                    </div>
                 </div>

                 {/* 动态仪表（底部） */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <div className="p-2 bg-blue-950 rounded-full"><Gauge size={20} className="text-blue-400" /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">桨尖负荷 (Tip Load)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">12.4 <span className="text-xs text-slate-600">kN/m²</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <div className="p-2 bg-orange-950 rounded-full"><Thermometer size={20} className="text-orange-400" /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">轴承温升</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">48.2 <span className="text-xs text-slate-600">°C</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Hydrodynamic Efficiency</div>
                       <div className="h-1 w-40 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{width: '72%'}}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <PropulsionThreeScene 
                    parts={PROPULSION_ASSETS as any} 
                    activePartId={activePartId}
                    rpm={rpm}
                    pitchAngle={pitch}
                    showWake={showWake}
                    onPartSelect={setActivePartId}
                 />
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：动力映射图 (Propulsion Matrix) */}
           <SciFiCard title="推力与功率关联映射 (Thrust-Power Map)" subtitle="PERFORMANCE_TRACK" className="h-60 border-blue-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={THRUST_EFFICIENCY_DATA}>
                       <defs>
                          <linearGradient id="colorThrustProp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={2} />
                       <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area yAxisId="left" type="monotone" dataKey="thrust" stroke="#0ea5e9" fill="url(#colorThrustProp)" strokeWidth={2} name="输出推力 (kN)" />
                       <Line yAxisId="left" type="monotone" dataKey="power" stroke="#8b5cf6" strokeWidth={2} dot={false} name="主机功率 (kW)" />
                       <Line yAxisId="right" type="monotone" dataKey="slip" stroke="#f59e0b" strokeWidth={2} dot={false} name="滑失率 (%)" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：全球物流与风险智能 (Logistics & Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="气蚀风险多维雷达" subtitle="CAVITATION_SCAN">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CAVITATION_ANALYSIS}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2">
                 "检测到高频气蚀噪声，建议调节螺距角以优化叶片背面压力。"
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="LOGISTICS_STREAM" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {LOGISTICS_HUB.map((node, i) => (
                       <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-blue-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <Anchor size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-200">{node.city}</span>
                             </div>
                             <span className="text-[10px] font-mono text-cyan-400">ETA: {node.delay}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-slate-500 uppercase tracking-widest">{node.type}</span>
                             <span className={`text-[10px] font-bold ${node.stock === '充足' ? 'text-green-500' : node.stock === '紧张' ? 'text-amber-500' : 'text-red-500'}`}>库存{node.stock === 'High' ? '充足' : '偏低'}</span>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-4">
                    <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Zap size={16} className="text-blue-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 补货指令</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “艉轴密封健康度过低 (45%)。已自动在新加坡枢纽预定 <span className="text-white font-bold">Simplex-240</span> 密封套件，下个港口即可完成交付。”
                       </p>
                       <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                          <Truck size={60} />
                       </div>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出推进系统保障方案
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">推进性能知识库</div>
                    <div className="text-xs font-bold text-white">PROP_KB_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};
