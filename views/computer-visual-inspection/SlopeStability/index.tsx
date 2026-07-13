import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/SlopeStability/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-slope-stability]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-slope-stability';
import { SlopeAnomalies, SlopeState } from '@/components/computer-visual-inspection/SlopeStability/three-types';
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
  CloudRain,
  Mountain,
  Waves
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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

const MOCK_ANOMALIES: SlopeAnomalies[] = [
  { id: 'S-01', position: [5, 10, 5], displacement: 45.2, velocity: 2.1, severity: 'high' },
  { id: 'S-04', position: [-8, 6, -2], displacement: 12.8, velocity: 0.5, severity: 'low' },
];

const DISPLACEMENT_HISTORY = [
  { time: '00:00', val: 12 },
  { time: '04:00', val: 15 },
  { time: '08:00', val: 28 },
  { time: '12:00', val: 42 },
  { time: '16:00', val: 45 },
  { time: '20:00', val: 44 },
];

const RADAR_DATA = [
  { subject: '位移量', A: 85, fullMark: 100 },
  { subject: '降雨量', A: 70, fullMark: 100 },
  { subject: '水位', A: 45, fullMark: 100 },
  { subject: '应力', A: 60, fullMark: 100 },
  { subject: '稳定性', A: 30, fullMark: 100 },
];

const SlopeStabilityView: React.FC = () => {
  const [state] = useState<SlopeState>({
    safetyFactor: 1.24,
    rainfall: 12.5,
    groundwaterLevel: -8.4
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500/40 rounded flex items-center justify-center">
            <Mountain className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">露天矿边坡稳定性视觉分析系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Zap size={12} /> SLOPE_SECTOR_NORTH
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-widest">稳定性 AI 引擎激活</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">安全系数</div>
            <div className="text-xl font-black text-white">{state.safetyFactor} <span className="text-xs">FOS</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">降雨量</div>
            <div className="text-xl font-black text-cyan-400">{state.rainfall} <span className="text-xs">mm</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Risk Analysis */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="边坡健康度多维分析">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar
                    name="Slope"
                    dataKey="A"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="位移异常点列表" className="flex-1">
            <div className="space-y-3">
              {MOCK_ANOMALIES.map(anomaly => (
                <div key={anomaly.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{anomaly.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      anomaly.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-500'
                    }`}>
                      {anomaly.severity === 'high' ? '严重' : '稳定'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">累计位移</div>
                      <div className="text-sm font-black text-white">{anomaly.displacement} mm</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500 uppercase font-mono">位移速率</div>
                      <div className="text-sm font-black text-blue-400">{anomaly.velocity} mm/d</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Terrain */}
        <div className="col-span-6 relative">
          <SciFiCard title="边坡数字孪生可视化" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene anomalies={MOCK_ANOMALIES} safetyFactor={state.safetyFactor} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-cyan-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">风险等级: 高</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <CloudRain size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">降雨量: 12.5mm</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '地下水位', value: '-8.4m', icon: Waves, color: 'text-blue-400' },
                { label: '应力水平', value: '45MPa', icon: Zap, color: 'text-yellow-400' },
                { label: '监测点位', value: '128', icon: ShieldCheck, color: 'text-green-400' },
                { label: '预警状态', value: '激活', icon: Activity, color: 'text-cyan-400' },
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

        {/* Right: Trends & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="位移历史趋势曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DISPLACEMENT_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="val" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能预警与决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">滑坡风险预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    北侧边坡 S-01 点位移速率激增至 2.1mm/d，安全系数降至 1.24。受近期强降雨影响，滑坡风险等级：<span className="text-red-500 font-bold">HIGH</span>。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <div className="text-[10px] text-cyan-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. 立即停止北侧采场作业。<br/>
                  2. 加强 S-01 区域雷达监测频率。<br/>
                  3. 启动边坡削坡减载应急预案。
                </p>
              </div>

              <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                导出详细稳定性评估报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SlopeStabilityView;
