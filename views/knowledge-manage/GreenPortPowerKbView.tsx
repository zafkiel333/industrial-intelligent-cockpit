
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, ShieldCheck, Ship, Anchor, 
  Database, FileText, Search, Activity, 
  Wind, Leaf, BatteryCharging, Link, 
  Binary, Compass, ClipboardList, Info,
  ChevronRight, Share2, Maximize2, Terminal,
  Cpu, LayoutGrid, Scale, Globe, History,
  Plug, Power, Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, BarChart, Bar, Cell, Legend, LineChart, Line
} from 'recharts';

// --- 档案库模拟数据 ---

const VESSEL_PROFILES = [
  { id: 'V-CONT-24', name: '超大型集装箱船 (ULCS)', voltage: '6.6kV', frequency: '60Hz', plug: 'Standard IEC', power: '7.5MVA' },
  { id: 'V-CRUISE-08', name: '大型邮轮 (Cruise)', voltage: '11kV', frequency: '60Hz', plug: 'Double Plug', power: '20MVA' },
  { id: 'V-RO-RO-12', name: '滚装船 (Ro-Ro)', voltage: '440V/6.6kV', frequency: '50/60Hz', plug: 'Multi-spec', power: '2.5MVA' },
  { id: 'V-LNG-15', name: '液化天然气船 (LNG)', voltage: '6.6kV', frequency: '60Hz', plug: 'Ex-Proof', power: '4.0MVA' },
];

const COMPATIBILITY_RULES = [
  { subject: '电压等级', weight: 95, status: 'Critical', desc: '岸船电压差必须在±5%范围内。' },
  { subject: '相位同步', weight: 100, status: 'Active', desc: '采用无缝切换(Soft-Transfer)技术。' },
  { subject: '接地保护', weight: 98, status: 'Ready', desc: '中性点经电阻接地系统校验。' },
  { subject: '插座高度', weight: 85, status: 'Warning', desc: '受潮汐变动影响的物理间隙校核。' },
  { subject: '通信协议', weight: 90, status: 'Active', desc: '基于IEC 61850的数据交互。' },
];

const REDUCTION_DATA = Array.from({length: 12}, (_, i) => ({
  month: `${i+1}月`,
  co2: 120 + Math.random() * 80,
  sox: 12 + Math.random() * 5,
  nox: 45 + Math.random() * 15
}));

