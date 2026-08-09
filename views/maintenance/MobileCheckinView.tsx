import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Scan, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  Cpu, 
  Wifi, 
  Battery, 
  Navigation2, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Fingerprint,
  HardDrive,
  Activity,
  Smartphone
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis
} from 'recharts';

// --- 模拟数据 ---
const CURRENT_TASK = {
  id: 'WO-MOBILE-7724',
  device: 'P-101A 高压泵组',
  area: '3号机房 / 西侧动力区',
  priority: 'High',
  desc: '电机端盖处检测到不规则震动，频率 45Hz，伴随轻微异响。',
  distance: '24.5 m',
  assignedTime: '14:20:00'
};

const PPE_CHECKLIST = [
  { id: 'helmet', label: '安全帽已佩戴', icon: <ShieldCheck size={14}/> },
  { id: 'gloves', label: '绝缘手套已备好', icon: <ShieldCheck size={14}/> },
  { id: 'shoes', label: '劳保鞋检查完毕', icon: <ShieldCheck size={14}/> },
];

const SKILL_RADAR = [
  { subject: '机械', A: 95, fullMark: 100 },
  { subject: '电气', A: 82, fullMark: 100 },
  { subject: '自动化', A: 70, fullMark: 100 },
  { subject: '液压', A: 88, fullMark: 100 },
  { subject: '安全', A: 100, fullMark: 100 },
];

