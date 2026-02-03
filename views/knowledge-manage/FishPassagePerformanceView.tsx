
import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/knowledge-manage/fish-passage/ThreeScene';
import { FishPassageState } from '../../components/knowledge-manage/fish-passage/three-types';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Fish, Waves, Zap, Activity, ShieldCheck, 
  Database, Wind, Droplets, Microscope, 
  AlertTriangle, CheckCircle2, Scan, Workflow,
  Thermometer, Filter, Settings, Search, Info,
  LineChart as LineChartIcon, BarChart as BarChartIcon,
  Volume2, Compass, Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

// --- 模拟数据 ---
const EFFICIENCY_DATA = Array.from({length: 12}, (_, i) => ({
    name: `${i * 2}:00`,
    passRate: 85 + Math.random() * 10,
    flow: 1.2 + Math.sin(i * 0.5) * 0.4
}));

const SPECIES_PIE = [
  { name: '洄游保护品种', value: 45, color: '#10b981' },
  { name: '普通底层鱼类', value: 30, color: '#3b82f6' },
  { name: '幼鱼/鱼苗', value: 25, color: '#f59e0b' },
];

const RECENT_LOGS = [
    { time: '14:32', event: 'AI 识别: 中华鲟 (1.4m)', status: 'Success' },
    { time: '14:15', event: '诱鱼泵频率调至 45Hz', status: 'Process' },
    { time: '13:50', event: '闸门 #3 开启度校准', status: 'Update' },
    { time: '13:10', event: '低水位运行预案激活', status: 'Warning' },
];

