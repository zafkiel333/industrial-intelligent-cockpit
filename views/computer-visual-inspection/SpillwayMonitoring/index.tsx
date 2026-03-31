import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/SpillwayMonitoring/ThreeScene';
import { ErosionZone, SpillwayState } from '@/components/computer-visual-inspection/SpillwayMonitoring/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Waves, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  Settings,
  Droplets,
  Zap,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const MOCK_ZONES: ErosionZone[] = [
  { id: '1', position: [-2, 4, -4], depth: 45, area: 1.2, severity: 'high' },
  { id: '2', position: [3, 2, 0], depth: 12, area: 0.5, severity: 'low' },
];

const FLOW_HISTORY = [
  { time: '00:00', flow: 450 },
  { time: '04:00', flow: 520 },
  { time: '08:00', flow: 890 },
  { time: '12:00', flow: 1250 },
  { time: '16:00', flow: 1100 },
  { time: '20:00', flow: 750 },
];

const RADAR_DATA = [
  { subject: '冲刷深度', A: 85, fullMark: 100 },
  { subject: '结构强度', A: 70, fullMark: 100 },
  { subject: '振动频率', A: 45, fullMark: 100 },
  { subject: '表面平整', A: 30, fullMark: 100 },
  { subject: '抗震等级', A: 90, fullMark: 100 },
];

const SpillwayMonitoringView: React.FC = () => {
  const [state] = useState<SpillwayState>({
    flowRate: 1245.5,
    waterLevel: 15.2,
    vibrationLevel: 2.4
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <Waves className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">溢洪道冲刷与结构完整性监测</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Zap size={12} /> SPILLWAY_SECTOR_NORTH
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Structural Health AI Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">实时流量</div>
            <div className="text-xl font-black text-white">{state.flowRate} <span className="text-xs">m³/s</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">结构振动</div>
            <div className="text-xl font-black text-blue-400">{state.vibrationLevel} <span className="text-xs">mm/s</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Visual Analysis */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="冲刷深度多维分析">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar
                    name="Spillway"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="异常区域清单" className="flex-1">
            <div className="space-y-3">
              {MOCK_ZONES.map(zone => (
                <div key={zone.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex justify-between items-center group hover:border-blue-500/50 transition-all">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">区域 ID: {zone.id}</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      冲刷深度: {zone.depth}mm
                      {zone.severity === 'high' && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[8px] rounded uppercase">Critical</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">受损面积</div>
                    <div className="text-sm font-bold text-blue-400">{zone.area} m²</div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <ShieldCheck size={12} /> 结构加固建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到北侧溢洪道中段存在深层冲刷，建议在枯水期进行环氧砂浆修补，并加强消能池底板监测。
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Twin */}
        <div className="col-span-6 relative">
          <SciFiCard title="溢洪道数字孪生系统" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene erosionZones={MOCK_ZONES} flowIntensity={0.8} />
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-blue-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Gate_01: Fully Open</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Sensor_B4: High Vibration</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '上游水位', value: '152.4m', icon: Droplets, color: 'text-blue-400' },
                { label: '下游水位', value: '137.2m', icon: Waves, color: 'text-cyan-400' },
                { label: '消能效率', value: '94.2%', icon: Activity, color: 'text-green-400' },
                { label: '结构寿命', value: '42.5Y', icon: History, color: 'text-purple-400' },
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

        {/* Right: Flow & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="泄洪流量历史趋势">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FLOW_HISTORY}>
                  <defs>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="flow" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能预警与决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="text-yellow-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-yellow-400">高流速冲刷预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    当前流速已超过 12m/s，消能池底板受力接近临界值。建议开启 2# 辅助溢洪道以分担压力。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护优先级
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">闸门维护</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">底板冲刷</span>
                    <span className="text-red-500">CRITICAL</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">侧墙裂缝</span>
                    <span className="text-yellow-500">MEDIUM</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                生成详细巡检报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SpillwayMonitoringView;
