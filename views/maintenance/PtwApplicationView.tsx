
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, 
  Flame, 
  ArrowUpToLine, 
  Construction, 
  Layers, 
  Users, 
  Fingerprint, 
  FileCheck, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Navigation,
  CheckCircle,
  XCircle,
  ChevronRight,
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  Scale,
  // Added Activity to the import list to resolve the missing reference on line 257
  Activity
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟数据 ---
const PERMIT_TYPES = [
  { id: 'hot', label: '动火作业', icon: <Flame />, color: 'text-orange-500' },
  { id: 'high', label: '高处作业', icon: <ArrowUpToLine />, color: 'text-cyan-400' },
  { id: 'confined', label: '受限空间', icon: <Layers />, color: 'text-purple-400' },
  { id: 'lifting', label: '吊装作业', icon: <Construction />, color: 'text-yellow-400' },
  { id: 'electrical', label: '临时用电', icon: <Zap />, color: 'text-blue-400' },
  { id: 'excavation', label: '动土作业', icon: <MapPin />, color: 'text-emerald-400' },
];

const RISK_FACTORS = [
  { subject: '人身风险', A: 45, fullMark: 100 },
  { subject: '环境影响', A: 20, fullMark: 100 },
  { subject: '设备损伤', A: 35, fullMark: 100 },
  { subject: '连锁反应', A: 60, fullMark: 100 },
  { subject: '处置难度', A: 30, fullMark: 100 },
];

const JSA_STEPS = [
  { id: 1, action: '作业区域隔离', measure: '设置警戒线及标识牌', status: true },
  { id: 2, action: '易燃物清除', measure: '作业点10米内无易燃物', status: true },
  { id: 3, action: '防护装备检查', measure: '佩戴阻燃服及防烟面具', status: false },
  { id: 4, action: '灭火设施就位', measure: '配置2台ABC干粉灭火器', status: true },
];

