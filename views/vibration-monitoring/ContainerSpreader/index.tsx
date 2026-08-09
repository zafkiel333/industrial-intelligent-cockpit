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
  Lock
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/ContainerSpreader/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ContainerSpreader]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ContainerSpreader';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 5 + 2,
  impact: Math.random() * 10 + 40,
  load: 30 + Math.random() * 5,
}));

const ContainerSpreaderView: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [lockStatus, setLockStatus] = useState<'locked' | 'unlocked'>('locked');

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.8) setLockStatus(prev => prev === 'locked' ? 'unlocked' : 'locked');
      if (Math.random() > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 5000);
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
              集装箱吊具锁头动作振动监测
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">Active Monitoring</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: SPREAD-01</span>
              <span className="flex items-center gap-1"><Lock size={12} /> 锁头状态: {lockStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">运行状态</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'normal' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-sm font-mono font-bold ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.toUpperCase()}</span>
            </div>
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
          <SciFiCard title="锁头冲击振动" subtitle="TWISTLOCK IMPACT">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">4.25</span>
              <span className="text-xs text-slate-500 font-mono uppercase">g</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="动作冲击能量" subtitle="ACTION IMPACT ENERGY">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">45.8</span>
              <span className="text-xs text-slate-500 font-mono uppercase">J</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="impact" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="吊具载荷" subtitle="SPREADER LOAD">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">32.4</span>
              <span className="text-xs text-slate-500 font-mono uppercase">t</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                <span>Capacity: 45t</span>
                <span className="text-emerald-400">72% LOAD</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="吊具锁头数字孪生动态监测" 
            subtitle="TWISTLOCK DIGITAL TWIN" 
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
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">锁头转角</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">{lockStatus === 'locked' ? '90.0' : '0.0'} <span className="text-xs">deg</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">锁头健康度</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">98.2%</div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">动作计数</div>
                    <div className="text-xl font-mono font-bold text-white">12,450 <span className="text-xs text-slate-500">CYCLES</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="冲击频谱分析" subtitle="IMPACT SPECTRUM">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "锁头闭锁动作瞬间产生高频冲击响应，衰减特性正常，未见机械卡阻迹象。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断预警" subtitle="AI DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">锁头动作顺畅</h4>
                  <p className="text-[10px] text-slate-400">冲击特征符合基准模型，锁头机构润滑良好。</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">疲劳寿命评估</h4>
                  <p className="text-[10px] text-slate-400">当前累计循环次数处于寿命周期前段，结构完整。</p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="历史趋势" subtitle="HISTORICAL TREND">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="load" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">24H Avg Load</span>
              <span className="text-xs font-bold text-white">28.5 t</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ContainerSpreaderView;
