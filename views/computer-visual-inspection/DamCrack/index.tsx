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
  Mountain,
  Ruler,
  AlertCircle,
  Camera,
  Scan,
  Map,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  Waves
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/DamCrack/ThreeScene';
import { DamCrackStatus } from '../../../components/computer-visual-inspection/DamCrack/three-types';
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
  Bar,
  ComposedChart,
  Scatter
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  cracks: Math.floor(Math.random() * 10),
  maxWidth: 2 + Math.random() * 8,
  risk: 10 + Math.random() * 40
}));

const DamCrack: React.FC = () => {
  const [status, setStatus] = useState<DamCrackStatus>({
    crackCount: 5,
    maxCrackWidth: 3.2,
    maxCrackLength: 1.5,
    riskScore: 25,
    lastInspectionTime: '2026-03-31 10:00:00',
    detectedCracks: [
      { x: -5, y: 3, z: 2, width: 3.2, length: 1.5, severity: 'medium' },
      { x: 4, y: -2, z: 1, width: 1.5, length: 0.8, severity: 'low' },
      { x: 0, y: 5, z: 3, width: 5.5, length: 2.2, severity: 'high' }
    ]
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const crackCount = Math.floor(Math.random() * 15);
        const maxCrackWidth = 1 + Math.random() * 15;
        const maxCrackLength = 0.5 + Math.random() * 5;
        const riskScore = (crackCount * 2) + (maxCrackWidth * 3) + (maxCrackLength * 2);
        
        const detectedCracks = Array.from({ length: crackCount }, () => ({
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15,
          z: Math.random() * 5,
          width: 1 + Math.random() * 10,
          length: 0.5 + Math.random() * 3,
          severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low' as any
        }));

        return {
          ...prev,
          crackCount,
          maxCrackWidth,
          maxCrackLength,
          riskScore,
          lastInspectionTime: new Date().toLocaleString(),
          detectedCracks
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
            <Mountain className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
              尾矿坝表面裂缝视觉识别系统
            </h1>
            <p className="text-orange-500/60 text-sm font-mono uppercase tracking-widest">
              Tailing Dam Surface Crack Visual Identification
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-orange-500/50 uppercase font-mono">坝体风险评分</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.riskScore > 60 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.riskScore > 30 ? 'bg-orange-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.riskScore > 60 ? 'text-red-400' : status.riskScore > 30 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {status.riskScore.toFixed(1)}
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
                <h3 className="text-xs font-mono text-orange-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">裂缝总数</span>
                    <span className="text-lg font-mono text-white">{status.crackCount} <span className="text-xs text-slate-500">处</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">最大宽度</span>
                    <span className="text-lg font-mono text-white">{status.maxCrackWidth.toFixed(1)} <span className="text-xs text-slate-500">mm</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '裂缝分析' : '历史追溯'}
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
                    <Scan className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-orange-500/50 uppercase font-mono tracking-widest">视觉检测引擎</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Navigation className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">检测范围</div>
                    <div className="text-xl font-bold text-white">1.2 <span className="text-xs font-normal text-slate-500">km²</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">DRONE-02 CONNECTED</span>
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
                  裂缝数量与宽度趋势
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-orange-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Bar yAxisId="left" dataKey="cracks" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="maxWidth" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  坝体风险指数历史
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
                  </AreaChart>
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
                { label: '裂缝总数', value: status.crackCount, unit: '处', icon: Search, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '最大宽度', value: status.maxCrackWidth.toFixed(1), unit: 'mm', icon: Ruler, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: '最大长度', value: status.maxCrackLength.toFixed(1), unit: 'm', icon: Maximize2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '风险评分', value: status.riskScore.toFixed(1), unit: '分', icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <h3 className="text-lg font-bold">智能坝体诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.riskScore > 50 ? 'bg-red-500/5 border-red-500/20' : status.riskScore > 20 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.riskScore > 50 ? 'text-red-400' : status.riskScore > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.riskScore > 50 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.riskScore > 50 ? '坝体结构高危' : status.riskScore > 20 ? '发现多处裂缝' : '坝体稳固'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.riskScore > 50 
                    ? '检测到贯穿性裂缝，且宽度持续增加。坝体结构稳定性面临严重威胁，建议立即启动应急预案。' 
                    : status.riskScore > 20 
                    ? '坝面出现多处浅层裂缝，主要集中在迎水面。请加强巡检频次，并观察裂缝发展趋势。' 
                    : '坝体表面未发现明显裂缝，结构参数稳定，符合安全运行标准。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">处置建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>{status.maxCrackWidth > 5 ? '立即进行裂缝注浆加固处理' : '维持日常无人机视觉巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>{status.riskScore > 40 ? '检查坝体内部浸润线位置' : '定期清理坝面杂草，防止根系破坏'}</span>
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
                {status.riskScore > 30 ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.riskScore > 30 ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      {status.riskScore > 60 ? '坝体贯穿性裂缝预警' : '新增多处坝面裂缝'}
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

export default DamCrack;
