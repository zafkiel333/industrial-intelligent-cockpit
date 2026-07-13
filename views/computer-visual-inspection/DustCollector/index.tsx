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
  Fan
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/DustCollector/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-dust-collector]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-dust-collector';
import { DustCollectorStatus } from '../../../components/computer-visual-inspection/DustCollector/three-types';
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
  concentration: 5 + Math.random() * 20,
  pressure: 800 + Math.random() * 400,
  airflow: 50000 + Math.random() * 5000
}));

const DustCollector: React.FC = () => {
  const [status, setStatus] = useState<DustCollectorStatus>({
    emissionConcentration: 12.5,
    differentialPressure: 1250.0,
    brokenBagsCount: 0,
    activeChamber: 1,
    cleaningCycleActive: false,
    fanSpeed: 1450,
    airflow: 52000,
    isAlarming: false,
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isAlarming = Math.random() > 0.85;
        const brokenBagsCount = isAlarming ? Math.floor(Math.random() * 3) + 1 : 0;
        const emissionConcentration = isAlarming ? 45 + Math.random() * 30 : 10 + Math.random() * 5;
        const differentialPressure = isAlarming ? 1800 + Math.random() * 400 : 1200 + Math.random() * 100;
        const cleaningCycleActive = Math.random() > 0.7;

        return {
          ...prev,
          isAlarming,
          brokenBagsCount,
          emissionConcentration,
          differentialPressure,
          cleaningCycleActive,
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
            <Filter className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              除尘器滤袋破损视觉识别系统
            </h1>
            <p className="text-emerald-500/60 text-sm font-mono uppercase tracking-widest">
              除尘器滤袋破损视觉识别系统
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-500/50 uppercase font-mono">排放合规状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isAlarming ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.emissionConcentration > 30 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isAlarming ? 'text-red-400' : status.emissionConcentration > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isAlarming ? '严重' : status.emissionConcentration > 30 ? '警告' : '安全'}
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
                <h3 className="text-xs font-mono text-emerald-500/70 uppercase mb-3 tracking-wider">实时除尘器孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">排放浓度</span>
                    <span className="text-lg font-mono text-white">{status.emissionConcentration.toFixed(1)} <span className="text-xs text-slate-500">mg/m³</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">过滤压差</span>
                    <span className="text-lg font-mono text-white">{status.differentialPressure.toFixed(0)} <span className="text-xs text-slate-500">Pa</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '破损分析' : '历史趋势'}
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
                    <AlertTriangle className={`w-6 h-6 ${status.brokenBagsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500/50 uppercase font-mono tracking-widest">破损滤袋数</div>
                    <div className="text-xl font-bold text-white">{status.brokenBagsCount} <span className="text-xs font-normal text-slate-500">个</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Fan className={`w-6 h-6 text-slate-400 ${status.fanSpeed > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: `${3000/status.fanSpeed}s` }} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">风机转速</div>
                    <div className="text-xl font-bold text-white">{status.fanSpeed} <span className="text-xs font-normal text-slate-500">RPM</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className={`w-1 h-1 rounded-full ${status.cleaningCycleActive ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {status.cleaningCycleActive ? '清灰循环激活' : '监控中'}
                  </span>
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
                  排放浓度趋势 (mg/m³)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-emerald-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="concentration" stroke="#10b981" fillOpacity={1} fill="url(#colorConc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-400" />
                  过滤压差波动 (Pa)
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
                { label: '排放浓度', value: status.emissionConcentration.toFixed(1), unit: 'mg/m³', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '过滤压差', value: status.differentialPressure.toFixed(0), unit: 'Pa', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '处理风量', value: (status.airflow/1000).toFixed(1), unit: 'k m³/h', icon: WindIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '风机频率', value: (status.fanSpeed/30).toFixed(1), unit: 'Hz', icon: Fan, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <h3 className="text-lg font-bold">智能破损诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isAlarming ? 'bg-red-500/5 border-red-500/20' : status.emissionConcentration > 20 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isAlarming ? 'text-red-400' : status.emissionConcentration > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isAlarming ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isAlarming ? `检测到 ${status.brokenBagsCount} 个滤袋破损` : status.emissionConcentration > 20 ? '排放浓度偏高' : '运行状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isAlarming 
                    ? `视觉传感器在第 ${status.activeChamber} 室检测到明显的粉尘泄露轨迹。排放浓度骤升至 ${status.emissionConcentration.toFixed(1)} mg/m³。建议立即隔离该室并更换滤袋。` 
                    : status.emissionConcentration > 20 
                    ? '排放浓度出现小幅波动，压差略高于正常区间。可能由于清灰不彻底或滤袋老化导致。建议增加清灰频率。' 
                    : '除尘器运行参数稳定。视觉算法未检测到异常烟羽，滤袋完整性良好，排放浓度远低于环保红线。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.isAlarming ? '立即执行受损室离线检修' : '维持日常视觉在线监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.differentialPressure > 1500 ? '优化脉冲清灰压力参数' : '定期校准粉尘视觉识别算法'}</span>
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
                {status.isAlarming ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isAlarming ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      除尘器滤袋破损告警
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

export default DustCollector;
