
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MiningSystemThreeScene } from '../../components/MiningSystem/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Database, ShieldCheck, ClipboardList, Settings, Server, Lock, 
  Layers, CheckCircle2, Clock, MapPin, ArrowRight, Activity,
  Truck, HardDrive, Filter, MessageSquareCode, Workflow, Zap, AlertTriangle
} from 'lucide-react';

export const MiningSystemOandMView: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<'crushing' | 'conveying' | 'hoisting'>('conveying');

  const systemInfo = {
    crushing: { title: '破碎系统服务域', color: 'text-amber-500', data: '452,102 条' },
    conveying: { title: '输送系统服务域', color: 'text-emerald-500', data: '1,204,550 条' },
    hoisting: { title: '提升系统服务域', color: 'text-purple-500', data: '892,300 条' },
  };

  const servicePipeline = [
    { id: 'S-201', task: '破碎机衬板磨损评估', status: '进行中', time: '1.2h', system: '破碎' },
    { id: 'S-202', task: '2号皮带接头X射线探伤', status: '已校验', time: '昨日', system: '输送' },
    { id: 'S-203', task: '提升机主轴承润滑分析', status: '异常拦截', time: '2h前', system: '提升' },
    { id: 'S-204', task: '全链路同步一致性校验', status: '已存档', time: '0.5h', system: '全线' },
  ];

  const dataQuality = [
    { name: '破碎', value: 92, fill: '#f59e0b' },
    { name: '输送', value: 98, fill: '#10b981' },
    { name: '提升', value: 95, fill: '#8b5cf6' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：系统管理概览 */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 px-4 bg-slate-900/10 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
             <Workflow className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              矿山破碎、输送、提升系统运维服务数据管理
              <div className="flex gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">Crushing</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">Conveying</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded uppercase">Hoisting</span>
              </div>
            </h1>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-4 font-mono">
              <span>节点 ID: MINE-CORE-CLUSTER-09</span>
              <span>同步时延: 8ms</span>
              <span>数据生命周期: 10年</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase">累计服务资产</span>
              <span className="text-xl font-mono font-bold text-indigo-400">2.54 PB</span>
           </div>
           <div className="w-[1px] h-10 bg-slate-800"></div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase">当前治理效率</span>
              <span className="text-xl font-mono font-bold text-green-400">99.2%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：服务流水线管理 */}
        <div className="w-full lg:w-[25%] flex flex-col gap-4">
           <SciFiCard title="运维服务管线" subtitle="SERVICE PIPELINE" className="flex-1">
              <div className="space-y-4">
                 {servicePipeline.map((item, idx) => (
                   <div key={idx} className="relative group p-3 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-indigo-500/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-indigo-400">{item.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          item.status === '异常拦截' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>{item.status}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{item.task}</div>
                      <div className="flex justify-between items-center mt-2 text-[10px]">
                         <span className="text-slate-500 flex items-center gap-1"><Clock size={10}/> {item.time}</span>
                         <span className="text-slate-400 uppercase">所属: {item.system}</span>
                      </div>
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowRight size={14} className="text-indigo-400" />
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="各子系统服务指数" subtitle="INDEX">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataQuality}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                    <Bar dataKey="value" barSize={15} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化协作主场景 */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
           <div className="flex-1 bg-slate-900/20 border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
              
              {/* 节点详细浮层 */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                    <div className={`text-lg font-bold flex items-center gap-2 ${systemInfo[activeSystem].color}`}>
                       <Zap size={18} /> {systemInfo[activeSystem].title}
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-4 font-mono">
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">托管服务数据包</div>
                          <div className="text-xl text-white font-bold">{systemInfo[activeSystem].data}</div>
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">活跃管理节点</div>
                          <div className="text-xl text-white font-bold">128 Nodes</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 交互提示 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 {(['crushing', 'conveying', 'hoisting'] as const).map(s => (
                   <button 
                     key={s}
                     onClick={() => setActiveSystem(s)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                       activeSystem === s 
                       ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                       : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500'
                     }`}
                   >
                     {systemInfo[s].title.split('系统')[0]}
                   </button>
                 ))}
              </div>

              <MiningSystemThreeScene activeSystem={activeSystem} onSystemSelect={setActiveSystem} />
           </div>

           {/* 底部实时数据治理总线 */}
           <div className="h-36 bg-indigo-950/10 border border-indigo-500/20 rounded-xl flex flex-col p-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> 服务数据治理总线 (Live Governance)
                 </div>
                 <div className="flex gap-2 font-mono text-[10px] text-slate-500">
                    <span>处理引擎: v4.2.0-Alpha</span>
                    <span className="text-green-500">加密状态: AES-GCM生效</span>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-2">
                    <span className="text-slate-600">[0.0ms]</span>
                    <span className="text-amber-500">CRUSH_CORE:</span>
                    <span>解析到破碎机主轴温升异常数据集，已触发专家诊断协议。</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[1.5ms]</span>
                    <span className="text-emerald-500">CONV_BUS:</span>
                    <span>3号输送带纠偏执行器数据回执异常，已启动二次校验程序。</span>
                 </div>
                 <div className="flex gap-2 opacity-50">
                    <span className="text-slate-600">[2.8ms]</span>
                    <span className="text-purple-500">HOIST_DATA:</span>
                    <span>提升机钢丝绳循环次数已达5万次，正在备份全生命周期应力谱。</span>
                 </div>
                 <div className="flex gap-2 animate-pulse">
                    <span className="text-slate-600">[4.2ms]</span>
                    <span className="text-red-500 font-bold">SECURITY_AUDIT:</span>
                    <span>外部非授权节点尝试请求系统拓扑数据，已执行源地址阻断。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：质量与合规矩阵 */}
        <div className="w-full lg:w-[25%] flex flex-col gap-4">
           <SciFiCard title="数据托管完整度" subtitle="COMPLIANCE">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: '结构数据', A: 98 },
                      { subject: '工况数据', A: 92 },
                      { subject: '环境数据', A: 85 },
                      { subject: '安全数据', A: 100 },
                      { subject: '维保数据', A: 95 },
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="服务数据分布" subtitle="ASSET DIST.">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={[
                            { name: '破碎服务包', value: 30 },
                            { name: '输送服务包', value: 45 },
                            { name: '提升服务包', value: 25 },
                         ]}
                         innerRadius={45}
                         outerRadius={65}
                         paddingAngle={8}
                         dataKey="value"
                       >
                          {[
                            <Cell key="0" fill="#f59e0b" />,
                            <Cell key="1" fill="#10b981" />,
                            <Cell key="2" fill="#8b5cf6" />,
                          ]}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-amber-500"></div> 破碎系统</span>
                    <span className="font-mono">30%</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-emerald-500"></div> 输送系统</span>
                    <span className="font-mono">45%</span>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="管理效能建议 (AI)" className="bg-indigo-900/10 border-indigo-800/20">
              <div className="flex flex-col gap-3">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded border border-indigo-500/30">
                       <AlertTriangle className="text-amber-500" size={16} />
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-white uppercase">预防性维护建议</div>
                       <div className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                          基于破碎系统近3个月振动频谱数据，预测2号轴承位可能在下周出现超温，建议提前录入维保计划。
                       </div>
                    </div>
                 </div>
                 <div className="h-[1px] bg-slate-800"></div>
                 <button className="w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 rounded text-[10px] text-indigo-100 flex items-center justify-center gap-2 transition-all">
                    生成系统健康审计报告 <ArrowRight size={10} />
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
