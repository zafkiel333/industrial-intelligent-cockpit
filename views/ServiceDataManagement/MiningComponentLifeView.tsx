
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ComponentLifeThreeScene } from '../../components/ServiceDataManagement/ComponentLife/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Calendar, Award, Repeat, Package, Activity, 
  ShieldCheck, Clock, Layers, Zap, AlertTriangle,
  History, Settings, FileText, ClipboardList, Database,
  UserCheck, ArrowRightLeft, TrendingDown
} from 'lucide-react';

export const MiningComponentLifeView: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string>('gear-02');

  const partProfiles: Record<string, any> = {
    'brg-01': { name: '主轴承', model: 'SKF-Explorer-880', health: 82, wearRate: '1.2%/月', rUL: '24个月' },
    'gear-02': { name: '减速齿轮组', model: 'ZF-Mining-H2', health: 45, wearRate: '4.5%/月', rUL: '5个月' },
    'hyd-03': { name: '提升液压缸', model: 'Rexroth-S991', health: 12, wearRate: '8.2%/月', rUL: '12天' },
    'cab-04': { name: '主供电缆', model: 'Siemens-CBL', health: 68, wearRate: '2.0%/月', rUL: '14个月' },
  };

  const replacementHistory = [
    { date: '2023-05-20', part: '减速齿轮组', type: '预防性更换', engineer: '陈工', cost: '￥85,000' },
    { date: '2022-11-15', part: '液压密封件', type: '故障更换', engineer: '王工', cost: '￥4,200' },
    { date: '2022-08-01', part: '主轴承', type: '全检复位', engineer: '技术支持部', cost: '￥12,000' },
    { date: '2022-03-10', part: '行走链板', type: '例行大修', engineer: '外协团队', status: '已校验' },
  ];

  const wearTrend = [
    { month: 'Jan', val: 95 }, { month: 'Feb', val: 92 }, { month: 'Mar', val: 88 },
    { month: 'Apr', val: 82 }, { month: 'May', val: 75 }, { month: 'Jun', val: 68 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：服务管理状态看板 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border border-white/5 rounded-2xl shadow-[inset_0_1px_20px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <History className="text-amber-500" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山大型装备关键部件寿命与更换服务管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-amber-500/80"><Layers size={10} /> 资产监控总量: 142 节点</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Clock size={10} /> 最近同步: 35s 之前</span>
                 <span>|</span>
                 <span className="text-blue-400 font-bold uppercase">Archive: SECURE_LEDGER_ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">待更换高危件</span>
              <span className="text-xl font-mono font-black text-red-500">03</span>
           </div>
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">服务保障周期</span>
              <span className="text-xl font-mono font-black text-emerald-400">99.8%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：服务履历与溯源管理 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="部件更换服务履历" subtitle="SERVICE LEDGER" className="flex-1">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
                 {replacementHistory.map((item, i) => (
                    <div key={i} className="group p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-amber-500/40 transition-all cursor-default relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-1 h-full bg-slate-800 group-hover:bg-amber-500 transition-colors"></div>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-amber-500">{item.date}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                            item.type === '故障更换' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>{item.type}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-200 mb-1">{item.part}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><UserCheck size={10}/> 责任人: {item.engineer}</span>
                          <span className="font-mono text-slate-400">{item.cost}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="备件库服务协同" subtitle="SUPPLY CHAIN">
              <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                 <Package size={24} className="text-blue-400" />
                 <div className="flex-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">在途备件状态</div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                       <span>SKF 核心密封件</span>
                       <span className="text-amber-400">运输中</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_8px_#3b82f6]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：部件全息生命矩阵 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#020617] border border-white/5 rounded-3xl relative overflow-hidden group">
              {/* 背景装饰网格 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 部件详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
                          <Repeat className="text-amber-500" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅部件服务链 (Selected Part)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{partProfiles[selectedPart]?.name}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">规格型号</div>
                          <div className="text-xs font-mono text-white mt-1">{partProfiles[selectedPart]?.model}</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">当前服役衰减率</div>
                          <div className="text-xs font-mono text-amber-400 mt-1">{partProfiles[selectedPart]?.wearRate}</div>
                       </div>
                       <div className="col-span-2 mt-2 pt-2 border-t border-white/10">
                          <div className="text-[9px] text-slate-500 uppercase">预测剩余服务寿命 (RUL)</div>
                          <div className="text-2xl font-black font-mono text-red-500 tracking-tight">{partProfiles[selectedPart]?.rUL}</div>
                       </div>
                    </div>
                 </div>
              </div>

              <ComponentLifeThreeScene activePartId={selectedPart} onPartSelect={setSelectedPart} />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-6 py-2 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
                       <span className="text-[9px] text-slate-300 uppercase">危急更替</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                       <span className="text-[9px] text-slate-300 uppercase">中度损耗</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[9px] text-slate-300 uppercase">健康服役</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* 服务事件治理总线 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    <Database size={14} className="animate-pulse" /> 零部件全生命周期数据总线 (Service Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">PROTOCOL: ASSET-TRACE-X</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[15:30:12]</span>
                    <span className="text-blue-400 font-bold">INFO:</span>
                    <span>解析到部件号 SKF-880 的最新振动趋势，RUL 预测值下调 2%。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[15:32:45]</span>
                    <span className="text-emerald-500 font-bold">SYNC:</span>
                    <span>山西分库已将匹配的行星齿轮备件锁定，关联工单 #WO-9904。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[15:35:01]</span>
                    <span className="text-amber-500 font-bold">AUDIT:</span>
                    <span>上季度轴承更换操作合规性审计完成，数据哈希值已归档。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group opacity-60">
                    <span className="text-slate-600">[15:40:22]</span>
                    <span className="text-slate-500 font-bold">WASH:</span>
                    <span>自动脱敏历史维保技师敏感数据，符合个人隐私保护规范。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：寿命分析与失效预测 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="部件损耗趋势分析" subtitle="WEAR TREND" className="flex-1">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wearTrend}>
                       <defs>
                          <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="val" stroke="#f59e0b" fill="url(#colorWear)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-red-950/10 border border-red-900/20 rounded-xl">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                       <div className="text-[10px] font-bold text-red-400 uppercase">失效临界预警</div>
                       <div className="text-[9px] text-slate-500 mt-1">
                          提升液压缸密封性能已连续 48 小时低于安全阈值，系统建议立即执行计划内停机。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="服务模式效能雷达" subtitle="STRATEGY">
              <div className="h-52 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '预防性', A: 95 }, { subject: '及时性', A: 82 }, { subject: '低成本', A: 75 }, { subject: '精准度', A: 90 }, { subject: '安全性', A: 100 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Status" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="数据一致性校验" className="bg-emerald-950/10 border-emerald-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">零部件溯源链条完整</div>
                    <div className="text-[9px] text-slate-500 mt-1">所有更换记录均已同步至分布式账本，支持原厂级审计。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
