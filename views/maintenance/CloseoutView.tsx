
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CloseoutThreeScene } from '../../components/maintenance_closeout/ThreeScene';
import { 
  CircleCheck, 
  Archive, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  FileCheck, 
  FileText,
  UserCheck,
  Star,
  Activity,
  History,
  Lock,
  Stamp,
  ArrowRight,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';

const COST_BREAKDOWN = [
  { name: '人工费', actual: 4500, budget: 4200 },
  { name: '备件费', actual: 12000, budget: 13500 },
  { name: '耗材费', actual: 800, budget: 1000 },
  { name: '服务费', actual: 3000, budget: 3000 },
];

const QUALITY_DATA = [
  { subject: '操作规范', A: 95, fullMark: 100 },
  { subject: '安全防护', A: 100, fullMark: 100 },
  { subject: '工期控制', A: 85, fullMark: 100 },
  { subject: '备件寿命', A: 92, fullMark: 100 },
  { subject: '资料完整', A: 98, fullMark: 100 },
];

const RECENT_CLOSED = [
  { id: 'WO-2024-882', target: 'M-101 循环泵', date: '今日 10:24', user: '周工', cost: '¥18,400' },
  { id: 'WO-2024-881', target: 'V-002 控制阀', date: '今日 09:15', user: '李工', cost: '¥2,100' },
];

export const CloseoutView: React.FC = () => {
  const [isClosing, setIsClosing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'processing'>('pending');

  const handleFinalClose = () => {
    setIsClosing(true);
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      // Success feedback logic here
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 font-[Rajdhani]">
      
      {/* 顶部全局 KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '本月已核销工单', value: '142', sub: '达成率 98%', icon: CircleCheck, color: 'text-green-400' },
          { label: '平均闭环时长', value: '42.5h', sub: '-12% 环比减少', icon: Clock, color: 'text-cyan-400' },
          { label: '备件领用吻合度', value: '99.2%', sub: '数据同步正常', icon: ShieldCheck, color: 'text-indigo-400' },
          { label: '累计归档容量', value: '1.2 TB', sub: '加密云存储', icon: Archive, color: 'text-slate-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded flex items-center gap-4 relative overflow-hidden group">
            <div className={`p-3 rounded bg-slate-800/50 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{kpi.label}</div>
              <div className="text-xl font-bold text-white leading-none my-1">{kpi.value}</div>
              <div className="text-[10px] text-slate-500">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：工单结算清单 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="待核销工单详情" subtitle="SETTLEMENT" highlight>
              <div className="space-y-4">
                 <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                       <div className="text-[10px] font-mono text-cyan-500">WO-20240320-09</div>
                       <div className="text-lg font-bold text-white">#3 冷却塔风机大修</div>
                    </div>
                    <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50">维修类别: 计划大修</span>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-500">主责技师:</span>
                       <span className="text-slate-200">王利民 (高级技师)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-500">实际耗时:</span>
                       <span className="text-slate-200">12.5 小时</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-500">备件数量:</span>
                       <span className="text-slate-200">4 类 / 12 件</span>
                    </div>
                 </div>

                 <div className="h-40 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={COST_BREAKDOWN} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          />
                          <Bar dataKey="actual" name="实际支出" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={10} />
                          <Bar dataKey="budget" name="预算参考" fill="#334155" radius={[0, 4, 4, 0]} barSize={4} />
                       </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 mt-1">
                       <span>费用项分析</span>
                       <span className="flex items-center gap-1"><TrendingDown size={10} className="text-green-500"/> 总体节约 ¥1,200</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="关联附件与报告" subtitle="ATTACHMENTS" className="flex-1">
              <div className="space-y-2 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                 {[
                   { name: '维修后试机报告.pdf', size: '2.4MB', type: 'doc' },
                   { name: '轴承磨损微距照片.jpg', size: '4.8MB', type: 'img' },
                   { name: '现场清理确认单.signed', size: '1.2MB', type: 'sig' },
                 ].map((file, i) => (
                   <div key={i} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded group hover:border-slate-600 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 overflow-hidden">
                         <FileText size={16} className="text-slate-500 group-hover:text-cyan-500 transition-colors" />
                         <div className="truncate">
                            <div className="text-[11px] text-slate-300 truncate">{file.name}</div>
                            <div className="text-[9px] text-slate-600">{file.size}</div>
                         </div>
                      </div>
                      <CircleCheck size={12} className="text-green-500" />
                   </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化核销场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020617] border border-slate-800 rounded overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs">
                          <Lock size={14} className="animate-pulse" />
                          ARCHIVE SECURITY: LEVEL-4
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Verification <span className="text-indigo-500">Core</span>
                       </div>
                    </div>
                    <div className="bg-black/60 border border-slate-700 p-2 rounded backdrop-blur text-right">
                       <div className="text-[10px] text-slate-500 uppercase">Process ID</div>
                       <div className="text-xs font-mono font-bold text-cyan-400 underline underline-offset-4">ARK-X-9022</div>
                    </div>
                 </div>

                 {/* 状态印章 */}
                 {status === 'success' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-32 h-32 rounded-full border-8 border-green-500/20 flex items-center justify-center relative">
                           <Stamp size={64} className="text-green-500" />
                           <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping"></div>
                        </div>
                        <div className="mt-4 text-3xl font-bold text-green-400 tracking-widest uppercase">已 经 核 销</div>
                        <div className="text-xs text-slate-500 font-mono mt-2 tracking-widest">TS: {new Date().toLocaleTimeString()}</div>
                    </div>
                 )}
              </div>

              {/* 3D 归档立方 */}
              <CloseoutThreeScene isClosing={isClosing} status={status} />

              {/* 底部操作区 */}
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none">
                 <div className="flex justify-center pointer-events-auto">
                    {status === 'pending' ? (
                       <button 
                         onClick={handleFinalClose}
                         className="group relative px-12 py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold tracking-[0.3em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20"
                       >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <div className="flex items-center gap-3">
                             <Stamp size={24} />
                             确认并关闭工单
                          </div>
                       </button>
                    ) : status === 'processing' ? (
                       <div className="flex flex-col items-center gap-2">
                          <Activity size={32} className="text-cyan-400 animate-spin" />
                          <span className="text-xs font-mono text-cyan-500 uppercase animate-pulse tracking-widest">Encrypting Assets...</span>
                       </div>
                    ) : (
                       <div className="flex gap-4">
                          <button className="px-8 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-all">
                             <FileText size={16}/> 预览核销报告
                          </button>
                          <button className="px-8 py-3 bg-green-600 text-white rounded text-sm font-bold flex items-center gap-2 hover:bg-green-500 transition-all shadow-lg shadow-green-900/20">
                             <History size={16}/> 返回工单中心
                          </button>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：质量评价与历史 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
          
          <SciFiCard title="质量评价多维视图" subtitle="QA RADAR">
             <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={QUALITY_DATA}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Quality" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                   </RadarChart>
                </ResponsiveContainer>
             </div>
             <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800 mt-2">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">综合评分</div>
                <div className="flex items-center gap-1 text-yellow-500">
                   {[1,2,3,4].map(s => <Star key={s} size={12} fill="currentColor" />)}
                   <Star size={12} />
                   <span className="text-lg font-bold ml-2 text-white">4.8</span>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="AI 专家闭环审核" subtitle="AUDIT">
             <div className="p-3 bg-slate-900/80 border-l-4 border-cyan-500 rounded-r flex flex-col gap-3">
                <div className="flex items-center gap-2">
                   <Activity size={16} className="text-cyan-400" />
                   <span className="text-xs font-bold text-slate-200">系统合规性检查</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                   “检测到所有关键测试点已通过，费用偏差在 5% 容差范围内。维修日志与图像证据匹配度高。建议执行最终核销。”
                </p>
                <div className="flex items-center gap-2 text-green-500">
                   <CircleCheck size={12} />
                   <span className="text-[10px] font-bold uppercase">Ready for Closure</span>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="最近已归档记录" subtitle="ARCHIVE" className="flex-1 overflow-hidden">
             <div className="space-y-3 overflow-y-auto h-full pr-1 custom-scrollbar">
                {RECENT_CLOSED.map((log, i) => (
                   <div key={i} className="p-2 bg-slate-950/50 border border-slate-800 rounded group hover:border-indigo-500/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] font-mono text-indigo-400">{log.id}</span>
                         <span className="text-[10px] text-slate-600">{log.date}</span>
                      </div>
                      <div className="text-xs text-slate-200 font-bold group-hover:text-indigo-300 transition-colors">{log.target}</div>
                      <div className="flex justify-between items-center mt-2">
                         <div className="flex items-center gap-1 text-[9px] text-slate-500">
                            <UserCheck size={8} /> {log.user}
                         </div>
                         <div className="text-[10px] text-slate-400 font-mono">{log.cost}</div>
                      </div>
                   </div>
                ))}
             </div>
          </SciFiCard>

        </div>
      </div>

    </div>
  );
};
