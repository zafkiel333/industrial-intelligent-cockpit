import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Unplug, 
  Zap, 
  Droplets, 
  Wind, 
  UserCheck, 
  Key, 
  AlertTriangle, 
  Activity, 
  Timer, 
  ClipboardCheck,
  History,
  Info,
  CircleSlash,
  Fingerprint
} from 'lucide-react';
// Fix: Added PolarRadiusAxis to the import list
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- 模拟隔离点数据 ---
const ISOLATION_POINTS = [
  { id: 'EP-101', name: '主电机断路器', type: 'electric', status: 'locked', user: '张工', time: '02:45:12' },
  { id: 'VP-204', name: '进气主控制阀', type: 'pneumatic', status: 'locked', user: '李工', time: '01:20:05' },
  { id: 'HP-305', name: '液压泵回流阀', type: 'hydraulic', status: 'warning', user: '王工', time: '00:15:30' },
  { id: 'EP-105', name: '照明系统空开', type: 'electric', status: 'unlocked', user: '-', time: '-' },
  { id: 'VP-208', name: '冷却水出口阀', type: 'fluid', status: 'locked', user: '赵工', time: '03:10:45' },
  { id: 'MP-001', name: '机械制动销', type: 'mechanical', status: 'locked', user: '张工', time: '02:44:20' },
];

const SAFETY_RADAR = [
  { subject: '物理隔离度', A: 95, fullMark: 100 },
  { subject: '程序合规性', A: 100, fullMark: 100 },
  { subject: '残余能量核验', A: 90, fullMark: 100 },
  { subject: '双重确认率', A: 98, fullMark: 100 },
  { subject: '应急响应', A: 85, fullMark: 100 },
];

