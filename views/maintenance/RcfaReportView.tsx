
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileWarning, 
  Search, 
  GitMerge, 
  ShieldAlert, 
  Zap, 
  Dna, 
  Microscope, 
  ClipboardCheck, 
  TrendingUp, 
  History, 
  Layers, 
  Cpu, 
  Activity, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Target,
  FlaskConical,
  Flame,
  Binary,
  Gavel,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';

// --- 模拟 RCFA 深度数据 ---

const WHY_CHAIN = [
  { level: 1, text: "表面现象：#2 轴承过热并停机", sub: "传感器触发 T-H 保护值 95°C" },
  { level: 2, text: "直接原因：润滑油膜连续性破裂", sub: "油压下降至 0.15MPa" },
  { level: 3, text: "中间原因：油泵输出效率衰减", sub: "变频器输出电流异常摆动" },
  { level: 4, text: "根本原因：泵轴承支架共振疲劳断裂", sub: "特征频率 42.5Hz 引起应力集中" },
  { level: 5, text: "系统缺陷：缺乏高频振动预防性检测", sub: "CBM 算法未包含此类谐波预警" },
];

const ELEMENTS_MATRIX = [
  { subject: '人 (Human)', A: 20, fullMark: 100, info: '操作规范' },
  { subject: '机 (Machine)', A: 95, fullMark: 100, info: '结构失效' },
  { subject: '料 (Material)', A: 45, fullMark: 100, info: '材质疲劳' },
  { subject: '法 (Method)', A: 60, fullMark: 100, info: '策略缺失' },
  { subject: '环 (Environment)', A: 10, fullMark: 100, info: '环境稳定' },
];

const PHYSICAL_ANOMALY = [
  { time: '-10min', temp: 65, vib: 1.2 },
  { time: '-5min', temp: 68, vib: 1.5 },
  { time: '-2min', temp: 75, vib: 4.8 },
  { time: '0min', temp: 95, vib: 12.4 }, // Failure point
  { time: '+2min', temp: 80, vib: 0.1 },
];

const CAPA_blueprint = [
  { id: 'CAPA-01', title: '硬件加固：更换高刚性支撑件', owner: '工程部', due: '04-15', status: 'In-Progress' },
  { id: 'CAPA-02', title: '算法更新：集成 1X-5X 谐波预警', owner: 'IT中心', due: '04-10', status: 'Pending' },
  { id: 'CAPA-03', title: '规程迭代：增加润滑泵站离线精检', owner: '维保组', due: '04-20', status: 'Pending' },
];

