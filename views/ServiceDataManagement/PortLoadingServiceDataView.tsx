
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { PortLoadingThreeScene } from '../../components/ServiceDataManagement/PortLoading/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-6]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-6';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Truck, Anchor, Box, Activity, Zap, Server, 
  Settings, AlertTriangle, Layers, Clock,
  ArrowRight, Container, Database, RefreshCw, Terminal
} from 'lucide-react';

export const PortLoadingServiceDataView: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('STS-01');
  const [efficiency, setEfficiency] = useState(1.2); // Multiplier for animation

  // Mock Data
  const fleetStatus = [
    { name: 'STS Cranes', available: 12, maintenance: 1, total: 13, color: '#facc15' },
    { name: 'ARMGs', available: 42, maintenance: 3, total: 45, color: '#10b981' },
    { name: 'AGVs', available: 85, maintenance: 5, total: 90, color: '#3b82f6' },
  ];

  const tosLog = [
    { time: '10:45:12', id: 'MOV-8821', type: 'LOAD', src: 'YARD A-02', dst: 'STS-04', status: 'ACTIVE' },
    { time: '10:45:05', id: 'MOV-8820', type: 'DISCH', src: 'STS-02', dst: 'AGV-12', status: 'COMPLETED' },
    { time: '10:44:48', id: 'MOV-8819', type: 'SHUFFLE', src: 'YARD B-11', dst: 'YARD B-11', status: 'COMPLETED' },
    { time: '10:44:30', id: 'MOV-8818', type: 'LOAD', src: 'YARD C-05', dst: 'STS-01', status: 'ACTIVE' },
  ];

  const performanceTrend = Array.from({length: 12}, (_, i) => ({
      hour: `${8+i}:00`,
      mph: 30 + Math.random() * 5, // Moves per hour
      target: 32
  }));

  const spreaderHealth = {
      locks: 85, // % lifecycle
      hydraulic: 92, // % pressure health
      electric: 98 // % signal integrity
  };

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0f172a] p-2 overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-yellow-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              <Anchor className="text-yellow-500" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">港口装卸与配套装备运维服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-400 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-1 text-yellow-500"><Activity size={10} /> 吞吐量: 2450 TEU/h</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-blue-400"><Database size={10} /> TOS 延迟: 12ms</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold">AUTOMATION LEVEL: L4</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">待处理维保工单</span>
              <span className="text-xl font-mono font-black text-yellow-500">04</span>
           </div>
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">设备综合利用率</span>
              <span className="text-xl font-mono font-black text-emerald-400">94.2%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Fleet Status */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="装备集群可用性矩阵" subtitle="FLEET STATUS" className="flex-1">
              <div className="space-y-4">
                 {fleetStatus.map((fleet, i) => (
                    <div key={i} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white">{fleet.name}</span>
                            <span className="text-[10px] text-slate-400">{fleet.available}/{fleet.total} Online</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="h-full" style={{width: `${(fleet.available/fleet.total)*100}%`, backgroundColor: fleet.color}}></div>
                            <div className="h-full bg-red-500/50" style={{width: `${(fleet.maintenance/fleet.total)*100}%`}}></div>
                        </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">关键部件：吊具 (Spreader) 健康度</div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">旋锁机构寿命</span>
                          <span className="text-white font-mono">{spreaderHealth.locks}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{width: `${spreaderHealth.locks}%`}}></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">液压系统压力</span>
                          <span className="text-white font-mono">{spreaderHealth.hydraulic}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: `${spreaderHealth.hydraulic}%`}}></div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="智能排程状态" subtitle="SCHEDULING">
              <div className="flex items-center gap-3 p-3 bg-blue-900/10 border border-blue-800/30 rounded-lg">
                 <Server className="text-blue-400" size={20} />
                 <div>
                    <div className="text-xs font-bold text-blue-200">AI 堆场优化算法</div>
                    <div className="text-[9px] text-slate-500 mt-1">
                       当前翻箱率降低 <span className="text-emerald-400">12%</span>，平均提箱时间减少 <span className="text-emerald-400">45s</span>。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#1e293b] to-[#020617] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              {/* HUD: Selected Unit */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                       <Box className="text-yellow-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Unit</div>
                          <div className="text-sm font-black text-white uppercase">{activeId}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                       <div>状态: <span className="text-emerald-400 font-bold">作业中</span></div>
                       <div>负载: <span className="text-white font-bold">28.5t</span></div>
                       <div>能耗: <span className="text-blue-400 font-bold">2.4 kWh</span></div>
                       <div>任务: <span className="text-white">MOV-8824</span></div>
                    </div>
                 </div>
              </div>

              <PortLoadingThreeScene
                 efficiency={efficiency}
                 activeEquipmentId={activeId}
                 onSelect={setActiveId}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-500 uppercase font-bold">Simulation Speed</div>
                 <input 
                    type="range" min="0.5" max="3" step="0.1" value={efficiency} 
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-32 accent-yellow-500 h-1 bg-slate-800 rounded-full" 
                 />
              </div>
           </div>

           {/* TOS Instruction Stream */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Terminal size={14} /> TOS Instruction Stream (Live)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">Q: 142 Pending</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {tosLog.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors items-center">
                       <span className="text-slate-600 w-12">[{log.time}]</span>
                       <span className="text-yellow-500 font-bold w-16">{log.id}</span>
                       <span className={`px-1.5 rounded text-[8px] font-bold w-12 text-center ${
                          log.type === 'LOAD' ? 'bg-blue-900 text-blue-300' : 
                          log.type === 'DISCH' ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-300'
                       }`}>{log.type}</span>
                       <span className="flex-1 text-slate-300">{log.src} <ArrowRight size={8} className="inline mx-1"/> {log.dst}</span>
                       <span className="text-slate-500">{log.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Efficiency & Energy */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="作业效率趋势 (MPH)" subtitle="MOVES PER HOUR" className="flex-1">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrend}>
                       <defs>
                          <linearGradient id="colorMph" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis hide domain={[20, 40]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="mph" stroke="#10b981" strokeWidth={2} fill="url(#colorMph)" />
                       <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center px-2 mt-2">
                 <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Gross MPH</div>
                    <div className="text-lg font-mono font-bold text-white">32.4</div>
                 </div>
                 <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Quay Crane MPH</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">28.1</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="单箱能耗分析" subtitle="ENERGY / TEU">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Zap size={16} className="text-yellow-400" />
                       <span className="text-xs">Energy Consumption</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-white">4.2 <span className="text-xs text-slate-500">kWh/TEU</span></span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{width: '65%'}}></div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <button className="py-2 bg-slate-800 hover:bg-blue-600/30 border border-slate-700 rounded text-[10px] font-bold text-slate-300 transition-all flex items-center justify-center gap-2">
                       <RefreshCw size={12} /> 能量回收数据
                    </button>
                    <button className="py-2 bg-slate-800 hover:bg-blue-600/30 border border-slate-700 rounded text-[10px] font-bold text-slate-300 transition-all flex items-center justify-center gap-2">
                       <Clock size={12} /> 待机功耗审计
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