export const LotoManagementView: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<string>(ISOLATION_POINTS[0].id);
  const activePoint = ISOLATION_POINTS.find(p => p.id === selectedPoint) || ISOLATION_POINTS[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：隔离安全指控条 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50">
              <ShieldCheck size={32} className="text-white" />
           </div>
           <div>
              <div className="text-[10px] text-emerald-500 uppercase tracking-[0.4em] font-bold mb-1">Lockout Tagout Protocol</div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 能量隔离 <span className="text-emerald-500 italic">安全控制中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400">隔离完整性: <span className="text-white font-mono">98.4%</span></span>
           </div>
           <div className="w-[1px] h-6 bg-slate-700"></div>
           <div className="flex items-center gap-3">
              <Lock size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-400">当前活跃锁具: <span className="text-white font-mono">15</span></span>
           </div>
           <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-emerald-900/20">
              发起新隔离申请
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：隔离点矩阵图谱 */}
        <div className="xl:col-span-4 flex flex-col gap-4">
           <SciFiCard title="区域能量隔离矩阵" subtitle="ISOLATION_MATRIX" highlight className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                 {ISOLATION_POINTS.map(point => (
                    <div 
                      key={point.id}
                      onClick={() => setSelectedPoint(point.id)}
                      className={`p-4 rounded border-2 transition-all cursor-pointer relative overflow-hidden group
                        ${selectedPoint === point.id 
                          ? 'border-emerald-500 bg-emerald-950/20' 
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-3">
                          <div className={`p-2 rounded ${point.status === 'locked' ? 'bg-emerald-900/30 text-emerald-400' : point.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                             {point.type === 'electric' ? <Zap size={18} /> : point.type === 'hydraulic' ? <Droplets size={18} /> : <Wind size={18} />}
                          </div>
                          {point.status === 'locked' ? <Lock size={14} className="text-emerald-500" /> : <Unlock size={14} className="text-slate-600" />}
                       </div>
                       <div className="text-sm font-bold text-white mb-1">{point.name}</div>
                       <div className="text-[10px] font-mono text-slate-500">{point.id}</div>
                       
                       {point.status === 'locked' && (
                         <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 flex items-center gap-1"><UserCheck size={10} /> {point.user}</span>
                            <span className="text-emerald-500 font-mono">{point.time}</span>
                         </div>
                       )}
                       
                       {/* 装饰线条 */}
                       <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-20 transition-opacity">
                          <Activity size={60} />
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：上锁细节与验证数字孪生 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050505] border border-slate-800 rounded-sm overflow-hidden flex flex-col group">
              {/* HUD 叠加信息层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
                          <Activity size={14} className="animate-pulse" />
                          REAL-TIME ENERGY SENSING: ACTIVE
                       </div>
                       <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                          Digital <span className="text-emerald-500">Lock-Box</span> Detail
                       </h3>
                    </div>
                    <div className="text-right bg-black/60 border border-emerald-900/30 p-2 rounded backdrop-blur">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest">Verification ID</div>
                       <div className="text-xs font-mono font-bold text-emerald-400">LOTO-RT-9924</div>
                    </div>
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 bg-emerald-900/20 px-3 py-1 border border-emerald-500/30 rounded text-[10px] text-emerald-300 font-bold">
                          <ClipboardCheck size={12} /> 符合 OSHA 1910.147 规范
                       </div>
                       <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 border border-slate-700 rounded text-[10px] text-slate-400">
                          <Info size={12} /> 双重验证机制已开启
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-500 uppercase mb-1 tracking-widest">Selected Point</div>
                       <div className="text-xl font-bold text-white font-mono">{activePoint.id}</div>
                    </div>
                 </div>
              </div>

              {/* 核心可视化区域：锁具与能量条 */}
              <div className="flex-1 flex items-center justify-center p-12">
                 <div className="w-full h-full border border-white/5 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] rounded relative flex items-center justify-center">
                    
                    {/* 动态能量圈 */}
                    <div className="absolute w-64 h-64 border border-dashed border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute w-80 h-80 border border-emerald-500/10 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>

                    {/* 中心锁具视觉 */}
                    <div className="relative z-0 flex flex-col items-center">
                       <div className={`p-8 rounded-full border-4 transition-all duration-700
                          ${activePoint.status === 'locked' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-slate-800 text-slate-700'}
                       `}>
                          <Lock size={80} strokeWidth={1} />
                       </div>
                       <div className="mt-6 text-center">
                          <div className="text-4xl font-bold text-white tracking-tighter">{activePoint.name}</div>
                          <div className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-[0.3em]">Hardware ID: {activePoint.id}</div>
                       </div>
                    </div>

                    {/* 残余能量监测器 (右侧) */}
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 space-y-6 w-32">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Residual Voltage</div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-0 transition-all duration-1000"></div>
                          </div>
                          <div className="text-[10px] font-mono text-emerald-500 text-right mt-1">0.00 V</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Pressure</div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-0 transition-all duration-1000"></div>
                          </div>
                          <div className="text-[10px] font-mono text-emerald-500 text-right mt-1">0.02 bar</div>
                       </div>
                       <div className="pt-2 border-t border-white/5">
                          <div className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                             <CheckSquare size={10} /> 零能确认
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 底部操作面板 */}
              <div className="bg-slate-900/80 border-t border-slate-800 p-4 flex gap-4">
                 <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-xs">
                    <Key size={16} /> 执行解锁授权
                 </button>
                 <button className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded flex items-center justify-center gap-3 transition-all border border-slate-700">
                    <History size={16} /> 查看隔离日志
                 </button>
              </div>
           </div>
        </div>

        {/* 右侧：统计、持有人与协议审计 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="隔离安全性雷达" subtitle="ASSESSMENT">
              <div className="h-52 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SAFETY_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Safety" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">综合安全评分</div>
                 <div className="text-3xl font-bold text-white font-mono leading-none mt-1">94.2</div>
              </div>
           </SciFiCard>

           <SciFiCard title="持有授权审计" subtitle="KEYS_STATUS">
              <div className="space-y-4">
                 {[
                   { name: '张工', keys: 2, level: 'Senior', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
                   { name: '李工', keys: 1, level: 'Member', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
                   { name: '王工', keys: 4, level: 'Supervisor', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
                 ].map((auth, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 group hover:border-emerald-500/50 transition-all">
                       <div className="flex items-center gap-3">
                          <img src={auth.photo} className="w-8 h-8 rounded bg-slate-800" alt="user" />
                          <div>
                             <div className="text-xs font-bold text-slate-200">{auth.name}</div>
                             <div className="text-[9px] text-slate-500 uppercase tracking-tighter">{auth.level} Authorized</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                             <Key size={10} /> x{auth.keys}
                          </div>
                          <div className="text-[8px] text-slate-600">持锁数量</div>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                    <UserCheck size={14} /> 验证授权资质
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="隔离事件时序" subtitle="AUDIT_TRAIL" className="flex-1">
              <div className="space-y-4 overflow-y-auto pr-2 h-full custom-scrollbar">
                 {[
                    { time: '14:20', action: '执行上锁', target: 'EP-101', user: '张工', icon: <Lock size={12}/> },
                    { time: '13:15', action: '零能确认', target: 'VP-204', user: '李工', icon: <Fingerprint size={12}/> },
                    { time: '12:40', action: '隔离申请', target: 'HP-305', user: '王工', icon: <CircleSlash size={12}/> },
                 ].map((log, i) => (
                    <div key={i} className="flex gap-4 text-[11px] relative pb-4 last:pb-0">
                       {i !== 2 && <div className="absolute left-2 top-6 bottom-0 w-[1px] bg-slate-800"></div>}
                       <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 shrink-0 border border-slate-700 z-10">
                          {log.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-slate-300">{log.action}</span>
                             <span className="text-[10px] text-slate-600 font-mono">{log.time}</span>
                          </div>
                          <div className="text-slate-500 truncate">针对节点 {log.target} - {log.user}发起</div>
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

// 辅助子组件：勾选框
const CheckSquare = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
