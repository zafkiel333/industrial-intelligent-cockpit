import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-0]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-0';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Activity, Thermometer, Zap, Timer, AlertTriangle, CheckCircle2, 
  Wind, Droplets, Waves, AlignLeft, Wifi
} from 'lucide-react';

interface EquipmentViewProps {
  title: string;
}

// Helper for initial random seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const EquipmentView: React.FC<EquipmentViewProps> = ({ title }) => {
  const seed = title.length; 

  // Initialize State with seed data
  const [metrics, setMetrics] = useState({
    waterLevel: (120 + seededRandom(seed) * 5),
    flowRate: (350 + seededRandom(seed+1) * 20),
    vaneOpen: (85 + seededRandom(seed+2) * 5),
    powerOutput: (580 + seededRandom(seed+3) * 10),
    powerFactor: 0.92,
    vibration: 2.69,
    temp: 48.1,
    latency: 12
  });

  const [trendData, setTrendData] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(seededRandom(seed + i * 13) * 30) + 60,
    }))
  );

  const [logs, setLogs] = useState([
    { time: '19:14:49', source: 'ENV_MONITOR', msg: '下游生态流量监测正常', type: 'info' },
    { time: '19:14:35', source: 'CLOUD_UPLINK', msg: '数据包上传至工业云端', type: 'success' },
    { time: '19:14:29', source: 'CLOUD_UPLINK', msg: '数据包上传至工业云端', type: 'success' },
    { time: '19:14:13', source: 'PWR_STABILIZER', msg: '瞬时负载波动补偿启动', type: 'warning' },
    { time: '19:14:11', source: 'VIB_SENSOR', msg: '检测到#3轴承微小震动波峰', type: 'warning' },
  ]);

  const radarData = [
    { subject: '机械效率', A: 90, fullMark: 100 },
    { subject: '振动稳定', A: 85, fullMark: 100 },
    { subject: '热工健康', A: 95, fullMark: 100 },
    { subject: '润滑油压', A: 88, fullMark: 100 },
    { subject: '电气绝缘', A: 92, fullMark: 100 },
    { subject: '空蚀余量', A: 80, fullMark: 100 },
  ];

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Metrics with small random fluctuations
      setMetrics(prev => ({
        waterLevel: prev.waterLevel + (Math.random() - 0.5) * 0.1,
        flowRate: prev.flowRate + (Math.random() - 0.5) * 2,
        vaneOpen: Math.min(100, Math.max(0, prev.vaneOpen + (Math.random() - 0.5) * 0.2)),
        powerOutput: prev.powerOutput + (Math.random() - 0.5) * 1.5,
        powerFactor: 0.92 + (Math.random() - 0.5) * 0.01,
        vibration: Math.max(0, prev.vibration + (Math.random() - 0.5) * 0.05),
        temp: prev.temp + (Math.random() - 0.5) * 0.2,
        latency: Math.max(5, Math.floor(prev.latency + (Math.random() - 0.5) * 3))
      }));

      // 2. Update Trend Chart (Rolling Window)
      setTrendData(prev => {
        const lastTime = prev[prev.length - 1].time;
        const newValue = Math.max(40, Math.min(100, prev[prev.length - 1].value + (Math.random() - 0.5) * 10));
        const newData = [...prev.slice(1), { time: lastTime + 1, value: newValue }];
        return newData;
      });

      // 3. Random Log Injection (Occasional)
      if (Math.random() > 0.8) {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const logTemplates = [
           { source: 'SYS_HEARTBEAT', msg: '系统心跳检测正常', type: 'info' },
           { source: 'AI_OPTIMIZER', msg: '完成一轮PID参数微调', type: 'success' },
           { source: 'VIB_SENSOR', msg: '震动频谱分析完成', type: 'info' },
           { source: 'THERMAL_CAM', msg: '红外热像扫描：温度均匀', type: 'info' }
        ];
        const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        
        setLogs(prev => [
            { time: timeStr, ...randomLog },
            ...prev.slice(0, 4) // Keep only last 5 logs
        ]);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani]">
      
      {/* Header Area specific to this view */}
      <div className="flex items-end justify-between border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-500 mb-1 uppercase tracking-wider">
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
             LIVE FEED / 实时接入 <span className="text-slate-500">|</span> 工业智能运维
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             {title.replace('智能运维', '')} <span className="text-2xl text-cyan-600 font-light">#01机组</span>
          </h1>
        </div>
        <div className="text-right">
             <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">System ID / 系统编号</div>
             <div className="text-xl font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 border-l-4 border-cyan-500">
               S1-1-X99
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          
          {/* Environment Monitor */}
          <SciFiCard title="环境与流体监测">
             <div className="flex flex-col gap-6 py-2">
                <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-2">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Waves size={16} className="text-blue-400"/>
                      <span>上游水位 (m)</span>
                   </div>
                   <span className="text-2xl font-bold text-white font-mono">{metrics.waterLevel.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-2">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Droplets size={16} className="text-cyan-400"/>
                      <span>瞬时流量 (m³/s)</span>
                   </div>
                   <span className="text-2xl font-bold text-white font-mono">{metrics.flowRate.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Wind size={16} className="text-slate-400"/>
                      <span>导叶开度 (%)</span>
                   </div>
                   <span className="text-2xl font-bold text-white font-mono">{metrics.vaneOpen.toFixed(1)}%</span>
                </div>
             </div>
          </SciFiCard>

          {/* AI Diagnosis */}
          <SciFiCard title="AI 智能诊断核心" className="flex-1">
             <div className="text-sm leading-relaxed text-slate-400">
                <p className="mb-3">
                   <span className="text-cyan-400 font-bold"> AI核心模块A-7报告：</span> 
                   {title.replace('智能运维', '')}机组H7-β2型 运行态势稳定，持续智能调优。
                </p>
                <p className="mb-3">
                   实时空蚀系数 <span className="text-white border-b border-white/20">Δσ 0.052</span>，
                   远低于0.060预警阈值。主轴承应力分布 <span className="text-white">±12.8MPa</span>，
                   无局部应力集中。
                </p>
                <p>
                   电网谐波畸变率 <span className="text-orange-400">THD-U 1.15%</span>，电能质量指标高。
                   预测未来500个操作周期内无0级故障。动态算法持续提升效率。
                </p>
             </div>
          </SciFiCard>

        </div>

        {/* CENTER COLUMN */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
           {/* 3D View */}
           <div className="flex-1 relative bg-[#0b1221] border border-slate-800 rounded-sm overflow-hidden min-h-[300px]">
              {/* Overlay UI in 3D View */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                 <div className="absolute top-4 left-4 w-32 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
                 <div className="absolute top-4 left-4 w-[1px] h-32 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                 <div className="absolute bottom-4 right-4 w-32 h-[1px] bg-gradient-to-l from-cyan-500 to-transparent"></div>
                 <div className="absolute bottom-4 right-4 w-[1px] h-32 bg-gradient-to-t from-cyan-500 to-transparent"></div>
              </div>
              <ThreeScene type="turbine" color="#0891b2" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Event Log */}
           <SciFiCard title="设备交互与事件日志" subtitle="LIVE LOG STREAM" className="h-[200px]" noPadding>
              <div className="overflow-y-auto h-full p-2 font-mono text-xs">
                 <table className="w-full text-left border-collapse">
                    <tbody>
                       {logs.map((log, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
                             <td className="py-1.5 px-2 text-slate-500">{log.time}</td>
                             <td className="py-1.5 px-2 text-cyan-700 font-bold">[{log.source}]</td>
                             <td className={`py-1.5 px-2 ${log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'}`}>
                                {log.type === 'warning' && '⚠️ '}{log.msg}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SciFiCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
           {/* Output Power */}
           <SciFiCard title="有功功率 Output" subtitle="TARGET: 600MW">
              <div className="mt-2">
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white tracking-tighter transition-all">{metrics.powerOutput.toFixed(1)}</span>
                    <span className="text-xl text-slate-500 font-medium">MW</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 mt-3 mb-1 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000" style={{ width: `${(metrics.powerOutput / 700) * 100}%` }}></div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>无功: 40.2 MVar</span>
                    <span>PF: {metrics.powerFactor.toFixed(2)}</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Radar Chart */}
           <SciFiCard title="多维健康度" subtitle="94.5 A+" className="flex-1">
              <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Current" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.2} />
                    </RadarChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Trend Chart */}
           <SciFiCard title="综合效率趋势" subtitle="89.9%">
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                    <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fill="url(#colorTrend)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-20">
         <div className="bg-[#0b1221] border border-slate-800 p-3 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
               <AlignLeft size={40} className="text-yellow-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Vibration X/Y</div>
            <div className="flex items-baseline gap-2">
               <Zap size={14} className="text-yellow-500" />
               <span className="text-xl font-bold text-slate-200 font-mono">{metrics.vibration.toFixed(2)}</span>
               <span className="text-xs text-slate-600">mm/s</span>
            </div>
         </div>

         <div className="bg-[#0b1221] border border-slate-800 p-3 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
               <Thermometer size={40} className="text-red-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Brg Temp</div>
             <div className="flex items-baseline gap-2">
               <Thermometer size={14} className="text-red-500" />
               <span className="text-xl font-bold text-slate-200 font-mono">{metrics.temp.toFixed(1)}</span>
               <span className="text-xs text-slate-600">°C</span>
            </div>
         </div>

         <div className="bg-[#0b1221] border border-slate-800 p-3 flex flex-col justify-center relative overflow-hidden group">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">System Health</div>
             <div className="flex items-center gap-2">
               <CheckCircle2 size={18} className="text-green-500" />
               <span className="text-xl font-bold text-slate-200">NORMAL</span>
            </div>
         </div>

         <div className="bg-[#0b1221] border border-slate-800 p-3 flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute bottom-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
               <Wifi size={40} className="text-blue-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Network Latency</div>
             <div className="flex items-baseline gap-2">
               <Wifi size={14} className="text-blue-500" />
               <span className="text-xl font-bold text-slate-200 font-mono">{metrics.latency}</span>
               <span className="text-xs text-slate-600">ms</span>
            </div>
         </div>
      </div>

    </div>
  );
};