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
  Strikethrough,
  Fuel,
  Anchor,
  Link,
  Move,
  Filter,
  Fan,
  RailSymbol,
  TrainFront,
  Truck
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/CraneRailWear/ThreeScene';
import { CraneRailWearStatus } from '../../../components/computer-visual-inspection/CraneRailWear/three-types';
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
  wear: 0.5 + Math.random() * 2,
  roughness: 1.2 + Math.random() * 0.8,
  vibration: 0.1 + Math.random() * 0.4
}));

const CraneRailWear: React.FC = () => {
  const [status, setStatus] = useState<CraneRailWearStatus>({
    wearDepth: 1.2,
    surfaceRoughness: 1.5,
    flatnessDeviation: 0.8,
    jointGap: 2.5,
    vibrationAmplitude: 0.2,
    isAnomalyDetected: false,
    anomalyType: 'none',
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isAnomalyDetected = Math.random() > 0.9;
        const wearDepth = isAnomalyDetected ? 3.5 + Math.random() * 1.5 : 1 + Math.random() * 0.5;
        const vibrationAmplitude = isAnomalyDetected ? 0.8 + Math.random() * 0.4 : 0.1 + Math.random() * 0.2;
        
        const anomalyTypes: CraneRailWearStatus['anomalyType'][] = ['pitting', 'spalling', 'crack', 'deformation'];
        const anomalyType = isAnomalyDetected ? anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)] : 'none';

        return {
          ...prev,
          isAnomalyDetected,
          anomalyType,
          wearDepth,
          vibrationAmplitude,
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
            <TrainFront className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              起重机轨道磨损与平整度监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              起重机轨道磨损与平整度视觉监测
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">轨道健康状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isAnomalyDetected ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.wearDepth > 3 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isAnomalyDetected ? 'text-red-400' : status.wearDepth > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isAnomalyDetected ? '严重' : status.wearDepth > 3 ? '警告' : '安全'}
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">实时轨道孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">磨损深度</span>
                    <span className="text-lg font-mono text-white">{status.wearDepth.toFixed(2)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">表面粗糙度</span>
                    <span className="text-lg font-mono text-white">{status.surfaceRoughness.toFixed(1)} <span className="text-xs text-slate-500">Ra</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '磨损分析' : '历史趋势'}
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
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">振动幅值</div>
                    <div className="text-xl font-bold text-white">{status.vibrationAmplitude.toFixed(2)} <span className="text-xs font-normal text-slate-500">mm</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Sliders className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">平整度偏差</div>
                    <div className="text-xl font-bold text-white">{status.flatnessDeviation.toFixed(2)} <span className="text-xs font-normal text-slate-500">mm</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">视觉扫描激活</span>
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
                  磨损深度趋势 (mm)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="wear" stroke="#06b6d4" fillOpacity={1} fill="url(#colorWear)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  表面粗糙度监测 (Ra)
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
                    <Line type="monotone" dataKey="roughness" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
                { label: '磨损深度', value: status.wearDepth.toFixed(2), unit: 'mm', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '表面粗糙度', value: status.surfaceRoughness.toFixed(1), unit: 'Ra', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '接头间隙', value: status.jointGap.toFixed(1), unit: 'mm', icon: Link, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '振动幅值', value: status.vibrationAmplitude.toFixed(2), unit: 'mm', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <h3 className="text-lg font-bold">智能磨损诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isAnomalyDetected ? 'bg-red-500/5 border-red-500/20' : status.wearDepth > 3 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isAnomalyDetected ? 'text-red-400' : status.wearDepth > 3 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isAnomalyDetected ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isAnomalyDetected ? `检测到轨道${status.anomalyType === 'crack' ? '裂纹' : '剥落'}` : status.wearDepth > 3 ? '严重磨损预警' : '运行状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isAnomalyDetected 
                    ? `视觉传感器识别到轨道表面出现${status.anomalyType === 'crack' ? '微裂纹' : '局部剥落'}。当前磨损深度 ${status.wearDepth.toFixed(2)} mm，已超过安全阈值。建议立即停机检查。` 
                    : status.wearDepth > 3 
                    ? '轨道磨损已接近临界值。表面粗糙度增加可能导致运行阻力增大，建议安排预防性维护。' 
                    : '轨道表面状态良好。几何尺寸平整度符合运行标准，未发现异常磨损迹象。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isAnomalyDetected ? '立即执行轨道表面修复或更换' : '维持日常视觉巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.wearDepth > 2 ? '安排轨道打磨以恢复平整度' : '定期校准视觉测量精度'}</span>
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
                {status.isAnomalyDetected ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isAnomalyDetected ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      起重机轨道表面异常告警
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">严重</span>
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

export default CraneRailWear;
