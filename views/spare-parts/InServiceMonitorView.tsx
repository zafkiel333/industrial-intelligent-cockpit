
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MonitoringScene } from '../../components/spare_parts_monitor/MonitoringScene';
import { SensorNode } from '../../components/spare_parts_monitor/three-types';
import { 
  Activity, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Fingerprint, 
  TrendingUp, 
  History, 
  Layers, 
  Scan,
  RefreshCw,
  Search,
  Bell,
  HardDrive,
  Network,
  Radio,
  Microscope,
  Gauge,
  ChevronRight,
  Target,
  Filter,
  Maximize2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, CartesianGrid, Legend, ComposedChart, ReferenceLine
} from 'recharts';

// --- 模拟实时数据 ---
const MONITOR_SENSORS: SensorNode[] = [
  { id: 'SN-01', name: '驱动侧轴承震动', position: [-2.5, 1.8, 0], status: 'optimal', value: 2.4, unit: 'mm/s', type: 'vibration' },
  { id: 'SN-02', name: '非驱动侧轴承温度', position: [2.5, 1.8, 0], status: 'warning', value: 72.5, unit: '°C', type: 'temperature' },
  { id: 'SN-03', name: '主轴轴向位移', position: [0, 0, 1.6], status: 'optimal', value: 0.12, unit: 'mm', type: 'stress' },
  { id: 'SN-04', name: '电机定子电流畸变', position: [-2, -2, 0], status: 'optimal', value: 1.5, unit: '%', type: 'stress' },
  { id: 'SN-05', name: '润滑系统出口压力', position: [2, -2.2, 0], status: 'critical', value: 0.15, unit: 'MPa', type: 'stress' },
];

const SPECTRUM_ANALYSIS = Array.from({ length: 40 }, (_, i) => ({
  freq: i * 2,
  base: 10 + Math.random() * 5,
  current: 10 + (i === 12 ? 45 : Math.random() * 10),
}));

const RUL_DEGRADATION = [
  { time: '0H', health: 100 },
  { time: '1000H', health: 98 },
  { time: '2000H', health: 95 },
  { time: '3000H', health: 88 },
  { time: '4000H', health: 82 },
  { time: 'Now', health: 74 },
  { time: 'Next_Check', health: 65 },
];

const ALARM_LOGS = [
  { time: '14:20:05', type: 'Warning', msg: 'SN-02 温度超过二级阈值', status: 'handling' },
  { time: '13:15:22', type: 'Optimal', msg: '系统自动完成一次PID调优', status: 'closed' },
  { time: '10:42:10', type: 'Critical', msg: 'SN-05 压力过低，备用泵联锁启动失败', status: 'active' },
];

