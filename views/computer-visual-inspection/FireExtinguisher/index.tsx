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
  Flame,
  Gauge,
  Calendar,
  MapPin,
  Maximize2,
  Search,
  ShieldAlert
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/FireExtinguisher/ThreeScene';
import { ExtinguisherStatus } from '../../../components/computer-visual-inspection/FireExtinguisher/three-types';
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
  pressure: 1.3 + Math.random() * 0.2,
  corrosion: 0.05 + Math.random() * 0.05
}));

const FireExtinguisher: React.FC = () => {
  const [status, setStatus] = useState<ExtinguisherStatus>({
    pressure: 1.45,
    expiryDate: '2027-12-31',
    isExpired: false,
    corrosionLevel: 0.1,
    location: 'A区-3号通道',
    lastInspected: '2026-03-15'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        pressure: 1.2 + Math.random() * 0.4,
        corrosionLevel: Math.min(1, prev.corrosionLevel + 0.00001)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-red-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-red-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Flame className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
              灭火器压力表与有效期视觉检测系统
            </h1>
            <p className="text-red-500/60 text-sm font-mono uppercase tracking-widest">
              Fire Extinguisher Pressure & Expiry Visual Inspection System
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-red-500/50 uppercase font-mono">设备状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.pressure < 1.0 || status.isExpired ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.pressure < 1.0 || status.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.pressure < 1.0 ? '压力过低' : status.isExpired ? '已过期' : '状态正常'}
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
                <h3 className="text-xs font-mono text-red-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前压力</span>
                    <span className="text-lg font-mono text-white">{status.pressure.toFixed(2)} <span className="text-xs text-slate-500">MPa</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">有效期至</span>
                    <span className="text-lg font-mono text-white">{status.expiryDate}</span>
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
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
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
                <div className="bg-black/60 backdrop-blur-xl border border-red-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <Search className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-red-500/50 uppercase font-mono tracking-widest">视觉识别状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">部署位置</div>
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
                  <Gauge className="w-5 h-5 text-red-400" />
                  压力波动记录 (MPa)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="pressure" stroke="#ef4444" fillOpacity={1} fill="url(#colorPressure)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  腐蚀程度监控 (%)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-orange-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fb923c' }}
                    />
                    <Line type="monotone" dataKey="corrosion" stroke="#fb923c" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-red-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '当前压力值', value: status.pressure.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: '腐蚀指数', value: (status.corrosionLevel * 100).toFixed(1), unit: '%', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '有效期剩余', value: '645', unit: '天', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '最后巡检', value: status.lastInspected, unit: '', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <h3 className="text-lg font-bold">智能合规性报告</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  合规性评分: 98%
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  当前灭火器压力处于正常范围（绿色区域），有效期充足，瓶体无明显锈蚀。符合消防安全标准。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>保持瓶体清洁，防止灰尘遮挡压力表</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>确保铅封完好，无擅自开启痕迹</span>
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

export default FireExtinguisher;
