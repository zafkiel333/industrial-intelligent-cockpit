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
  Sliders
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/ValvePosition/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-valve-position]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-valve-position';
import { ValveStatus } from '../../../components/computer-visual-inspection/ValvePosition/three-types';
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
  opening: 20 + Math.random() * 60,
  flow: 100 + Math.random() * 200,
  pressure: 0.5 + Math.random() * 0.2
}));

const ValvePosition: React.FC = () => {
  const [status, setStatus] = useState<ValveStatus>({
    openingPercentage: 45.5,
    flowRate: 185.2,
    pressureIn: 0.65,
    pressureOut: 0.42,
    isOperating: false,
    lastAction: 'adjust',
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isOperating = Math.random() > 0.7;
        const openingPercentage = isOperating 
          ? Math.min(100, Math.max(0, prev.openingPercentage + (Math.random() - 0.5) * 10))
          : prev.openingPercentage;
        const flowRate = (openingPercentage / 100) * 400 + (Math.random() * 20);
        const pressureIn = 0.6 + Math.random() * 0.1;
        const pressureOut = pressureIn * (openingPercentage / 100) * 0.9 + 0.1;
        
        const actions: ValveStatus['lastAction'][] = ['open', 'close', 'adjust'];
        const lastAction = isOperating ? actions[Math.floor(Math.random() * actions.length)] : prev.lastAction;

        return {
          ...prev,
          isOperating,
          lastAction,
          openingPercentage,
          flowRate,
          pressureIn,
          pressureOut,
          lastInspectionTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sliders className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              阀门开关状态与开度视觉识别系统
            </h1>
            <p className="text-emerald-500/60 text-sm font-mono uppercase tracking-widest">
              Valve Position & Opening Visual Recognition
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-500/50 uppercase font-mono">阀门运行状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isOperating ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : status.openingPercentage === 0 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.openingPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isOperating ? 'text-blue-400' : status.openingPercentage === 0 ? 'text-red-400' : status.openingPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status.isOperating ? 'ADJUSTING' : status.openingPercentage === 0 ? 'CLOSED' : status.openingPercentage === 100 ? 'OPEN' : 'PARTIAL'}
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
                <h3 className="text-xs font-mono text-emerald-500/70 uppercase mb-3 tracking-wider">实时阀门孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前开度</span>
                    <span className="text-lg font-mono text-white">{status.openingPercentage.toFixed(1)} <span className="text-xs text-slate-500">%</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">瞬时流量</span>
                    <span className="text-lg font-mono text-white">{status.flowRate.toFixed(1)} <span className="text-xs text-slate-500">m³/h</span></span>
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
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '开度分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Gauge className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500/50 uppercase font-mono tracking-widest">入口压力</div>
                    <div className="text-xl font-bold text-white">{status.pressureIn.toFixed(2)} <span className="text-xs font-normal text-slate-500">MPa</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <History className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">最后动作</div>
                    <div className="text-xl font-bold text-white uppercase">{status.lastAction}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">VALVE-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  开度与流量趋势
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-emerald-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorOpening" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="opening" stroke="#10b981" fillOpacity={1} fill="url(#colorOpening)" strokeWidth={2} />
                    <Area type="monotone" dataKey="flow" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-400" />
                  进出口压差监测 (MPa)
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
                    <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-emerald-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '当前开度', value: status.openingPercentage.toFixed(1), unit: '%', icon: Sliders, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '瞬时流量', value: status.flowRate.toFixed(1), unit: 'm³/h', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '入口压力', value: status.pressureIn.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '出口压力', value: status.pressureOut.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-blue-500', bg: 'bg-blue-600/10' },
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
              <Cpu className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">智能阀门诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.openingPercentage > 95 ? 'bg-emerald-500/5 border-emerald-500/20' : status.openingPercentage < 5 ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.openingPercentage > 95 ? 'text-emerald-400' : status.openingPercentage < 5 ? 'text-red-400' : 'text-amber-400'}`}>
                  {status.openingPercentage > 95 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  诊断结果: {status.openingPercentage > 95 ? '全开状态' : status.openingPercentage < 5 ? '全关状态' : '节流运行中'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.openingPercentage > 95 
                    ? '视觉识别确认阀杆处于上限位，手轮位置符合全开特征。流阻最小，系统压力损失符合预期。' 
                    : status.openingPercentage < 5 
                    ? '视觉识别确认阀杆处于下限位，手轮已锁死。出口压力接近环境压力，密封性能良好。' 
                    : `阀门处于 ${status.openingPercentage.toFixed(1)}% 的中间开度。视觉算法检测到手轮刻度与实际流量特征匹配，未发现卡涩或内漏迹象。`}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.isOperating ? '监控调节过程中的压力波动' : '维持日常视觉巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.openingPercentage > 0 && status.openingPercentage < 100 ? '定期检查阀座冲刷情况' : '定期对阀杆进行润滑保养'}</span>
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
                0 NEW
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="text-slate-500 text-xs italic text-center py-4">
                暂无异常预警记录
              </div>
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default ValvePosition;
