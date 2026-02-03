
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MineSafetyScene } from '../../components/mining_safety/MineSafetyScene';
import { SafetySensorNode } from '../../components/mining_safety/three-types';
import { 
  ShieldAlert, 
  Activity, 
  Wind, 
  Radio, 
  Settings2, 
  Database, 
  Globe, 
  ChevronRight, 
  Clock, 
  Search,
  Maximize2,
  Cpu,
  Zap,
  Mic,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  History,
  FileCheck,
  Binary,
  Layers,
  Heart,
  Package,
  RotateCw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  LineChart, 
  Line, 
  Legend, 
  ComposedChart, 
  ReferenceLine, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

// --- 模拟工程数据 ---
const SENSOR_ASSETS: SafetySensorNode[] = [
  { id: 'GAS-01-W', name: '无线瓦斯探头 (CH4)', type: 'gas', position: [2, 5, 2], health: 88, signalStrength: 92, lastCalibration: '2024-03-20', isIntrinsicallySafe: true },
  { id: 'STR-04-A', name: '围岩压力监测仪', type: 'stress', position: [-4, 2, -3], health: 94, signalStrength: 85, lastCalibration: '2024-01-15', isIntrinsicallySafe: true },
  { id: 'DST-02-B', name: '防爆粉尘浓度传感器', type: 'dust', position: [5, -4, 4], health: 42, signalStrength: 78, lastCalibration: '2023-12-10', isIntrinsicallySafe: true },
  { id: 'UWB-NODE-7', name: '人员定位 UWB 基站', type: 'uwb', position: [-3, -8, 2], health: 91, signalStrength: 99, lastCalibration: '2024-02-12', isIntrinsicallySafe: false },
];

const GAS_TREND_DATA = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  val: 0.12 + Math.sin(i * 0.4) * 0.05 + (i === 15 ? 0.3 : 0), // 模拟15点小幅异常
  limit: 0.5
}));

const CALIBRATION_STATS = [
  { subject: '灵敏度', A: 95, fullMark: 100 },
  { subject: '响应时间', A: 98, fullMark: 100 },
  { subject: '线性度', A: 92, fullMark: 100 },
  { subject: '漂移控制', A: 85, fullMark: 100 },
  { subject: '抗交叉干扰', A: 90, fullMark: 100 },
];

const SPARE_PARTS_INVENTORY = [
  { id: 'SENS-MOD-G', name: '瓦斯检测核心模组', stock: 12, leadTime: '2天', status: 'Optimal' },
  { id: 'BAT-EX-400', name: '本安级电池组 (4000mAh)', stock: 5, leadTime: '7天', status: 'Warning' },
  { id: 'UWB-TAG-R', name: 'RFID/UWB 识别标签', stock: 150, leadTime: '3天', status: 'Optimal' },
];

