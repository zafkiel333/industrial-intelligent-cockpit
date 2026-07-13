import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/SluiceGateSeal/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-sluice-gate-seal]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-sluice-gate-seal';
import { SealDefect, GateState } from '@/components/computer-visual-inspection/SluiceGateSeal/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  ShieldAlert, 
  Droplets, 
  Activity, 
  Maximize2, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Settings,
  Waves,
  Lock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const MOCK_DEFECTS: SealDefect[] = [
  { id: '1', position: [0.6, 2, 0.5], type: 'wear', severity: 0.8 },
  { id: '2', position: [0.6, -3, -1.2], type: 'deformation', severity: 0.6 },
];

const LEAKAGE_HISTORY = [
  { time: '08:00', rate: 0.5 },
  { time: '09:00', rate: 0.8 },
  { time: '10:00', rate: 1.2 },
  { time: '11:00', rate: 1.1 },
  { time: '12:00', rate: 1.5 },
  { time: '13:00', rate: 2.1 },
  { time: '14:00', rate: 1.8 },
];

const SluiceGateSealView: React.FC = () => {
  const [gateState, setGateState] = useState<GateState>({
    opening: 45,
    leakageRate: 1.8,
    waterPressure: 125.4
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <Lock className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">闸门止水密封完整性检测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Waves size={12} /> SECTOR_04_GATE_02
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Status: Monitoring</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">当前开度</div>
            <div className="text-xl font-black text-white">{gateState.opening}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">上游水压</div>
            <div className="text-xl font-black text-cyan-400">{gateState.waterPressure} <span className="text-xs">kPa</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Visual Analysis */}
        <div className="col-span-5 flex flex-col space-y-4">
          <SciFiCard title="视觉检测实时流" className="flex-1 relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/sluice/800/600" 
              alt="Gate Seal Visual" 
              className="w-full h-full object-cover opacity-70"
              referrerPolicy="no-referrer"
            />
            {/* Detection Overlays */}
            <div className="absolute top-1/4 left-1/3 w-32 h-48 border-2 border-red-500/60 bg-red-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] px-1 font-bold uppercase">Defect: Wear (82%)</div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-32 border-2 border-yellow-500/60 bg-yellow-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-[8px] px-1 font-bold uppercase">Defect: Deform (64%)</div>
            </div>
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-300">CAM_02_SIDE_SEAL</span>
            </div>
          </SciFiCard>

          <SciFiCard title="漏水量历史趋势">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LEAKAGE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Bar dataKey="rate" radius={[2, 2, 0, 0]}>
                    {LEAKAGE_HISTORY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rate > 1.5 ? '#ef4444' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Twin */}
        <div className="col-span-4 relative">
          <SciFiCard title="密封结构数字孪生" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene defects={MOCK_DEFECTS} leakageRate={gateState.leakageRate} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-mono">密封完整性指数</span>
                <span className="text-sm font-black text-red-500">68.5%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '68.5%' }}
                  className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                />
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-blue-500 transition-all">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>
          </SciFiCard>
        </div>

        {/* Right: Diagnosis & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="智能诊断结果">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500" size={20} />
                <div>
                  <div className="text-xs font-bold text-red-400">严重漏水预警</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">漏水量已超过阈值 (1.5L/s)，检测到侧边止水带局部撕裂。</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-mono px-1">缺陷详情</div>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded flex justify-between items-center">
                  <span className="text-[10px] text-slate-300">侧向止水带磨损</span>
                  <span className="text-[10px] font-bold text-red-500">严重</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded flex justify-between items-center">
                  <span className="text-[10px] text-slate-300">底部密封变形</span>
                  <span className="text-[10px] font-bold text-yellow-500">中度</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="维修联动计划" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-blue-500/20 rounded">
                  <FileText size={14} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">工单: WO-20260324-001</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">状态: 待审批 | 优先级: 高</div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 建议维修方案
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. 计划在下次枯水期对 02 号闸门进行侧向止水带整体更换。<br/>
                  2. 临时加装辅助密封压板，缓解当前漏水状况。
                </p>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                <Settings size={14} />
                进入维修决策系统
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SluiceGateSealView;
