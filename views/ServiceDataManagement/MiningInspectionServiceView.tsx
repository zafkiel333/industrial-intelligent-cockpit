
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { InspectionThreeScene } from '../../components/ServiceDataManagement/Inspection/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Scan, ShieldCheck, Activity, Database, LayoutGrid, 
  MapPin, Clock, Workflow, ClipboardList, AlertCircle,
  Eye, FileSearch, Trash2, CheckCircle2, History,
  HardDrive, Cpu, Terminal
} from 'lucide-react';

export const MiningInspectionServiceView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('uav-01');

  const nodeDetails: Record<string, any> = {
    'uav-01': { name: '大疆御 3T (A-12)', battery: '68%', mission: '露天矿边坡稳定性勘测', data: '450.2 MB' },
    'bot-04': { name: '四足巡检机器人', battery: '92%', mission: '102 综采面皮带廊道巡检', data: '1.2 GB' },
    'ar-22': { name: 'AR 智能眼镜-22', user: '张工', mission: '提升机房预防性点检', data: '88.5 MB' },
  };

  const inspectionQueue = [
    { time: '10:45', route: '主井提升系统巡检', operator: '机器人 R-04', status: '同步中' },
    { time: '10:30', route: '边坡地质灾害巡查', operator: '无人机 A-12', status: '已存档' },
    { time: '09:15', route: '配电中心人工复核', operator: '李工 (AR)', status: '已校验' },
    { time: '昨日', route: '洗选车间季度大检', operator: '系统自动', status: '待审计' },
  ];

  const aiRecognition = [
    { type: '螺栓松动', count: 12, confidence: 98.2 },
    { type: '漏油异常', count: 4, confidence: 95.5 },
    { type: '非授权入侵', count: 0, confidence: 100 },
    { type: '部件温升', count: 7, confidence: 91.2 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：巡检管理状态头 */}
      <div className="flex items-center justify-between px-6 py-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl shadow-[inset_0_1px_30px_rgba(16,185,129,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Scan className="text-emerald-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山装备智能巡检与服务数据管理指挥台</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-emerald-500/80"><LayoutGrid size={10} /> 巡检网格: G-402 | 活跃终端: 08</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 存证层: 分布式哈希链条</span>
                 <span>|</span>
                 <span className="text-blue-400 font-bold uppercase underline underline-offset-4 decoration-blue-500/30">Protocol: INSPECT-SECURE-X</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">巡检覆盖率</span>
              <span className="text-xl font-mono font-black text-emerald-400">99.2%</span>
           </div>
           <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">AI 识别召回率</span>
              <span className="text-xl font-mono font-black text-blue-400">97.5%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：巡检任务与缺陷清单 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="全域巡检任务总线" subtitle="TASK PIPELINE" className="flex-1 overflow-hidden">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[480px]">
                 {inspectionQueue.map((item, i) => (
                    <div key={i} className="group p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition-all cursor-default relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-emerald-500">{item.time}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                            item.status === '待审计' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>{item.status}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-200 mb-1">{item.route}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={10}/> 采集端: {item.operator}</span>
                          <button className="text-emerald-500 hover:text-white transition-colors">查看包</button>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="AI 视觉识别缺陷分布" subtitle="AI INSIGHTS">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiRecognition} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="type" type="category" stroke="#64748b" tick={{fontSize: 9}} width={60} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息拓扑与数据治理日志 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#061612] to-[#020617] border border-emerald-500/10 rounded-3xl relative overflow-hidden group">
              {/* 背景装饰网格 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 节点详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40">
                          <Workflow className="text-emerald-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅巡检采集链路 (Live Link)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{nodeDetails[selectedNode]?.name || '远程终端节点'}</div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/10">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">当前任务负荷</div>
                          <div className="text-xs font-mono text-emerald-300">{nodeDetails[selectedNode]?.mission || 'N/A'}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">数据上传量</div>
                             <div className="text-lg font-mono text-white font-bold">{nodeDetails[selectedNode]?.data || '0 MB'}</div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">终端电量/状态</div>
                             <div className="text-lg font-mono text-emerald-400 font-bold">{nodeDetails[selectedNode]?.battery || 'ONLINE'}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <InspectionThreeScene activeNodeId={selectedNode} onNodeSelect={setSelectedNode} />

              <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                 <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-3">
                    <History size={16} /> 触发数据一致性校验 (Chain Audit)
                 </button>
              </div>
           </div>

           {/* 巡检治理数据总线 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <Terminal size={14} className="animate-pulse" /> 巡检感知数据治理总线 (Perception Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">NODE_HASH: 0x88EE...A091</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:20:01]</span>
                    <span className="text-emerald-500 font-bold">INFO:</span>
                    <span>接收到无人机 A-12 上传的红外热图(15MB)，已启动边缘识别引擎。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:20:15]</span>
                    <span className="text-blue-500 font-bold">SYNC:</span>
                    <span>识别到 2 号提升机轴承位温度异常 (+5.2°C)，自动关联工单服务记录。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[11:21:40]</span>
                    <span className="text-amber-500 font-bold">WARN:</span>
                    <span>AR 终端-22 定位偏移异常 (&gt2m)，已自动标记该段数据为“需二次人工核验”。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group opacity-60">
                    <span className="text-slate-600">[11:23:12]</span>
                    <span className="text-slate-500 font-bold">ARCHIVE:</span>
                    <span>上午巡检任务全包哈希摘要已写入区块链节点 #Mining-Nodes-Main。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：质量监控与合规存证 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="巡检质量多维雷达" subtitle="QA MATRIX" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '真实性', A: 100 }, { subject: '覆盖度', A: 92 }, { subject: '识别精度', A: 95 }, { subject: '同步延时', A: 88 }, { subject: '方案闭环', A: 99 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                 <ShieldCheck className="text-emerald-500" size={18} />
                 <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase leading-none">所有巡检数据已数字签名</div>
                    <div className="text-[9px] text-slate-500 mt-1">证书编号: CERT-OM-99201-MINE</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="边缘存储与计算状态" subtitle="HARDWARE">
              <div className="grid grid-cols-2 gap-3 py-2">
                 <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <HardDrive className="mx-auto text-emerald-500 mb-1" size={20} />
                    <div className="text-[9px] text-slate-500 uppercase">本地缓存剩余</div>
                    <div className="text-sm font-mono text-white">4.2 TB</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <Cpu className="mx-auto text-blue-500 mb-1" size={20} />
                    <div className="text-[9px] text-slate-500 uppercase">推理单元负载</div>
                    <div className="text-sm font-mono text-white">24%</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="专家服务协同箱" subtitle="TOOLS">
              <div className="flex gap-2">
                 <button className="flex-1 py-2 bg-slate-800 hover:bg-emerald-600/30 rounded border border-slate-700 text-[10px] font-bold transition-all">
                    缺陷分级导出
                 </button>
                 <button className="flex-1 py-2 bg-slate-800 hover:bg-emerald-600/30 rounded border border-slate-700 text-[10px] font-bold transition-all">
                    调取历史比对
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
