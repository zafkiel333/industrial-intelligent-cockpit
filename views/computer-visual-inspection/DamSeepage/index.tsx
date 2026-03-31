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
  Camera
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/DamSeepage/ThreeScene';
import { SeepageStatus } from '../../../components/computer-visual-inspection/DamSeepage/three-types';
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
  depth: 5 + Math.random() * 2,
  seepage: 0.5 + Math.random() * 1.5,
  risk: 20 + Math.random() * 30
}));

const DamSeepage: React.FC = () => {
  const [status, setStatus] = useState<SeepageStatus>({
    phreaticLineDepth: 5.5,
    seepageArea: 12.5,
    seepageRate: 0.8,
    riskScore: 32,
    lastInspectionTime: '2026-03-31 10:00:00',
    seepageSpots: [
      { x: -5, y: 3, z: 2, size: 1.2, flowRate: 0.2 },
      { x: 4, y: -2, z: 1, size: 0.8, flowRate: 0.1 },
      { x: 0, y: 5, z: 3, size: 2.5, flowRate: 0.5 }
    ]
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const phreaticLineDepth = 4 + Math.random() * 4;
        const seepageArea = 5 + Math.random() * 20;
        const seepageRate = 0.1 + Math.random() * 2;
        const riskScore = (8 - phreaticLineDepth) * 10 + (seepageRate * 20);
        
        const seepageSpots = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15,
          z: Math.random() * 5,
          size: 0.5 + Math.random() * 2,
          flowRate: 0.1 + Math.random() * 0.5
        }));

        return {
          ...prev,
          phreaticLineDepth,
          seepageArea,
          seepageRate,
          riskScore,
          lastInspectionTime: new Date().toLocaleString(),
          seepageSpots
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
            <Waves className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              尾矿坝浸润线与渗漏视觉监测
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Tailing Dam Phreatic Line & Seepage Visual Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">坝体安全等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.riskScore > 60 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.riskScore > 30 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.riskScore > 60 ? 'text-red-400' : status.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
                <h3 className="text-xs font-mono text-blue-500/70 uppercase mb-3 tracking-wider">实时浸润孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">浸润线埋深</span>
                    <span className="text-lg font-mono text-white">{status.phreaticLineDepth.toFixed(2)} <span className="text-xs text-slate-500">m</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">渗漏速率</span>
                    <span className="text-lg font-mono text-white">{status.seepageRate.toFixed(2)} <span className="text-xs text-slate-500">L/s</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '渗漏分析' : '历史趋势'}
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
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">渗漏点数量</div>
                    <div className="text-xl font-bold text-white">{status.seepageSpots.length} <span className="text-xs font-normal text-slate-500">SPOTS</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Gauge className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">孔隙水压力</div>
                    <div className="text-xl font-bold text-white">125 <span className="text-xs font-normal text-slate-500">kPa</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">SAT-SCAN ACTIVE</span>
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
                  浸润线深度趋势 (m)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="depth" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDepth)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-400" />
                  渗漏速率波动 (L/s)
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
                    <Line type="monotone" dataKey="seepage" stroke="#06b6d4" strokeWidth={2} dot={false} />
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
                { label: '浸润线深度', value: status.phreaticLineDepth.toFixed(2), unit: 'm', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '渗漏总面积', value: status.seepageArea.toFixed(1), unit: 'm²', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '渗漏速率', value: status.seepageRate.toFixed(2), unit: 'L/s', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-600/10' },
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
              <Cpu className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">智能渗漏诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.riskScore > 50 ? 'bg-red-500/5 border-red-500/20' : status.riskScore > 20 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.riskScore > 50 ? 'text-red-400' : status.riskScore > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.riskScore > 50 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.riskScore > 50 ? '坝体渗流失控' : status.riskScore > 20 ? '发现异常渗漏' : '渗流状态稳定'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.riskScore > 50 
                    ? '浸润线位置异常抬升，已接近坝坡表面，且渗漏速率急剧增加。存在管涌或溃坝风险，请立即采取排渗降压措施。' 
                    : status.riskScore > 20 
                    ? '坝坡局部出现潮湿斑点及少量渗水。请检查排渗管是否堵塞，并监测渗水浑浊度。' 
                    : '浸润线埋深处于安全区间，坝体未发现明显渗漏点，排渗系统运行正常。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.phreaticLineDepth < 5 ? '启动应急排渗泵，降低库水位' : '维持日常排渗井水位监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.seepageRate > 1.5 ? '对渗漏区域进行反滤压盖处理' : '定期清理排渗棱体，防止淤堵'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
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
                      {status.riskScore > 60 ? '浸润线逸出点预警' : '发现新增渗漏点'}
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

export default DamSeepage;