export const GreenPortPowerKbView: React.FC = () => {
  const [activeVessel, setActiveVessel] = useState('V-CONT-24');

  const currentVessel = VESSEL_PROFILES.find(v => v.id === activeVessel) || VESSEL_PROFILES[0];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 装饰性底层：电流脉冲网格 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
              <pattern id="powerGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                  <circle cx="0" cy="0" r="1" fill="#10b981" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#powerGrid)" />
          </svg>
      </div>

      {/* --- HEADER: 档案中心头部 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.3)] group cursor-help">
             <Zap size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-[0.4em] font-black">
               Shore-to-Ship Power Compatibility Archive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               绿色港口岸电连接 <span className="text-emerald-500 italic">兼容性数字档案</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">已建档船型</div>
              <div className="text-3xl font-mono font-black text-white leading-none">842 <span className="text-xs text-slate-600 font-normal">SHIPS</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">年度减碳贡献</div>
              <div className="text-3xl font-mono font-black text-emerald-400 leading-none">12.5<span className="text-xs font-normal text-slate-600">k tCO₂</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">技术合规版本</div>
              <div className="text-xl font-mono font-black text-blue-400 leading-none">IEC-80005-2024</div>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 船端侧档案导航 */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="船端技术索引" subtitle="VESSEL TAXONOMY" className="flex-1 border-emerald-900/30 bg-[#08140c]/90">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="检索船舶名称、IMO或技术代码..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                  </div>
                  {VESSEL_PROFILES.map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => setActiveVessel(v.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group
                        ${activeVessel === v.id ? 'bg-emerald-950/40 border-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        {activeVessel === v.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                               <div className="p-2 rounded bg-slate-800 text-emerald-400 group-hover:text-emerald-200">
                                   <Ship size={18} />
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-slate-200">{v.name}</div>
                                   <div className="text-[10px] text-slate-500 font-mono uppercase">{v.id}</div>
                               </div>
                           </div>
                           <ChevronRight size={14} className={activeVessel === v.id ? 'text-emerald-500' : 'text-slate-700'} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/50 pt-2">
                            <span>VOLT: {v.voltage}</span>
                            <span>FREQ: {v.frequency}</span>
                        </div>
                    </div>
                  ))}
                  
                  <div className="mt-auto p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-xl">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold mb-2 flex items-center gap-2">
                          <Info size={12} /> 知识点：高压接电
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "大型船舶通常采用 6.6kV 岸电系统。档案库记录了船舶配电板与岸端电缆管理系统（CMS）的物理连接参数，确保对接误差小于 15cm。"
                      </p>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全场能效评分" subtitle="GREEN RATING" className="h-[200px] border-emerald-900/30">
                <div className="w-full h-full pt-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPATIBILITY_RULES}>
                           <PolarGrid stroke="#064e3b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                           <Radar name="Status" dataKey="weight" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: 接口蓝图与逻辑分析 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 接口物理图谱交互区 */}
           <div className="flex-[1.2] bg-[#050b0a] border border-emerald-900/30 rounded-3xl overflow-hidden relative shadow-inner flex flex-col">
              <div className="absolute top-6 left-6 z-20">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-emerald-500 p-4 rounded-sm shadow-2xl flex flex-col">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <LayoutGrid size={14} /> Physical Interface Topology
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                       岸端接口 (AMP) 物理对位图谱
                    </h2>
                 </div>
              </div>

              {/* 矢量技术绘图背景 */}
              <div className="flex-1 relative flex items-center justify-center p-10">
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                     <Binary size={400} className="text-emerald-500" />
                  </div>
                  
                  {/* 技术图纸 SVG */}
                  <svg viewBox="0 0 600 300" className="w-full h-full z-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <defs>
                          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                          </marker>
                      </defs>
                      {/* 岸基设备 */}
                      <rect x="50" y="50" width="150" height="200" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
                      <text x="125" y="40" fill="#10b981" fontSize="12" textAnchor="middle" fontWeight="bold">岸基电缆车 (CMS)</text>
                      
                      {/* 船端插座 */}
                      <rect x="400" y="80" width="120" height="140" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                      <text x="460" y="70" fill="#3b82f6" fontSize="12" textAnchor="middle" fontWeight="bold">船端接电箱 (AMP)</text>

                      {/* 连接线缆 */}
                      <path d="M200 150 Q 300 50, 400 150" fill="none" stroke="#10b981" strokeWidth="4" className="animate-[dash_2s_linear_infinite]" strokeDasharray="10 5" />
                      
                      {/* 数据节点标注 */}
                      <g className="cursor-pointer group/node">
                        <circle cx="200" cy="150" r="6" fill="#10b981" />
                        <text x="180" y="140" fill="#94a3b8" fontSize="10" textAnchor="end">插头类型: {currentVessel.plug}</text>
                      </g>
                      <g className="cursor-pointer group/node">
                        <circle cx="400" cy="150" r="6" fill="#3b82f6" />
                        <text x="420" y="140" fill="#94a3b8" fontSize="10">接电容量: {currentVessel.power}</text>
                      </g>
                  </svg>

                  {/* 悬浮数据标签 */}
                  <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                     <div className="bg-slate-950/80 border border-slate-700 p-3 rounded-lg backdrop-blur">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">接地电阻校核</div>
                        <div className="text-lg font-mono font-bold text-emerald-400">0.05 Ω</div>
                     </div>
                     <div className="bg-slate-950/80 border border-slate-700 p-3 rounded-lg backdrop-blur">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">负载平衡度</div>
                        <div className="text-lg font-mono font-bold text-white">99.2%</div>
                     </div>
                  </div>
              </div>

              {/* 底部功能栏 */}
              <div className="h-16 bg-slate-950/80 border-t border-emerald-900/30 px-8 flex items-center justify-between">
                 <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                       <Sliders size={14} className="text-emerald-500" />
                       <span className="text-xs text-slate-400">调取历史接电记录</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Terminal size={14} className="text-emerald-500" />
                       <span className="text-xs text-slate-400">电气参数溯源</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase rounded-sm border border-slate-700 transition-all flex items-center gap-2">
                       <Share2 size={12} /> 同步至船级社
                    </button>
                    <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black uppercase rounded-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2">
                       <Maximize2 size={12} /> 深度规格解析
                    </button>
                 </div>
              </div>
           </div>

           {/* 底部：减排效能溯源 */}
           <div className="flex-1 bg-slate-950 border border-emerald-900/20 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
               <div className="flex justify-between items-center mb-2 px-2">
                   <div className="flex items-center gap-2">
                       <Leaf size={14} className="text-emerald-500" />
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Environmental Mitigation Audit</span>
                   </div>
                   <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> CO₂ Reduction</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> SOx Prevented</span>
                   </div>
               </div>
               <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REDUCTION_DATA}>
                          <defs>
                              <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" tick={{fontSize: 10}} />
                          <YAxis stroke="#475569" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: '1px solid #064e3b'}} />
                          <Area type="monotone" dataKey="co2" stroke="#10b981" fill="url(#colorRest)" strokeWidth={2} />
                          <Line type="monotone" dataKey="sox" stroke="#3b82f6" strokeWidth={1} dot={false} />
                      </AreaChart>
                   </ResponsiveContainer>
               </div>
           </div>
        </section>

        {/* RIGHT: 法律规范与兼容性校验 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="兼容性校验引擎" subtitle="CHECKLIST" className="h-1/2 border-emerald-900/30">
               <div className="flex flex-col h-full gap-3">
                   <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                       <div className="absolute right-0 top-0 p-2 opacity-10"><Power size={32} className="text-emerald-500" /></div>
                       <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                          <ShieldCheck size={14} /> 自动合规性评估
                       </h4>
                       <div className="space-y-3">
                           {COMPATIBILITY_RULES.map((rule, i) => (
                               <div key={i} className="flex flex-col gap-1">
                                   <div className="flex justify-between items-center text-[10px]">
                                       <span className="text-slate-300 font-bold">{rule.subject}</span>
                                       <span className="text-emerald-400 font-mono">{rule.weight}% MATCH</span>
                                   </div>
                                   <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                       <div className="h-full bg-emerald-500" style={{width: `${rule.weight}%`}}></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                       <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1 flex items-center gap-2">
                           <History size={12}/> 异常档案追溯 (Historical Clashes)
                       </div>
                       {[
                           { date: '2023-11-05', msg: '电缆管理系统拉力感应器误报' },
                           { date: '2023-08-22', msg: '船端同步信号丢失导致自动切断' }
                       ].map((item, i) => (
                           <div key={i} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 hover:border-red-500/30 cursor-help">
                               <div className="text-[9px] text-slate-500 font-mono mb-1">{item.date}</div>
                               <div className="text-[10px] text-red-300">{item.msg}</div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="全球标准与法规库" subtitle="STANDARDS" className="flex-1 border-emerald-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { title: 'IEC/IEEE 80005-1', ref: 'High Voltage Shore Connection', type: 'HV' },
                       { title: 'IEC 80005-2', ref: 'Communication & Protocols', type: 'DATA' },
                       { title: 'ISO 28001', ref: 'Supply Chain Security', type: 'SEC' },
                       { title: 'MSA China 2024', ref: '港口岸电建设规范', type: 'REG' },
                   ].map((std, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-emerald-500/50 transition-all cursor-pointer group">
                           <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-emerald-400">
                               <FileText size={16}/>
                           </div>
                           <div className="flex-1 overflow-hidden">
                               <div className="text-[9px] text-slate-600 font-mono">{std.type} • GLOBAL</div>
                               <div className="text-xs font-bold text-slate-300 truncate group-hover:text-white">{std.title}</div>
                               <div className="text-[9px] text-slate-500 truncate">{std.ref}</div>
                           </div>
                           <ChevronRight size={14} className="text-slate-700" />
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: 状态与审计 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                PDM_DATA_LINK: ESTABLISHED [PORT-SERVER-04]
            </span>
            <span className="hidden md:inline">ENCRYPTION: AES-256-GCM</span>
            <span className="hidden md:inline text-emerald-800">LAST_ARCHIVE_COMMIT: {new Date().toLocaleTimeString()}</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Globe size={12} className="text-emerald-800" /> DISTRIBUTED_KNOWLEDGE: SYNCED
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
};
