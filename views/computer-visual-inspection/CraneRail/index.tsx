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
  Wind as WindIcon,
  Fan,
  RailSymbol,
  TrainFront,
  Truck
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/CraneRail/ThreeScene';
import { CraneRailStatus } from '../../../components/computer-visual-inspection/CraneRail/three-types';
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
  gauge: (Math.random() - 0.5) * 5,
  vibration: 2 + Math.random() * 4
}));

const CraneRail: React.FC = () => {
  const [status, setStatus] = useState<CraneRailStatus>({
    railWear: 1.2,
    gaugeDeviation: 2.5,
    straightness: 0.8,
    wheelLoad: 15.5,
    vibrationLevel: 3.2,
    isDeformed: false,
    deformationType: 'none',
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isDeformed = Math.random() > 0.9;
        const railWear = isDeformed ? 4 + Math.random() * 2 : 1 + Math.random() * 0.5;
        const gaugeDeviation = isDeformed ? 8 + Math.random() * 5 : 2 + Math.random() * 1;
        const vibrationLevel = isDeformed ? 8 + Math.random() * 4 : 3 + Math.random() * 1;
        
        const deformationTypes: CraneRailStatus['deformationType'][] = ['wear', 'gauge_error', 'loose_bolt', 'crack'];
        const deformationType = isDeformed ? deformationTypes[Math.floor(Math.random() * deformationTypes.length)] : 'none';

        return {
          ...prev,
          isDeformed,
          deformationType,
          railWear,
          gaugeDeviation,
          vibrationLevel,
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
              行车轨道磨损与变形监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              行车轨道磨损与变形视觉监测
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">轨道安全等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isDeformed ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.railWear > 3 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isDeformed ? 'text-red-400' : status.railWear > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isDeformed ? '严重' : status.railWear > 3 ? '警告' : '安全'}
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">
                  {activeTab === 'realtime' ? '实时轨道孪生' : activeTab === 'analysis' ? '变形应力分析' : '历史数据回溯'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">轨道磨损</span>
                    <span className="text-lg font-mono text-white">{status.railWear.toFixed(2)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">轨距偏差</span>
                    <span className="text-lg font-mono text-white">{status.gaugeDeviation.toFixed(1)} <span className="text-xs text-slate-500">mm</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '变形分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      {activeTab === 'realtime' ? <Activity className="w-6 h-6 text-cyan-400" /> : activeTab === 'analysis' ? <Layers className="w-6 h-6 text-cyan-400" /> : <History className="w-6 h-6 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">
                        {activeTab === 'realtime' ? '当前振动' : activeTab === 'analysis' ? '应力集中' : '平均磨损'}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {activeTab === 'realtime' ? status.vibrationLevel.toFixed(1) : activeTab === 'analysis' ? (status.railWear * 1.5).toFixed(1) : '1.42'} 
                        <span className="text-xs font-normal text-slate-500"> {activeTab === 'realtime' ? 'mm/s' : activeTab === 'analysis' ? 'MPa' : 'mm'}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Scale className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">轮压载荷</div>
                    <div className="text-xl font-bold text-white">{status.wheelLoad.toFixed(1)} <span className="text-xs font-normal text-slate-500">t</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">CV-RAIL-SCANNER v4.2</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-500/40">延迟: 12ms | 帧率: 60</div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-6"
            >
              <SciFiCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    {activeTab === 'history' ? '年度磨损统计' : '轨道磨损趋势 (mm)'}
                  </h3>
                  <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'history' ? (
                      <ReBarChart data={mockHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                        <Bar dataKey="wear" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    ) : (
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
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="wear" stroke="#06b6d4" fillOpacity={1} fill="url(#colorWear)" strokeWidth={2} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </SciFiCard>

              <SciFiCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Move className="w-5 h-5 text-blue-400" />
                    {activeTab === 'analysis' ? '变形应力分布' : '轨距偏差监测 (mm)'}
                  </h3>
                  <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'analysis' ? (
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: '垂直磨损', A: 120, fullMark: 150 },
                        { subject: '侧向磨损', A: 98, fullMark: 150 },
                        { subject: '轨距扩张', A: 86, fullMark: 150 },
                        { subject: '直线度', A: 99, fullMark: 150 },
                        { subject: '平整度', A: 85, fullMark: 150 },
                      ]}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                        <Radar name="应力" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </RadarChart>
                    ) : (
                      <LineChart data={mockHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="gauge" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </SciFiCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Metrics */}
          <SciFiCard className="p-6">
            <h3 className="text-sm font-mono text-cyan-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '轨道磨损', value: status.railWear.toFixed(2), unit: 'mm', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '轨距偏差', value: status.gaugeDeviation.toFixed(1), unit: 'mm', icon: Move, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '直线度', value: status.straightness.toFixed(2), unit: 'mm/m', icon: Sliders, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '振动水平', value: status.vibrationLevel.toFixed(1), unit: 'mm/s', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <h3 className="text-lg font-bold">智能轨道诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isDeformed ? 'bg-red-500/5 border-red-500/20' : status.railWear > 3 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isDeformed ? 'text-red-400' : status.railWear > 3 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isDeformed ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isDeformed ? `检测到轨道${status.deformationType === 'gauge_error' ? '轨距超标' : '结构性损伤'}` : status.railWear > 3 ? '轨道严重磨损' : '运行状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isDeformed 
                    ? `视觉传感器识别到轨道出现${status.deformationType === 'gauge_error' ? '明显的轨距扩张' : '表面裂纹'}。当前轨距偏差 ${status.gaugeDeviation.toFixed(1)} mm，存在行车脱轨风险。请立即停止作业并进行人工复核。` 
                    : status.railWear > 3 
                    ? '轨道侧向磨损严重，已接近报废限值。振动水平出现异常升高，建议尽快安排轨道打磨或局部更换。' 
                    : '轨道几何尺寸稳定。直线度与平整度符合运行标准，未发现紧固件松动或表面剥落迹象。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isDeformed ? '立即执行轨道几何尺寸校正' : '维持日常视觉巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.railWear > 2 ? '安排轨道润滑系统检查' : '定期校准视觉测量精度'}</span>
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
                {status.isDeformed ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isDeformed ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      行车轨道几何尺寸超标告警
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

export default CraneRail;
