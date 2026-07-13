
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/turbine-cavitation/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-turbine-cavitation]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-turbine-cavitation';
import { CavitationSimState } from '../../components/knowledge-manage/turbine-cavitation/three-types';
import { 
  Waves, Search, AlertTriangle, FileText, 
  Activity, Zap, Clock, Database, 
  ArrowRight, Layers, BarChart4, Share2, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const CASE_LIBRARY = [
  { id: 'C-2023-01', title: '叶片进水边气蚀 (Leading Edge)', date: '2023-03-15', severity: 'High', type: 'Inlet' },
  { id: 'C-2022-12', title: '泄水锥涡带气蚀 (Cone Vortex)', date: '2022-11-20', severity: 'Med', type: 'Vortex' },
  { id: 'C-2022-08', title: '叶片背面翼型气蚀 (Suction Side)', date: '2022-08-05', severity: 'High', type: 'Profile' },
  { id: 'C-2021-04', title: '下环间隙气蚀 (Gap Cavitation)', date: '2021-04-12', severity: 'Low', type: 'Gap' },
];

const EROSION_STATS = [
  { name: '0-2mm', value: 45, fill: '#0ea5e9' },
  { name: '2-5mm', value: 30, fill: '#f59e0b' },
  { name: '>5mm', value: 25, fill: '#ef4444' },
];

const OPERATING_CONDITIONS = Array.from({length: 20}, (_, i) => ({
    time: i,
    sigma: 0.03 + Math.sin(i*0.5) * 0.01 + (i > 10 ? -0.015 : 0), // Thoma number
    limit: 0.025
}));

export const TurbineCavitationView: React.FC = () => {
  const [simState, setSimState] = useState<CavitationSimState>('IDLE');
  const [selectedCase, setSelectedCase] = useState(CASE_LIBRARY[0]);

  const handleCaseSelect = (c: any) => {
      setSelectedCase(c);
      setSimState('CASE_FOCUS');
      // Reset to idle after a bit or keep focused?
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_#0ea5e9_0%,_transparent_60%)]"></div>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
             <Waves size={28} className="text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Operations Knowledge Graph
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水轮机汽蚀破坏 <span className="text-cyan-500 italic">案例图谱</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Cases</div>
                <div className="text-2xl font-mono font-black text-white">1,248</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Avg Repair Cost</div>
                <div className="text-2xl font-mono font-black text-orange-400">¥ 12.5<span className="text-sm">W</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Case Library --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="历史案例库" subtitle="ARCHIVE" className="flex-1 border-cyan-900/30 bg-[#080c14]/90">
              <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="搜索机组型号、气蚀类型..." 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                   />
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {CASE_LIBRARY.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => handleCaseSelect(c)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                           ${selectedCase.id === c.id ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                        `}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-white group-hover:text-cyan-400">{c.title}</span>
                              <span className={`text-[9px] px-1.5 rounded font-black ${c.severity === 'High' ? 'bg-red-900/40 text-red-400' : c.severity === 'Med' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>
                                  {c.severity}
                              </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>ID: {c.id}</span>
                              <span>{c.date}</span>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
               <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                   <BarChart4 size={12}/> 损伤深度分布
               </div>
               <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={EROSION_STATS}
                             cx="50%"
                             cy="50%"
                             innerRadius={25}
                             outerRadius={40}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {EROSION_STATS.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.fill} />
                             ))}
                           </Pie>
                           <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '9px'}} iconSize={8}/>
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #333'}} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </div>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-2xl group">
               
               {/* 3D Scene */}
               <ThreeScene state={simState} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-4 rounded-sm flex flex-col border-l-4 border-l-cyan-500">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Database size={10}/> Active Case
                       </div>
                       <div className="text-xl font-black text-white">{selectedCase.title}</div>
                       <div className="text-xs text-slate-400 mt-1">{selectedCase.id} | Type: {selectedCase.type}</div>
                   </div>
               </div>

               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   <button 
                     onClick={() => setSimState('IDLE')}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${simState === 'IDLE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                   >
                       模型概览
                   </button>
                   <button 
                     onClick={() => setSimState('FLOW_SIM')}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${simState === 'FLOW_SIM' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                   >
                       流场仿真
                   </button>
                   <button 
                     onClick={() => setSimState('DAMAGE_MAP')}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${simState === 'DAMAGE_MAP' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                   >
                       损伤热图
                   </button>
               </div>
           </div>

           {/* Cavitation Coefficient Trend */}
           <div className="h-[180px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>气蚀系数 (Thoma Number σ) 历史曲线</span>
                   <span className="text-cyan-500">Safe Limit: &gt; 0.025</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={OPERATING_CONDITIONS}>
                       <defs>
                           <linearGradient id="sigmaGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 0.06]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                       <ReferenceLine y={0.025} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Critical', fill:'red', fontSize:10}} />
                       <Area type="monotone" dataKey="sigma" stroke="#0ea5e9" fill="url(#sigmaGrad)" strokeWidth={2} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Knowledge Detail --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="损伤机理分析" subtitle="MECHANISM" className="border-cyan-900/30">
               <div className="p-3 text-sm text-slate-300 leading-relaxed bg-slate-900/50 rounded border border-slate-800">
                   <p className="mb-2">
                       <strong className="text-cyan-400">失效模式：</strong> 
                       局部压力降低至饱和蒸汽压以下，产生气泡。气泡流至高压区溃灭，产生微射流冲击叶片表面，导致疲劳剥蚀。
                   </p>
                   <p>
                       <strong className="text-orange-400">关联工况：</strong> 
                       低水头、大流量、负荷频繁波动。
                   </p>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-4">
                   <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-700">
                       <div className="text-[10px] text-slate-500 uppercase">Cavitation Noise</div>
                       <div className="text-lg font-bold text-white">85 dB</div>
                   </div>
                   <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-700">
                       <div className="text-[10px] text-slate-500 uppercase">Mass Loss Rate</div>
                       <div className="text-lg font-bold text-red-400">12 g/h</div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="修复与防护策略" subtitle="SOLUTION" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-start gap-3 p-3 bg-green-900/10 border border-green-900/30 rounded cursor-pointer hover:bg-green-900/20 transition-colors">
                       <Zap size={18} className="text-green-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-green-200">补焊修复工艺</div>
                           <div className="text-[10px] text-green-100/70">使用奥氏体不锈钢焊条进行多层堆焊，焊后打磨恢复型线。</div>
                       </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 bg-blue-900/10 border border-blue-900/30 rounded cursor-pointer hover:bg-blue-900/20 transition-colors">
                       <Layers size={18} className="text-blue-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-blue-200">抗气蚀涂层</div>
                           <div className="text-[10px] text-blue-100/70">应用 HVOF 超音速火焰喷涂碳化钨涂层，提高表面硬度。</div>
                       </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 bg-orange-900/10 border border-orange-900/30 rounded cursor-pointer hover:bg-orange-900/20 transition-colors">
                       <Settings size={18} className="text-orange-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-orange-200">运行优化</div>
                           <div className="text-[10px] text-orange-100/70">避开低负荷振动区，优化协联曲线，提高尾水位。</div>
                       </div>
                   </div>
               </div>
               
               <button className="mt-auto w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all border border-slate-600">
                   <Share2 size={14} /> 分享案例至知识库
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
