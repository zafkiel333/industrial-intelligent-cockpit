
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CollaborationThreeScene } from '../../components/ServiceDataManagement/Collaboration/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sm-6]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sm-6';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  Users, Share2, Workflow, Box, Activity, ShieldCheck, 
  Clock, Zap, LayoutGrid, Layers, RefreshCcw, Database,
  ArrowRightLeft, UserCheck, PackageOpen, ClipboardCheck
} from 'lucide-react';

export const MiningMultiFaceCollabView: React.FC = () => {
  const [selectedFace, setSelectedFace] = useState<string>('face-02');

  const faceDetails: Record<string, any> = {
    'face-01': { name: '101工作面', efficiency: 94, resourceStatus: '充足', engineers: 4 },
    'face-02': { name: '102工作面', efficiency: 82, resourceStatus: '紧缺', engineers: 12 },
    'face-03': { name: '201工作面', efficiency: 91, resourceStatus: '均衡', engineers: 3 },
    'face-04': { name: '中央调度池', efficiency: 100, resourceStatus: '全开', engineers: 45 },
  };

  const collabTasks = [
    { id: 'C-901', title: '102面液压支架群紧急专家会诊', initiator: '102面', participant: '总部中心', status: '进行中' },
    { id: 'C-904', title: '跨面备件库位调拨：密封组件 x4', initiator: '101面', participant: '201面', status: '运送中' },
    { id: 'C-908', title: '全矿区采煤机运行性能对标审计', initiator: '治理处', participant: '全工作面', status: '已完成' },
    { id: 'C-912', title: '102面数据同步链路丢包协同修复', initiator: 'IT部', participant: '102面', status: '待响应' },
  ];

  const resourcePool = [
    { name: '液压支护件', stock: 85, shared: 40 },
    { name: '传感器模组', stock: 92, shared: 25 },
    { name: '传动链配件', stock: 65, shared: 15 },
    { name: '电气控制元', stock: 78, shared: 30 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：协同指挥中心头部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-blue-950/10 border border-blue-500/20 rounded-2xl shadow-[inset_0_1px_20px_rgba(59,130,246,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Share2 className="text-blue-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山多工作面协同运维服务管理平台</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-1 text-blue-400"><Workflow size={10} /> 协同模式: 全域动态调度</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 数据同步层: L2 分布式账本</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold tracking-normal">SESSION: GLOBAL_COLLAB_ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">跨面协同活跃数</span>
              <span className="text-lg font-mono font-black text-blue-400">14 / 20</span>
           </div>
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">平均决策周期</span>
              <span className="text-lg font-mono font-black text-emerald-400">8.5 min</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：对标与资源状态 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="工作面运维效能对标" subtitle="BENCHMARKING" className="flex-1">
              <div className="h-full flex flex-col">
                 <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={Object.values(faceDetails).filter(d => d.name !== '中央调度池')}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                          <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} barSize={25}>
                             {Object.values(faceDetails).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.efficiency > 90 ? '#10b981' : '#f59e0b'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 space-y-3">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1">重点协同面详情</div>
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">{faceDetails[selectedFace]?.name}</span>
                          <span className="text-[10px] px-2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">活跃任务: {faceDetails[selectedFace]?.activeTasks}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-400">
                          <div className="flex flex-col">
                             <span>运维人力负载</span>
                             <span className="text-white font-mono font-bold mt-0.5">{faceDetails[selectedFace]?.engineers} 人</span>
                          </div>
                          <div className="flex flex-col">
                             <span>资源平衡度</span>
                             <span className="text-orange-400 font-mono font-bold mt-0.5">{faceDetails[selectedFace]?.resourceStatus}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="各区域资源健康分布" subtitle="HEALTH MAP">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: '人力', A: 85 }, { subject: '备件', A: 62 }, { subject: '数据', A: 99 }, { subject: '工具', A: 78 }, { subject: '经验', A: 92 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Status" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：协同拓扑与数据日志 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-transparent border border-blue-500/10 rounded-2xl relative overflow-hidden group">
              {/* 协同看板 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-blue-500/20 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-500/20 rounded-lg">
                          <LayoutGrid className="text-blue-400" size={20} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">正在浏览</div>
                          <div className="text-sm font-black text-white uppercase tracking-tight">多面协同运维资源拓扑地图</div>
                       </div>
                    </div>
                    <div className="mt-4 flex gap-6">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">数据共享率</div>
                          <div className="text-lg font-mono text-emerald-400 font-bold">100%</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">跨面调拨时延</div>
                          <div className="text-lg font-mono text-white font-bold">2.4ms</div>
                       </div>
                    </div>
                 </div>
              </div>

              <CollaborationThreeScene activeFaceId={selectedFace} onFaceSelect={setSelectedFace} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all flex items-center gap-2">
                    <RefreshCcw size={14} /> 刷新协同拓扑
                 </button>
              </div>
           </div>

           {/* 协同数据治理总线 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> 跨面数据协同总线 (Collab Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">CHANNEL_MASK: 0x88FF_AA01</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:20:01]</span>
                    <span className="text-blue-500 font-bold">SYNC:</span>
                    <span>101综采面将采煤机截割部振动频谱特征包(50MB)广播至协同池。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:20:15]</span>
                    <span className="text-emerald-500 font-bold">MATCH:</span>
                    <span>根据102面报警特征，自动从201面提取同类故障处理工单作为协同参考。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:21:40]</span>
                    <span className="text-orange-500 font-bold">DISPATCH:</span>
                    <span>102综采面发起“技术专家远程协同请求”，系统已关联总部中心专家。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group opacity-60">
                    <span className="text-slate-600">[11:23:12]</span>
                    <span className="text-slate-500 font-bold">AUDIT:</span>
                    <span>跨面协作任务 C-908 数据一致性审计通过，已永久存证。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：协作任务与资源共享 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="跨面协同任务队列" subtitle="TASKS" className="flex-1">
              <div className="space-y-3 mt-1">
                 {collabTasks.map((task, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-blue-500/40 transition-all cursor-default group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-blue-400">{task.id}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase font-bold">{task.status}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{task.title}</div>
                       <div className="flex items-center gap-2 text-[9px] text-slate-500">
                          <UserCheck size={10} /> 参与方: <span className="text-slate-300">{task.initiator}</span> <ArrowRightLeft size={8} /> <span className="text-slate-300">{task.participant}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="共享资源池状态" subtitle="SPARE POOL">
              <div className="space-y-4 py-2">
                 {resourcePool.map((res, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 flex items-center gap-2"><PackageOpen size={12} className="text-blue-500"/> {res.name}</span>
                          <span className="text-white font-mono font-bold">{res.stock}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500 h-full" style={{width: `${res.stock}%`}}></div>
                          <div className="bg-blue-900 h-full" style={{width: `${res.shared}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-4 flex items-center gap-3 p-2 bg-emerald-950/10 border border-emerald-900/30 rounded-lg">
                 <ShieldCheck className="text-emerald-500" size={16} />
                 <div className="text-[9px] text-emerald-400 leading-tight">全矿区共享资源调度策略已由 AI-CORE 完成优化，预计降低库存冗余 12%。</div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