export const PtwApplicationView: React.FC = () => {
  const [selectedType, setSelectedType] = useState('hot');
  const [riskLevel, setRiskLevel] = useState('Medium');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 顶部：申请状态与身份 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-orange-500 text-xs tracking-[0.3em] uppercase mb-1 font-bold">
            <ShieldAlert size={14} className="animate-pulse" />
            Safety Authorization Protocol
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-4">
            电子作业票 <span className="text-orange-500 italic">申请终端</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="text-right border-r border-slate-800 pr-6">
              <div className="text-[10px] text-slate-500 uppercase">申请单编号 / ID</div>
              <div className="text-xl font-mono font-bold text-white">PTW-20240401-0024</div>
           </div>
           <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 p-2 rounded">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="user" className="w-10 h-10 rounded border border-orange-500/30" />
              <div>
                 <div className="text-xs font-bold text-white">陈建国 (特种作业)</div>
                 <div className="text-[9px] text-orange-400 font-mono tracking-widest uppercase">Certified LV-3</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：作业类型与参数录入 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
           <SciFiCard title="作业类型矩阵" subtitle="CATEGORY_SELECT" highlight className="border-orange-500/20">
              <div className="grid grid-cols-2 gap-3">
                 {PERMIT_TYPES.map(type => (
                    <button 
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded border flex flex-col items-center justify-center gap-2 transition-all group relative overflow-hidden
                        ${selectedType === type.id 
                          ? 'bg-orange-950/20 border-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className={`text-xl ${selectedType === type.id ? 'scale-110' : 'opacity-40 group-hover:opacity-100'} transition-transform`}>
                          {type.icon}
                       </div>
                       <span className={`text-[11px] font-bold ${selectedType === type.id ? 'text-white' : 'text-slate-500'}`}>{type.label}</span>
                       {selectedType === type.id && (
                          <div className="absolute top-1 right-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
                          </div>
                       )}
                    </button>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="作业核心参数" subtitle="WORK_METADATA">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">作业区域 / Work Area</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-orange-500 outline-none">
                       <option>#1 发电机组底层</option>
                       <option>#3 压力钢管检查廊道</option>
                       <option>户外变电站 A 区</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">作业时段 / Timeframe</label>
                    <div className="flex gap-2">
                       <input type="text" placeholder="14:00" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-white text-center" />
                       <span className="flex items-center text-slate-600">➔</span>
                       <input type="text" placeholder="18:00" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-white text-center" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">现场监护人 / Supervisor</label>
                    <div className="relative">
                       <input type="text" value="王利民" readOnly className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-400" />
                       <Users className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化风险分析与 JSA */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
              
              {/* 风险雷达图 */}
              <SciFiCard title="多维风险演化模型" subtitle="RISK_RADAR" className="bg-slate-950/30">
                 <div className="h-full w-full flex flex-col">
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RISK_FACTORS}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="风险值" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="p-4 bg-orange-900/10 border-t border-orange-900/20 rounded-b">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400 font-bold uppercase">综合危险指数</span>
                          <span className="text-xl font-bold text-orange-500 font-mono italic">LV-3 High</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[65%]" style={{ boxShadow: '0 0 10px #f59e0b' }}></div>
                       </div>
                    </div>
                 </div>
              </SciFiCard>

              {/* JSA措施核查 */}
              <SciFiCard title="JSA 安全措施核查表" subtitle="MEASURES_AUDIT">
                 <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                    {JSA_STEPS.map(step => (
                       <div key={step.id} className={`p-3 rounded border flex items-center justify-between transition-all
                          ${step.status ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-slate-900/40 border-slate-800'}
                       `}>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-slate-500">#{step.id}</span>
                                <h4 className="text-xs font-bold text-slate-100">{step.action}</h4>
                             </div>
                             <p className="text-[10px] text-slate-500">{step.measure}</p>
                          </div>
                          {step.status ? (
                             <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                          ) : (
                             <button className="w-5 h-5 rounded border border-orange-500/50 flex items-center justify-center hover:bg-orange-500/10">
                                <div className="w-2 h-2 rounded-sm bg-orange-500/20"></div>
                             </button>
                          )}
                       </div>
                    ))}
                    
                    <div className="mt-auto pt-4 flex gap-2">
                       <div className="bg-red-900/10 p-2 rounded border border-red-900/30 flex items-start gap-2">
                          <AlertTriangle className="text-red-500 shrink-0" size={14} />
                          <p className="text-[9px] text-red-300 leading-tight">
                             JSA 分析显示：由于现场环境温度波动，动火作业需额外配置专职“安全观察员”。
                          </p>
                       </div>
                    </div>
                 </div>
              </SciFiCard>
           </div>

           {/* 底部：签名确认区 */}
           <SciFiCard title="多方责任确认与电子签名" subtitle="AUTHORIZATION_CHAIN" className="h-44">
              <div className="flex items-center justify-between h-full px-4 relative">
                 {/* 连线背景 */}
                 <div className="absolute left-20 right-20 top-1/2 h-[1px] bg-slate-800 -z-0"></div>
                 
                 {[
                    { label: '申请人确认', role: '陈建国', date: '14:20', done: true },
                    { label: '安全审核员', role: '自动核验', date: '14:22', done: true },
                    { label: '部门负责人', role: '王大雷', date: '待签署', done: false },
                 ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 relative z-10">
                       <div className={`w-14 h-14 rounded border-2 flex items-center justify-center transition-all duration-700
                          ${step.done ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'border-slate-700 bg-slate-900 text-slate-600'}
                       `}>
                          {step.done ? <Fingerprint size={28} /> : <div className="text-xs font-bold uppercase">Sign</div>}
                       </div>
                       <div className="text-center">
                          <div className={`text-[10px] font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">{step.role}</div>
                          {step.done && <div className="text-[8px] text-emerald-500 mt-0.5">SIGNED @ {step.date}</div>}
                       </div>
                    </div>
                 ))}

                 <div className="flex flex-col gap-2">
                    <button className="px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold tracking-[0.4em] rounded-full shadow-2xl shadow-orange-900/30 hover:scale-105 active:scale-95 transition-all">
                       提交申请协议
                    </button>
                    <div className="text-[9px] text-center text-slate-500 flex items-center justify-center gap-1">
                       <ShieldCheck size={10} className="text-emerald-500" />
                       符合 GB/T 33000-2016 安全生产规范
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：辅助工具与关联信息 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* 环境遥测实时核验 */}
           <SciFiCard title="环境遥测实时核验" subtitle="ENVIRONMENT_SENSING">
              <div className="space-y-4">
                 {[
                   { label: '环境含氧量', val: '21.4%', limit: '19.5% - 23.5%', icon: <Activity />, status: 'PASS' },
                   { label: '易燃气体浓度', val: '0.02%', limit: '< 0.5%', icon: <Flame />, status: 'PASS' },
                   { label: '现场风速', val: '2.4 m/s', limit: '< 10 m/s', icon: <Navigation />, status: 'PASS' },
                 ].map((sensor, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">{sensor.icon} {sensor.label}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">{sensor.status}</span>
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className="text-xl font-mono font-bold text-white">{sensor.val}</span>
                          <span className="text-[9px] text-slate-600 italic">阈值: {sensor.limit}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="相关安全手册" subtitle="KNOWLEDGE_BASE" className="flex-1">
              <div className="space-y-2 h-full flex flex-col">
                 {[
                   { name: '动火作业一级防火制度.pdf', size: '1.2MB' },
                   { name: '紧急灭火器快速指引.dwg', size: '840KB' },
                   { name: '特种作业个人防护规范.pdf', size: '2.4MB' },
                 ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950/50 border border-slate-800 rounded group hover:bg-orange-950/10 cursor-pointer transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="text-slate-500 group-hover:text-orange-500 transition-colors"><FileCheck size={16} /></div>
                          <div className="text-[11px] text-slate-300 group-hover:text-white truncate max-w-[140px]">{doc.name}</div>
                       </div>
                       <ChevronRight size={14} className="text-slate-700" />
                    </div>
                 ))}
                 
                 <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">累计本月申请数</span>
                       <span className="text-white font-mono font-bold">142</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">平均审批时长</span>
                       <span className="text-white font-mono font-bold">18.4 min</span>
                    </div>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded transition-all">
                       查看我的申请历史
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
