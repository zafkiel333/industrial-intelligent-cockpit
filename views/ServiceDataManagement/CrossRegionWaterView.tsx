
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CrossRegionWaterThreeScene } from '../../components/ServiceDataManagement/CrossRegionWater/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell, ScatterChart, Scatter, PolarRadiusAxis
} from 'recharts';
import { 
  Waves, Activity, GitCommit, MapPin, 
  Droplets, Gauge, AlertOctagon, TrendingUp, 
  ArrowRight, ShieldCheck, Zap, Server
} from 'lucide-react';

export const CrossRegionWaterView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('node-pump1');
  const [flowSpeed, setFlowSpeed] = useState(1.2);

  // Mock Data
  const hydrologyData = {
    sourceLevel: 145.2, // m
    targetNeed: 850, // m3/s
    transferRate: 842, // m3/s
    qualityIndex: 94, // Score
    turbidity: 2.4, // NTU
  };

  const dispatchPlan = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    plan: 800 + Math.sin(i*0.2)*100,
    actual: 800 + Math.sin(i*0.2)*100 + (Math.random()-0.5)*20,
    energy: 4500 + Math.sin(i*0.2)*500
  }));

  const nodeDetails: Record<string, any> = {
    'node-head': { name: '渠首引水枢纽', type: 'GATE', status: 'Normal', p1: '开度: 85%', p2: '流量: 450 m³/s' },
    'node-pump1': { name: '一级泵站集群', type: 'PUMP', status: 'Normal', p1: '机组: 6/8 运行', p2: '扬程: 32m' },
    'node-aque': { name: '沙河渡槽', type: 'STRUCT', status: 'Warning', p1: '沉降: 2mm', p2: '渗流: 0.5L/s' },
    'node-tun': { name: '穿黄隧洞', type: 'TUNNEL', status: 'Normal', p1: '围岩应力: 稳定', p2: '通风: 良好' },
    'node-res': { name: '调蓄水库', type: 'RES', status: 'Normal', p1: '库容: 65%', p2: '入库: 440 m³/s' },
  };

  const qualityComponents = [
    { subject: 'pH值', A: 98, fullMark: 100 },
    { subject: '溶解氧', A: 92, fullMark: 100 },
    { subject: '氨氮', A: 95, fullMark: 100 },
    { subject: '高锰酸盐', A: 88, fullMark: 100 },
    { subject: '总磷', A: 90, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：跨区域调水总指挥 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-transparent border-b border-indigo-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse">
              <GitCommit className="text-indigo-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">跨区域水利工程运行维护服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-indigo-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><MapPin size={12}/> ROUTE: 1,432 KM</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Activity size={12}/> DISPATCH MODE: ECO-OPTIMIZED</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">TOTAL TRANSFER: 24.5亿 m³</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-indigo-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Real-time Flow</div>
              <div className="text-xl font-mono font-black text-cyan-300">{hydrologyData.transferRate} <span className="text-xs text-slate-500">m³/s</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-indigo-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Water Quality</div>
              <div className="text-xl font-mono font-black text-emerald-400">CLASS II</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：源头与水质感知 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Source Status */}
           <SciFiCard title="水源地全要素感知" subtitle="SOURCE MONITOR" className="bg-[#0f172a]/80 border-indigo-900/50">
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                    <div className="text-[9px] text-slate-500 flex justify-center items-center gap-1"><Waves size={10}/> Water Level</div>
                    <div className="text-lg font-bold text-white">{hydrologyData.sourceLevel}m</div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                    <div className="text-[9px] text-slate-500 flex justify-center items-center gap-1"><Droplets size={10}/> Turbidity</div>
                    <div className="text-lg font-bold text-cyan-400">{hydrologyData.turbidity} NTU</div>
                 </div>
              </div>
              
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={qualityComponents}>
                       <PolarGrid stroke="#312e81" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Quality" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Dispatch Plan */}
           <SciFiCard title="全线调度指令执行" subtitle="DISPATCH" className="flex-1 border-indigo-900/50">
              <div className="h-48 w-full mb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dispatchPlan}>
                       <defs>
                          <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 9}} interval={3} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="plan" stroke="#6366f1" fill="url(#colorPlan)" name="Plan Flow" />
                       <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} dot={false} name="Actual" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900/40 p-2 rounded">
                 <span>Plan Adherence: <span className="text-emerald-400 font-bold">99.8%</span></span>
                 <span>Energy Cost: <span className="text-yellow-400 font-bold">0.32 ¥/m³</span></span>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全域 3D 孪生 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-indigo-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(99,102,241,0.1)]">
              
              {/* HUD: Node Detail */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl shadow-2xl min-w-[240px]">
                    <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-2 mb-2">
                       <Server className="text-indigo-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Infrastructure</div>
                          <div className="text-sm font-black text-white uppercase">{nodeDetails[activeNode]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-2 text-[10px] text-slate-300 font-mono">
                       <div className="flex justify-between">
                          <span>类型:</span>
                          <span className="text-white">{nodeDetails[activeNode]?.type}</span>
                       </div>
                       <div className="flex justify-between">
                          <span>状态:</span>
                          <span className={nodeDetails[activeNode]?.status === 'Warning' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{nodeDetails[activeNode]?.status}</span>
                       </div>
                       <div className="h-[1px] bg-white/10 my-1"></div>
                       <div className="text-indigo-200">{nodeDetails[activeNode]?.p1}</div>
                       <div className="text-indigo-200">{nodeDetails[activeNode]?.p2}</div>
                    </div>
                 </div>
              </div>

              {/* Control: Flow Speed */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-400 uppercase font-bold">Simulation Speed</div>
                 <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={flowSpeed} 
                    onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-slate-700 rounded-full accent-indigo-500 cursor-pointer"
                 />
              </div>

              <CrossRegionWaterThreeScene 
                 activeNodeId={activeNode} 
                 onNodeSelect={setActiveNode} 
                 flowVelocity={flowSpeed}
                 waterQualityIndex={hydrologyData.qualityIndex}
              />

              {/* Bottom Legend */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4 px-4 py-2 bg-black/60 rounded-full border border-white/5 backdrop-blur">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> <span className="text-[10px] text-slate-300">Pump Station</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> <span className="text-[10px] text-slate-300">Aqueduct</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> <span className="text-[10px] text-slate-300">Tunnel</span></div>
              </div>
           </div>

           {/* Alerts Log */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <AlertOctagon size={14} /> System Alerts & Operations
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">10:45:12</span>
                    <span className="text-amber-500 font-bold">WARN</span>
                    <span>渡槽段检测到微小沉降位移 (0.5mm)，已触发结构健康预警。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">10:30:00</span>
                    <span className="text-green-500 font-bold">INFO</span>
                    <span>二级泵站 3# 机组完成启动并网，流量平稳增加。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">09:15:20</span>
                    <span className="text-blue-400 font-bold">MAINT</span>
                    <span>全线光纤通信网络巡检完成，无断点。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：运维保障与能耗 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Energy Consumption */}
           <SciFiCard title="梯级泵站能耗分析" subtitle="ENERGY EFF" className="border-indigo-900/50">
              <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                       <Zap size={14} className="text-yellow-400" /> Total Power
                    </div>
                    <div className="text-xl font-bold text-white">45.2 <span className="text-xs font-normal text-slate-500">MW</span></div>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{width: '75%'}}></div>
                 </div>
                 <div className="h-32 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={dispatchPlan.slice(0,10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 8}} />
                          <YAxis hide />
                          <Bar dataKey="energy" fill="#6366f1" radius={[2, 2, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>

           {/* Safety Monitoring */}
           <SciFiCard title="工程安全监测" subtitle="SAFETY" className="flex-1 border-indigo-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-emerald-500" />
                       <div>
                          <div className="text-xs text-white font-bold">大坝/闸门安全</div>
                          <div className="text-[9px] text-slate-500">渗压计/应力计正常</div>
                       </div>
                    </div>
                    <span className="text-[10px] bg-green-900/20 text-green-400 px-1.5 rounded">Safe</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                       <TrendingUp size={16} className="text-amber-500" />
                       <div>
                          <div className="text-xs text-white font-bold">输水管道压力</div>
                          <div className="text-[9px] text-slate-500">局部波动预警</div>
                       </div>
                    </div>
                    <span className="text-[10px] bg-amber-900/20 text-amber-400 px-1.5 rounded">Watch</span>
                 </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded text-[10px] text-indigo-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                 <ArrowRight size={12} /> 生成安全评估日报
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
