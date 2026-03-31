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
  Move
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/PipeHanger/ThreeScene';
import { PipeHangerStatus } from '../../../components/computer-visual-inspection/PipeHanger/three-types';
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
  displacement: Math.random() * 10,
  load: 15 + Math.random() * 5,
  tilt: Math.random() * 2
}));

const PipeHanger: React.FC = () => {
  const [status, setStatus] = useState<PipeHangerStatus>({
    displacementX: 2.5,
    displacementY: -1.2,
    displacementZ: 0.5,
    springLoad: 18.5,
    tiltAngle: 0.8,
    isFailed: false,
    failureType: 'none',
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isFailed = Math.random() > 0.9;
        const displacementX = isFailed ? 15 + Math.random() * 10 : 2 + Math.random() * 2;
        const displacementY = isFailed ? -10 - Math.random() * 5 : -1 - Math.random() * 1;
        const displacementZ = (Math.random() - 0.5) * 2;
        const springLoad = isFailed ? 5 + Math.random() * 5 : 18 + Math.random() * 2;
        const tiltAngle = isFailed ? 5 + Math.random() * 5 : 0.5 + Math.random() * 0.5;
        
        const failureTypes: PipeHangerStatus['failureType'][] = ['overload', 'corrosion', 'disconnection', 'spring_break'];
        const failureType = isFailed ? failureTypes[Math.floor(Math.random() * failureTypes.length)] : 'none';

        return {
          ...prev,
          isFailed,
          failureType,
          displacementX,
          displacementY,
          displacementZ,
          springLoad,
          tiltAngle,
          lastInspectionTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-blue-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Anchor className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              管道支吊架位移与失效监测系统
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Pipe Hanger Displacement & Failure Visual Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">支架安全状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isFailed ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : Math.abs(status.displacementX) > 8 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isFailed ? 'text-red-400' : Math.abs(status.displacementX) > 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isFailed ? 'FAILED' : Math.abs(status.displacementX) > 8 ? 'WARNING' : 'SECURE'}
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
                <h3 className="text-xs font-mono text-blue-500/70 uppercase mb-3 tracking-wider">实时支吊架孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">X轴位移</span>
                    <span className="text-lg font-mono text-white">{status.displacementX.toFixed(2)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">弹簧荷载</span>
                    <span className="text-lg font-mono text-white">{status.springLoad.toFixed(1)} <span className="text-xs text-slate-500">kN</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '位移分析' : '历史趋势'}
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
                    <Move className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">倾斜角度</div>
                    <div className="text-xl font-bold text-white">{status.tiltAngle.toFixed(1)} <span className="text-xs font-normal text-slate-500">°</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Link className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">连接状态</div>
                    <div className="text-xl font-bold text-white uppercase">{status.isFailed ? 'DISCONNECTED' : 'CONNECTED'}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">HANGER-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  位移变化趋势 (mm)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="displacement" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDisp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-cyan-400" />
                  弹簧荷载波动 (kN)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Line type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} dot={false} />
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
                { label: 'X轴位移', value: status.displacementX.toFixed(2), unit: 'mm', icon: Move, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Y轴位移', value: status.displacementY.toFixed(2), unit: 'mm', icon: Move, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '弹簧荷载', value: status.springLoad.toFixed(1), unit: 'kN', icon: Gauge, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '倾斜角度', value: status.tiltAngle.toFixed(1), unit: '°', icon: Sliders, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <Cpu className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">智能支架诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isFailed ? 'bg-red-500/5 border-red-500/20' : Math.abs(status.displacementX) > 8 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isFailed ? 'text-red-400' : Math.abs(status.displacementX) > 8 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isFailed ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isFailed ? `检测到${status.failureType === 'spring_break' ? '弹簧断裂' : '支架脱落'}` : Math.abs(status.displacementX) > 8 ? '位移严重超标' : '运行状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isFailed 
                    ? `视觉传感器识别到支吊架组件出现物理断裂，弹簧荷载骤降至 ${status.springLoad.toFixed(1)} kN。管道失去支撑，存在严重的下坠风险，请立即采取临时加固措施。` 
                    : Math.abs(status.displacementX) > 8 
                    ? '管道位移超出设计补偿范围。可能由于热胀冷缩补偿器失效或管道堵塞导致应力集中。建议检查全线补偿器状态。' 
                    : '支吊架位移处于正常热态/冷态区间。弹簧荷载稳定，吊杆倾斜度符合标准，未发现结构性损伤迹象。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.isFailed ? '立即更换受损支吊架组件' : '维持日常视觉在线监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{Math.abs(status.displacementX) > 5 ? '调整支架弹簧预紧力' : '定期校准视觉位移测量基准'}</span>
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
                {status.isFailed ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isFailed ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      支吊架结构失效告警
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

export default PipeHanger;