export const MiningSafetyServiceView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>('GAS-01-W');
  const [alertLevel, setAlertLevel] = useState<'normal' | 'warning' | 'critical'>('normal');

  const activeSensor = useMemo(() => 
    SENSOR_ASSETS.find(s => s.id === activeId) || SENSOR_ASSETS[0], 
  [activeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：生命线保障看板 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border-2 border-purple-400/50 relative group overflow-hidden">
              <ShieldAlert size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-purple-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Mining Safety Perceptual Mesh & Spares
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿山安全监测 <span className="text-purple-500 italic">备件智能保障中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">传感器在线率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">99.8%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均标定周期</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">14.2 <span className="text-sm font-normal text-slate-600 uppercase">Days</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">紧急备件缺口</div>
              <div className="text-2xl font-mono font-bold text-red-500 animate-pulse">01</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：感知元器件矩阵 (Sensing Grid) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-purple-500" /> 在役感知节点</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {SENSOR_ASSETS.map(node => (
                <div 
                  key={node.id}
                  onClick={() => setActiveId(node.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeId === node.id 
                      ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-purple-500 mb-1 uppercase">{node.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{node.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${node.health > 70 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        {node.type === 'gas' ? <Wind size={16} className="text-emerald-400"/> : 
                         node.type === 'stress' ? <Layers size={16} className="text-indigo-400"/> :
                         <Activity size={16} className="text-cyan-400"/>}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">信号质量</div>
                        <div className="text-lg font-mono font-bold text-white">{node.signalStrength} <span className="text-[10px] text-slate-600">dBm</span></div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">健康状态</div>
                        <div className={`text-lg font-mono font-bold ${node.health > 80 ? 'text-green-400' : 'text-red-400'}`}>{node.health}%</div>
                     </div>
                  </div>
                  
                  {activeId === node.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 shadow-[0_0_10px_#8b5cf6]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="标定精准度指纹" subtitle="CALIBRATION_FINGERPRINT" className="h-48 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={CALIBRATION_STATS}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="准确度" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中轴：全息断面与数字孪生 (Core Area) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050810] border border-purple-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Zap size={14} className="animate-pulse" />
                          Subterranean Sensory Mesh: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          矿道断面 <span className="text-purple-500 italic">全息监测场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-purple-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">探测深度模拟</div>
                          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">-850 <span className="text-sm font-normal text-slate-600 uppercase">Meters</span></div>
                       </div>
                       <div className="flex gap-2">
                          {['GAS', 'STRESS', 'DUST', 'PERSONNEL'].map(tag => (
                             <span key={tag} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-bold text-slate-500 hover:text-purple-400 transition-colors cursor-pointer">{tag}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Thermometer size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">节点最高温升</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">42.8 <span className="text-[10px] text-slate-600">°C</span></div>
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
                 <MineSafetyScene 
                    sensors={SENSOR_ASSETS} 
                    activeSensorId={activeId}
                    onSelect={setActiveId}
                    mineDepth={850}
                    alertLevel={alertLevel}
                 />
              </div>

              {/* 背景装饰氛围 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b5cf6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：多维环境信号流 (Signal Flow) */}
           <SciFiCard title="瓦斯 (CH4) 浓度实时脉冲" subtitle="SIGNAL_TRANSIENT" className="h-60 border-purple-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={GAS_TREND_DATA}>
                       <defs>
                          <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={3} />
                       <YAxis stroke="#475569" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="val" stroke="#10b981" fill="url(#colorGas)" strokeWidth={2} name="瓦斯浓度 (%)" />
                       <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '警报阈值', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：备件供应链与认证 (Supply & Cert) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="应急备件库存监控" subtitle="EMERGENCY_RESERVE">
              <div className="space-y-4 py-2">
                 {SPARE_PARTS_INVENTORY.map((part, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded flex flex-col gap-2 group hover:border-purple-500/50 transition-all cursor-pointer">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             <Package size={14} className="text-purple-500" />
                             <span className="text-xs font-bold text-slate-200">{part.name}</span>
                          </div>
                          <span className={`text-[9px] font-bold ${part.status === 'Optimal' ? 'text-green-400' : 'text-amber-500'}`}>{part.status}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">当前库存: <span className="text-white font-mono">{part.stock} EA</span></span>
                          <span className="text-slate-500">补货周期: <span className="text-cyan-400 font-mono">{part.leadTime}</span></span>
                       </div>
                       <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: part.status === 'Optimal' ? '100%' : '30%' }}></div>
                       </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Zap size={14} /> 启动紧急配给程序
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="本征安全 (Ex) 认证链" subtitle="COMPLIANCE_CERT" className="flex-1 border-purple-900/30 bg-purple-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-purple-900/20 border-l-4 border-purple-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-emerald-400" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">本安证书核验成功</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “所选瓦斯探头 (GAS-01-W) 匹配 <span className="text-white font-bold">GB 3836.1-2010</span> 防爆标准，认证代码: Ex ia I Ma，有效期至 2026年。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <FileCheck size={80} className="text-emerald-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <RotateCw size={12} className="text-cyan-500" /> 备件全生命周期溯源
                    </div>
                    {[
                      { label: '原厂核心模组溯源', status: 'done' },
                      { label: '三方防爆环境测试', status: 'done' },
                      { label: '数字化安装扭矩同步', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-purple-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-slate-600 animate-pulse" />}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 导出安全监测审计报告
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联安全标准库</div>
                    <div className="text-xs font-bold text-white">SAFETY_CODE_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.6); }
        @keyframes scan {
          0% { transform: translateY(-300px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}} />
    </div>
  );
};
