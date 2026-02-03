
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Sparkles, 
  Trash2, 
  LayoutGrid, 
  Brush, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Camera, 
  Activity, 
  TrendingUp, 
  Zap, 
  Target, 
  Fingerprint, 
  ScanSearch,
  Search,
  Filter,
  History,
  ArrowUpRight,
  ClipboardCheck,
  Award,
  ChevronRight
} from 'lucide-react';

// --- 模拟数据 ---

const FIVE_S_DATA = [
  { subject: '整理 (Seiri)', A: 95, fullMark: 100 },
  { subject: '整顿 (Seiton)', A: 82, fullMark: 100 },
  { subject: '清扫 (Seiso)', A: 98, fullMark: 100 },
  { subject: '清洁 (Seiketsu)', A: 85, fullMark: 100 },
  { subject: '素养 (Shitsuke)', A: 90, fullMark: 100 },
];

const RECENT_AUDITS = [
  { id: '5S-0922', zone: '1号机组操作台', score: 92, user: '张工', time: '10:24' },
  { id: '5S-0925', zone: '油品仓库 A区', score: 78, user: '李工', time: '09:15' },
  { id: '5S-0929', zone: '精密备件室', score: 96, user: '王工', time: '昨日' },
];

const IMPROVEMENT_TREND = [
  { month: '01', score: 75 },
  { month: '02', score: 78 },
  { month: '03', score: 82 },
  { month: '04', score: 88 },
  { month: '05', score: 91 },
  { month: '06', score: 94 },
];

