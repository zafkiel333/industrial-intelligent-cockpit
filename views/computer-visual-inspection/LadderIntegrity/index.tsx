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
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Droplets,
  Waves,
  Gauge,
  Thermometer,
  Wind,
  Cloud,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Map,
  Scan,
  Camera,
  CircleDot,
  AlertCircle,
  BarChart,
  PieChart,
  LayoutGrid,
  Database,
  Box,
  Cylinder,
  Factory,
  ZapOff,
  Radio,
  Microscope,
  Power,
  RotateCcw,
  Sliders,
  Scale,
  Construction,
  Strikethrough
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/LadderIntegrity/ThreeScene';
import { LadderStatus } from '../../../components/computer-visual-inspection/LadderIntegrity/three-types';
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
  BarChart as ReBarChart,
  Bar,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  deformation: Math.random() * 5,
  corrosion: 5 + Math.random() * 10,
  load: 60 + Math.random() * 40
}));

const LadderIntegrity: React.FC = () => {
  const [status, setStatus] = useState<LadderStatus>({
    deformationX: 1.2,
    deformationY: 0.8,
    corrosionLevel: 12.5,
    weldIntegrity: 98.2,
    loadWeight: 75.5,
    isSafe: true,
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const loadWeight = 60 + Math.random() * 60;
        const deformationX = (loadWeight / 100) * 2 + (Math.random() * 0.5);
        const deformationY = (loadWeight / 100) * 1.5 + (Math.random() * 0.5);
        const corrosionLevel = prev.corrosionLevel + (Math.random() * 0.1);
        const weldIntegrity = 95 + Math.random() * 5;
        const isSafe = deformationX < 5 && deformationY < 5 && corrosionLevel < 40;

        return {
          ...prev,
          isSafe,
          deformationX,
          deformationY,
          corrosionLevel,
          weldIntegrity,
          loadWeight,
          lastInspectionTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Construction className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              工业爬梯结构稳固性监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Industrial Ladder Structural Integrity Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">结构安全等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${!status.isSafe ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.corrosionLevel > 25 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${!status.isSafe ? 'text-red-400' : status.corrosionLevel > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isSafe ? 'SECURE' : 'UNSAFE'}
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">实时结构孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">X轴形变</span>
                    <span className="text-lg font-mono text-white">{status.deformationX.toFixed(2)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前负载</span>
                    <span className="text-lg font-mono text-white">{status.loadWeight.toFixed(1)} <span className="text-xs text-slate-500">kg</span></span>
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
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '应力分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Construction className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">焊缝完整度</div>
                    <div className="text-xl font-bold text-white">{status.weldIntegrity.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">锈蚀等级</div>
                    <div className="text-xl font-bold text-white">{status.corrosionLevel.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">STRUCT-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  结构形变趋势 (mm)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorDef" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="deformation" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDef)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-400" />
                  实时负载波动 (kg)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-cyan-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'X轴形变', value: status.deformationX.toFixed(2), unit: 'mm', icon: Sliders, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'Y轴形变', value: status.deformationY.toFixed(2), unit: 'mm', icon: Sliders, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '当前负载', value: status.loadWeight.toFixed(1), unit: 'kg', icon: Scale, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '锈蚀等级', value: status.corrosionLevel.toFixed(1), unit: '%', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold">智能结构诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${!status.isSafe ? 'bg-red-500/5 border-red-500/20' : status.corrosionLevel > 25 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${!status.isSafe ? 'text-red-400' : status.corrosionLevel > 25 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isSafe ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  诊断结果: {status.isSafe ? '结构稳固' : '存在安全隐患'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {!status.isSafe 
                    ? '视觉算法检测到爬梯立柱出现显著弯曲形变，且底部焊缝存在疑似裂纹。当前负载下结构失稳风险极高，建议立即封锁并加固。' 
                    : status.corrosionLevel > 25 
                    ? '爬梯踏板边缘出现明显锈蚀剥落，防滑性能下降。虽然主体结构尚稳固，但长期暴露可能导致承载力下降，建议进行除锈刷漆。' 
                    : '爬梯几何尺寸稳定，未发现明显塑性变形。焊缝连接处完整，表面涂层完好，符合安全使用标准。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.corrosionLevel > 20 ? '安排表面除锈及防腐喷涂' : '维持日常视觉在线监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.weldIntegrity < 98 ? '对关键焊缝进行超声波探伤' : '定期校准视觉位移测量基准'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                异常告警日志
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {!status.isSafe ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {!status.isSafe ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      爬梯结构失稳告警
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Critical</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic text-center py-4">
                  暂无异常预警记录
                </div>
              )}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default LadderIntegrity;
