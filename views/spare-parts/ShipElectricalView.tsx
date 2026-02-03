
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ElectricalThreeScene } from '../../components/ship_electrical/ThreeScene';
import { ElectricalPart } from '../../components/ship_electrical/three-types';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Binary, 
  Search, 
  AlertTriangle, 
  Layers, 
  Maximize2,
  Database,
  History,
  TrendingUp,
  RotateCw,
  Wind,
  Cable,
  Thermometer,
  ShieldAlert,
  FileText,
  ChevronRight,
  Globe,
  Radio,
  Cpu as CpuIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  // Fix: Added missing ReferenceLine to imports from recharts
  LineChart, Line, BarChart, Bar, Cell, Legend, ReferenceLine
} from 'recharts';

// --- 模拟数据 ---
const ELECTRICAL_ASSETS: ElectricalPart[] = [
  { id: 'ACB-MAIN-01', name: '万能断路器 (ACB)', type: 'breaker', status: 'normal', load: 0.72, temp: 45, insulation: 1200 },
  { id: 'INV-PROP-02', name: '推进变频器功率单元', type: 'inverter', status: 'warning', load: 0.85, temp: 72, insulation: 450 },
  { id: 'TRANS-AUX-04', name: '照明变压器 (440/220)', type: 'transformer', status: 'normal', load: 0.40, temp: 52, insulation: 800 },
  { id: 'PLC-COM-X7', name: '自动化站控制模组', type: 'module', status: 'normal', load: 0.15, temp: 32, insulation: 9999 },
];

const HARMONIC_DATA = Array.from({ length: 15 }, (_, i) => ({
  order: i + 1,
  val: i === 0 ? 100 : Math.random() * (20 / (i + 1))
}));

const INSULATION_TREND = [
  { time: '01月', val: 5.2 }, { time: '02月', val: 5.0 },
  { time: '03月', val: 4.5 }, { time: '04月', val: 3.8 }, // 呈下降趋势
];

