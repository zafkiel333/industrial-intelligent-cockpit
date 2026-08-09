
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { AuxSystemThreeScene } from '../../components/ship_auxiliary/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-ship-auxiliary]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-ship-auxiliary';
import { AuxComponent } from '../../components/ship_auxiliary/three-types';
import { 
  Waves, 
  Activity, 
  Settings, 
  Wind, 
  Droplets, 
  Thermometer, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  RotateCw, 
  Layers,
  Database,
  Truck,
  Box,
  Compass,
  FileText,
  TrendingUp,
  History,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, Bar, Cell
} from 'recharts';

// --- 模拟辅机运行数据 ---
const AUX_UNITS: AuxComponent[] = [
  { id: 'AUX-SEP-01', name: '1号重油分油机', type: 'separator', status: 'online', vibration: 2.4, temperature: 98, pressure: 0.45, healthIndex: 88 },
  { id: 'AUX-SEP-02', name: '2号润滑油分油机', type: 'separator', status: 'standby', vibration: 0.1, temperature: 25, pressure: 0, healthIndex: 94 },
  { id: 'AUX-HE-04', name: '中央冷却换热器', type: 'heat_exchanger', status: 'online', vibration: 0.5, temperature: 42, pressure: 0.32, healthIndex: 91 },
  { id: 'AUX-AC-01', name: '1号主空压机', type: 'compressor', status: 'maintenance', vibration: 8.2, temperature: 145, pressure: 3.0, healthIndex: 45 },
];

const SPARE_PARTS_HUB = [
  { id: 'SK-V24', name: '密封大修包 (Overhaul Kit)', category: 'Separator', stock: 2, lead: '12d', status: 'critical' },
  { id: 'FL-M08', name: '自动反冲洗滤芯', category: 'Filter', stock: 45, lead: '3d', status: 'normal' },
  { id: 'GS-T12', name: '钛板换热器垫片', category: 'Heat Exchanger', stock: 12, lead: '7d', status: 'warning' },
  { id: 'VA-P40', name: '减压阀导阀', category: 'Pneumatic', stock: 5, lead: '15d', status: 'normal' },
];

const SEPARATOR_PERFORMANCE = [
  { time: '08:00', separationRate: 98, humidity: 0.02 },
  { time: '10:00', separationRate: 97, humidity: 0.03 },
  { time: '12:00', separationRate: 95, humidity: 0.05 },
  { time: '14:00', separationRate: 92, humidity: 0.08 }, // 性能下降点
  { time: '16:00', separationRate: 94, humidity: 0.06 },
];

export const ShipAuxiliaryView: React.FC = () => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('AUX-SEP-01');
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'flow'>('standard');

  const activeUnit = useMemo(() => 
    AUX_UNITS.find(u => u.id === selectedUnitId) || AUX_UNITS[0], 
    [selectedUnitId]
  );

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-400/50 relative group">
              <Settings size={36} className="text-white group-hover:rotate-90 transition-transform duration-500" />
              <div className="absolute -inset-2 border border-dashed border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Auxiliary Machinery & System Support
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船舶辅机系统 <span className="text-blue-500 italic">备件与技术服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统可用性</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均无故障时间</div>
              <div className="text-2xl font-mono font-bold text-white">4,250 <span className="text-sm text-slate-600 font-normal">h</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：辅机单元目录 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="辅机系统单元" subtitle="AUX_UNITS" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {AUX_UNITS.map(unit => (
                    <div 
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                         ${selectedUnitId === unit.id 
                            ? 'bg-blue-950/30 border-blue-500 shadow-lg' 
                            : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-blue-500 font-bold">{unit.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${unit.status === 'online' ? 'bg-green-900/30 text-green-400' : 
                               unit.status === 'maintenance' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                          `}>{unit.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{unit.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Activity size={10} /> Vib: {unit.vibration}</span>
                          <span className="flex items-center gap-1 font-mono text-blue-400">{unit.healthIndex}% Health</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="关键耗材库存" subtitle="PARTS_STOCK" className="h-56">
              <div className="space-y-3 overflow-y-auto h-full pr-1 custom-scrollbar">
                 {SPARE_PARTS_HUB.map(part => (
                    <div key={part.id} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded group hover:border-blue-500/30">
                       <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">{part.name}</div>
                          <div className="text-[9px] text-slate-600 uppercase">{part.category}</div>
                       </div>
                       <div className="text-right">
                          <div className={`text-sm font-bold ${part.status === 'critical' ? 'text-red-500' : 'text-white'}`}>{part.stock}</div>
                          <div className="text-[8px] text-slate-600">Lead: {part.lead}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 全息视图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-blue-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          AUX_SYSTEM_SIM_V2
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activeUnit.name} <span className="text-blue-500 italic">数字孪生</span>
                       </h2>
                    </div>
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="flex bg-slate-950/80 p-1 rounded border border-slate-800">
                          {['standard', 'xray', 'flow'].map(mode => (
                             <button 
                                key={mode} 
                                onClick={() => setViewMode(mode as any)}
                                className={`px-4 py-1 text-[10px] uppercase font-bold rounded-sm transition-all ${viewMode === mode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                             >
                                {mode}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <AuxSystemThreeScene 
                    activeUnitId={selectedUnitId}
                    units={AUX_UNITS}
                    flowIntensity={activeUnit.status === 'online' ? 1.0 : 0}
                    onUnitSelect={setSelectedUnitId}
                    viewMode={viewMode}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部分析图表 */}
           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="分离效率曲线" subtitle="SEP_PERFORMANCE" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SEPARATOR_PERFORMANCE}>
                          <defs>
                             <linearGradient id="colorSep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                          <Area type="monotone" dataKey="separationRate" stroke="#0ea5e9" fill="url(#colorSep)" strokeWidth={2} name="分离率 (%)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="系统运行指标雷达" subtitle="OPERATIONAL_RADAR">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: '振动稳定性', A: 92, fullMark: 100 },
                          { subject: '温升控制', A: 85, fullMark: 100 },
                          { subject: '出口压力', A: 78, fullMark: 100 },
                          { subject: '能耗比', A: 95, fullMark: 100 },
                          { subject: '油液纯度', A: 88, fullMark: 100 },
                       ]}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Performance" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：决策与建议 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           <SciFiCard title="智能维护决策" subtitle="AI_ADVISORY" className="border-blue-900/30 bg-blue-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">排障建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “1号分油机分离效率下降明显。基于振动频谱分析，转鼓底部轴承已出现<span className="text-white font-bold">剥落特征</span>。建议在下次港口作业前更换轴承组件。”
                    </p>
                 </div>
                 
                 <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase rounded shadow-lg flex items-center justify-center gap-2">
                    <FileText size={16} /> 生成维护任务书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">辅机技术手册库</div>
                    <div className="text-xs font-bold text-white">AUX_TECH_V2.pdf</div>
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
      `}</style>
    </div>
  );
};
