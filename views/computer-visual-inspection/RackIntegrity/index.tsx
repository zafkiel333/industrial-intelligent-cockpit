import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  Eye, 
  BarChart3, 
  ShieldCheck,
  Zap,
  RefreshCcw,
  History,
  Cpu,
  Box,
  Weight,
  Ruler,
  TrendingDown,
  Maximize2,
  Search,
  ShieldAlert,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/RackIntegrity/ThreeScene';
import { RackStatus } from '../../../components/computer-visual-inspection/RackIntegrity/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  deformation: 2 + Math.random() * 2,
  load: 800 + Math.random() * 200
}));

const RackIntegrity: React.FC = () => {
  const [status, setStatus] = useState<RackStatus>({
    deformation: 2.5,
    loadWeight: 850,
    tiltAngle: 0.2,
    structuralIntegrity: 0.98,
    isOverloaded: false,
    location: 'B区-12排-4架',
    lastInspected: '2026-03-25'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        deformation: 2 + Math.random() * 3,
        loadWeight: 800 + Math.random() * 400,
        tiltAngle: Math.random() * 0.5,
        isOverloaded: prev.loadWeight > 1000
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-blue-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Layers className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              仓库货架结构完整性与变形监测系统
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Warehouse Rack Structural Integrity & Deformation Monitoring System
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">货架状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isOverloaded || status.deformation > 5 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.isOverloaded || status.deformation > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.isOverloaded ? '超载预警' : status.deformation > 5 ? '变形严重' : '运行安全'}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <SciFiCard className="h-[600px] relative overflow-hidden group">
            {/* 3D Scene Overlay */}
            <div className="absolute top-6 left-6 z-10 space-y-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <h3 className="text-xs font-mono text-blue-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前载荷</span>
                    <span className="text-lg font-mono text-white">{status.loadWeight.toFixed(0)} <span className="text-xs text-slate-500">kg</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">最大变形</span>
                    <span className="text-lg font-mono text-white">{status.deformation.toFixed(1)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'analysis', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'analysis' ? '智能分析' : '历史追溯'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">视觉识别状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Box className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">货架位置</div>
                    <div className="text-xl font-bold text-white">{status.location}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <Maximize2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-blue-400" />
                  载荷变化趋势 (kg)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-purple-400" />
                  结构变形记录 (mm)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Line type="monotone" dataKey="deformation" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Metrics */}
          <SciFiCard className="p-6">
            <h3 className="text-sm font-mono text-blue-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '实时载荷', value: status.loadWeight.toFixed(0), unit: 'kg', icon: Weight, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '最大变形', value: status.deformation.toFixed(1), unit: 'mm', icon: Ruler, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: '倾斜角度', value: status.tiltAngle.toFixed(2), unit: '°', icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '结构完整性', value: (status.structuralIntegrity * 100).toFixed(0), unit: '%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                      <div className="text-xl font-bold font-mono">{item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">智能结构评估</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  安全指数: 96%
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  货架结构整体稳定，变形量在允许范围内。倾斜角度极小，未发现明显的结构损伤或螺栓松动。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>严禁超载，确保货物摆放均匀</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>定期检查货架立柱防撞护脚的完好性</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                异常预警日志
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">0 NEW</span>
            </div>
            
            <div className="space-y-3 text-slate-500 text-xs italic text-center py-8">
              暂无异常预警记录
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default RackIntegrity;