export const ShipElectricalView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('ACB-MAIN-01');
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'thermal'>('standard');

  const activePart = useMemo(() => 
    ELECTRICAL_ASSETS.find(a => a.id === selectedId) || ELECTRICAL_ASSETS[0], 
    [selectedId]
  );

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：电气指控态势栏 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-blue-950/40 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border-2 border-white/20 relative group">
              <Zap size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Shipboard Integrated Power Network
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船舶电气系统 <span className="text-cyan-500 italic">全域备件保障</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统总负载</div>
              <div className="text-2xl font-mono font-bold text-white">4,285 <span className="text-sm text-slate-600">kW</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">母线频率</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">60.02 <span className="text-xs text-slate-600">Hz</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">电能质量 (PQ)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：资产库存与绝缘监测 (Asset & Insulation) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="电气备件资产阵列" subtitle="COMPONENT_STACK" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="检索断路器/变频器/PLC..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500" />
                 </div>
                 
                 {ELECTRICAL_ASSETS.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => setSelectedId(asset.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedId === asset.id 
                            ? 'bg-blue-950/30 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-cyan-500 font-bold">{asset.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${asset.status === 'normal' ? 'bg-green-900/30 text-green-400' : 
                               asset.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400'}
                          `}>{asset.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{asset.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Activity size={10} /> 负荷: {(asset.load * 100).toFixed(0)}%</span>
                          <span className="flex items-center gap-1"><Thermometer size={10} /> {asset.temp}°C</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="电缆绝缘老化趋势" subtitle="INSULATION_LIFE" className="h-56 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={INSULATION_TREND}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 10]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Line type="monotone" dataKey="val" stroke="#facc15" strokeWidth={2} dot={{ r: 4, fill: '#facc15' }} name="绝缘阻值 (GΩ)" />
                       {/* Fix: Added ReferenceLine component usage */}
                       <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="3 3" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 mt-2 italic">
                 警告：主发电机输出电缆绝缘层加速衰减，预计下月进入临界区。
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 全息配电场 (Digital Twin Environment) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Radio size={14} className="animate-pulse" />
                          ELECTROMAGNETIC SYNC: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          电气系统 <span className="text-cyan-500 italic">全息数字孪生</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">视图切换 (Filter)</div>
                          <div className="flex gap-1">
                             {['standard', 'xray', 'thermal'].map(m => (
                               <button 
                                 key={m} 
                                 onClick={() => setViewMode(m as any)}
                                 className={`px-3 py-1 text-[8px] uppercase font-bold rounded-sm border transition-all
                                    ${viewMode === m ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}
                                 `}
                               >
                                  {m}
                               </button>
                             ))}
                          </div>
                       </div>
                       <button 
                         onClick={() => setIsPowerOn(!isPowerOn)}
                         className={`px-6 py-1.5 rounded-full font-bold text-xs border transition-all ${isPowerOn ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-red-900/40 border-red-500 text-red-400'}`}
                       >
                          系统上电: {isPowerOn ? 'ONLINE' : 'OFFLINE'}
                       </button>
                    </div>
                 </div>

                 {/* 动态仪表（底部） */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <div className="p-2 bg-cyan-950 rounded-full"><Cable size={20} className="text-cyan-400" /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">直流侧电压 (VDC)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">642.5 <span className="text-xs text-slate-600">V</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <div className="p-2 bg-purple-950 rounded-full"><Activity size={20} className="text-purple-400" /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">谐波失真 (THD)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">2.14 <span className="text-xs text-slate-600">%</span></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ElectricalThreeScene 
                    parts={ELECTRICAL_ASSETS} 
                    activePartId={selectedId}
                    onPartSelect={setSelectedId}
                    isPowerOn={isPowerOn}
                    viewMode={viewMode}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：谐波频谱分析 (Harmonic spectrum) */}
           <SciFiCard title="母线谐波能量分布图" subtitle="HARMONIC_SPECTRUM" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HARMONIC_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="order" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: '谐波阶次 (Harmonic Order)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={20}>
                          {HARMONIC_DATA.map((entry, index) => (
                             <Cell key={index} fill={index === 0 ? '#0ea5e9' : index % 2 === 0 ? '#8b5cf6' : '#a855f7'} />
                          ))}
                       </Bar>
                       {/* Fix: Added ReferenceLine component usage */}
                       <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'IEEE 519 Limit', fill: 'red', fontSize: 10, position: 'insideRight' }} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：全球物流与风险智能 (Logistics & Risk) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="电弧风险多维雷达" subtitle="ARC_FLASH_RISK">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                       { subject: '电缆接点温升', A: 45, fullMark: 100 },
                       { subject: '湿度风险', A: 20, fullMark: 100 },
                       { subject: '瞬时浪涌', A: 65, fullMark: 100 },
                       { subject: '绝缘等级', A: 92, fullMark: 100 },
                       { subject: '断路器寿命', A: 88, fullMark: 100 },
                    ]}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk" dataKey="A" stroke="#facc15" strokeWidth={2} fill="#facc15" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2 px-2 leading-relaxed">
                 "监测到主并网柜连接端子存在微小热效应积累，建议在靠岸期间进行红外检测。"
              </div>
           </SciFiCard>

           <SciFiCard title="全球电气备件调度" subtitle="GLOBAL_SUPPLY" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { node: '新加坡保税库', stock: 'ACB 框架 (x2)', eta: '12h', status: 'Ready' },
                      { node: '鹿特丹中心', stock: '功率模块 (x4)', eta: '36h', status: 'Transit' },
                      { node: '上海工厂', stock: '定制控制电缆', eta: '5d', status: 'Fab' },
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

                 <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
                    <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <CpuIcon size={16} className="text-indigo-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 置换建议</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “鉴于现役推进变频器已处于‘生命周期末端’，建议利用本次新加坡停靠窗口，整体置换为高效能固态功率模组，可降低系统损耗约 <span className="text-emerald-400 font-bold">12%</span>。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出系统健康审计报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">电气原理库索引</div>
                    <div className="text-xs font-bold text-white">E-SCHEMATIC_V8.db</div>
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
