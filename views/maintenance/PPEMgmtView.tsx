
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Shield, 
  HardHat, 
  Glasses, 
  Wind, 
  Zap, 
  Flame, 
  AlertTriangle, 
  Fingerprint, 
  CheckCircle2, 
  History, 
  Search, 
  Filter, 
  ChevronRight, 
  Activity, 
  Clock, 
  Package, 
  RefreshCw,
  UserCheck,
  Briefcase,
  Layers,
  Thermometer,
  ShieldCheck,
  Scan
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- 模拟数据 ---

const PPE_ITEMS = [
  { id: 'H-92', name: '智能降噪安全帽', type: 'Head', integrity: 92, status: 'issued', icon: <HardHat /> },
  { id: 'G-45', name: '增强型激光护目镜', type: 'Eye', integrity: 78, status: 'available', icon: <Glasses /> },
  { id: 'R-10', name: '正压式空气呼吸器', type: 'Resp', integrity: 100, status: 'mandatory', icon: <Wind /> },
  { id: 'S-77', name: '10kV 绝缘防护服', type: 'Body', integrity: 85, status: 'issued', icon: <Shield /> },
  { id: 'B-22', name: '防砸防静电劳保鞋', type: 'Foot', integrity: 64, status: 'warning', icon: <Zap /> },
];

const COMPLIANCE_DATA = [
  { subject: '坠落防护', A: 100, fullMark: 100 },
  { subject: '电气绝缘', A: 95, fullMark: 100 },
  { subject: '呼吸保护', A: 100, fullMark: 100 },
  { subject: '眼面保护', A: 82, fullMark: 100 },
  { subject: '躯干加固', A: 90, fullMark: 100 },
];

const REQUISITION_HISTORY = [
  { id: 'LOG-8842', item: '重型防化服', date: '04-01 10:20', status: 'returned', user: '张工' },
  { id: 'LOG-8845', item: '自吸过滤呼吸器', date: '04-02 09:15', status: 'using', user: '李工' },
  { id: 'LOG-8849', item: '焊接防护面罩', date: '04-02 14:40', status: 'using', user: '赵工' },
];

// --- 辅助组件：人体部位选择图 ---
const HumanSilhouette = ({ activePart, onSelect }: { activePart: string, onSelect: (part: string) => void }) => (
  <div className="relative w-full h-full flex items-center justify-center py-8">
     {/* 模拟人体矢量背景 */}
     <div className="relative w-48 h-96 opacity-40">
        <svg viewBox="0 0 100 200" className="w-full h-full text-cyan-900 fill-current">
          <path d="M50,10 C45,10 42,15 42,20 C42,25 45,30 50,30 C55,30 58,25 58,20 C58,15 55,10 50,10 Z" /> {/* Head */}
          <path d="M40,32 L60,32 L65,45 L75,80 L70,85 L60,55 L60,110 L40,110 L40,55 L30,85 L25,80 L35,45 Z" /> {/* Body & Arms */}
          <path d="M40,112 L60,112 L65,150 L62,190 L52,190 L50,150 L48,190 L38,190 L35,150 Z" /> {/* Legs */}
        </svg>
     </div>

     {/* 交互热点 */}
     <div className="absolute inset-0">
        {[
          { id: 'Head', top: '8%', left: '46%', label: '头部防护' },
          { id: 'Eye', top: '15%', left: '55%', label: '眼面保护' },
          { id: 'Body', top: '40%', left: '46%', label: '躯干防护' },
          { id: 'Hand', top: '45%', left: '72%', label: '手部防护' },
          { id: 'Foot', top: '85%', left: '46%', label: '足部防护' },
        ].map(part => (
          <button
            key={part.id}
            onClick={() => onSelect(part.id)}
            className={`absolute transform -translate-x-1/2 group flex items-center gap-2 transition-all
              ${activePart === part.id ? 'z-20' : 'z-10'}
            `}
            style={{ top: part.top, left: part.left }}
          >
             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                ${activePart === part.id ? 'bg-cyan-500 border-white scale-125 shadow-[0_0_15px_#06b6d4]' : 'bg-slate-900 border-cyan-500 opacity-60'}
             `}>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
             </div>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap transition-all
                ${activePart === part.id ? 'bg-cyan-600 text-white translate-x-1' : 'bg-slate-900/80 text-slate-500 opacity-0 group-hover:opacity-100'}
             `}>{part.label}</span>
          </button>
        ))}
     </div>
  </div>
);

