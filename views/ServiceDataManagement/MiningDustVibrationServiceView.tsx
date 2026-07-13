
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { DustVibrationThreeScene } from '../../components/ServiceDataManagement/DustVibration/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sm-4]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sm-4';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  ShieldAlert, Activity, Wind, Database, Gauge, 
  Thermometer, AlertTriangle, Layers, Filter, CheckCircle2,
  PenTool, ShieldCheck, ClipboardList, Zap, Clock
} from 'lucide-react';

export const MiningDustVibrationServiceView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('v-sensor-01');
  const [vibeIntense, setVibeIntense] = useState(1);

  // 模拟特种服务指标
  const serviceStats = [
    { label: '数据去噪成功率', value: '99.4%', color: 'text-emerald-400' },
    { label: '滤网阻塞预测', value: '12%', color: 'text-yellow-400' },
    { label: '自清洗系统状态', value: 'STANDBY', color: 'text-blue-400' },
    { label: '应力累计报警', value: '24', color: 'text-red-400' },
  ];

  const maintenanceLog = [
    { time: '10:20', task: '激光镜头压缩空气脉冲自清洗', result: '成功', system: '粉尘治理' },
    { time: '09:15', task: '高频振动去噪算法动态权重更新', result: '已生效', system: '数据治理' },
    { time: '08:00', task: '传感器加固底座疲劳度检测', result: '通过', system: '结构服务' },
    { time: '昨天', task: '防尘密封圈润滑服务档案补录', result: '归档', system: '资产档案' },
  ];

  const vibeFrequencyData = [
    { freq: '10Hz', amp: 12 }, { freq: '50Hz', amp: 45 }, { freq: '100Hz', amp: 88 },
    { freq: '200Hz', amp: 32 }, { freq: '500Hz', amp: 15 }, { freq: '1kHz', amp: 8 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：工况环境与服务概览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/20 border-b border-yellow-500/20 rounded-t-2xl shadow-[inset_0_1px_20px_rgba(234,179,8,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.2)]">
              <ShieldAlert className="text-yellow-500" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-extrabold tracking-tighter text-white">矿山装备高粉尘高振动工况服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-1 text-yellow-500/80"><Activity size={10} /> 实时振动烈度: 12.8 mm/s</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Wind size={10} /> 粉尘浓度: 450 mg/m³</span>
                 <span>|</span>
                 <span className="text-blue-400">服务分级: 极端环境保障级</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {serviceStats.map((s, i) => (
             <div key={i} className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold">{s.label}</span>
                <span className={`text-lg font-mono font-black ${s.color}`}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：数据清洗与算法服务 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="数据抗噪治理流" subtitle="DENOISING SERVICE" className="flex-1">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-300">实时去噪算法负载</span>
                       <span className="text-[10px] text-emerald-400">NORMAL</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[65%] shadow-[0_0_10px_#10b981]"></div>
                    </div>
                 </div>

                 <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={vibeFrequencyData}>
                          <defs>
                             <linearGradient id="colorAmp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis hide />
                          <Area type="monotone" dataKey="amp" stroke="#f59e0b" fill="url(#colorAmp)" strokeWidth={2} />
                       </AreaChart>
                    </ResponsiveContainer>
                    <div className="text-[9px] text-center text-slate-500 mt-1">数据治理前置：动态振动频谱分析 (Hz)</div>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">采样包丢失率</div>
                       <div className="text-lg font-mono text-white">0.02%</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">算法补偿偏移</div>
                       <div className="text-lg font-mono text-white">±0.4%</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="粉尘工况特种维保" subtitle="DUST PROTECTION">
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-2"><Layers size={14}/> 滤网穿透健康度</span>
                    <span className="text-emerald-400 font-bold">92%</span>
                 </div>
                 <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[92%]"></div>
                 </div>
                 <button className="w-full py-2 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/30 rounded text-[10px] text-yellow-500 uppercase font-bold tracking-widest transition-all">
                    执行滤芯手动清洗校验
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：工况可靠性拓扑 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#1c1917]/50 to-transparent border border-white/5 rounded-2xl relative overflow-hidden group">
              {/* 工况应力 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
                    <div className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-3">
                       <Zap className="text-yellow-500" size={20} /> 极端工况应力全息库
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">累计环境冲击</div>
                          <div className="text-lg font-mono text-white tracking-tight">1.28 MGy</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">数据采集熵值</div>
                          <div className="text-lg font-mono text-emerald-400 tracking-tight">0.042</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 交互控件：模拟振动影响预览 */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-500 uppercase font-bold">振动预览调节</div>
                 <input 
                   type="range" min="0" max="10" step="1" value={vibeIntense} 
                   onChange={(e) => setVibeIntense(Number(e.target.value))}
                   className="w-32 accent-yellow-500 h-1 bg-slate-800 rounded-full" 
                 />
              </div>

              <DustVibrationThreeScene vibrationIntensity={vibeIntense} onNodeSelect={setActiveNode} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-6 py-2 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
                       <span className="text-[9px] text-slate-300">高应力点</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[9px] text-slate-300">稳态节点</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* 工况服务日志总线 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                    <Filter size={14} className="animate-pulse" /> 工况感知服务日志流
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">NODE_CLUSTER: RUGGED-A01</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {maintenanceLog.map((log, i) => (
                    <div key={i} className="flex justify-between hover:bg-white/5 p-1 rounded transition-colors group">
                       <div className="flex gap-4">
                          <span className="text-slate-600">[{log.time}]</span>
                          <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">{log.system}</span>
                          <span>{log.task}</span>
                       </div>
                       <span className="text-emerald-500 font-bold">{log.result}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：可靠性管理与决策 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="数据完整性预警" subtitle="INTEGRITY" className="flex-1">
              <div className="h-full flex flex-col justify-between">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 rounded-xl">
                       <ShieldAlert className="text-red-500" size={20} />
                       <div>
                          <div className="text-[10px] font-bold text-white uppercase">传感器物理松动预警</div>
                          <div className="text-[9px] text-slate-500 mt-1 italic">
                             根据振动特征识别到 2 号基座固定螺栓扭矩下降 15%，建议现场复紧。
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl">
                       <ShieldCheck className="text-indigo-400" size={20} />
                       <div>
                          <div className="text-[10px] font-bold text-white uppercase">防护罩磨损审计</div>
                          <div className="text-[9px] text-slate-500 mt-1">
                             外部密封壳体耐磨涂层预计剩余寿命 425 小时。
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-4 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest text-center">工况MTBF预测 (Mean Time Between Failures)</div>
                    <div className="flex justify-center items-end gap-1 h-12">
                       {[30, 45, 60, 40, 80, 55, 90, 70].map((h, i) => (
                          <div key={i} className="flex-1 bg-slate-800 rounded-t-sm relative overflow-hidden group">
                             <div className="absolute bottom-0 w-full bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] text-slate-600 font-mono">
                       <span>T-7D</span>
                       <span>Current</span>
                       <span>T+7D (Est)</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="服务模式优化建议" className="bg-blue-900/10 border-blue-800/30">
              <div className="flex gap-4 items-start">
                 <div className="p-2 bg-blue-500/20 rounded-lg">
                    <ClipboardList size={20} className="text-blue-400" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-white uppercase mb-1 tracking-tight">AI 管理优化建议</div>
                    <div className="text-[9px] text-slate-500 leading-relaxed">
                       基于本周持续 150mg/m³ 以上的高粉尘工况，建议将“电控柜滤网”的维保周期从 15 天临时调整为 7 天。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
