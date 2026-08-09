import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/ShovelToothLoss/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-shovel-tooth-loss]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-shovel-tooth-loss';
import { ToothStatus, ShovelState } from '@/components/computer-visual-inspection/ShovelToothLoss/three-types';
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
  Cpu,
  Hammer
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

const MOCK_TEETH: ToothStatus[] = [
  { id: 'T-01', index: 0, status: 'normal', wearLevel: 12 },
  { id: 'T-02', index: 1, status: 'worn', wearLevel: 65 },
  { id: 'T-03', index: 2, status: 'missing', wearLevel: 100 },
  { id: 'T-04', index: 3, status: 'normal', wearLevel: 8 },
  { id: 'T-05', index: 4, status: 'normal', wearLevel: 15 },
];

const IMPACT_HISTORY = [
  { time: '08:00', val: 1200 },
  { time: '08:10', val: 1450 },
  { time: '08:20', val: 1100 },
  { time: '08:30', val: 1680 },
  { time: '08:40', val: 1320 },
  { time: '08:50', val: 1250 },
];

const RADAR_DATA = [
  { subject: '挖掘效率', A: 75, fullMark: 100 },
  { subject: '能耗水平', A: 85, fullMark: 100 },
  { subject: '斗齿完整', A: 60, fullMark: 100 },
  { subject: '结构疲劳', A: 45, fullMark: 100 },
  { subject: '载荷平衡', A: 30, fullMark: 100 },
];

const ShovelToothLossView: React.FC = () => {
  const [state] = useState<ShovelState>({
    impactForce: 1450.5,
    cycleTime: 42.5,
    payload: 55.2
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-yellow-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-600/20 border border-yellow-500/40 rounded flex items-center justify-center">
            <Hammer className="text-yellow-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">电铲铲斗斗齿脱落智能监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> SHOVEL_UNIT_12
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">ToothGuard AI v3.0 Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">挖掘冲击力</div>
            <div className="text-xl font-black text-white">{state.impactForce} <span className="text-xs">kN</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">循环周期</div>
            <div className="text-xl font-black text-yellow-400">{state.cycleTime} <span className="text-xs">s</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Tooth Analysis */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="斗齿健康多维评估">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar
                    name="Shovel"
                    dataKey="A"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="斗齿状态实时清单" className="flex-1">
            <div className="space-y-3">
              {MOCK_TEETH.map(tooth => (
                <div key={tooth.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-yellow-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{tooth.id} (位置: {tooth.index + 1})</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      tooth.status === 'missing' ? 'bg-red-500/20 text-red-500' : (tooth.status === 'worn' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500')
                    }`}>
                      {tooth.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">磨损程度</div>
                      <div className="text-sm font-black text-white">{tooth.wearLevel}%</div>
                    </div>
                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${tooth.wearLevel}%` }}
                        className={`h-full ${tooth.wearLevel > 80 ? 'bg-red-500' : (tooth.wearLevel > 50 ? 'bg-yellow-500' : 'bg-green-500')}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Bucket */}
        <div className="col-span-6 relative">
          <SciFiCard title="铲斗数字孪生实时监测" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene teeth={MOCK_TEETH} isOperating={true} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-yellow-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">Tooth Loss Detected!</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <Timer size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Payload: 55.2t</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '累计挖掘', value: '1.2M t', icon: History, color: 'text-blue-400' },
                { label: '瞬时功率', value: '450kW', icon: Zap, color: 'text-yellow-400' },
                { label: '结构完整', value: '85%', icon: ShieldCheck, color: 'text-green-400' },
                { label: '振动频率', value: '12Hz', icon: Activity, color: 'text-cyan-400' },
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
          <SciFiCard title="挖掘冲击力历史曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={IMPACT_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能维护决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">斗齿脱落报警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    检测到 3# 斗齿已脱落。脱落斗齿可能混入矿石流，对下游破碎机造成严重损坏。建议立即停机并启动斗齿搜寻程序。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <div className="text-[10px] text-yellow-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护建议
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">斗齿搜寻</span>
                    <span className="text-red-500">CRITICAL</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">斗齿更换</span>
                    <span className="text-yellow-500">HIGH</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">斗体加固</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded shadow-lg shadow-yellow-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
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

export default ShovelToothLossView;