export const RcfaReportView: React.FC = () => {
  const [activeWhy, setActiveWhy] = useState(4); // 默认高亮根因

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：鉴证报告抬头 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-orange-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)] border border-orange-400/50 relative group">
              <Microscope size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-orange-500/10 rounded-sm animate-pulse"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Failure Forensic & Root Cause Analysis
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 故障根因 <span className="text-orange-500 italic">鉴证分析报告</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">事故编号</div>
              <div className="text-xl font-mono font-bold text-white">RCFA-202404-001</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">严重指数</div>
              <div className="text-xl font-mono font-bold text-red-500">LEVEL-4</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">分析信度</div>
              <div className="text-xl font-mono font-bold text-cyan-400">96.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：5-Whys 逻辑穿透链 (The Causality Chain) */}
        <div className="xl:col-span-4 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><GitMerge size={14} className="text-orange-500" /> 逻辑穿透链 (5-Whys)</span>
              <span>Root Cause Discovery</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 px-1 pb-4">
              {WHY_CHAIN.map((step, idx) => (
                <div 
                  key={step.level}
                  onClick={() => setActiveWhy(idx)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeWhy === idx 
                      ? 'bg-orange-950/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)] scale-[1.02]' 
                      : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                       ${activeWhy === idx ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-800 text-slate-500 border-slate-700'}
                    `}>
                       {step.level}
                    </div>
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${activeWhy === idx ? 'text-orange-400' : 'text-slate-600'}`}>
                       Iteration Why-{step.level}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{step.text}</div>
                  <div className="text-[10px] text-slate-400 font-mono italic">{step.sub}</div>
                  
                  {idx < WHY_CHAIN.length - 1 && (
                     <div className="absolute -bottom-4 left-6 h-4 w-0.5 bg-slate-800 z-0"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="专家结论摘要" subtitle="EXPERT_OPINION" className="bg-orange-950/5 border-orange-900/20">
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-orange-600/20 rounded text-orange-400">
                    <Gavel size={24} />
                 </div>
                 <div className="text-xs text-slate-400 leading-relaxed">
                    “本次失效属于典型的<span className="text-white font-bold mx-1">共振诱发结构疲劳</span>。建议立即对全线泵房支架进行模态测试，并调整调速器频率避开 42Hz 敏感区。”
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：要素收敛矩阵与物理鉴证 (Analysis Workbench) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-slate-800/50 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs mb-1">
                          <Binary size={14} className="animate-pulse" />
                          FACTOR CONVERGENCE MATRIX
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          多维要素 <span className="text-orange-500 italic">冲突分析场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-orange-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">主要冲突因子</div>
                       <div className="text-2xl font-bold text-white leading-none mt-1">机械失效 (M)</div>
                    </div>
                 </div>

                 {/* 底部信息条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Target size={20} className="text-red-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">事故触发源</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Weld-Crack Area #04</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20">调取高清取证</button>
                    </div>
                 </div>
              </div>

              {/* 中央可视化：雷达图 (要素分析) */}
              <div className="flex-1 w-full pointer-events-auto flex items-center justify-center relative">
                 <div className="w-full h-full max-h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ELEMENTS_MATRIX}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar 
                             name="贡献度" 
                             dataKey="A" 
                             stroke="#f97316" 
                             strokeWidth={3} 
                             fill="#f97316" 
                             fillOpacity={0.2} 
                          />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #7c2d12', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-orange-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-orange-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-orange-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-orange-500/40"></div>
           </div>

           {/* 底部：异常特征曲线 (Physical Forensic) */}
           <SciFiCard title="事故瞬态物理特征曲线" subtitle="TRANSIENT_FORENSIC" className="h-60">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PHYSICAL_ANOMALY}>
                       <defs>
                          <linearGradient id="colorTempRecord" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} fill="url(#colorTempRecord)" name="温度指数" />
                       <Line type="monotone" dataKey="vib" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="振动振幅" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：证据库与 CAPA 蓝图 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="现场数字证据库" subtitle="EVIDENCE_LOCKER">
              <div className="grid grid-cols-2 gap-2 py-2">
                 {[
                   { label: '断裂截面', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=150', tag: 'Micro' },
                   { label: '油品检测', img: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?q=80&w=150', tag: 'Lab' },
                 ].map((item, i) => (
                    <div key={i} className="group relative aspect-square bg-slate-900 rounded overflow-hidden border border-slate-800 hover:border-orange-500 transition-all cursor-zoom-in">
                       <img src={item.img} alt={item.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[9px] text-white font-bold">{item.label}</span>
                          <span className="text-[8px] text-orange-500 font-mono uppercase">{item.tag} DATA</span>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-2 py-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                 <History size={12} /> 调阅历史故障拓扑
              </button>
           </SciFiCard>

           <SciFiCard title="CAPA 治理蓝图" subtitle="CAPA_SYSTEM" className="flex-1 border-orange-900/30 bg-orange-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {CAPA_blueprint.map(capa => (
                      <div key={capa.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-sm relative overflow-hidden group hover:border-orange-500/50 transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-orange-500 font-bold">{capa.id}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${capa.status === 'In-Progress' ? 'bg-orange-900/30 text-orange-400' : 'bg-slate-800 text-slate-500'}
                            `}>{capa.status}</span>
                         </div>
                         <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{capa.title}</h4>
                         <div className="flex justify-between items-center mt-3 text-[9px] text-slate-500 uppercase font-bold">
                            <span>负责人: {capa.owner}</span>
                            <span className="flex items-center gap-1"><Clock size={10} /> {capa.due}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-widest">
                       <span>整改任务同步状态</span>
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold text-xs uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <ClipboardCheck size={16} /> 下发治理指令集
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">生成 PDF 分析报告</div>
                    <div className="text-xs font-bold text-white">Full_RCFA_Report.v4</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-orange-500 transition-colors" />
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
          background: rgba(249, 115, 22, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.6);
        }
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Clock = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