export const MobileCheckinView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'checked-in'>('idle');
  const [progress, setProgress] = useState(0);

  const handleCheckin = () => {
    setStatus('scanning');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('checked-in');
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 顶部：移动端状态栏仿真 */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-700 px-6 py-2 rounded-t-lg">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
               <Wifi size={14} className="animate-pulse" /> 5G_FIELD_SECURE
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
               <Battery size={14} /> 88%
            </div>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Field Terminal v4.2</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：任务战术简报 */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <SciFiCard title="当前指派任务" subtitle="TACTICAL_INFO" highlight className="flex-1">
              <div className="space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-[10px] font-mono text-cyan-500 mb-1">TASK_ID: {CURRENT_TASK.id}</div>
                       <h2 className="text-2xl font-bold text-white tracking-tight">{CURRENT_TASK.device}</h2>
                    </div>
                    <div className="bg-red-900/30 border border-red-500 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                       Priority: {CURRENT_TASK.priority}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <MapPin size={10} /> 作业区域
                       </div>
                       <div className="text-xs font-bold text-white leading-tight">{CURRENT_TASK.area}</div>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <Clock size={10} /> 响应时间
                       </div>
                       <div className="text-xs font-bold text-cyan-400 font-mono">00:12:45</div>
                    </div>
                 </div>

                 <div className="p-4 bg-cyan-950/10 border border-cyan-900/30 rounded relative overflow-hidden">
                    <div className="text-xs text-cyan-500 font-bold mb-2 flex items-center gap-2">
                       <AlertCircle size={14} /> 故障描述
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                       “{CURRENT_TASK.desc}”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                       <Cpu size={60} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
                       <span>技术手册与BOM就绪</span>
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <div className="flex gap-2">
                       <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                          <HardDrive size={14} /> 调阅离线图纸
                       </button>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="技师能力画像" subtitle="PROFILE">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：核心签到控制台 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020617] border border-slate-800 rounded-sm overflow-hidden flex flex-col items-center justify-center group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]"></div>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              {/* GIS 定位叠加层 */}
              <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none z-10">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-cyan-500 font-mono text-[10px]">
                       <Navigation2 size={12} className="animate-pulse" /> GIS_SIGNAL: STRONG
                    </div>
                    <div className="text-lg font-bold text-white font-mono">31.2304° N, 121.4737° E</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">距目标位置</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono">{CURRENT_TASK.distance}</div>
                 </div>
              </div>

              {/* 中央签到器 */}
              <div className="relative flex flex-col items-center">
                 {/* 动态圆环 */}
                 <div className={`w-64 h-64 rounded-full border-2 border-dashed transition-all duration-1000 flex items-center justify-center
                    ${status === 'idle' ? 'border-slate-800' : status === 'scanning' ? 'border-cyan-500 animate-[spin_10s_linear_infinite]' : 'border-green-500'}
                 `}>
                    <div className={`w-56 h-56 rounded-full border border-slate-700 flex items-center justify-center transition-all duration-700
                       ${status === 'scanning' ? 'bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : status === 'checked-in' ? 'bg-green-950/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-transparent'}
                    `}>
                       <button 
                         onClick={handleCheckin}
                         disabled={status !== 'idle'}
                         className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95
                           ${status === 'idle' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-900/40' : status === 'scanning' ? 'bg-slate-800' : 'bg-green-600 shadow-xl shadow-green-900/40'}
                         `}
                       >
                          {status === 'idle' && (
                             <>
                                <Fingerprint size={48} className="text-white mb-2" />
                                <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">指纹签到</span>
                             </>
                          )}
                          {status === 'scanning' && (
                             <div className="relative flex flex-col items-center">
                                <Activity size={48} className="text-cyan-400 animate-pulse mb-2" />
                                <span className="text-lg font-mono font-bold text-cyan-400">{progress}%</span>
                                <div className="absolute -inset-4 border border-cyan-500 rounded-full animate-ping opacity-20"></div>
                             </div>
                          )}
                          {status === 'checked-in' && (
                             <>
                                <UserCheck size={48} className="text-white mb-2" />
                                <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">已准入</span>
                             </>
                          )}
                       </button>
                    </div>
                 </div>

                 {/* 扫描状态文字 */}
                 <div className="mt-8 text-center">
                    <div className={`text-sm font-bold uppercase tracking-widest mb-1
                       ${status === 'idle' ? 'text-slate-500' : status === 'scanning' ? 'text-cyan-400' : 'text-green-500'}
                    `}>
                       {status === 'idle' ? '等待技师身份核验...' : status === 'scanning' ? '正在匹配生物指纹与地理位置...' : '现场准入授权已下发'}
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono italic">
                       Authorized: Field Tech LV-3 // Security Token: 9X-221
                    </div>
                 </div>
              </div>

              {/* 底部功能按钮 */}
              <div className="absolute bottom-10 flex gap-6">
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                       <Smartphone size={18} />
                    </div>
                    <span className="text-[9px] uppercase text-slate-600">设备绑定</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                       <Scan size={18} />
                    </div>
                    <span className="text-[9px] uppercase text-slate-600">扫码领件</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：安全与合规核查 */}
        <div className="xl:col-span-3 flex flex-col gap-6">
           <SciFiCard title="现场安全准入检查" subtitle="SAFETY_PROTOCOL">
              <div className="space-y-4">
                 <div className="text-[10px] text-slate-500 uppercase mb-2">作业前必须勾选 / Pre-work Checklist</div>
                 {PPE_CHECKLIST.map((item, i) => (
                    <label key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-sm cursor-pointer hover:border-cyan-500/50 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="text-slate-600 group-hover:text-cyan-400 transition-colors">{item.icon}</div>
                          <span className="text-xs text-slate-300 font-bold">{item.label}</span>
                       </div>
                       <input type="checkbox" className="w-4 h-4 accent-cyan-500 bg-slate-950 border-slate-700" />
                    </label>
                 ))}
                 <div className="pt-4 border-t border-slate-800">
                    <div className="bg-amber-900/10 border border-amber-900/30 p-3 rounded flex items-start gap-3">
                       <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                       <div className="text-[10px] text-amber-200 leading-normal">
                          <span className="font-bold">安全提醒：</span> 该区域存在高压放电风险，请确保绝缘鞋底无积水并已锁定隔离电源。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="今日任务完成度" subtitle="WORKLOAD" className="flex-1">
              <div className="flex flex-col h-full justify-between">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-xs text-slate-400 font-bold uppercase">Today Progress</span>
                       <span className="text-xl font-bold font-mono text-white">3 / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                       <div className="h-full bg-cyan-500 w-3/5"></div>
                       <div className="h-full bg-slate-700 w-2/5"></div>
                    </div>
                 </div>

                 <div className="space-y-3 mt-8">
                    {[
                      { label: '平均响应时间', val: '12 min' },
                      { label: '任务准时率', val: '98.5%' },
                      { label: '现场评分', val: '4.92' },
                    ].map((kpi, i) => (
                       <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                          <span className="text-[10px] text-slate-500 uppercase">{kpi.label}</span>
                          <span className="text-xs font-bold text-slate-200 font-mono">{kpi.val}</span>
                       </div>
                    ))}
                 </div>

                 <button className="w-full py-3 mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                    调阅历史作业单 <ChevronRight size={14} />
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>

    </div>
  );
};
