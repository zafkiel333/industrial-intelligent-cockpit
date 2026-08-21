import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { CV_MONITORING_IMAGES } from '@/src/assets/cvMonitoringImages';
import { ThreeScene } from '@/components/computer-visual-inspection/TransformerLeak/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-transformer-leak]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-transformer-leak';
import { LeakPoint, TransformerState } from '@/components/computer-visual-inspection/TransformerLeak/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Zap, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Droplets, 
  ShieldAlert,
  BarChart3,
  History,
  FileText,
  Settings,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MOCK_LEAKS: LeakPoint[] = [
  { id: '1', position: [2.1, 1, 0.5], severity: 'high', temperature: 85.4 },
  { id: '2', position: [-2.1, -1.5, -1.2], severity: 'medium', temperature: 72.1 },
];

const TEMP_HISTORY = [
  { time: '00:00', temp: 65 },
  { time: '04:00', temp: 68 },
  { time: '08:00', temp: 75 },
  { time: '12:00', temp: 82 },
  { time: '16:00', temp: 88 },
  { time: '20:00', temp: 84 },
  { time: '23:59', temp: 78 },
];

const SEVERITY_DATA = [
  { name: '正常', value: 85 },
  { name: '轻微渗漏', value: 10 },
  { name: '严重渗漏', value: 5 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const TransformerLeakView: React.FC = () => {
  const [state, setState] = useState<TransformerState>({
    load: 78.5,
    oilTemp: 82.4,
    ambientTemp: 24.5
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Zap className="text-yellow-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">变压器渗漏油视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-yellow-500 font-mono flex items-center gap-1">
                <Cpu size={12} /> MAIN_TRANSFORMER_01
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">实时分析激活</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">当前负荷</div>
            <div className="text-xl font-black text-white">{state.load}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">油箱温度</div>
            <div className="text-xl font-black text-red-500">{state.oilTemp} <span className="text-xs">°C</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Top Row */}
        <div className="col-span-8 grid grid-cols-2 gap-4">
          <SciFiCard title="红外/可见光融合监测" className="relative overflow-hidden">
            <div className="grid grid-cols-2 h-full gap-1">
              <div className="relative">
                <img 
                  src={CV_MONITORING_IMAGES.transformerOilLeak}
                  alt="油浸式变压器可见光巡检画面"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 text-[8px] font-mono text-slate-400 rounded">可见光摄像头_01</div>
              </div>
              <div className="relative">
                <img 
                  src={CV_MONITORING_IMAGES.transformerOilLeak}
                  alt="油浸式变压器热成像巡检画面"
                  className="w-full h-full object-cover opacity-60 hue-rotate-180"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 text-[8px] font-mono text-slate-400 rounded">热成像摄像头_01</div>
              </div>
            </div>
            {/* Detection Overlay */}
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-red-500/60 bg-red-500/10 rounded animate-pulse pointer-events-none">
              <div className="absolute -top-5 left-0 bg-red-500 text-white text-[8px] px-1 font-bold">检测到渗漏 (94%)</div>
            </div>
          </SciFiCard>

          <SciFiCard title="设备数字孪生" className="relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene leaks={MOCK_LEAKS} />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-yellow-500 transition-all">
                <Settings size={14} className="text-slate-400" />
              </button>
            </div>
          </SciFiCard>
        </div>

        <div className="col-span-4 flex flex-col space-y-4">
          <SciFiCard title="渗漏风险评估">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEVERITY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SEVERITY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {SEVERITY_DATA.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-[10px] text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断报告" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">检测到严重渗漏点</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    散热片第4组焊缝处发现油迹，红外温差异常 (ΔT: 12.5°C)，建议立即停电检查。
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-[8px] text-slate-500 uppercase font-mono">渗漏速率</div>
                  <div className="text-sm font-black text-yellow-500">0.45 ml/h</div>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-[8px] text-slate-500 uppercase font-mono">预计停机时间</div>
                  <div className="text-sm font-black text-cyan-400">4.5 hrs</div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Bottom Row */}
        <div className="col-span-8">
          <SciFiCard title="温度变化趋势 (24h)">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TEMP_HISTORY}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        <div className="col-span-4">
          <SciFiCard title="维修联动计划">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="text-cyan-400" size={14} />
                  <span className="text-[10px] font-bold">维修工单: #TR-2026-001</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">紧急</span>
              </div>
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center gap-1">
                  <ShieldAlert size={12} /> 维护建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. 准备密封胶垫与专用密封胶。<br/>
                  2. 安排在 2026-03-25 凌晨 02:00 进行带电补漏或停电检修。
                </p>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white text-xs font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                下发维修指令
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default TransformerLeakView;
