import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/InsulatorDefect/ThreeScene';
import { InsulatorDefect, InsulatorState } from '@/components/computer-visual-inspection/InsulatorDefect/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  ShieldAlert, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  FileText,
  Settings,
  CloudRain,
  Radio
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const MOCK_DEFECTS: InsulatorDefect[] = [
  { id: '1', index: 3, type: 'flashover', severity: 0.85 },
  { id: '2', index: 7, type: 'contamination', severity: 0.62 },
];

const CURRENT_HISTORY = [
  { time: '08:00', current: 0.12 },
  { time: '09:00', current: 0.15 },
  { time: '10:00', current: 0.28 },
  { time: '11:00', current: 0.45 },
  { time: '12:00', current: 0.52 },
  { time: '13:00', current: 0.48 },
  { time: '14:00', current: 0.65 },
];

const RADAR_DATA = [
  { subject: '绝缘强度', A: 65, fullMark: 100 },
  { subject: '表面洁净', A: 40, fullMark: 100 },
  { subject: '结构完整', A: 85, fullMark: 100 },
  { subject: '耐压水平', A: 70, fullMark: 100 },
  { subject: '抗污闪', A: 55, fullMark: 100 },
];

const InsulatorDefectView: React.FC = () => {
  const [state, setState] = useState<InsulatorState>({
    voltage: 500,
    leakageCurrent: 0.65,
    humidity: 82
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/40 rounded flex items-center justify-center">
            <Radio className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">绝缘子缺陷智能识别系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                <Zap size={12} /> TOWER_LINE_500KV_#24
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AI Vision Core Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">泄露电流</div>
            <div className="text-xl font-black text-red-500">{state.leakageCurrent} <span className="text-xs">mA</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">环境湿度</div>
            <div className="text-xl font-black text-cyan-400">{state.humidity}%</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Visual Recognition */}
        <div className="col-span-4 flex flex-col space-y-4">
          <SciFiCard title="视觉识别实时流" className="flex-1 relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/insulator/800/600" 
              alt="Insulator Visual" 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            {/* Detection Overlays */}
            <div className="absolute top-1/3 left-1/4 w-32 h-16 border-2 border-red-500/60 bg-red-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] px-1 font-bold">DEFECT: FLASHOVER (85%)</div>
            </div>
            <div className="absolute bottom-1/4 right-1/3 w-24 h-12 border-2 border-yellow-500/60 bg-yellow-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-[8px] px-1 font-bold">DEFECT: CONTAM (62%)</div>
            </div>
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-300">UAV_CAM_ZOOM_4X</span>
            </div>
          </SciFiCard>

          <SciFiCard title="泄露电流趋势">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CURRENT_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Twin */}
        <div className="col-span-4 relative">
          <SciFiCard title="绝缘子串数字孪生" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene defects={MOCK_DEFECTS} />
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-purple-500 transition-all">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm">
                <div className="text-[8px] text-slate-500 uppercase font-mono">运行电压</div>
                <div className="text-sm font-black text-white">500.4 kV</div>
              </div>
              <div className="p-2 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm">
                <div className="text-[8px] text-slate-500 uppercase font-mono">绝缘电阻</div>
                <div className="text-sm font-black text-red-500">12.5 GΩ</div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right: Analysis & Maintenance */}
        <div className="col-span-4 flex flex-col space-y-4">
          <SciFiCard title="健康度多维分析">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar
                    name="Insulator"
                    dataKey="A"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与建议" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">污闪风险极高</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    检测到第3、7片绝缘子表面存在明显放电痕迹及重度污秽。结合当前湿度 (82%)，污闪风险等级：<span className="text-red-500 font-bold">CRITICAL</span>。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <div className="text-[10px] text-purple-400 font-bold mb-2 flex items-center gap-1">
                  <ShieldAlert size={12} /> 维护指令
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. 立即启动无人机带电清扫作业。<br/>
                  2. 计划在48小时内进行停电更换受损绝缘子。<br/>
                  3. 增加该塔位在线监测频率至 5min/次。
                </p>
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                执行应急维护
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default InsulatorDefectView;
