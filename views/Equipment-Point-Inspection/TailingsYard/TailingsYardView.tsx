import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/TailingsYard/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-2]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-2';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, Bar, Cell
} from 'recharts';
import { 
  ShieldCheck, Droplets, Activity, Waves, 
  MapPin, Radar as RadarIcon, Satellite, AlertTriangle, 
  CheckCircle2, Camera, Clock, History, LayoutGrid
} from 'lucide-react';

export const TailingsYardView: React.FC = () => {
  const [missionStep, setMissionStep] = useState(2);
  const [metrics, setMetrics] = useState({
    waterLevel: 42.5,
    freeboard: 3.5, // 安全超高
    phValue: 7.8,
    settlement: 12.4, // 位移 mm
    saturationLine: 18.2 // 浸润线深度 m
  });

  const steps = [
    { name: 'InSAR 全域扫描', status: 'done' },
    { name: '库水位自动校核', status: 'done' },
    { name: '浸润线传感器同步', status: 'active' },
    { name: '排洪构筑物巡检', status: 'pending' },
    { name: '报告自动生成', status: 'pending' }
  ];

  const [obsLogs, setObsLogs] = useState([
    { id: 1, type: 'AI_CRACK', msg: '二级子坝南侧 210m 处疑似微小干缩裂纹', confidence: 0.82, time: '14:20' },
    { id: 2, type: 'SENSOR_OK', msg: '干滩长度 125m 处于安全红色阈值外', confidence: 1.0, time: '14:15' },
  ]);

  const radarData = [
    { subject: '抗滑稳定性', A: 92, fullMark: 100 },
    { subject: '防洪能力', A: 98, fullMark: 100 },
    { subject: '坝体变形', A: 85, fullMark: 100 },
    { subject: '浸润线高度', A: 88, fullMark: 100 },
    { subject: '渗流量监测', A: 90, fullMark: 100 },
  ];

  const displacementTrend = Array.from({length: 12}, (_, i) => ({
    time: `${i*2}h`,
    local: 10 + Math.random() * 5,
    satellite: 11 + Math.random() * 4
  }));

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：巡检任务实时链路 */}
      <div className="bg-[#0b1221]/90 border border-slate-800 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
                <Satellite size={32} className="text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-widest uppercase italic">
                    尾矿堆场智能点巡检系统 <span className="text-cyan-500 text-xl not-italic tracking-normal">// TSF_AUTO_PATROL_V5</span>
                </h1>
                <div className="flex gap-6 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                   <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500"/> 位置: 4号尾矿库 (东区)</span>
                   <span className="flex items-center gap-1"><Activity size={12} className="text-cyan-500"/> 运行状态: 自动巡检执行中</span>
                   <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12}/> 合规等级: 壹级A标准</span>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-4 bg-slate-900/60 px-6 py-3 border border-white/5 rounded-full">
              <Clock size={16} className="text-cyan-500" />
              <div className="text-right">
                 <div className="text-[10px] text-slate-500">NEXT SCHEDULE</div>
                 <div className="text-lg font-mono font-black text-white">18:00:00</div>
              </div>
           </div>
        </div>

        {/* 任务进度条 */}
        <div className="flex justify-between relative px-2">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800 -translate-y-1/2 z-0"></div>
           {steps.map((step, idx) => (
             <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${step.status === 'done' ? 'bg-green-500 border-green-400' : step.status === 'active' ? 'bg-cyan-600 border-cyan-400 animate-ping' : 'bg-slate-900 border-slate-700'}`}>
                   {step.status === 'done' ? <CheckCircle2 size={14} /> : <div className="text-[10px] font-bold">{idx + 1}</div>}
                </div>
                <span className={`text-[10px] font-bold ${step.status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}>{step.name}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* 左侧：3D 巡检主视图 */}
        <div className="w-full lg:w-3/5 flex flex-col gap-5 relative">
           <div className="flex-1 bg-[#020617] border border-cyan-500/20 rounded-sm relative group overflow-hidden">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-40 h-40 border-t border-l border-cyan-500/20 m-4"></div>
                 
                 {/* 无人机姿态仪表 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-white/10 rounded flex items-center gap-4">
                       <RadarIcon size={24} className="text-cyan-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">UAV Altitude</div>
                          <div className="text-xl font-mono font-bold text-white">142.5 m</div>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-white/10 rounded">
                       <div className="text-[10px] text-slate-500 uppercase mb-2 text-center">Gimbal Orientation</div>
                       <div className="w-24 h-24 border border-slate-700 rounded-full relative flex items-center justify-center">
                          <div className="w-1 h-16 bg-cyan-500/50 absolute rotate-45"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                       </div>
                    </div>
                 </div>

                 {/* 实时点位扫描状态 */}
                 <div className="absolute bottom-10 left-10 space-y-4">
                    <div className="bg-black/80 px-4 py-2 border-l-4 border-green-500">
                       <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Zone_04 North Embankment</div>
                       <div className="text-sm font-bold text-white mt-1">位移监测点 #D12: 正常 (Δ2.1mm)</div>
                    </div>
                    <div className="bg-black/80 px-4 py-2 border-l-4 border-amber-500">
                       <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Zone_04 Sump Discharge</div>
                       <div className="text-sm font-bold text-white mt-1">溢洪道畅通性: 合规</div>
                    </div>
                 </div>
              </div>

              <ThreeScene isInspecting={true} />

              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 动态网格背景特效 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 底部：多源异构数据趋势 (巡检对比) */}
           <div className="h-48 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="卫星InSAR vs 地面传感器位移对比" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displacementTrend} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 20]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Line type="monotone" dataKey="local" stroke="#00e5ff" strokeWidth={2} dot={false} name="地表位移计" />
                       <Line type="stepAfter" dataKey="satellite" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="5 5" dot={false} name="卫星形变反演" />
                    </LineChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="坝体健康状态综合评价雷达" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="健康评价" dataKey="A" stroke="#00ff9d" fill="#00ff9d" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：巡检发现与稳定性矩阵 */}
        <div className="w-full lg:w-2/5 flex flex-col gap-5">
           
           {/* 坝体物理指标矩阵 */}
           <SciFiCard title="坝体实时物理特性矩阵" className="bg-[#1a1c2e]/40">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Waves size={30} className="text-cyan-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">库水位海拔</div>
                    <div className="text-3xl font-mono font-black text-cyan-400 mt-2">1,245.8 <span className="text-xs">m</span></div>
                    <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 font-bold">
                       <CheckCircle2 size={10}/> 距离警戒线 4.2m
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Droplets size={30} className="text-blue-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">最大浸润线深度</div>
                    <div className="text-3xl font-mono font-black text-blue-400 mt-2">18.25 <span className="text-xs">m</span></div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                       <History size={10}/> 较昨日 +0.2% (稳)
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded-sm">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">分级子坝稳定性</div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[92%] shadow-[0_0_10px_lime]"></div>
                       </div>
                       <span className="text-xs font-mono font-bold">92%</span>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded-sm">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">尾矿砂平均PH</div>
                    <div className="flex items-center gap-3">
                       <div className="text-2xl font-mono font-black text-amber-400">7.42</div>
                       <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 border border-amber-500/30">弱碱性</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* AI 缺陷识别流 */}
           <SciFiCard title="巡检 AI 发现日志 (实时流)" className="flex-1 border-cyan-900/40">
              <div className="flex flex-col gap-4">
                 {obsLogs.map(log => (
                    <div key={log.id} className="flex gap-4 p-4 bg-slate-900/40 border-l-4 border-cyan-500 group cursor-pointer hover:bg-cyan-500/5 transition-all">
                       <div className="w-16 h-16 bg-slate-800 border border-white/10 rounded-sm flex items-center justify-center relative overflow-hidden">
                          <Camera size={24} className="text-slate-600" />
                          <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-transparent transition-all"></div>
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{log.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 leading-relaxed font-bold">{log.msg}</div>
                          <div className="mt-2 flex items-center gap-3">
                             <div className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">置信度: {(log.confidence*100).toFixed(0)}%</div>
                             <button className="text-[9px] text-cyan-500 font-black hover:underline uppercase italic tracking-tighter">{">>>"} 调取原始红外图像</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 紧急警报按钮区域 */}
                 <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-start gap-3">
                       <AlertTriangle size={20} className="text-red-500 animate-bounce" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase">Emergency Protocol</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold">若大坝形变速率超过 5mm/d 请立即启动应急排洪。</div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 transition-all text-white font-black uppercase italic tracking-[0.3em] shadow-[0_0_25px_rgba(8,145,178,0.3)]">
                       启动全站人工核验响应
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 分布式网关拓扑 */}
           <SciFiCard title="数据节点链路">
              <div className="flex items-center gap-5 py-1 px-2">
                 <div className="w-12 h-12 bg-cyan-950/80 rounded border border-cyan-500/30 flex items-center justify-center">
                    <RadarIcon size={22} className="text-cyan-400" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">
                       <span>Link Health</span>
                       <span className="text-green-400">Excellent</span>
                    </div>
                    <div className="flex gap-1.5">
                       {Array.from({length: 8}).map((_, i) => (
                          <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 6 ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-slate-700'}`}></div>
                       ))}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-2 font-mono">GATEWAY_NODE_TSF_04 :: 25.4 GB/hr STREAMED</div>
                 </div>
              </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
