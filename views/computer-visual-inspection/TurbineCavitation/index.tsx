import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/TurbineCavitation/ThreeScene';
import { CavitationPoint } from '@/components/computer-visual-inspection/TurbineCavitation/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Wind, 
  Zap, 
  Activity, 
  AlertCircle, 
  Settings, 
  RefreshCw,
  BarChart3,
  Gauge,
  Droplets,
  ShieldCheck
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const MOCK_POINTS: CavitationPoint[] = [
  { id: '1', bladeIndex: 0, intensity: 0.8, position: [3, 0.5, 0.5] },
  { id: '2', bladeIndex: 2, intensity: 0.5, position: [-1.5, -0.2, 2.5] },
  { id: '3', bladeIndex: 4, intensity: 0.9, position: [-2, 0.8, -2] },
];

const RADAR_DATA = [
  { subject: '振动', A: 120, fullMark: 150 },
  { subject: '噪声', A: 98, fullMark: 150 },
  { subject: '效率', A: 86, fullMark: 150 },
  { subject: '压力脉动', A: 99, fullMark: 150 },
  { subject: '空化强度', A: 85, fullMark: 150 },
];

const SPECTRUM_DATA = Array.from({ length: 20 }, (_, i) => ({
  freq: `${i * 10}Hz`,
  value: Math.random() * 100,
}));

const TurbineCavitationView: React.FC = () => {
  const [rpm, setRpm] = useState(120);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('warning');

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Wind className="text-cyan-400 animate-spin-slow" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-white uppercase italic">水轮机叶片空蚀智能检测系统</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 text-[10px] font-bold rounded border border-cyan-700/30 uppercase tracking-tighter">Intelligent Cavitation Monitor</span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono">NODE_ID: TURBINE_07_ALPHA</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">当前转速</div>
            <div className="text-2xl font-black text-cyan-400 font-mono">{rpm} <span className="text-xs">RPM</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">运行效率</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">94.2 <span className="text-xs">%</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Health & Radar */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="健康度多维分析" className="flex-1">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Runner Health"
                    dataKey="A"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="实时状态监控">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <Gauge className="text-cyan-400" size={18} />
                  <span className="text-xs font-bold">空化强度</span>
                </div>
                <span className="text-sm font-black text-yellow-500">中度风险</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <Activity className="text-cyan-400" size={18} />
                  <span className="text-xs font-bold">振动幅值</span>
                </div>
                <span className="text-sm font-black text-emerald-400">正常</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <Droplets className="text-cyan-400" size={18} />
                  <span className="text-xs font-bold">压力波动</span>
                </div>
                <span className="text-sm font-black text-emerald-400">稳定</span>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Visualization */}
        <div className="col-span-6 relative">
          <SciFiCard title="转轮数字孪生" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene rpm={rpm} cavitationPoints={MOCK_POINTS} />
            </div>
            
            {/* HUD Elements */}
            <div className="absolute top-12 left-6 space-y-2 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500"></div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Live Telemetry</span>
              </div>
              <div className="text-xs font-mono text-slate-400">X-AXIS: 0.002mm</div>
              <div className="text-xs font-mono text-slate-400">Y-AXIS: 0.015mm</div>
              <div className="text-xs font-mono text-slate-400">Z-AXIS: 0.008mm</div>
            </div>

            <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-2">
              <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
                <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">空化气泡密度</div>
                <div className="text-lg font-black text-white font-mono">1.24 <span className="text-[10px] text-slate-400">pts/cm²</span></div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-cyan-500 transition-all">
                  <RefreshCw size={14} className="text-slate-400" />
                </button>
                <button className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-cyan-500 transition-all">
                  <Settings size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right: Spectrum & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="振动频谱分析" className="flex-1">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPECTRUM_DATA}>
                  <XAxis dataKey="freq" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断建议">
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="text-yellow-500" size={14} />
                  <span className="text-xs font-black text-yellow-500 uppercase">检测到异常空化</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  3号叶片背部区域空化强度超过阈值，建议检查导叶开度，优化水力运行工况。
                </p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="text-cyan-500" size={14} />
                  <span className="text-xs font-black text-cyan-500 uppercase">预防性维护建议</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  预计 120 小时后需进行叶片表面涂层检查，已自动排入下月检修计划。
                </p>
              </div>
              <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2">
                <BarChart3 size={14} />
                查看详细诊断报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TurbineCavitationView;
