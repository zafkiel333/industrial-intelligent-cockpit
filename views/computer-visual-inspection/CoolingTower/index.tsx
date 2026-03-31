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
  Fan,
  Snowflake,
  AlertCircle,
  BarChart,
  PieChart,
  LayoutGrid,
  Database,
  Box,
  Cylinder,
  Factory
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/CoolingTower/ThreeScene';
import { CoolingTowerStatus } from '../../../components/computer-visual-inspection/CoolingTower/three-types';
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
  Scatter
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  scaling: 10 + Math.random() * 40,
  efficiency: 70 + Math.random() * 25,
  tempDiff: 5 + Math.random() * 5
}));

const CoolingTower: React.FC = () => {
  const [status, setStatus] = useState<CoolingTowerStatus>({
    scalingLevel: 15.5,
    waterFlowRate: 1250,
    fanSpeed: 450,
    inletTemp: 38.2,
    outletTemp: 29.8,
    efficiency: 88.4,
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const scalingLevel = 10 + Math.random() * 60;
        const waterFlowRate = 1100 + Math.random() * 300;
        const fanSpeed = 400 + Math.random() * 200;
        const inletTemp = 35 + Math.random() * 10;
        const outletTemp = inletTemp - (5 + Math.random() * 5);
        const efficiency = 100 - (scalingLevel * 0.5) - (Math.random() * 5);

        return {
          ...prev,
          scalingLevel,
          waterFlowRate,
          fanSpeed,
          inletTemp,
          outletTemp,
          efficiency,
          lastInspectionTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-orange-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-orange-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Factory className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
              冷却塔填料结垢视觉监测系统
            </h1>
            <p className="text-orange-500/60 text-sm font-mono uppercase tracking-widest">
              Cooling Tower Packing Scaling Visual Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-orange-500/50 uppercase font-mono">运行效率等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.efficiency < 75 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.efficiency < 85 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.efficiency < 75 ? 'text-red-400' : status.efficiency < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.efficiency.toFixed(1)}%
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
                <h3 className="text-xs font-mono text-orange-500/70 uppercase mb-3 tracking-wider">实时冷却塔孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">填料结垢率</span>
                    <span className="text-lg font-mono text-white">{status.scalingLevel.toFixed(1)} <span className="text-xs text-slate-500">%</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">风机转速</span>
                    <span className="text-lg font-mono text-white">{status.fanSpeed.toFixed(0)} <span className="text-xs text-slate-500">RPM</span></span>
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
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '结垢分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-orange-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Waves className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-orange-500/50 uppercase font-mono tracking-widest">循环水量</div>
                    <div className="text-xl font-bold text-white">{status.waterFlowRate.toFixed(0)} <span className="text-xs font-normal text-slate-500">m³/h</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Thermometer className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">进出水温差</div>
                    <div className="text-xl font-bold text-white">{(status.inletTemp - status.outletTemp).toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">VISION-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  结垢率与效率趋势 (%)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-orange-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorScaling" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#f59e0b' }}
                    />
                    <Area type="monotone" dataKey="scaling" stroke="#f59e0b" fillOpacity={1} fill="url(#colorScaling)" strokeWidth={2} />
                    <Area type="monotone" dataKey="efficiency" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-blue-400" />
                  冷却温差波动 (°C)
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
                    <Line type="monotone" dataKey="tempDiff" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-orange-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '结垢等级', value: status.scalingLevel.toFixed(1), unit: '%', icon: LayoutGrid, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '冷却效率', value: status.efficiency.toFixed(1), unit: '%', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '循环水量', value: status.waterFlowRate.toFixed(0), unit: 'm³/h', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '进水温度', value: status.inletTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-red-400', bg: 'bg-red-500/10' },
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
              <Cpu className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold">智能结垢诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.scalingLevel > 50 ? 'bg-red-500/5 border-red-500/20' : status.scalingLevel > 25 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.scalingLevel > 50 ? 'text-red-400' : status.scalingLevel > 25 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.scalingLevel > 50 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.scalingLevel > 50 ? '填料严重堵塞' : status.scalingLevel > 25 ? '发现明显结垢' : '填料状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.scalingLevel > 50 
                    ? '视觉传感器识别到填料表面大面积钙化结垢，部分区域已出现物理堵塞。冷却效率下降显著，建议立即停机进行化学清洗。' 
                    : status.scalingLevel > 25 
                    ? '填料局部出现黄色水垢沉积。虽然目前对换热影响有限，但结垢速率有加快趋势。请检查水质硬度并调整加药量。' 
                    : '填料表面清洁，未发现明显水垢沉积。水流分布均匀，换热效率处于设计区间，系统运行稳定。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>{status.scalingLevel > 40 ? '安排高压水冲洗或更换填料' : '维持日常在线水质监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>{status.efficiency < 80 ? '检查风机叶片角度及传动皮带' : '定期校准视觉识别算法阈值'}</span>
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
                {status.scalingLevel > 30 ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.scalingLevel > 30 ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      填料结垢率超标预警
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

export default CoolingTower;
