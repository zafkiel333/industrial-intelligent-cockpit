
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ExtremeConditionThreeScene } from '../../components/ServiceDataManagement/ExtremeCondition/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sm-12]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sm-12';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, Cell, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  ShieldAlert, Activity, Flame, Wind, Database, 
  Terminal, ShieldCheck, Zap, AlertTriangle, 
  LayoutGrid, Compass, Lock, Workflow, History,
  FileWarning, HardDrive, Cpu
} from 'lucide-react';

export const MiningExtremeConditionView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('env-3');

  const stressIndex = 74;

  const nodeStats: Record<string, any> = {
    'env-1': { name: '深部采区地温流', type: '高热量载荷', value: '48.5 °C', risk: 'HIGH', protocol: 'ISOLATION-7' },
    'env-2': { name: '瓦斯运移监测层', type: '生化浓度', value: '0.45%', risk: 'MID', protocol: 'DILUTION-ACTIVE' },
    'env-3': { name: '顶板应力矢量场', type: '结构压力', value: '145 MPa', risk: 'CRITICAL', protocol: 'REINFORCE-OMEGA' },
    'env-4': { name: '突涌水渗流模型', type: '液体动压', value: '12 m³/h', risk: 'LOW', protocol: 'DRAIN-STANDBY' },
  };

  const mitigationLogs = [
    { time: '14:20:01', event: '应力集中区服务节点自动漂移', action: '边缘熔断', status: 'SUCCESS' },
    { time: '14:18:45', event: '高温区通信模组切换至强化模式', action: '硬件增强', status: 'ACTIVE' },
    { time: '14:15:30', event: '极端工况毫秒级全采样包完成快照', action: '数据固化', status: 'ARCHIVED' },
    { time: '14:10:12', event: 'AI预判未来30min内存在冲击压风险', action: '风险对冲', status: 'PRE-ALERT' },
  ];

  const safetyRadar = [
    { subject: '防爆安全性', A: 100 }, { subject: '高压鲁棒性', A: 95 }, { subject: '高温冗余度', A: 88 }, { subject: '断网续传率', A: 92 }, { subject: '应急决策快', A: 98 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020202] p-2 overflow-hidden select-none">
      
      {/* 顶部：保障指挥部头部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-red-950/20 border border-red-500/30 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.1)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-red-600/30 border border-red-500/50 rounded-xl animate-pulse">
              <ShieldAlert className="text-red-500" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山极端工况与安全保障服务数据管理指挥台</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-red-500/80"><Activity size={10} /> 全域风险指数: {stressIndex} / 100</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 存证层: 分布式高冗余节点</span>
                 <span>|</span>
                 <span className="text-yellow-500 font-black">MODE: EXTREME_CONDITION_ARMED</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-5 py-2 bg-black border border-red-900 rounded-lg flex flex-col items-end min-w-[150px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">已处理极端事件</span>
              <span className="text-xl font-mono font-black text-red-500">124</span>
           </div>
           <div className="px-5 py-2 bg-black border border-slate-800 rounded-lg flex flex-col items-end min-w-[150px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">保障服务可用性</span>
              <span className="text-xl font-mono font-black text-emerald-400">99.999%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：极端事件与风险总线 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="风险矢量实时总线" subtitle="RISK BUS" className="flex-1 overflow-hidden">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[480px]">
                 {Object.entries(nodeStats).map(([id, node]) => (
                   <div 
                    key={id} 
                    onClick={() => setSelectedNode(id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      selectedNode === id ? 'bg-red-600/10 border-red-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-red-500/30'
                    }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-white uppercase">{node.name}</span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                           node.risk === 'CRITICAL' ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-800 text-slate-400'
                         }`}>{node.risk}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 font-mono">
                         <div>感知类型: <span className="text-red-400">{node.type}</span></div>
                         <div>实时数值: <span className="text-white">{node.value}</span></div>
                      </div>
                      {selectedNode === id && (
                         <div className="absolute right-0 bottom-0 p-1 opacity-20">
                            <Zap size={16} className="text-red-500" />
                         </div>
                      )}
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="边缘冗余服务负载" subtitle="EDGE REDUNDANCY">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-red-500/20 rounded-xl">
                    <HardDrive size={24} className="text-red-400" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px]">
                       <span className="text-slate-500 uppercase font-bold">本地数据暂存水位</span>
                       <span className="text-red-400 font-mono">12.5%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-red-600 w-[12.5%] shadow-[0_0_8px_#dc2626]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：安全防御全息场景 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-red-950/10 to-[#020202] border border-red-500/10 rounded-3xl relative overflow-hidden group">
              {/* 装饰性HUD */}
              <div className="absolute inset-0 tech-grid-bg opacity-5 pointer-events-none"></div>
              
              {/* 矢量详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur-2xl border border-red-500/30 p-5 rounded-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                       <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
                          <Flame className="text-red-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅防御逻辑 (Active Protocol)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{nodeStats[selectedNode]?.protocol}</div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase">感知器隔离状态</span>
                          <span className="text-emerald-400 font-bold uppercase">PHYSICALLY_ISOLATED</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">数据容错率</div>
                             <div className="text-lg font-mono text-white font-bold">12.8% <span className="text-[8px] text-slate-600">ERR</span></div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">自动修复因子</div>
                             <div className="text-lg font-mono text-red-500 font-bold">0.992</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <ExtremeConditionThreeScene activeNodeId={selectedNode} onNodeSelect={setSelectedNode} globalStressIndex={stressIndex} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10">
                 <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex items-center gap-3 group">
                    <Zap size={14} className="group-hover:scale-125 transition-transform" /> 立即启动全矿井安全策略熔断 (Emergency Trip)
                 </button>
              </div>
           </div>

           {/* 保障策略审计日志 */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    <Terminal size={14} className="animate-pulse" /> 安全保障服务策略审计 (Policy Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">KERNEL_VERSION: SHIELD_PRO_V5</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {mitigationLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className="text-red-500 font-bold w-20">{log.action}</span>
                       <span className="flex-1 text-slate-300">{log.event}</span>
                       <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-yellow-500'}`}>[{log.status}]</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：效能对标与合规存证 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="保障系统效能雷达" subtitle="ASSURANCE" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={safetyRadar}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Status" dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-xl mt-2">
                 <div className="flex items-center gap-3">
                    <FileWarning className="text-red-500" size={20} />
                    <div>
                       <div className="text-[10px] font-bold text-red-300 uppercase leading-none">最近极端风险评估</div>
                       <div className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                          当前工作面应力释放频率异常增加 12%，触发保障模型 C-15：全自动化补强数据下发。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="安全保障资源池" subtitle="RESOURCES">
              <div className="space-y-4">
                 {[
                   { label: '备用带宽通路', val: 100, status: 'READY' },
                   { label: '应急决策算力', val: 75, status: 'IDLE' },
                   { label: '容错节点配额', val: 42, status: 'BUSY' }
                 ].map((s, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">{s.label}</span>
                          <span className="text-red-400 font-bold">{s.status}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600" style={{width: `${s.val}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="数据完整性背书" className="bg-emerald-950/10 border-emerald-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">极端工况存证已锁定</div>
                    <div className="text-[9px] text-slate-500 mt-1">所有安全保障指令均关联数字签名，支持百万级并发审计。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
