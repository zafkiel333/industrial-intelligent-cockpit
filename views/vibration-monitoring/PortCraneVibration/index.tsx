import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Waves,
  Maximize2,
  TrendingUp,
  Anchor,
  CircleDot
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/PortCraneVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PortCraneVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PortCraneVibration';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 3 + 1,
  fatigue: Math.random() * 0.5 + 0.1,
  load: 40 + Math.random() * 20,
}));

const PortCraneVibrationView: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [metrics, setMetrics] = useState({
    hoistVibration: 1.45,
    trolleyVibration: 0.85,
    fatigueIndex: 0.24,
    loadWeight: 52.4,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        hoistVibration: 1.2 + Math.random() * 0.5,
        trolleyVibration: 0.7 + Math.random() * 0.3,
        loadWeight: 50 + Math.random() * 5,
      }));
      if (Math.random() > 0.98) setStatus('warning');
      else setStatus('normal');
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Anchor className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              岸桥起升机构震动与疲劳监测
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">STS Crane Monitoring</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: STS-CRANE-04</span>
              <span className="flex items-center gap-1 font-bold text-blue-400 uppercase tracking-wider">MONITORING ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前载荷</div>
            <div className="text-sm font-mono font-bold text-blue-400">{metrics.loadWeight.toFixed(1)} t</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 transition-all">
              <Settings size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="起升机构振动" subtitle="HOIST VIBRATION">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.hoistVibration.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">mm/s</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="hoistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} fill="url(#hoistGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="疲劳损伤指数" subtitle="FATIGUE INDEX">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.fatigueIndex.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">index</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                <span>Limit: 0.85</span>
                <span className="text-blue-400">SAFE</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: '28%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="小车机构振动" subtitle="TROLLEY VIBRATION">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.trolleyVibration.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">mm/s</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.slice(0, 10)}>
                  <Bar dataKey="vibration">
                    {mockData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="岸桥起升机构数字孪生" 
            subtitle="STS DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 border-l-2 border-blue-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">结构疲劳状态</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">STABLE</div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">起升高度</div>
                  <div className="text-xl font-mono font-bold text-white">42.5 <span className="text-xs text-slate-500">m</span></div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">钢丝绳张力</div>
                    <div className="text-xl font-mono font-bold text-white">125 <span className="text-xs text-slate-500">kN</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="振动频谱分析" subtitle="VIBRATION SPECTRUM">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="vibration" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "起升机构在额定载荷下振动平稳，未见明显的钢丝绳跳动或减速箱异常啮合频率。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="结构疲劳诊断" subtitle="FATIGUE DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">主梁结构安全</h4>
                  <p className="text-[10px] text-slate-400">应力循环计数正常，未发现疲劳裂纹扩展迹象。</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">寿命剩余评估</h4>
                  <p className="text-[10px] text-slate-400">基于当前作业强度，结构剩余疲劳寿命约为15.4年。</p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="载荷历史趋势" subtitle="LOAD TREND">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Avg Load</span>
              <span className="text-xs font-bold text-white">48.5 t</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortCraneVibrationView;
