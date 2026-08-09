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
  Ship,
  CircleDot
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/PortFender/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PortFender]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PortFender';
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  impact: Math.random() * 100 + 20,
  vibration: Math.random() * 5 + 1,
  energy: Math.random() * 500 + 100,
}));

const PortFenderView: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [metrics, setMetrics] = useState({
    impactForce: 45.2,
    vibrationPeak: 2.15,
    energyAbsorption: 324.5,
    fenderHealth: 94.8,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        impactForce: 40 + Math.random() * 10,
        vibrationPeak: 2 + Math.random() * 1,
        energyAbsorption: 300 + Math.random() * 50,
      }));
      if (Math.random() > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Ship className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              码头护舷靠泊冲击震动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Berthing Impact System</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: FENDER-UNIT-07</span>
              <span className="flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-wider">MONITORING ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">冲击力</div>
            <div className="text-sm font-mono font-bold text-cyan-400">{metrics.impactForce.toFixed(1)} kN</div>
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
          <SciFiCard title="冲击震动峰值" subtitle="IMPACT VIBRATION">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.vibrationPeak.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">mm/s</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="能量吸收值" subtitle="ENERGY ABSORPTION">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.energyAbsorption.toFixed(0)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">kJ</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                <span>Capacity: 800 kJ</span>
                <span className="text-cyan-400">NORMAL</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="护舷健康度" subtitle="FENDER HEALTH">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.fenderHealth.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">%</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis type="number" dataKey="time" hide />
                  <YAxis type="number" dataKey="impact" hide />
                  <ZAxis type="number" range={[50, 400]} />
                  <Scatter name="Health" data={mockData} fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="护舷冲击数字孪生" 
            subtitle="FENDER DIGITAL TWIN" 
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
                <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">靠泊监测状态</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">MONITORING</div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">护舷压缩量</div>
                  <div className="text-xl font-mono font-bold text-white">125 <span className="text-xs text-slate-500">mm</span></div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">靠泊速度</div>
                    <div className="text-xl font-mono font-bold text-white">0.12 <span className="text-xs text-slate-500">m/s</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="冲击响应频谱" subtitle="IMPACT SPECTRUM">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="impact" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "护舷冲击响应处于设计范围内，能量吸收曲线平滑，未见结构性损伤特征。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="靠泊安全诊断" subtitle="BERTHING DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">护舷性能稳定</h4>
                  <p className="text-[10px] text-slate-400">橡胶弹性模量保持良好，未发现永久性变形或老化裂纹。</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">靠泊建议</h4>
                  <p className="text-[10px] text-slate-400">当前护舷状态支持大型船舶靠泊，建议保持现有靠泊速度限制。</p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="能量吸收历史" subtitle="ENERGY HISTORY">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="energy" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Total Energy</span>
              <span className="text-xs font-bold text-white">12.4 MJ</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortFenderView;
