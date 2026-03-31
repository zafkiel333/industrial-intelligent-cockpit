import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/ConveyorTear/ThreeScene';
import { TearAnomalies, BeltState } from '@/components/computer-visual-inspection/ConveyorTear/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  Settings,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  Timer,
  Scan,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOCK_ANOMALIES: TearAnomalies[] = [
  { id: 'T-102', position: 45, length: 120, severity: 'high' },
  { id: 'T-105', position: 78, length: 45, severity: 'medium' },
];

const TENSION_HISTORY = [
  { time: '10:00', tension: 45 },
  { time: '10:05', tension: 48 },
  { time: '10:10', tension: 52 },
  { time: '10:15', tension: 44 },
  { time: '10:20', tension: 46 },
  { time: '10:25', tension: 47 },
];

const ConveyorTearView: React.FC = () => {
  const [state] = useState<BeltState>({
    speed: 3.5,
    tension: 46.8,
    isScanning: true
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <Scan className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">输送带纵向撕裂视觉识别系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> CONVEYOR_UNIT_07
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">DeepScan AI v4.2 Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">带速</div>
            <div className="text-xl font-black text-white">{state.speed} <span className="text-xs">m/s</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">张力</div>
            <div className="text-xl font-black text-blue-400">{state.tension} <span className="text-xs">kN</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Detection Stats */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="实时撕裂风险评估">
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <TrendingUp size={14} className="text-green-500" />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">综合健康指数</div>
                <div className="text-3xl font-black text-white">92.4%</div>
                <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92.4%' }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">今日预警</div>
                  <div className="text-lg font-black text-white">03</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">停机风险</div>
                  <div className="text-lg font-black text-green-500">LOW</div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="异常撕裂点列表" className="flex-1">
            <div className="space-y-3">
              {MOCK_ANOMALIES.map(anomaly => (
                <div key={anomaly.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-red-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{anomaly.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      anomaly.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {anomaly.severity === 'high' ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">撕裂长度</div>
                      <div className="text-sm font-black text-white">{anomaly.length} mm</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500 uppercase font-mono">传送带位置</div>
                      <div className="text-sm font-black text-blue-400">{anomaly.position}m</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Belt */}
        <div className="col-span-6 relative">
          <SciFiCard title="输送带数字孪生监控" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene anomalies={MOCK_ANOMALIES} speed={state.speed} isScanning={state.isScanning} />
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-blue-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Scanning Overlay */}
            <div className="absolute top-4 left-4 p-3 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">Laser Scanning Active</span>
              </div>
              <div className="text-[8px] text-slate-500 font-mono">RESOLUTION: 0.1mm/px</div>
              <div className="text-[8px] text-slate-500 font-mono">LATENCY: 12ms</div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '累计里程', value: '1,245km', icon: History, color: 'text-blue-400' },
                { label: '电机负载', value: '78%', icon: Zap, color: 'text-yellow-400' },
                { label: '托辊状态', value: 'Normal', icon: ShieldCheck, color: 'text-green-400' },
                { label: '环境温度', value: '28.4°C', icon: Activity, color: 'text-cyan-400' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={12} className={item.color} />
                    <span className="text-[8px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-lg font-black text-white tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Right: Tension & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="张力实时波动曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TENSION_HISTORY}>
                  <defs>
                    <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="tension" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTension)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能决策建议" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">严重撕裂预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    检测到 T-102 处存在 120mm 纵向撕裂，且有扩大趋势。建议在下个检修窗口（预计 2 小时后）进行紧急补焊。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护优先级
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">带面补强</span>
                    <span className="text-red-500">CRITICAL</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">托辊更换</span>
                    <span className="text-yellow-500">MEDIUM</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">电机润滑</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                导出实时诊断报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConveyorTearView;