export const InServiceMonitorView: React.FC = () => {
  const [activeSensorId, setActiveSensorId] = useState<string | null>('SN-02');
  const [viewMode, setViewMode] = useState<'hologram' | 'telemetry'>('hologram');

  const activeSensor = useMemo(() => 
    MONITOR_SENSORS.find(s => s.id === activeSensorId) || MONITOR_SENSORS[0], 
  [activeSensorId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：战略监测态势栏 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-indigo-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-white/20 relative group">
              <Activity size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded-sm animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Industrial Asset In-Service Intelligence
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 备件在役 <span className="text-cyan-500 italic">全息监测中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">在线监测资产</div>
              <div className="text-2xl font-mono font-bold text-white">1,248 <span className="text-sm font-normal text-slate-600">UNIT</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统综合健康度</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">92.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">边缘计算负载</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">42%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左侧：资产神经阵列 (Monitoring Tree) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Network size={14} className="text-cyan-500" /> 传感器神经阵列</span>
              <button className="p-1 hover:bg-slate-800 rounded"><Filter size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {MONITOR_SENSORS.map(sensor => (
                <div 
                  key={sensor.id}
                  onClick={() => setActiveSensorId(sensor.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${activeSensorId === sensor.id 
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-cyan-500 mb-1">{sensor.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{sensor.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${sensor.status === 'optimal' ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        {sensor.type === 'vibration' ? <Radio size={16} className="text-cyan-400"/> : 
                         sensor.type === 'temperature' ? <Thermometer size={16} className="text-orange-400"/> : 
                         <Activity size={16} className="text-indigo-400"/>}
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <div className="flex flex-col">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Real-time Value</div>
                        <div className="text-xl font-mono font-bold text-white">
                           {sensor.value} <span className="text-xs text-slate-500 font-normal">{sensor.unit}</span>
                        </div>
                     </div>
                     <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded
                        ${sensor.status === 'optimal' ? 'bg-green-900/30 text-green-400' : 
                          sensor.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400'}
                     `}>{sensor.status}</div>
                  </div>
                  
                  {activeSensorId === sensor.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="数据吞吐效能" subtitle="THROUGHPUT" className="h-40 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.from({length: 12}, (_, i) => ({ x: i, y: 30 + Math.random() * 40 }))}>
                       <Area type="monotone" dataKey="y" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                    </AreaChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-mono font-bold text-white">128 <span className="text-xs">msg/s</span></span>
                    <span className="text-[9px] text-slate-500 uppercase">Synchronized</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息数字孪生监测场 (Monitoring Chamber) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-sm overflow-hidden group">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Target size={14} className="animate-pulse" />
                          Holographic Telemetry Field
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          设备在役 <span className="text-cyan-500 italic">全息数字孪生</span>
                       </h2>
                    </div>
                    <div className="flex gap-4 items-start pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">同步误差率 (Drift)</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">0.002<span className="text-sm font-normal text-slate-600">ms</span></div>
                       </div>
                    </div>
                 </div>

                 {/* 中间操作浮窗 */}
                 {activeSensor && (
                    <div className="absolute top-32 right-8 w-64 bg-slate-900/90 border border-cyan-500/40 p-4 rounded-sm backdrop-blur-xl animate-in slide-in-from-right-4 duration-500 pointer-events-auto shadow-2xl">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Node Focus</span>
                          <Maximize2 size={12} className="text-slate-500 cursor-pointer hover:text-white" />
                       </div>
                       <div className="text-sm font-bold text-white mb-1">{activeSensor.name}</div>
                       <div className="text-xs text-slate-400 font-mono mb-4">{activeSensor.id} - Location: [312, 14, 05]</div>
                       <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">峰值波速</div>
                             <div className="text-lg font-bold text-white font-mono">1.42</div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">置信概率</div>
                             <div className="text-lg font-bold text-emerald-400 font-mono">99.2%</div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Fingerprint size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">数据加密哈希</div>
                             <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">0x9A22...E10B</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                          <Microscope size={14}/> 启动深度自诊断
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <MonitoringScene 
                    sensors={MONITOR_SENSORS} 
                    activeSensorId={activeSensorId}
                    onSensorSelect={setActiveSensorId}
                    systemLoad={0.4}
                 />
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40"></div>
           </div>

           {/* 底部：波形与频谱联合分析器 (Signal Analyzer) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-60">
              <SciFiCard title="高频采样频谱指纹" subtitle="FFT_ANALYSIS" noPadding>
                 <div className="h-full w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SPECTRUM_ANALYSIS}>
                          <defs>
                             <linearGradient id="colorSpec" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="freq" hide />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="current" stroke="#0ea5e9" fill="url(#colorSpec)" strokeWidth={2} name="当前频谱" />
                          <Area type="monotone" dataKey="base" stroke="#475569" fill="transparent" strokeDasharray="5 5" name="基准指纹" />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '9px'}} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="实时波形示波器" subtitle="OSCILLOSCOPE" noPadding>
                 <div className="h-full w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={Array.from({length: 30}, (_, i) => ({ x: i, y: Math.sin(i*0.5) * 10 + Math.random() * 5 }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="x" hide />
                          <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                          <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="3 3" />
                       </LineChart>
                    </ResponsiveContainer>
                    <div className="absolute top-2 right-4 flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                       <Zap size={10} className="animate-pulse" /> 实时捕获中
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：健康驾驶舱 (Health Cockpit) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="多维健康度雷达" subtitle="HEALTH_MATRIX">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: '机械稳定', A: 95, fullMark: 100 },
                      { subject: '热工正常', A: 78, fullMark: 100 },
                      { subject: '润滑充足', A: 45, fullMark: 100 },
                      { subject: '电气纯净', A: 92, fullMark: 100 },
                      { subject: '应力平衡', A: 88, fullMark: 100 },
                    ]}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="健康分" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-3">
                 <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                 <div className="text-[10px] text-red-200 leading-normal">
                    <span className="font-bold">系统预警：</span> 润滑系统出口压力偏差过大 (-12.4%)，建议立即检查主泵输出电磁阀。
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="RUL 寿命退化预测" subtitle="PROGNOSTICS" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={RUL_DEGRADATION}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="health" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                          <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                          <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{value: '失效线', fill: 'red', fontSize: 10}} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase">预计维护窗口</div>
                       <div className="text-sm font-bold text-white">2024-05-12</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase">置信度 (AI)</div>
                       <div className="text-sm font-bold text-cyan-400 font-mono">92.8%</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* 审计日志流 (Mini) */}
           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 <span>异常诊断流 (Alert Stream)</span>
                 <Bell size={12} className="text-red-500" />
              </div>
              <div className="space-y-2 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
                 {ALARM_LOGS.map((log, i) => (
                    <div key={i} className="flex justify-between items-start text-[10px] py-1.5 border-b border-white/5 last:border-0">
                       <div className="flex-1 min-w-0 pr-2">
                          <div className={`font-bold ${log.type === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{log.msg}</div>
                          <div className="text-slate-600 mt-0.5">{log.time}</div>
                       </div>
                       <ChevronRight size={14} className="text-slate-700 shrink-0" />
                    </div>
                 ))}
              </div>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                 <History size={12} /> 查看完整诊断链
              </button>
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
};
