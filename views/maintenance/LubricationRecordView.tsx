import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LubricationThreeScene } from '../../components/maintenance_lubrication/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-oil-record]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-oil-record';
import { 
  Droplets, 
  FlaskConical, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle, 
  History, 
  PlusCircle, 
  CheckCircle2, 
  Filter, 
  Scale, 
  Pipette,
  Gauge,
  RefreshCw,
  Activity,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- Mock Data ---

const OIL_INVENTORY = [
  { id: 'LUB-46', name: '抗磨液压油 L-HM46', stock: 85, color: '#f59e0b', capacity: 1000 },
  { id: 'LUB-320', name: '重负荷齿轮油 CKD320', stock: 42, color: '#d97706', capacity: 500 },
  { id: 'LUB-TUR', name: '透平油 T-46', stock: 92, color: '#fcd34d', capacity: 1200 },
  { id: 'LUB-GRS', name: '锂基润滑脂 #2', stock: 15, color: '#a8a29e', capacity: 200, unit: 'kg' },
];

const HISTORY_RECORDS = [
  { id: 'REC-0982', date: '10:42', user: '张工', machine: '#2 提升机', type: 'L-HM46', amount: '200 L', reason: '定期更换' },
  { id: 'REC-0981', date: '08:15', user: '李工', machine: '#1 皮带机', type: 'CKD320', amount: '15 L', reason: '液位低报警' },
  { id: 'REC-0980', date: '昨日', user: '王工', machine: '#4 破碎机', type: 'Grease', amount: '5 kg', reason: '润滑点维护' },
  { id: 'REC-0979', date: '昨日', user: '系统', machine: '#3 风机', type: 'T-46', amount: '2 L', reason: '自动补油' },
];

const CONSUMPTION_TREND = [
  { day: 'Mon', amount: 45 }, { day: 'Tue', amount: 120 },
  { day: 'Wed', amount: 80 }, { day: 'Thu', amount: 60 },
  { day: 'Fri', amount: 150 }, { day: 'Sat', amount: 30 },
  { day: 'Sun', amount: 90 },
];

const VISCOSITY_DATA = [
  { temp: 20, visc: 100 }, { temp: 30, visc: 68 },
  { temp: 40, visc: 46 }, { temp: 50, visc: 32 },
  { temp: 60, visc: 22 }, { temp: 70, visc: 15 },
];

export const LubricationRecordView: React.FC = () => {
  const [selectedOil, setSelectedOil] = useState(OIL_INVENTORY[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [fillLevel, setFillLevel] = useState(0.7);

  const handleQuickAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      setFillLevel(Math.min(1, fillLevel + 0.1));
      setIsAdding(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：润滑控制台抬头 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] border-2 border-amber-400/50">
              <Droplets size={30} className="text-white drop-shadow-md" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Fluid Management System
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 润滑油液 <span className="text-amber-500 italic">添加记录与监测</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月消耗</div>
              <div className="text-xl font-mono font-bold text-white">1,420 <span className="text-xs text-slate-600">L</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">库存预警</div>
              <div className="text-xl font-mono font-bold text-red-500">2 <span className="text-xs text-slate-600">Items</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">油品健康度</div>
              <div className="text-xl font-mono font-bold text-green-400">98.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：油品库存仓 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="数字油库 (Digital Depot)" subtitle="INVENTORY" highlight className="flex-1 border-amber-900/30">
              <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {OIL_INVENTORY.map(oil => (
                    <div 
                      key={oil.id}
                      onClick={() => setSelectedOil(oil)}
                      className={`relative p-4 rounded border cursor-pointer transition-all group overflow-hidden
                         ${selectedOil.id === oil.id 
                            ? 'bg-slate-800 border-amber-500' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className="flex justify-between items-start z-10 relative">
                          <div>
                             <div className="text-xs font-bold text-slate-200 mb-1">{oil.name}</div>
                             <div className="text-[10px] text-slate-500 font-mono">{oil.id}</div>
                          </div>
                          <div className={`text-lg font-bold font-mono ${oil.stock < 30 ? 'text-red-500' : 'text-white'}`}>
                             {oil.stock}%
                          </div>
                       </div>
                       
                       {/* Liquid Visualization Background */}
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                          <div 
                             className="h-full transition-all duration-1000" 
                             style={{ 
                                width: `${oil.stock}%`, 
                                backgroundColor: oil.color,
                                boxShadow: `0 0 10px ${oil.color}`
                             }} 
                          />
                       </div>
                       
                       {/* Tank graphic simulated */}
                       <div className="absolute right-2 bottom-4 w-8 h-12 border border-slate-600 rounded-sm flex flex-col justify-end p-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                          <div className="w-full rounded-sm transition-all duration-1000" style={{ height: `${oil.stock}%`, backgroundColor: oil.color }}></div>
                       </div>
                    </div>
                 ))}
                 
                 <button className="mt-2 w-full py-3 border border-dashed border-slate-700 text-slate-500 rounded text-xs hover:text-amber-500 hover:border-amber-500/50 transition-colors flex items-center justify-center gap-2">
                    <PlusCircle size={14} /> 登记新油品
                 </button>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                 <AlertTriangle size={14} className="text-amber-500" /> 近期异常
              </div>
              <div className="space-y-2">
                 <div className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded border-l-2 border-red-500">
                    <span className="text-slate-300">#2 提升机</span> 减速箱油温偏高 (75°C)，建议取样化验。
                 </div>
              </div>
           </div>
        </div>

        {/* 中间：3D 润滑孪生与操作 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           
           {/* 3D 场景 */}
           <div className="flex-1 relative bg-[#080502] border border-amber-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between">
                    <div className="bg-black/60 backdrop-blur border border-amber-500/30 p-3 rounded">
                       <div className="text-[10px] text-amber-500 font-bold uppercase mb-1">Active Fluid</div>
                       <div className="text-xl font-bold text-white">{selectedOil.name}</div>
                       <div className="text-xs text-slate-400">Viscosity: ISO VG 46</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="bg-black/60 backdrop-blur border border-slate-700 p-2 rounded text-right">
                           <div className="text-[9px] text-slate-500 uppercase">Temp</div>
                           <div className="text-sm font-mono text-white">42.5°C</div>
                        </div>
                        <div className="bg-black/60 backdrop-blur border border-slate-700 p-2 rounded text-right">
                           <div className="text-[9px] text-slate-500 uppercase">Purity</div>
                           <div className="text-sm font-mono text-green-400">NAS 7</div>
                        </div>
                    </div>
                 </div>

                 {/* 底部操作条 (浮动) */}
                 <div className="pointer-events-auto flex justify-center gap-4 pb-4">
                    <button 
                      onClick={handleQuickAdd}
                      disabled={isAdding}
                      className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                       {isAdding ? <RefreshCw className="animate-spin" size={18}/> : <Pipette size={18}/>}
                       {isAdding ? '注入中...' : '记录添加'}
                    </button>
                    <button className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-full border border-slate-600 hover:bg-slate-700 transition-all flex items-center gap-2">
                       <FlaskConical size={18}/> 取样分析
                    </button>
                 </div>
              </div>

              {/* 3D Component */}
              <div className="absolute inset-0">
                 <LubricationThreeScene 
                    level={fillLevel} 
                    color={selectedOil.color} 
                    isFlowing={!isAdding}
                    viscosity={0.5}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>
              
              {/* 装饰网格 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
           </div>

           {/* 粘度-温度曲线 */}
           <div className="h-48 bg-slate-900/40 border border-slate-800 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Activity size={12}/> 粘温特性曲线 (V-T Chart)</span>
                 <span className="text-[10px] text-slate-500">ISO 3448 Standard</span>
              </div>
              <div className="h-full w-full -ml-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={VISCOSITY_DATA}>
                       <defs>
                          <linearGradient id="colorVisc" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="temp" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Temp (°C)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'cSt', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b', color: '#fff', fontSize: '12px'}} />
                       <Area type="monotone" dataKey="visc" stroke="#f59e0b" fill="url(#colorVisc)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>

        {/* 右侧：记录流与分析 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
           
           {/* 添加记录流水 */}
           <SciFiCard title="近期添加日志" subtitle="LOGBOOK" className="flex-1 overflow-hidden border-slate-800">
              <div className="h-full flex flex-col">
                 {/* Table Header */}
                 <div className="grid grid-cols-4 text-[10px] text-slate-500 uppercase font-bold px-2 py-2 border-b border-slate-800">
                    <div className="col-span-2">Time / Machine</div>
                    <div>Type</div>
                    <div className="text-right">Amount</div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {HISTORY_RECORDS.map((rec) => (
                       <div key={rec.id} className="grid grid-cols-4 items-center p-2 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-xs">
                          <div className="col-span-2">
                             <div className="font-bold text-slate-200">{rec.date} <span className="text-slate-500 font-normal mx-1">|</span> {rec.user}</div>
                             <div className="text-[10px] text-cyan-400">{rec.machine}</div>
                          </div>
                          <div className="text-slate-400">{rec.type}</div>
                          <div className="text-right font-mono font-bold text-amber-500">{rec.amount}</div>
                       </div>
                    ))}
                 </div>
                 
                 <button className="w-full mt-2 py-2 bg-slate-800 text-slate-400 text-xs rounded hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <FileText size={12} /> 导出月度报表
                 </button>
              </div>
           </SciFiCard>

           {/* 消耗趋势 */}
           <SciFiCard title="润滑消耗趋势" subtitle="CONSUMPTION" className="h-64">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CONSUMPTION_TREND} margin={{top: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Bar dataKey="amount" fill="#0ea5e9" radius={[2, 2, 0, 0]} barSize={12}>
                          {CONSUMPTION_TREND.map((entry, index) => (
                             <Cell key={index} fill={index === 4 ? '#ef4444' : '#0ea5e9'} /> // Highlight peak
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
                 <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div> 异常峰值
                    <div className="w-2 h-2 bg-cyan-500 rounded-full ml-2"></div> 正常消耗
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};