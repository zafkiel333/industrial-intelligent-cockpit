
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
// Added ScanLine to fix "Cannot find name 'ScanLine'" error
import { 
  ShieldAlert, Radio, Fingerprint, Search, 
  Database, MapPin, Globe, History, 
  Share2, FileText, ChevronRight, Zap,
  Activity, Cpu, Eye, Scale,
  Terminal, Network, Filter, AlertTriangle,
  ScanLine
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  CartesianGrid, AreaChart, Area, ScatterChart, Scatter, 
  ZAxis, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- 模拟异常特征库数据 ---

const ANOMALY_CATEGORIES = [
  { id: 'pos-spoofing', label: '轨迹/位置欺骗', type: 'Dynamic', count: 124, risk: 'Critical', color: '#ef4444' },
  { id: 'identity-theft', label: '身份标识冒用', type: 'Static', count: 42, risk: 'High', color: '#a855f7' },
  { id: 'dark-vessel', label: '关闭/屏蔽信号', type: 'Communication', count: 215, risk: 'High', color: '#f59e0b' },
  { id: 'rendezvous', label: '非法海上集结', type: 'Behavior', count: 86, risk: 'Medium', color: '#0ea5e9' },
  { id: 'loitering', label: '异常滞留/徘徊', type: 'Behavior', count: 154, risk: 'Low', color: '#10b981' },
];

const TRAJECTORY_DATA = {
  normal: Array.from({length: 20}, (_, i) => ({ x: i, y: i * 0.5 + 10 })),
  anomalous: [
    { x: 0, y: 10 }, { x: 2, y: 11 }, { x: 4, y: 12 }, 
    { x: 6, y: 13 }, { x: 8, y: 25 }, // Sudden Jump
    { x: 10, y: 26 }, { x: 12, y: 12 }, // Sudden Return
    { x: 14, y: 13 }, { x: 16, y: 14 }, { x: 18, y: 15 },
  ]
};

const FREQUENCY_STATS = [
  { name: '南海', value: 35, fill: '#ef4444' },
  { name: '马六甲海峡', value: 25, fill: '#f59e0b' },
  { name: '东海', value: 20, fill: '#0ea5e9' },
  { name: '亚丁湾', value: 20, fill: '#a855f7' },
];

const LOGIC_FLOW = [
  { id: 1, title: '数据清洗', desc: '过滤无效坐标点及非标准化MMSI。' },
  { id: 2, title: '运动学校验', desc: '计算相邻点瞬时航速，判断是否超过船舶物理极限（如：> 50kn）。' },
  { id: 3, title: '时空关联计算', desc: '通过多基站交叉定位，对冲AIS广播坐标。' },
  { id: 4, title: '综合得分评估', desc: '结合历史行为记录，输出异常概率评分。' },
];

export const AisAnomalyKbView: React.FC = () => {
  const [activeId, setActiveId] = useState('pos-spoofing');
  const activeDetail = ANOMALY_CATEGORIES.find(c => c.id === activeId) || ANOMALY_CATEGORIES[0];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 overflow-hidden relative">
      
      {/* 背景装饰：数据流动画 */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.05)_0%,_transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10" 
               style={{ backgroundImage: 'linear-gradient(#065f46 1px, transparent 1px), linear-gradient(90deg, #065f46 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
      </div>

      {/* --- 顶部：核心概览 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
             <Fingerprint size={36} className="text-emerald-400" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Radio size={14} className="animate-pulse" /> Global AIS Surveillance Knowledge Base
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               船舶自动识别系统 <span className="text-emerald-500 italic">异常行为特征库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">收录异常模式</div>
              <div className="text-2xl font-mono font-black text-white leading-none">12 <span className="text-xs text-slate-600 font-normal">MODELS</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">今日自动拦截</div>
              <div className="text-2xl font-mono font-black text-red-400 leading-none">1,452 <span className="text-xs text-red-900 font-normal">EVENTS</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">知识库版本</div>
              <div className="text-xl font-mono font-black text-emerald-400 leading-none">V4.2.0-SIG</div>
           </div>
        </div>
      </header>

      {/* --- 主体区域 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* 左侧：异常谱系导航 */}
        <section className="w-[300px] flex flex-col gap-4">
           <SciFiCard title="异常模式分类" subtitle="TAXONOMY" className="flex-1 border-emerald-900/30">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {ANOMALY_CATEGORIES.map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => setActiveId(cat.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                        ${activeId === cat.id ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        {activeId === cat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
                        
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">{cat.label}</span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                              ${cat.risk === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                {cat.risk}
                           </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                            <span>{cat.type}</span>
                            <span>{cat.count} 案例</span>
                        </div>
                        {activeId === cat.id && (
                            <div className="absolute right-0 top-0 h-full w-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        )}
                    </div>
                  ))}
                  <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded text-[10px] text-slate-500 uppercase font-black transition-all">
                      + 录入新异常特征
                  </button>
              </div>
           </SciFiCard>

           <SciFiCard title="全球高频预警区" subtitle="RISK ZONES" className="h-[240px] border-emerald-900/30">
                <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={FREQUENCY_STATS}
                             cx="50%" cy="50%"
                             innerRadius={35}
                             outerRadius={55}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                           >
                             {FREQUENCY_STATS.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.fill} />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Legend verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{fontSize: '9px', paddingBottom: '10px'}} />
                       </PieChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* 中央：特征模式分析 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 特征指纹波形对比 */}
           <div className="flex-1 bg-black/40 border border-emerald-900/30 rounded-2xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex flex-col p-6">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <ScanLine size={14} /> Feature Pattern Visualizer
                    </span>
                    <h2 className="text-2xl font-black text-white italic">{activeDetail.label}模式指纹</h2>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-slate-600"></div>
                        <span className="text-[10px] text-slate-500">正常轨迹</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-emerald-500"></div>
                        <span className="text-[10px] text-emerald-400">特征异常轨迹</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 min-h-0 bg-slate-950/40 rounded-xl border border-slate-800/50 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={TRAJECTORY_DATA.anomalous}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="x" hide />
                          <YAxis stroke="#475569" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: '1px solid #065f46'}} />
                          <Line 
                            type="monotone" 
                            dataKey="y" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{r: 4, fill: '#10b981'}} 
                            activeDot={{r: 6, stroke: '#fff'}}
                            animationDuration={1500}
                          />
                          {/* 参考线 */}
                          <Line 
                            data={TRAJECTORY_DATA.normal} 
                            type="monotone" 
                            dataKey="y" 
                            stroke="#334155" 
                            strokeWidth={1} 
                            strokeDasharray="5 5" 
                            dot={false} 
                          />
                      </LineChart>
                  </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4">
                  {[
                    { label: '均方根误差 (RMSE)', val: '4.52', unit: 'km' },
                    { label: '航向偏离度', val: '124', unit: 'deg' },
                    { label: '时间同步偏差', val: '15', unit: 'ms' },
                    { label: '特征匹配度', val: '98.2', unit: '%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase mb-1">{stat.label}</div>
                        <div className="text-xl font-mono font-bold text-white leading-none">{stat.val} <span className="text-[10px] font-normal text-slate-600">{stat.unit}</span></div>
                    </div>
                  ))}
              </div>
           </div>

           {/* 典型历史案例展示 */}
           <div className="h-[220px] bg-slate-950 border border-emerald-900/20 rounded-2xl p-5 flex gap-6 overflow-hidden">
               <div className="w-[300px] border-r border-slate-800 pr-6 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-red-950/40 text-red-500 border border-red-900/30">
                        <History size={24} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">典型历史案例</div>
                        <div className="text-[10px] text-slate-500 font-mono">CASE_ID: SIG-X882</div>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "2023年4月12日，‘EVER-GREEN’轮在进港过程中，其AIS位置信息突然向西北方向瞬移12海里，持续40秒后回归。该特征被标记为典型基站模拟欺骗。"
                  </p>
               </div>
               <div className="flex-1 flex flex-col">
                  <div className="text-[10px] text-slate-500 uppercase font-black mb-3">Geographic Impact Map</div>
                  <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                      <Globe size={80} className="text-slate-800 animate-spin-slow" />
                      <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-yellow-500 rounded-full opacity-60"></div>
                  </div>
               </div>
           </div>
        </section>

        {/* 右侧：算法逻辑与规程 */}
        <section className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="识别算法逻辑" subtitle="ALGO ENGINE" className="h-[380px] border-emerald-900/30">
               <div className="flex flex-col h-full gap-4 relative">
                   <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-emerald-900/50"></div>
                   {LOGIC_FLOW.map((flow, i) => (
                       <div key={i} className="relative pl-8 group">
                           <div className="absolute left-2.5 top-0 w-3 h-3 rounded-full bg-slate-950 border border-emerald-500 group-hover:bg-emerald-500 transition-colors z-10 flex items-center justify-center">
                              <div className="w-1 h-1 bg-emerald-300 rounded-full"></div>
                           </div>
                           <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 group-hover:border-emerald-500/50 transition-all">
                              <div className="text-xs font-bold text-white mb-1">{flow.title}</div>
                              <div className="text-[10px] text-slate-500 leading-tight">{flow.desc}</div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-auto pt-4 border-t border-slate-800">
                       <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                           <Cpu size={14} /> 启动边缘侧验证仿真
                       </button>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="法律法规参考" subtitle="REGULATORY" className="flex-1 border-emerald-900/30">
               <div className="flex flex-col gap-3">
                   {[
                       { title: 'SOLAS 公约第 V 章', ref: 'IMO Regulation 19' },
                       { title: '海上交通安全法', ref: '第三十五条' },
                       { title: 'AIS 设备使用标准', ref: 'ITU-R M.1371' },
                   ].map((law, i) => (
                       <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/40 border border-slate-800 rounded hover:bg-slate-800 transition-colors cursor-pointer group">
                           <div className="p-2 rounded bg-slate-800 group-hover:bg-emerald-900/30">
                               <FileText size={16} className="text-slate-500 group-hover:text-emerald-400" />
                           </div>
                           <div>
                               <div className="text-xs font-bold text-slate-200">{law.title}</div>
                               <div className="text-[10px] text-slate-600">{law.ref}</div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-2 p-3 bg-red-950/20 border border-red-900/20 rounded-lg flex items-start gap-3">
                       <ShieldAlert className="text-red-500 shrink-0" size={16} />
                       <p className="text-[10px] text-red-300/80 leading-relaxed italic">
                           注意：恶意篡改 AIS 信息将被列入“黑名单”，面临永久性停航处罚。
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- 全局状态脚注 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950 border-t border-emerald-900/30 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                DB_SYNC: SYNCHRONIZED [ASIA-PAC-04]
            </span>
            <span className="hidden md:inline">SYSTEM_HEALTH: EXCELLENT</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Network size={12} className="text-emerald-600" /> DISTRIBUTED_KNOWLEDGE_MATRIX: ONLINE
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #065f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .text-shadow-glow { text-shadow: 0 0 10px rgba(16,185,129,0.5); }
      `}</style>
    </div>
  );
};
