
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { NavThreeScene } from '../../components/ship_auto_nav/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-ship-automation-nav]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-ship-automation-nav';
import { NavNode } from '../../components/ship_auto_nav/three-types';
import { 
  Navigation, 
  Wifi, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Compass, 
  Target, 
  Cpu, 
  RotateCw, 
  Globe, 
  Box, 
  Search,
  Settings2,
  AlertTriangle,
  FileText,
  TrendingUp,
  History,
  CheckCircle2,
  Maximize2,
  Package,
  Satellite,
  Waves,
  LayoutGrid,
  ChevronRight,
  RefreshCw,
  Signal,
  ClipboardCheck,
  Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- 模拟数据 ---
const NAV_NODES: NavNode[] = [
  { id: 'NAV-RADAR-X', name: 'X波段航海雷达', type: 'radar', status: 'online', position: [0, 4, 0], signalStrength: 94 },
  { id: 'NAV-AIS-01', name: 'AIS 自动识别系统', type: 'ais', status: 'online', position: [-4, 1, 3], signalStrength: 98 },
  { id: 'NAV-ECDIS-P', name: '电子海图主站 (ECDIS)', type: 'ecdis', status: 'online', position: [2, 0, 5], signalStrength: 100 },
  { id: 'NAV-GYRO-02', name: '光纤陀螺罗经 #2', type: 'gyro', status: 'warning', position: [-2, -1, -4], signalStrength: 72 },
  { id: 'NAV-GPS-B', name: '北斗/GPS 双模天线', type: 'gps', status: 'online', position: [5, 6, -2], signalStrength: 95 },
];

const SIGNAL_DEGRADATION = [
  { time: '08:00', strength: 98, noise: 2 },
  { time: '10:00', strength: 96, noise: 4 },
  { time: '12:00', strength: 92, noise: 8 },
  { time: '14:00', strength: 85, noise: 12 }, // 信号衰减
  { time: '16:00', strength: 94, noise: 5 },
];

const SPARE_PARTS_INVENTORY = [
  { id: 'SN-MAG-77', name: '雷达磁控管 (Magnetron)', stock: 2, lead: '14d', status: 'critical', type: 'Electronic' },
  { id: 'SN-LCD-24', name: '桥楼 24寸 加固显示屏', stock: 1, lead: '30d', status: 'warning', type: 'Display' },
  { id: 'SN-CPU-V4', name: 'AIS 核心处理器板卡', stock: 0, lead: '7d', status: 'critical', type: 'PCB' },
  { id: 'SN-ANT-L1', name: 'GNSS 全向接收天线', stock: 5, lead: '2d', status: 'normal', type: 'Hardware' },
];

const SYSTEM_HEALTH_RADAR = [
  { subject: '信号同步', A: 95, fullMark: 100 },
  { subject: '定位精度', A: 98, fullMark: 100 },
  { subject: '数据冗余', A: 85, fullMark: 100 },
  { subject: '网络吞吐', A: 92, fullMark: 100 },
  { subject: '抗干扰度', A: 80, fullMark: 100 },
];

export const ShipAutomationNavView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('NAV-RADAR-X');
  const [isScanning, setIsScanning] = useState(true);

  const activeNode = useMemo(() => 
    NAV_NODES.find(n => n.id === selectedId) || NAV_NODES[0], 
  [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：航行指挥态势栏 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-blue-950/40 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border-2 border-blue-400/50 relative group">
              <Navigation size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Integrated Bridge System & Automation
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船舶自动化 <span className="text-cyan-500 italic">与导航设备备件服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">全球定位精度</div>
              <div className="text-2xl font-mono font-bold text-white">0.02 <span className="text-sm text-slate-600 font-normal">m</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AIS 目标数</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">128 <span className="text-xs text-slate-600 font-normal">NODES</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">网络安全性</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">LEVEL_4</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：核心电子备件库 (Avionics Inventory) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="导航核心备件库存" subtitle="AVIONICS_INVENTORY" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2 px-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索组件/批次..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500 transition-all" />
                 </div>
                 
                 {SPARE_PARTS_INVENTORY.map(part => (
                    <div 
                      key={part.id}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                         ${part.status === 'critical' ? 'bg-red-950/20 border-red-900/40 shadow-red-900/10' : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/50'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-cyan-500 font-bold">{part.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.status === 'critical' ? 'bg-red-900/50 text-red-400 animate-pulse' : 
                               part.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{part.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{part.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>库存: <span className={part.stock === 0 ? 'text-red-500' : 'text-white'}>{part.stock} Unit</span></span>
                          <span className="flex items-center gap-1 uppercase tracking-tighter"><Cpu size={10} /> {part.type}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="卫星信号质量检测" subtitle="CONSTELLATION" className="h-56 border-slate-800">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Satellite className="text-indigo-400" size={16} />
                       <span className="text-xs font-bold text-slate-300">定位系统状态</span>
                    </div>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active</span>
                 </div>
                 <div className="grid grid-cols-4 gap-1">
                    {Array.from({length: 12}).map((_, i) => (
                       <div key={i} className="h-8 bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden group">
                          <div className={`w-1 h-full absolute left-0 ${i % 4 === 0 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                          <span className="text-[8px] font-mono text-slate-500">S-{10+i}</span>
                       </div>
                    ))}
                 </div>
                 <div className="p-2 bg-blue-900/10 border border-blue-900/30 rounded text-[9px] text-slate-400 leading-tight">
                    当前可见星数：24 (GPS: 12, BD: 12)。PDOP 值：0.8 (Excellent)。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：船桥全息数字孪生 (Digital Bridge) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Radio size={14} className="animate-pulse" />
                          Holographic Navigation Field v5.0
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          导航设备 <span className="text-cyan-500 italic">全息态势场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">雷达波束强度</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400 leading-none">12.4 <span className="text-sm font-normal text-slate-600">kW</span></div>
                       </div>
                       <button onClick={() => setIsScanning(!isScanning)} className={`px-6 py-1.5 rounded-full font-bold text-xs border transition-all ${isScanning ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                          {isScanning ? '停止扫描 (Scan Off)' : '启动扫描 (Scan On)'}
                       </button>
                    </div>
                 </div>

                 {/* 底部详情 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Compass size={20} className="text-indigo-400 animate-spin-slow" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">陀螺罗经航向</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">245.8° <span className="text-cyan-500 text-[10px]">T</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Integrated Link Quality</div>
                       <div className="h-1 w-40 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{width: '88%'}}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <NavThreeScene 
                    nodes={NAV_NODES} 
                    activeNodeId={selectedId}
                    isRadarScanning={isScanning}
                    onNodeSelect={setSelectedId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 背景网格装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：信号分析与同步 (Signal Pulse) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-60">
              <SciFiCard title="射频前端信号脉冲" subtitle="RF_SPECTRUM" noPadding>
                 <div className="h-full w-full p-4 flex flex-col">
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SIGNAL_DEGRADATION}>
                             <defs>
                                <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis hide domain={[0, 120]} />
                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                             <Area type="monotone" dataKey="strength" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorStrength)" name="信号强度" />
                             <Area type="monotone" dataKey="noise" stroke="#ef4444" strokeWidth={1} fill="transparent" strokeDasharray="5 5" name="底噪干扰" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                       <span>SNR: 24.5 dB</span>
                       <span className="text-green-400">Stable</span>
                    </div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="数据同步一致性" subtitle="SYNC_FIDELITY" noPadding>
                 <div className="h-full w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SYSTEM_HEALTH_RADAR}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Performance" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：智能决策与全球物流 (Logistics & Decisions) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 故障预测决策" subtitle="SMART_STRATEGY" className="border-indigo-900/30 bg-indigo-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">性能退化预判</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于最近 72 小时的雷达回波增益分析，<span className="text-white font-bold">X波段磁控管</span> 效率下降 15%。预测将在 450 运行小时后失效。建议在抵达新加坡港时进行更换。”
                    </p>
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                       <RefreshCw size={80} />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ClipboardCheck size={12} className="text-green-500" /> 推荐维护包 (Recommended)
                    </div>
                    {[
                      { label: 'Radar Magnetron Kit', val: '¥14,200', urgent: true },
                      { label: 'Display Filter Set', val: '¥850', urgent: false },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300 truncate w-32">{step.label}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-white">{step.val}</span>
                            {step.urgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="GLOBAL_SUPPLY" className="flex-1 border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { node: '新加坡保税库', stock: 'Magnetron x2', eta: '12h', status: 'Ready' },
                      { node: '鹿特丹服务中心', stock: 'ECDIS Board x1', eta: '36h', status: 'Transit' },
                      { node: '上海工厂', stock: 'Sensor Cables', eta: '5d', status: 'Process' },
                    ].map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2">
                                <Globe size={14} className="text-cyan-500" />
                                <span className="text-xs font-bold text-slate-200">{item.node}</span>
                             </div>
                             <span className="text-[10px] font-mono text-cyan-400">ETA: {item.eta}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mb-2">{item.stock}</div>
                          <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-600" style={{ width: item.status === 'Ready' ? '100%' : '40%' }}></div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <button className="w-full py-3 mt-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 导出导航系统年度巡检报告
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">自动化设备档案库</div>
                    <div className="text-xs font-bold text-white">AUTO_NAV_KB_V8.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
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
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
