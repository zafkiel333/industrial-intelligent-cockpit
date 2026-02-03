
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RefurbishThreeScene } from '../../components/spare_parts_refurbish/ThreeScene';
import { 
  Recycle, 
  Wrench, 
  ScanLine, 
  Zap, 
  Thermometer, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertOctagon, 
  FileText, 
  Layers,
  ArrowRight,
  Microscope,
  Flame,
  Leaf,
  DollarSign,
  Scale
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Line, Legend
} from 'recharts';

// --- MOCK DATA ---
const REFURBISH_QUEUE = [
  { id: 'RF-2024-001', name: '主轴承内圈', type: 'shaft', status: 'Processing', progress: 45, value: 12000 },
  { id: 'RF-2024-002', name: '液压缸体 A', type: 'shaft', status: 'Pending', progress: 0, value: 8500 },
  { id: 'RF-2024-003', name: '行星齿轮组', type: 'gear', status: 'Finished', progress: 100, value: 4500 },
];

const COST_BENEFIT_DATA = [
  { name: '新件采购', value: 12000, color: '#ef4444' },
  { name: '翻新成本', value: 3500, color: '#10b981' },
];

const PERFORMANCE_RECOVERY = [
  { subject: '表面硬度', before: 60, after: 95, full: 100 },
  { subject: '尺寸精度', before: 40, after: 98, full: 100 },
  { subject: '耐腐蚀性', before: 50, after: 92, full: 100 },
  { subject: '疲劳强度', before: 70, after: 90, full: 100 },
  { subject: '表面光洁', before: 30, after: 95, full: 100 },
];

const PROCESS_LOG = Array.from({length: 20}, (_, i) => ({
  time: i,
  temp: 800 + Math.random() * 200, // Cladding temp
  thickness: 0.1 * i,
}));

