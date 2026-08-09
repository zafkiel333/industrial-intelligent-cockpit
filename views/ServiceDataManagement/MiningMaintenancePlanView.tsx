
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MaintenanceThreeScene } from '../../components/ServiceDataManagement/MaintenancePlan/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sm-10]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sm-10';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Calendar, ClipboardCheck, Workflow, Server, ShieldCheck, 
  Clock, Zap, Activity, Users, Box, TrendingUp, AlertTriangle,
  History, FileJson, RefreshCw, Layers, CheckCircle, Search
} from 'lucide-react';

export const MiningMaintenancePlanView: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string>('stage-1');

  const stageData: Record<string, any> = {
    'stage-1': { name: '计划编排阶段', desc: 'Q3季度预防性检修任务包制定中', tasks: 12, efficiency: '98%' },
    'stage-2': { name: '资源派发阶段', desc: '主井提升机核心轴承备件调拨锁定', tasks: 8, efficiency: '94%' },
    'stage-3': { name: '过程执行阶段', desc: '102采煤机截割部现场解体检修进行中', tasks: 15, efficiency: '82%' },
    'stage-4': { name: '闭环审计阶段', desc: '针对F-9901故障修复质量的数字化回溯', tasks: 5, efficiency: '100%' },
  };

  const planTimeline = [
    { date: '05-24', task: '全矿区高压供电电缆预防检修', priority: '高', status: '待执行' },
    { date: '05-26', task: '2#主通风机叶片动平衡校验', priority: '中', status: '准备中' },
    { date: '06-01', task: 'MG-1100型采煤机月度深度维保', priority: '高', status: '已计划' },
    { date: '06-05', task: '选矿厂1#破碎机衬板例行更换', priority: '低', status: '已审核' },
  ];

  const executionEfficiency = [
    { name: 'Mon', planned: 10, actual: 9 },
    { name: 'Tue', planned: 12, actual: 12 },
    { name: 'Wed', planned: 8, actual: 11 },
    { name: 'Thu', planned: 15, actual: 13 },
    { name: 'Fri', planned: 10, actual: 9 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：检修指挥中枢头部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border border-indigo-500/20 rounded-2xl shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <ClipboardCheck className="text-indigo-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山装备检修计划与执行闭环数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-indigo-400"><Workflow size={10} /> 模式: 数字化PDCA闭环</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Layers size={10} /> 治理层: 分布式协同审计</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold tracking-normal uppercase underline decoration-emerald-500/30 underline-offset-4">Kernel Status: Synced</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">活跃检修工单</span>
              <span className="text-xl font-mono font-black text-indigo-400 tracking-tighter">42 / 1250</span>
           </div>
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">计划达成率</span>
              <span className="text-xl font-mono font-black text-emerald-400 tracking-tighter">98.5%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：计划总线与检修日历 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="检修计划总线" subtitle="PLANNING BUS" className="flex-1 overflow-hidden">
              <div className="mb-4">
                 <div className="flex justify-between items-center px-1 mb-3">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">近期关键计划点</span>
                    <Calendar size={12} className="text-slate-600" />
                 </div>
                 <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[420px]">
                    {planTimeline.map((p, i) => (
                       <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-mono text-indigo-400">{p.date}</span>
                             <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                               p.priority === '高' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'
                             }`}>{p.priority} 优先级</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{p.task}</div>
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                             <span className="flex items-center gap-1"><Clock size={10} /> 状态: {p.status}</span>
                             <button className="text-indigo-500 hover:text-indigo-300">详情包</button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="计划资源负载预测" subtitle="FORECAST">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '人力', val: 85 }, { name: '工具', val: 62 }, { name: '备件', val: 92 }, { name: '机位', val: 45 }
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis hide />
                       <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：闭环数据治理主场景 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#020617] border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
              {/* 背景修饰 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 治理详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40">
                          <Workflow className="text-indigo-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">当前流程状态节点</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{stageData[activeStage]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/10">
                       <div className="text-[11px] text-indigo-200 leading-relaxed italic">“{stageData[activeStage]?.desc}”</div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">节点任务数</div>
                             <div className="text-lg font-mono text-white font-bold">{stageData[activeStage]?.tasks} <span className="text-[10px] text-slate-600">UNIT</span></div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">数据流转效率</div>
                             <div className="text-lg font-mono text-emerald-400 font-bold">{stageData[activeStage]?.efficiency}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <MaintenanceThreeScene activeStageId={activeStage} onStageSelect={setActiveStage} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
                    <RefreshCw size={14} /> 强制触发全流程审计 (Force Audit)
                 </button>
              </div>
           </div>

           {/* 过程执行数据总线 */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> 过程执行实时数据流 (Live Execution Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">PROTOCOL: SDM-LOOP-X</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:20:12]</span>
                    <span className="text-blue-400 font-bold">EVENT:</span>
                    <span>山西1号矿区电铲主轴承维保工单 #W-8802 已进入“实绩数据校验”阶段。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:22:45]</span>
                    <span className="text-emerald-500 font-bold">SYNC:</span>
                    <span>备件库反馈： MG-1100型密封圈 x4 已从中心库完成跨区调拨关联。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:25:01]</span>
                    <span className="text-amber-500 font-bold">WARN:</span>
                    <span>计划偏差预警：2#提升机制动片更换耗时超出计划均值 15.4%。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group opacity-60">
                    <span className="text-slate-600">[16:30:22]</span>
                    <span className="text-slate-500 font-bold">AUDIT:</span>
                    <span>Q2季度历史检修知识沉淀完成，共解析 142 条专家经验规则。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：闭环分析与效能审计 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="计划 vs 实绩对比" subtitle="LOOP ANALYSIS" className="flex-1">
              <div className="h-52 w-full mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={executionEfficiency}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Line type="monotone" dataKey="planned" name="计划量" stroke="#6366f1" strokeWidth={2} dot={{r:3}} />
                       <Line type="monotone" dataKey="actual" name="实绩量" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl mt-4">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <div>
                       <div className="text-[10px] font-bold text-indigo-300 uppercase">偏差根因挖掘报告</div>
                       <div className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                          近期实绩波动主因：山西分矿区“特种润滑工具”调拨延迟。系统建议优化 Q3 季度备品前置策略。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="闭环治理评估雷达" subtitle="GOVERNANCE">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: '数据完整', A: 95 }, { subject: '审计合规', A: 100 }, { subject: '偏差受控', A: 82 }, { subject: '经验复用', A: 90 }, { subject: '实时响应', A: 99 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Governance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="数字化资产存证" className="bg-emerald-950/10 border-emerald-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">检修全链条数据确权</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">检修实绩包已通过中心化哈希背书，具备原厂级法律效力，支持跨机构审计。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