const DEFECT_SNAPSHOTS = [
  { id: 'D-01', type: '油垢', loc: '#4泵底座', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=200', status: 'pending' },
  { id: 'D-02', type: '堆放违规', loc: '主走廊', img: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?q=80&w=200', status: 'fixed' },
];

export const FiveSScoreView: React.FC = () => {
  const [activeZone, setActiveZone] = useState('机组A区');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：精益指挥控制条 */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 relative group">
              <Sparkles size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Lean Maintenance Field Audit
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修现场 5S <span className="text-emerald-500 italic">精益质量评价</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">今日全厂得分</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">92.4 <span className="text-sm font-normal text-slate-600">Avg</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">待整改缺陷</div>
              <div className="text-2xl font-mono font-bold text-red-500">03 <span className="text-xs font-normal text-slate-600">Nodes</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">精益达标率</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">98.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：审计源流水与区域切换 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><ScanSearch size={14} className="text-emerald-500" /> 审计目标阵列</span>
              <button className="hover:text-emerald-400 transition-colors"><Filter size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {['机组A区', '中控中心', '仓储中心', '外部管廊', '办公生活区'].map(zone => (
                <div 
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeZone === zone 
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{zone}</span>
                    <ChevronRight size={14} className={activeZone === zone ? 'text-emerald-500' : 'text-slate-700'} />
                  </div>
                  <div className="flex justify-between items-end">
                     <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase">最后巡检: 14:20</div>
                        <div className="text-xs text-slate-300 font-mono">ID: 5S_TAG_X90</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase">治理指数</div>
                        <div className="text-lg font-bold text-white">A+</div>
                     </div>
                  </div>
                  {activeZone === zone && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="5S 审计合规记录" subtitle="LOG_STREAM" className="h-48 border-slate-800">
              <div className="space-y-3 overflow-y-auto h-full pr-1 custom-scrollbar">
                 {RECENT_AUDITS.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950/50 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                       <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-100 truncate">{log.zone}</div>
                          <div className="text-[9px] text-slate-600 font-mono">{log.id} | {log.time}</div>
                       </div>
                       <div className={`text-xs font-bold font-mono ${log.score > 85 ? 'text-emerald-400' : 'text-amber-500'}`}>{log.score}</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：5S 评分全息矩阵 (主展示区) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-emerald-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景装饰：网格与光脉冲 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#065f46 1px, transparent 1px), linear-gradient(90deg, #065f46 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1">
                          <Fingerprint size={14} className="animate-pulse" />
                          BIOMETRIC LEAN COMPLIANCE SCAN
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activeZone} <span className="text-emerald-500 italic">5S 评估矩阵</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-emerald-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">综合执行力</div>
                       <div className="text-4xl font-mono font-bold text-emerald-400 leading-none mt-1">94.8<span className="text-sm font-normal text-slate-600">/100</span></div>
                    </div>
                 </div>

                 {/* 中部核心可视化：雷达图 */}
                 <div className="flex-1 w-full pointer-events-auto flex items-center justify-center relative">
                    {/* 背景转动圆环 */}
                    <div className="absolute w-96 h-96 border border-emerald-500/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute w-[420px] h-[420px] border border-emerald-500/5 rounded-full animate-[spin_50s_linear_infinite_reverse]"></div>
                    
                    <div className="w-full h-full max-h-[450px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={FIVE_S_DATA}>
                             <PolarGrid stroke="#064e3b" strokeDasharray="3 3" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar 
                                name="5S评分" 
                                dataKey="A" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                fill="#10b981" 
                                fillOpacity={0.2} 
                             />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #059669', borderRadius: '4px', fontSize: '12px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                             />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* 底部摘要操作条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Award size={20} className="text-yellow-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">精益标杆排名</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">RANK #02 (Site-wide)</div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Activity size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">动态监测频率</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">48 SAMPLES / DAY</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20">发起即时审计</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">导出评分单</button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-500/40"></div>
           </div>

           {/* 底部：治理演化趋势 */}
           <SciFiCard title="5S 治理效能改善路径" subtitle="EVOLUTION_TRACK" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={IMPROVEMENT_TREND}>
                       <defs>
                          <linearGradient id="colorScoreEnv" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[60, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fill="url(#colorScoreEnv)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：AI 视觉缺陷与整改 (证据链) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 视觉缺陷识别" subtitle="VISION_INTEL">
              <div className="space-y-4">
                 {DEFECT_SNAPSHOTS.map((defect) => (
                    <div key={defect.id} className="bg-slate-900 border border-slate-800 rounded p-2 group hover:border-emerald-500/50 transition-all">
                       <div className="relative aspect-video rounded overflow-hidden mb-2">
                          <img src={defect.img} alt="defect" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                          <div className="absolute inset-0 bg-red-500/10 opacity-60"></div>
                          {/* 扫描线动画 */}
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-[scan_3s_infinite]"></div>
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase
                             ${defect.status === 'pending' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}
                          `}>{defect.status}</div>
                       </div>
                       <div className="flex justify-between items-start">
                          <div>
                             <div className="text-xs font-bold text-slate-100">{defect.type}</div>
                             <div className="text-[10px] text-slate-500 flex items-center gap-1"><Target size={10} /> {defect.loc}</div>
                          </div>
                          <button className="p-1.5 bg-slate-800 rounded hover:bg-emerald-600 transition-colors"><Zap size={12}/></button>
                       </div>
                    </div>
                 ))}
                 
                 <div className="p-3 bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Activity size={16} className="text-emerald-400" />
                       <span className="text-[10px] font-bold text-white uppercase">AI 整改建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于视觉分析，#4泵区存在持续油渍，判定为密封老化而非溢洒，建议发起预防性维护工单。”
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="整改闭环矩阵" subtitle="CLOSED_LOOP" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { label: '废弃滤芯清理', due: '14:00', status: 'done' },
                      { label: '通道划线修复', due: '16:30', status: 'doing' },
                      { label: '配电柜除尘', due: '明天', status: 'pending' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                         <div className="min-w-0">
                            <div className={`text-xs font-bold ${item.status === 'done' ? 'text-slate-500' : 'text-slate-200'}`}>{item.label}</div>
                            <div className="text-[9px] text-slate-600 font-mono">DUE: {item.due}</div>
                         </div>
                         {item.status === 'done' ? <CheckCircle size={16} className="text-green-500" /> : 
                          item.status === 'doing' ? <Activity size={16} className="text-cyan-500 animate-pulse" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>
                 
                 <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <ClipboardCheck size={14} /> 确认整改并归档
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ISO 质量档案</div>
                    <div className="text-xs font-bold text-white">ISO_5S_COMP_2024</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
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
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
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
