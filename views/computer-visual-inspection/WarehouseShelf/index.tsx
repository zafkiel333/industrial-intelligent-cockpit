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
  Layers,
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Wind,
  Thermometer,
  Weight,
  Ruler,
  AlertCircle,
  Database,
  LayoutGrid,
  Warehouse
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/WarehouseShelf/ThreeScene';
import { ShelfStatus } from '../../../components/computer-visual-inspection/WarehouseShelf/three-types';
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
  deformation: 2 + Math.random() * 8,
  load: 500 + Math.random() * 200,
  health: 90 + Math.random() * 10
}));

const WarehouseShelf: React.FC = () => {
  const [status, setStatus] = useState<ShelfStatus>({
    deformationValue: 5.2,
    loadWeight: 650,
    structuralHealth: 92,
    isDeformed: false,
    hasCracks: false,
    lastInspectionTime: '2026-03-31 10:00:00',
    shelfId: 'W-04-B-12',
    alerts: []
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'structural' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const deformationValue = 2 + Math.random() * 15;
        const loadWeight = 400 + Math.random() * 400;
        const isDeformed = deformationValue > 12;
        const hasCracks = Math.random() > 0.95;
        const structuralHealth = 100 - (deformationValue * 2) - (hasCracks ? 20 : 0);
        
        const alerts = [];
        if (isDeformed) alerts.push('检测到横梁形变超标');
        if (hasCracks) alerts.push('发现结构性裂纹');
        if (loadWeight > 750) alerts.push('货架处于超负荷状态');

        return {
          ...prev,
          deformationValue,
          loadWeight,
          structuralHealth,
          isDeformed,
          hasCracks,
          lastInspectionTime: new Date().toLocaleString(),
          alerts
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-amber-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-amber-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Warehouse className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
              仓库货架结构完整性与变形监测
            </h1>
            <p className="text-amber-500/60 text-sm font-mono uppercase tracking-widest">
              Warehouse Shelf Structural Integrity & Deformation Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-amber-500/50 uppercase font-mono">结构健康指数</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.structuralHealth < 70 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.structuralHealth < 90 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.structuralHealth < 70 ? 'text-red-400' : status.structuralHealth < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.structuralHealth.toFixed(1)}
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
                <h3 className="text-xs font-mono text-amber-500/70 uppercase mb-3 tracking-wider">实时结构孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">货架编号</span>
                    <span className="text-lg font-mono text-white">{status.shelfId}</span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前载重</span>
                    <span className="text-lg font-mono text-white">{status.loadWeight.toFixed(0)} <span className="text-xs text-slate-500">kg</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'structural', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'structural' ? '结构分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-500/50 uppercase font-mono tracking-widest">结构监测频率</div>
                    <div className="text-xl font-bold text-white">10 <span className="text-xs font-normal text-slate-500">Hz</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Ruler className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">最大形变量</div>
                    <div className="text-xl font-bold text-white">{status.deformationValue.toFixed(2)} <span className="text-xs font-normal text-slate-500">mm</span></div>
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
                  <Weight className="w-5 h-5 text-amber-400" />
                  载重与形变关联分析
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-amber-400 transition-colors" />
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
                    <Bar yAxisId="left" dataKey="load" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="deformation" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  结构健康度历史
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-emerald-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2} />
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
            <h3 className="text-sm font-mono text-amber-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '最大形变量', value: status.deformationValue.toFixed(2), unit: 'mm', icon: Ruler, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: '当前总载重', value: status.loadWeight.toFixed(0), unit: 'kg', icon: Weight, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '结构裂纹', value: status.hasCracks ? '发现' : '未见', unit: '', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '健康评估', value: status.structuralHealth.toFixed(1), unit: '分', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <Cpu className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold">智能结构诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.alerts.length > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.alerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {status.alerts.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.alerts.length > 0 ? '结构风险预警' : '结构稳固'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.alerts.length > 0 
                    ? `检测到以下异常：${status.alerts.join('、')}。货架稳定性受到威胁，建议立即卸载货物并进行加固处理。` 
                    : '当前货架结构完整性良好，形变量在安全阈值范围内，可正常承载。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{status.isDeformed ? '立即安排结构工程师现场核查' : '维持季度常规结构巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{status.loadWeight > 700 ? '优化货物分布，降低单层载重' : '保持货架标识清晰，严禁超载'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Alert List */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                异常告警队列
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {status.alerts.length} ACTIVE
              </span>
            </div>
            
            <div className="space-y-3">
              {status.alerts.length > 0 ? (
                status.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs text-slate-300">{alert}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">CRITICAL</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs italic text-center py-4">
                  暂无结构异常告警
                </div>
              )}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default WarehouseShelf;