export const FishPassagePerformanceView: React.FC = () => {
  const [simState, setSimState] = useState<FishPassageState>('MONITORING');
  const [count, setCount] = useState(15840);

  useEffect(() => {
    const timer = setInterval(() => setCount(prev => prev + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020408] text-slate-100 font-[Rajdhani] p-4 gap-4 overflow-hidden relative">
      
      {/* --- 背景装饰层 --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px]"></div>
      </div>

      {/* --- 顶部：核心 KPI 指挥中心 --- */}
      <header className="z-20 flex items-center justify-between bg-slate-900/40 border border-white/10 p-5 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
             <Fish size={32} className="text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 mb-1 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> Ecological Infrastructure Dashboard
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               过鱼设施 <span className="text-emerald-500 italic">运行效能档案</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">年度过鱼量 (YTD)</div>
            <div className="text-3xl font-mono font-black text-white leading-none">
              {count.toLocaleString()} <span className="text-xs text-slate-600 font-normal">UNIT</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800 self-center"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">通道健康度</div>
            <div className="text-3xl font-mono font-black text-emerald-400 leading-none">98.4<span className="text-xs font-normal text-slate-600">%</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800 self-center"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统能效等级</div>
            <div className="text-3xl font-mono font-black text-cyan-400 leading-none">A+</div>
          </div>
        </div>
      </header>

      {/* --- 主体内容区 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* 左侧：实时监测与 AI 识别 */}
        <section className="w-[340px] flex flex-col gap-4 flex-shrink-0 overflow-y-auto custom-scrollbar">
           <SciFiCard title="AI 视觉识别系统" subtitle="VISION AI" className="border-emerald-900/30">
              <div className="flex flex-col gap-4 h-full">
                  <div className="aspect-video bg-black rounded border border-emerald-500/20 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20"></div>
                      <Scan className="text-emerald-500 opacity-40 animate-pulse" size={48} />
                      <div className="absolute top-2 left-2 text-[8px] bg-emerald-600 text-white px-1">CAM-01 LIVE</div>
                      {/* 扫描线动画 */}
                      <div className="absolute w-full h-0.5 bg-emerald-500/50 shadow-[0_0_10px_#10b981] animate-[scan_3s_linear_infinite]"></div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] font-mono">
                      {RECENT_LOGS.map((log, i) => (
                          <div key={i} className="flex justify-between p-2 bg-slate-900/60 border border-slate-800 rounded group hover:border-emerald-500/50 transition-colors">
                              <span className="text-emerald-500">{log.time}</span>
                              <span className="text-slate-200 truncate mx-2">{log.event}</span>
                              <span className="text-slate-600">{log.status}</span>
                          </div>
                      ))}
                  </div>
                  
                  <button className="w-full py-2 bg-slate-800 hover:bg-emerald-900/40 text-xs font-bold border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                      <Database size={14} /> 调取结构化档案库
                  </button>
              </div>
           </SciFiCard>

           <SciFiCard title="物种多样性分布" subtitle="DIVERSITY" className="h-[240px] border-emerald-900/30">
               <div className="h-full w-full flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={SPECIES_PIE}
                             cx="50%" cy="50%"
                             innerRadius={45}
                             outerRadius={65}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                           >
                             {SPECIES_PIE.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none', borderRadius: '8px'}} />
                           {/* Added Legend to the import from recharts to fix the error */}
                           <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </section>

        {/* 中央：3D 孪生与效能分析 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           {/* 3D 容器 */}
           <div className="flex-1 bg-black border border-white/5 rounded-2xl overflow-hidden relative shadow-inner group">
               <ThreeScene state={simState} />

               {/* 3D 浮层控制器 */}
               <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-none">
                   <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-lg flex flex-col border-l-4 border-l-emerald-500 shadow-xl">
                       <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Digital Twin Status</span>
                       <h2 className="text-xl font-bold text-white uppercase italic">{simState}</h2>
                       <div className="mt-2 text-[10px] text-slate-400 max-w-[200px]">
                           正在实时渲染过鱼通道 #04 断面水流动力学仿真，基于 LEO 卫星数据同步。
                       </div>
                   </div>

                   <div className="pointer-events-auto flex gap-2">
                       {['MONITORING', 'PEAK_SEASON', 'MAINTENANCE'].map(s => (
                           <button 
                             key={s}
                             onClick={() => setSimState(s as any)}
                             className={`px-3 py-1 text-[9px] font-black uppercase rounded-full transition-all border
                                ${simState === s ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black/60 border-white/10 text-slate-500 hover:text-white'}
                             `}
                           >
                               {s}
                           </button>
                       ))}
                   </div>
               </div>

               {/* 右侧实时气泡 */}
               <div className="absolute top-4 right-4 flex flex-col gap-2 items-end pointer-events-none">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-white/10 flex flex-col items-end">
                       <span className="text-[9px] text-emerald-400 font-bold">诱鱼声波频率</span>
                       <span className="text-xl font-mono text-white">425.2 <span className="text-xs text-slate-500">Hz</span></span>
                   </div>
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-white/10 flex flex-col items-end">
                       <span className="text-[9px] text-cyan-400 font-bold">出口表面流速</span>
                       <span className="text-xl font-mono text-white">1.18 <span className="text-xs text-slate-500">m/s</span></span>
                   </div>
               </div>
           </div>

           {/* 下部效能图表 */}
           <div className="h-[200px] bg-slate-900/40 border border-white/5 rounded-2xl p-4">
               <div className="flex justify-between items-center mb-2 px-2">
                   <div className="flex items-center gap-2">
                       <LineChartIcon size={14} className="text-emerald-500" />
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">过鱼效率与水流关联分析 (Efficiency Curve)</span>
                   </div>
                   <div className="flex gap-4 text-[10px] text-slate-500">
                       <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500"></div> 通行达标率</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-500"></div> 平均流速</span>
                   </div>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={EFFICIENCY_DATA}>
                       <defs>
                           <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#475569" tick={{fontSize: 10}} />
                       <YAxis stroke="#475569" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none', color: '#fff'}} />
                       <Area type="monotone" dataKey="passRate" stroke="#10b981" fill="url(#effGrad)" strokeWidth={2} />
                       <Line type="monotone" dataKey="flow" stroke="#0ea5e9" strokeWidth={1} dot={false} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </section>

        {/* 右侧：环境因子与运维 */}
        <section className="w-[300px] flex flex-col gap-4 flex-shrink-0">
           
           <SciFiCard title="生境监测因子" subtitle="ECO-SENSORS" className="border-emerald-900/30">
               <div className="grid grid-cols-2 gap-4 h-full content-center">
                   <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center">
                       <Thermometer size={18} className="text-orange-400 mb-1" />
                       <span className="text-lg font-bold text-white font-mono">18.5°C</span>
                       <span className="text-[9px] text-slate-500 uppercase">Water Temp</span>
                   </div>
                   <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center">
                       <Droplets size={18} className="text-blue-400 mb-1" />
                       <span className="text-lg font-bold text-white font-mono">8.2</span>
                       <span className="text-[9px] text-slate-500 uppercase">Dissolved O2</span>
                   </div>
                   <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center">
                       <Activity size={18} className="text-emerald-400 mb-1" />
                       <span className="text-lg font-bold text-white font-mono">7.4</span>
                       <span className="text-[9px] text-slate-500 uppercase">pH Level</span>
                   </div>
                   <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center">
                       <Wind size={18} className="text-cyan-400 mb-1" />
                       <span className="text-lg font-bold text-white font-mono">15%</span>
                       <span className="text-[9px] text-slate-500 uppercase">Turbidity</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="设施运维状态" subtitle="MAINTENANCE" className="flex-1 border-emerald-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">拦污栅清洁度</span>
                           <span className="text-emerald-400">Normal</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full w-[92%]"></div>
                       </div>

                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">闸门执行器油压</span>
                           <span className="text-emerald-400">Stable</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full w-[85%]"></div>
                       </div>

                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">声学诱鱼机负载</span>
                           <span className="text-yellow-400">Warning</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full w-[45%]"></div>
                       </div>
                   </div>

                   <div className="mt-auto space-y-2">
                       <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-all">
                           <Settings size={14} /> 启动声学设备自检
                       </button>
                       <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-2">
                           <AlertTriangle size={14} className="text-red-500 shrink-0" />
                           <span className="text-[10px] text-red-300/80 leading-tight">当前下游水位波动剧烈，建议开启 2# 诱鱼补水泵以平衡压差。</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </section>
      </main>

      {/* --- 底部状态栏 --- */}
      <footer className="z-20 h-16 grid grid-cols-5 gap-4">
         <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400"><Volume2 size={20}/></div>
            <div>
               <div className="text-[9px] text-slate-500 uppercase font-black">诱鱼频率</div>
               <div className="text-lg font-mono font-bold text-white">425Hz</div>
            </div>
         </div>
         <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400"><Compass size={20}/></div>
            <div>
               <div className="text-[9px] text-slate-500 uppercase font-black">水流矢量</div>
               <div className="text-lg font-mono font-bold text-white">NNE 2.4°</div>
            </div>
         </div>
         <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-orange-600/20 rounded-lg text-orange-400"><Gauge size={20}/></div>
            <div>
               <div className="text-[9px] text-slate-500 uppercase font-black">通道动压</div>
               <div className="text-lg font-mono font-bold text-white">12.5 <span className="text-xs">kPa</span></div>
            </div>
         </div>
         <div className="col-span-2 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl flex items-center justify-between px-6 overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Info size={20} /></div>
               <div className="text-[11px] font-bold text-emerald-300 leading-tight">
                  <span className="block opacity-60 text-[9px] uppercase mb-0.5">Knowledge Engine AI</span>
                  当前生态模型建议：维持现有流量，气泡幕墙可降低 10% 功率。
               </div>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg shadow-emerald-900/40 relative z-10">Apply</button>
            {/* 装饰光效 */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full"></div>
         </div>
      </footer>

      {/* --- 全屏扫描动画样式 --- */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(180px); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
