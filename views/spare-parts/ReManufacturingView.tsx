
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RemanThreeScene } from '../../components/spare_parts_remanufacturing/ThreeScene';
import { RemanPartState } from '../../components/spare_parts_remanufacturing/three-types';
import { 
  Recycle, 
  RotateCw, 
  Settings, 
  Leaf, 
  Database, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Layers, 
  ArrowRight,
  Microscope, 
  Package, 
  Factory, 
  BarChart3, 
  Cpu, 
  RefreshCw, 
  Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

// --- MOCK DATA ---

const CORE_INVENTORY = [
  { id: 'C-9021', name: '重型柴油机曲轴', type: 'shaft', status: '待评估', origin: '矿山部', days: 12 },
  { id: 'C-9025', name: '液压泵缸体总成', type: 'piston', status: '可再制造', origin: '港口部', days: 5 },
  { id: 'C-9033', name: '风机增速箱齿轮', type: 'gearbox', status: '清洗中', origin: '能源部', days: 2 },
  { id: 'C-9042', name: '燃气轮机叶片组', type: 'turbine', status: '待报废', origin: '发电部', days: 45 },
];

const PERFORMANCE_COMPARE = [
  { subject: '耐磨性', new: 100, reman: 105, fullMark: 120 }, // 再制造往往通过表面强化优于新品
  { subject: '疲劳强度', new: 100, reman: 98, fullMark: 120 },
  { subject: '尺寸精度', new: 100, reman: 100, fullMark: 120 },
  { subject: '表面光洁度', new: 100, reman: 102, fullMark: 120 },
  { subject: '使用寿命', new: 100, reman: 95, fullMark: 120 },
];

const COST_SAVING_TREND = [
  { month: '01', newCost: 120, remanCost: 45 },
  { month: '02', newCost: 150, remanCost: 55 },
  { month: '03', newCost: 180, remanCost: 65 },
  { month: '04', newCost: 130, remanCost: 50 },
  { month: '05', newCost: 200, remanCost: 75 },
  { month: '06', newCost: 220, remanCost: 80 },
];

export const ReManufacturingView: React.FC = () => {
  const [selectedCore, setSelectedCore] = useState(CORE_INVENTORY[1].id);
  const [scanProgress, setScanProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const activeCore = CORE_INVENTORY.find(c => c.id === selectedCore) || CORE_INVENTORY[1];

  // Simulation
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 1) {
            setIsRunning(false);
            return 1;
          }
          return prev + 0.005;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startReman = () => {
    setScanProgress(0);
    setIsRunning(true);
  };

  const getPartType = (name: string): any => {
    if (name.includes('齿轮')) return 'gearbox';
    if (name.includes('叶片')) return 'turbine';
    return 'piston';
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020604]">
      
      {/* 顶部：再生工厂仪表盘 */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 bg-gradient-to-r from-emerald-950/40 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-lime-900 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 relative group">
              <Recycle size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-emerald-500/20 rounded-lg animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Advanced Re-Genesis Facility
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件 <span className="text-emerald-500 italic">再制造与循环赋能</span> 中心
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">累计减碳量</div>
              <div className="text-2xl font-mono font-bold text-green-400">1,245 <span className="text-sm text-slate-600">tCO₂</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">资源循环率</div>
              <div className="text-2xl font-mono font-bold text-lime-400">82.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">成本节约</div>
              <div className="text-2xl font-mono font-bold text-white">¥ 4.2M</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：旧件管理 (Core Management) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="旧件回收池 (Core Bank)" subtitle="INVENTORY" highlight className="flex-1 border-emerald-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {CORE_INVENTORY.map(core => (
                    <div 
                      key={core.id}
                      onClick={() => { setSelectedCore(core.id); setScanProgress(0); setIsRunning(false); }}
                      className={`p-4 rounded border cursor-pointer transition-all relative group overflow-hidden
                         ${selectedCore === core.id 
                            ? 'bg-emerald-950/20 border-emerald-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">{core.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase
                             ${core.status === '可再制造' ? 'bg-green-900/30 text-green-400' : 
                               core.status === '待报废' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                          `}>{core.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{core.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Factory size={10}/> {core.origin}</span>
                          <span>在库 {core.days} 天</span>
                       </div>
                       {selectedCore === core.id && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <Microscope size={14} className="text-emerald-500" /> 残值评估 (Evaluation)
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">结构完整性</div>
                    <div className="text-sm font-bold text-white">92%</div>
                 </div>
                 <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">疲劳损伤</div>
                    <div className="text-sm font-bold text-amber-400">Low</div>
                 </div>
              </div>
              <button className="w-full py-2 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-xs rounded hover:bg-emerald-900/40 transition-all uppercase tracking-widest font-bold">
                 生成评估报告
              </button>
           </div>
        </div>

        {/* 中枢：再制造演化 (The Re-Genesis) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#010a05] border border-emerald-900/20 rounded-lg overflow-hidden group">
              {/* 背景格线 */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#010a05_100%)]"></div>

              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <RefreshCw size={14} className={isRunning ? "animate-spin" : ""} />
                          Process Status: {isRunning ? 'RE-MANUFACTURING' : 'STANDBY'}
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          <span className="text-emerald-500">Laser Cladding</span> Chamber
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-emerald-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">修复进度 (Progress)</div>
                       <div className="text-3xl font-mono font-bold text-emerald-400 leading-none mt-1">{(scanProgress*100).toFixed(0)}<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 中部信息：工序状态 */}
                 <div className="absolute top-1/2 left-4 transform -translate-y-1/2 space-y-4 pointer-events-auto">
                    {[
                      { label: '表面清洗 / Cleaning', done: scanProgress > 0.1 },
                      { label: '激光熔覆 / Cladding', done: scanProgress > 0.4 },
                      { label: '精密加工 / Machining', done: scanProgress > 0.7 },
                      { label: '探伤质检 / QC', done: scanProgress > 0.95 },
                    ].map((step, i) => (
                       <div key={i} className={`flex items-center gap-3 transition-all ${step.done ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${step.done ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600 text-slate-600'}`}>
                             {step.done ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{i+1}</span>}
                          </div>
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{step.label}</span>
                       </div>
                    ))}
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Zap size={20} className="text-yellow-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前工艺参数</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Power: 1200W</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <button 
                         onClick={startReman}
                         disabled={isRunning || activeCore.status !== '可再制造'}
                         className={`px-10 py-3 rounded-sm font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center gap-2
                            ${isRunning ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'}
                         `}
                       >
                          <Settings size={16} className={isRunning ? "animate-spin" : ""} />
                          {isRunning ? 'Processing...' : '启动再制造工序'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <RemanThreeScene 
                    activePart={{
                       id: activeCore.id,
                       type: getPartType(activeCore.name),
                       health: 50,
                       process: 'cladding'
                    }}
                    scanProgress={scanProgress}
                    isRunning={isRunning}
                 />
              </div>
           </div>

           {/* 底部：成本效益分析 */}
           <SciFiCard title="再制造经济效益 (Cost Benefit)" subtitle="SAVINGS_MODEL" className="h-56 border-emerald-900/30">
              <div className="h-full w-full flex gap-6">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COST_SAVING_TREND}>
                          <defs>
                             <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorReman" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                          <Area type="monotone" dataKey="newCost" stroke="#ef4444" fill="url(#colorNew)" strokeWidth={2} name="新品采购成本" />
                          <Area type="monotone" dataKey="remanCost" stroke="#10b981" fill="url(#colorReman)" strokeWidth={3} name="再制造成本" />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-60 border-l border-slate-800 pl-6 flex flex-col justify-center gap-4">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均成本节约率</div>
                       <div className="text-3xl font-mono font-bold text-white">62.4%</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">环境效益 (LCA)</div>
                       <div className="flex items-center gap-2">
                          <Leaf size={16} className="text-green-500" />
                          <span className="text-sm text-green-400 font-bold">A+ Grade</span>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：新品性能对标 (Quality & Stock) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="性能对标雷达" subtitle="BENCHMARK">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={PERFORMANCE_COMPARE}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 110]} tick={false} axisLine={false} />
                       <Radar name="新品基准" dataKey="new" stroke="#64748b" strokeWidth={1} fill="transparent" strokeDasharray="5 5" />
                       <Radar name="再制造件" dataKey="reman" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Legend wrapperStyle={{fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                 <div className="inline-block bg-emerald-900/30 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-bold">
                    性能超越新品 2.5%
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="再制造产品库" subtitle="STOCK_OUT" className="flex-1 overflow-hidden border-emerald-900/30 bg-emerald-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { name: '高压油泵 HPP-200', batch: 'RM-2401', stock: 2, status: 'Ready' },
                      { name: '主轴承组件', batch: 'RM-2312', stock: 5, status: 'Ready' },
                      { name: '伺服电机 45kW', batch: 'RM-2402', stock: 1, status: 'Testing' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-900/60 border border-slate-800 p-3 rounded group hover:border-emerald-500/40 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-emerald-600 font-bold">{item.batch}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${item.status === 'Ready' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}
                            `}>{item.status}</span>
                         </div>
                         <div className="text-xs font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{item.name}</div>
                         <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">库存: {item.stock}</span>
                            <span className="text-slate-500 flex items-center gap-1"><Award size={10}/> 质保: 1年</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Package size={16} /> 调拨出库
                 </button>
              </div>
           </SciFiCard>

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
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};