export const PPEMgmtView: React.FC = () => {
  const [activePart, setActivePart] = useState('Head');
  const [isScanning, setIsScanning] = useState(false);

  const activeItem = useMemo(() => PPE_ITEMS.find(i => i.type === activePart), [activePart]);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战术抬头与环境风险 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-indigo-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 relative group">
              <ShieldCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Tactical Safety Loadout Hub
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 个人防护装备 <span className="text-cyan-500 italic">全息配给中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="bg-red-950/20 border border-red-500/30 px-6 py-3 rounded-sm flex items-center gap-4 backdrop-blur-md">
              <div className="p-2 bg-red-500/20 rounded-full animate-pulse"><AlertTriangle className="text-red-500" size={20} /></div>
              <div>
                 <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">当前环境风险</div>
                 <div className="text-sm font-bold text-white uppercase">高压弧闪 (Arc Flash Level 4)</div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统审计号</div>
              <div className="text-xs font-mono text-cyan-400 opacity-60">AUTH-PPE-9022-X</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：用户授权与库存态势 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="技师身份识别" subtitle="BIOMETRIC_AUTH" highlight className="border-cyan-900/30">
              <div className="flex flex-col items-center gap-6 py-2">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-2 border-2 border-dashed border-cyan-500/40 rounded-full"></div>
                    {isScanning ? (
                      <Activity className="text-cyan-400 animate-pulse" size={40} />
                    ) : (
                      <Fingerprint className="text-cyan-500" size={48} />
                    )}
                 </div>
                 <div className="text-center">
                    <div className="text-lg font-bold text-white">王建国 (Maintenance Tech)</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest">UID: 77240188242</div>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-[10px] font-bold">
                       <ShieldCheck size={12} /> 资质已验证: 高压电工
                    </div>
                 </div>
                 <button 
                  onClick={handleScan}
                  className="w-full py-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-cyan-500 hover:bg-cyan-900/20 hover:border-cyan-500/50 transition-all uppercase tracking-widest"
                 >
                    {isScanning ? '验证中...' : '启动身份校验'}
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="配给库存热力" subtitle="STOCK_LEVELS" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: '头部', val: 85 }, { name: '眼面', val: 12 }, { name: '躯干', val: 42 }, { name: '手部', val: 90 }, { name: '足部', val: 30 }
                       ]} layout="vertical" margin={{ left: -20 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0c0a09', border: 'none'}} />
                          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={12}>
                             {Array.from({length: 5}).map((_, i) => (
                               <Cell key={i} fill={i === 1 ? '#ef4444' : '#0ea5e9'} fillOpacity={0.8} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={16} />
                    <div className="text-[10px] text-red-200">
                       <span className="font-bold">警告：</span> 护目镜库存处于临界值（余12），补货在途。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：战术装配数字化指引 (Loadout View) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* 背景格线 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1">
                          <Scan size={14} className="animate-pulse" />
                          EQUIPMENT INTEGRITY SCANNER v4.2
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          战术装配 <span className="text-cyan-500 italic">数字化指引</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">合规安全指数</div>
                       <div className="text-4xl font-mono font-bold text-cyan-400 leading-none mt-1">96.5<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 底部详细信息浮动条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       {activeItem && (
                         <div className="bg-slate-900/80 p-4 rounded border border-cyan-500/40 backdrop-blur-md flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
                            <div className="p-3 bg-cyan-900/40 rounded text-cyan-400 border border-cyan-500/20">
                               {activeItem.icon}
                            </div>
                            <div>
                               <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">选中装备详情</div>
                               <div className="text-lg font-bold text-white">{activeItem.name}</div>
                               <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                     <History size={10} /> 序列号: <span className="text-cyan-400 font-mono">{activeItem.id}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                     <Activity size={10} /> 状态: <span className="text-green-500 font-bold uppercase">{activeItem.status}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="h-10 w-[1px] bg-slate-800"></div>
                            <div className="w-24">
                               <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-bold">
                                  <span>生命值</span>
                                  <span className={activeItem.integrity < 70 ? 'text-red-400' : 'text-cyan-400'}>{activeItem.integrity}%</span>
                               </div>
                               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-1000 ${activeItem.integrity < 70 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${activeItem.integrity}%` }}></div>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* 核心可视化：人体指引图 */}
              <div className="flex-1 w-full flex items-center justify-center pointer-events-auto">
                 <HumanSilhouette activePart={activePart} onSelect={setActivePart} />
              </div>

              {/* 底部功能条 */}
              <div className="absolute bottom-6 right-8 pointer-events-auto">
                 <button className="group relative px-12 py-4 bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold tracking-[0.4em] rounded-sm overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-900/40">
                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative flex items-center gap-3">
                       <CheckCircle2 size={20} /> 确认并解锁配给柜
                    </span>
                 </button>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40"></div>
           </div>
        </div>

        {/* 右翼：合规审计与历史流 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="防护合规性雷达" subtitle="SLA_AUDIT" className="h-64 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COMPLIANCE_DATA}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar 
                          name="合规率" 
                          dataKey="A" 
                          stroke="#06b6d4" 
                          strokeWidth={2} 
                          fill="#06b6d4" 
                          fillOpacity={0.3} 
                       />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="智能领用建议" subtitle="AI_SUGGESTION" className="border-indigo-900/30 bg-indigo-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Briefcase size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">基于工单建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “您即将处理 <span className="text-indigo-400 font-bold">#2号机组高压试验</span>，系统已为您自动勾选‘绝缘防护套件’及‘阻燃面罩’。请确保检查绝缘手套的末次耐压试验有效期。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Layers size={12} className="text-cyan-500" /> 强制领用检查清单
                    </div>
                    {[
                      { label: '电弧防护等级 40cal', status: 'done' },
                      { label: '双重绝缘手套', status: 'pending' },
                      { label: '防尘高压靴', status: 'done' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className={`text-[11px] ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                         {step.status === 'done' ? <ShieldCheck size={12} className="text-green-500" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>}
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Clock size={12} /> 实时领用流水
                 </div>
                 <History size={12} className="text-slate-700" />
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                 {REQUISITION_HISTORY.map((log, i) => (
                   <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-white/5 last:border-0">
                      <span className="text-slate-300 font-bold">{log.item}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-slate-600 font-mono">{log.date}</span>
                         <span className={log.status === 'using' ? 'text-amber-500 animate-pulse' : 'text-slate-600'}>
                            {log.status === 'using' ? '在用' : '归还'}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-500 hover:text-white transition-all">
                 查看全部历史档案
              </button>
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const PlusCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
