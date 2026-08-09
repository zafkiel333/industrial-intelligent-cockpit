
import React, { useState } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { MiningThreeScene } from '../components/Mining/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sm-1]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sm-1';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Database, ShieldCheck, ClipboardList, Briefcase, FileSearch, 
  Settings, Server, Lock, Layers, CheckCircle2, Clock, MapPin, 
  ArrowRight, Download, Filter, MessageSquareCode
} from 'lucide-react';

export const MiningServiceDataView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'governance'>('lifecycle');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 管理 KPI 数据
  const kpis = [
    { label: '服务数据资产总量', value: '4.2 TB', icon: Database, color: 'text-cyan-400' },
    { label: '管理工单总数', value: '1,502 件', icon: ClipboardList, color: 'text-orange-400' },
    { label: '数据分类准确率', value: '99.8 %', icon: ShieldCheck, color: 'text-green-400' },
    { label: '同步边缘节点', value: '12 个', icon: Server, color: 'text-purple-400' },
  ];

  const serviceTimeline = [
    { date: '2024-05-20', event: '预防性维护数据录入', type: 'MAINTENANCE', status: '已校验' },
    { date: '2024-05-18', event: '核心液压包故障分析报告', type: 'DIAGNOSIS', status: '已存档' },
    { date: '2024-05-15', event: '季度性能指标对标管理', type: 'BENCHMARK', status: '进行中' },
    { date: '2024-05-10', event: '备件库存周转效率优化', type: 'INVENTORY', status: '已完成' },
  ];

  const qualityData = [
    { subject: '数据合规', A: 98 },
    { subject: '实时同步', A: 95 },
    { subject: '跨区共享', A: 85 },
    { subject: '加密强度', A: 100 },
    { subject: '完整度', A: 92 },
  ];

  const handleNodeClick = (id: string) => {
    setSelectedNode(id);
    console.log(`Clicked on node: ${id}`);
    // 这里可以触发侧边弹窗或具体数据展示
  };

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部标题与管理KPI */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/20 border border-cyan-500/50 rounded shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Briefcase className="text-cyan-400" size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  露天矿与井工矿大型采掘装备运行服务数据管理
                </h1>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest flex gap-4 mt-1">
                  <span>管理等级: L4 核心数据资产</span>
                  <span>|</span>
                  <span>托管协议: SLM-Enterprise V3</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-slate-800 hover:bg-cyan-600 transition-all rounded border border-slate-700 flex items-center gap-2 text-xs">
                <Download size={14} /> 导出管理报告
             </button>
             <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 transition-all rounded border border-cyan-400 flex items-center gap-2 text-xs font-bold text-white shadow-lg">
                <Filter size={14} /> 数据检索
             </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
           {kpis.map((kpi, i) => (
             <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg flex items-center gap-4 hover:border-cyan-500/50 transition-colors cursor-default group">
                <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-900/30 transition-colors`}>
                   <kpi.icon className={kpi.color} size={20} />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 uppercase">{kpi.label}</div>
                   <div className="text-xl font-mono font-bold text-white">{kpi.value}</div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：管理逻辑页签 */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
           <SciFiCard title="服务全生命周期数据链" subtitle="LIFECYCLE">
              <div className="flex gap-1 mb-4 p-1 bg-slate-950 rounded-lg">
                 <button 
                   onClick={() => setActiveTab('lifecycle')}
                   className={`flex-1 py-1.5 text-[10px] rounded transition-all ${activeTab === 'lifecycle' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   历史档案回溯
                 </button>
                 <button 
                   onClick={() => setActiveTab('governance')}
                   className={`flex-1 py-1.5 text-[10px] rounded transition-all ${activeTab === 'governance' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   实时数据质控
                 </button>
              </div>

              {activeTab === 'lifecycle' ? (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                   {serviceTimeline.map((item, idx) => (
                     <div key={idx} className="relative pl-6 border-l border-slate-800 group cursor-pointer hover:bg-slate-800/20 p-2 rounded transition-all">
                        <div className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_8px_cyan] transition-all"></div>
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[10px] font-mono text-cyan-500">{item.date}</span>
                           <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 border border-slate-800">{item.status}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white">{item.event}</div>
                        <div className="text-[9px] text-slate-500 mt-1 uppercase font-mono">{item.type}</div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                   <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={qualityData}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name="Quality" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                         </RadarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-2 gap-2 w-full mt-4">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                         <div className="text-[9px] text-slate-600 uppercase">清洗延迟</div>
                         <div className="text-sm font-bold text-green-400">12ms</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                         <div className="text-[9px] text-slate-600 uppercase">异常拦截</div>
                         <div className="text-sm font-bold text-orange-400">0</div>
                      </div>
                   </div>
                </div>
              )}
           </SciFiCard>

           <SciFiCard title="数据托管与安全合规" subtitle="COMPLIANCE">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-2 bg-green-950/10 border border-green-900/30 rounded">
                    <Lock size={16} className="text-green-500" />
                    <div>
                       <div className="text-[10px] font-bold text-green-400">国标 GB/T 35273 加密生效</div>
                       <div className="text-[8px] text-slate-500">所有导出链路已执行AES-256脱敏</div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-400 uppercase">数据主权所属:</span>
                    <span className="text-cyan-400 font-bold">华北中心矿区</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化全息视窗 */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a]/40 to-transparent border border-cyan-500/10 rounded-xl relative overflow-hidden group">
              {/* 点击交互提示 */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                 <div className="flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                    <span className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest">Digital Archive Explorer</span>
                 </div>
                 {selectedNode && (
                   <div className="mt-4 bg-black/60 backdrop-blur border border-white/10 p-3 rounded-lg animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">选中节点详细档案: {selectedNode}</div>
                      <div className="text-[10px] text-slate-400">正在调取云端全生命周期服务数据集...</div>
                   </div>
                 )}
              </div>

              {/* 装饰层 */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-transparent to-transparent"></div>
              
              <MiningThreeScene onNodeClick={handleNodeClick} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                 <div className="bg-black/40 backdrop-blur border border-white/5 p-2 rounded flex gap-4 text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={10} className="text-red-500" /> 设备坐标: E110 N39</span>
                    <span className="flex items-center gap-1"><Clock size={10} className="text-cyan-500" /> 上次核验: 10:45:01</span>
                 </div>
                 <button className="h-8 w-8 rounded-full bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110 active:scale-95">
                    <ArrowRight size={16} />
                 </button>
              </div>
           </div>

           {/* 底部管理日志 */}
           <div className="h-32 bg-slate-900/30 border border-slate-800 rounded-lg flex flex-col p-3 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <MessageSquareCode size={14} className="text-cyan-500" /> 管理活动总线 (Live Events)
                 </span>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:42:01]</span>
                    <span className="text-cyan-500">SERVICE_DATA_INBOUND:</span>
                    <span>接收到大型电铲 #01 结构应力回归分析数据。</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:41:55]</span>
                    <span className="text-green-500">GOVERNANCE_PASSED:</span>
                    <span>数据包签名验证成功，通过国网级安全网闸。</span>
                 </div>
                 <div className="flex gap-2 opacity-50">
                    <span className="text-slate-600">[10:41:40]</span>
                    <span className="text-slate-500">SYSTEM_CLEANUP:</span>
                    <span>自动清理 30 天前的过期服务缓存数据。</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:41:22]</span>
                    <span className="text-orange-500">SLA_MONITOR:</span>
                    <span>警告：井工矿 102 面数据回传延迟超过 50ms。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：治理、共享与分布 */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
           <SciFiCard title="数据资产结构" subtitle="ASSET ANALYSIS">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={[
                            { name: '机械履历', value: 400, color: '#06b6d4' },
                            { name: '电气参数', value: 300, color: '#8b5cf6' },
                            { name: '环境载荷', value: 200, color: '#f59e0b' },
                            { name: '人工巡检', value: 100, color: '#10b981' },
                         ]}
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={5}
                         dataKey="value"
                       >
                          {[
                            { color: '#06b6d4' }, { color: '#8b5cf6' }, { color: '#f59e0b' }, { color: '#10b981' }
                          ].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #333', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-cyan-500"></div> 机械结构档案</span>
                    <span className="font-mono text-white">40%</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-purple-500"></div> 电气控制数据</span>
                    <span className="font-mono text-white">30%</span>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="边缘节点同步状态" subtitle="NETWORK">
              <div className="flex flex-col gap-4">
                 {[
                   { name: '山西塔山站', status: 'ACTIVE', load: 42 },
                   { name: '内蒙古准格尔站', status: 'ACTIVE', load: 88 },
                   { name: '陕西红柳林站', status: 'ACTIVE', load: 15 },
                 ].map((node, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                         <span className="text-slate-400">{node.name}</span>
                         <span className="text-green-400 font-bold">{node.status}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className="bg-cyan-500 h-full transition-all duration-1000" style={{width: `${node.load}%`}}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="管理效能决策辅助" className="bg-cyan-900/10 border-cyan-800/30">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-cyan-600/20 rounded border border-cyan-500/30">
                    <Layers className="text-cyan-400" size={20} />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-cyan-100">优化建议 (AI-CORE)</div>
                    <div className="text-[9px] text-slate-400 mt-1">建议调拨液压站备件库存，历史数据预测下周使用率上升 15%。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