export const PartsRefurbishView: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState(REFURBISH_QUEUE[0].id);
  const [stage, setStage] = useState<'scanning' | 'cladding' | 'machining' | 'finished'>('scanning');
  const [progress, setProgress] = useState(0);
  const [laserPower, setLaserPower] = useState(0);
  
  const activeJob = REFURBISH_QUEUE.find(j => j.id === selectedJobId) || REFURBISH_QUEUE[0];

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (stage === 'cladding') {
       interval = setInterval(() => {
          setProgress(p => {
             if (p >= 100) {
                setStage('finished');
                setLaserPower(0);
                return 100;
             }
             return p + 0.5;
          });
          setLaserPower(80 + Math.random() * 20);
       }, 50);
    } else if (stage === 'scanning') {
       interval = setInterval(() => {
          setProgress(p => {
             if (p >= 100) {
                setStage('cladding');
                setProgress(0);
                return 100;
             }
             return p + 2;
          });
       }, 50);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const startProcess = () => {
     setStage('scanning');
     setProgress(0);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：再生实验室抬头 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/50 relative group">
              <Recycle size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-indigo-500/10 rounded animate-[pulse_3s_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Advanced Remanufacturing Lab
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件维修 <span className="text-indigo-500 italic">激光增材翻新中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">再生价值 (ROI)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">345%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">碳减排量</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">4.2 <span className="text-xs text-slate-600">tCO2</span></div>
           </div>
           <button 
             onClick={startProcess}
             disabled={stage !== 'finished' && progress > 0}
             className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-sm text-xs font-bold transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <Zap size={14} /> 启动再制造
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：翻新队列与损伤评估 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="待修复资产队列" subtitle="REPAIR_QUEUE" highlight className="flex-1 border-indigo-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {REFURBISH_QUEUE.map(job => (
                    <div 
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                         ${selectedJobId === job.id 
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">{job.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${job.status === 'Processing' ? 'bg-amber-900/30 text-amber-400 animate-pulse' : 
                               job.status === 'Finished' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}
                          `}>{job.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{job.name}</div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-indigo-500 transition-all duration-500" 
                             style={{width: `${job.progress}%`}}
                          ></div>
                       </div>
                       <div className="mt-2 flex justify-between text-[9px] text-slate-500">
                          <span>原值: ¥{(job.value * 2.5).toLocaleString()}</span>
                          <span>修复预算: ¥{job.value.toLocaleString()}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/60 border border-slate-800 rounded relative group overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 mb-3">
                 <ScanLine size={14} /> 损伤深度扫描
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-[9px] text-slate-500 uppercase">最大磨损深度</div>
                    <div className="text-xl font-mono font-bold text-white">2.4 <span className="text-xs text-slate-600">mm</span></div>
                 </div>
                 <div>
                    <div className="text-[9px] text-slate-500 uppercase">需熔覆体积</div>
                    <div className="text-xl font-mono font-bold text-orange-400">12.5 <span className="text-xs text-slate-600">cm³</span></div>
                 </div>
              </div>
              <div className="absolute inset-0 border border-red-500/10 rounded pointer-events-none group-hover:border-red-500/30 transition-colors"></div>
           </div>
        </div>

        {/* 中枢：3D 激光熔覆工作台 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded-lg overflow-hidden group">
              
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Zap size={14} className={laserPower > 0 ? "text-yellow-400 animate-pulse" : ""} />
                          Laser Cladding System: {laserPower > 0 ? 'FIRING' : 'IDLE'}
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          Additive <span className="text-indigo-500">Repair</span> Cell
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">熔池温度</div>
                       <div className="text-3xl font-mono font-bold text-orange-400 leading-none mt-1">
                          {laserPower > 0 ? (1200 + Math.random()*50).toFixed(0) : 25} <span className="text-sm font-normal text-slate-600">°C</span>
                       </div>
                    </div>
                 </div>

                 {/* 实时参数仪表 */}
                 <div className="flex gap-4 items-end pointer-events-auto">
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex flex-col w-32 backdrop-blur-sm">
                       <span className="text-[9px] text-slate-500 uppercase font-bold mb-1">送粉速率</span>
                       <div className="text-lg font-bold text-white font-mono">12.5 <span className="text-xs text-slate-600">g/min</span></div>
                       <div className="h-1 w-full bg-slate-700 rounded-full mt-1">
                          <div className="h-full bg-green-500" style={{width: '60%'}}></div>
                       </div>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex flex-col w-32 backdrop-blur-sm">
                       <span className="text-[9px] text-slate-500 uppercase font-bold mb-1">激光功率</span>
                       <div className="text-lg font-bold text-white font-mono">{laserPower.toFixed(0)} <span className="text-xs text-slate-600">%</span></div>
                       <div className="h-1 w-full bg-slate-700 rounded-full mt-1">
                          <div className="h-full bg-red-500" style={{width: `${laserPower}%`}}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <RefurbishThreeScene 
                    stage={stage}
                    progress={progress}
                    laserPower={laserPower}
                    partType={activeJob.type as any}
                 />
              </div>
           </div>

           {/* 底部：过程监控曲线 */}
           <SciFiCard title="熔覆过程热力监测" subtitle="PROCESS_CONTROL" className="h-56 border-indigo-900/30" noPadding>
              <div className="h-full w-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PROCESS_LOG}>
                       <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 1500]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} fill="url(#colorTemp)" name="熔池温度" />
                       <Line type="monotone" dataKey="thickness" stroke="#0ea5e9" strokeWidth={2} dot={false} name="熔覆层厚度" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：价值分析与质检 (Value & QA) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="经济效益对比" subtitle="COST_BENEFIT">
              <div className="h-48 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COST_BENEFIT_DATA} layout="vertical" barGap={2}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={60} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                          {COST_BENEFIT_DATA.map((entry, index) => (
                             <Cell key={index} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800 flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold">单件节约</span>
                 <span className="text-lg font-mono font-bold text-green-400">¥ 8,500</span>
              </div>
           </SciFiCard>

           <SciFiCard title="性能恢复验证" subtitle="QA_RESULT">
              <div className="h-52 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={PERFORMANCE_RECOVERY}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="修复后" dataKey="after" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                       <Radar name="修复前" dataKey="before" stroke="#ef4444" strokeWidth={1} fill="transparent" strokeDasharray="3 3" />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Legend verticalAlign="top" height={30} wrapperStyle={{fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded flex items-center justify-between group cursor-pointer hover:bg-emerald-900/20 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-900/30 rounded text-emerald-400"><Leaf size={16} /></div>
                 <div>
                    <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest">循环经济贡献</div>
                    <div className="text-xs font-bold text-white">Carbon Credit: +120</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-emerald-500" />
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
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};
