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
  Droplets,
  Waves,
  Maximize2,
  Search,
  ShieldAlert,
  Layers,
  Map,
  Navigation,
  Clock,
  Trash2,
  Wind,
  Thermometer
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/WorkshopFloor/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-workshop-floor]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-workshop-floor';
import { FloorStatus } from '../../../components/computer-visual-inspection/WorkshopFloor/three-types';
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  water: Math.random() * 5,
  oil: Math.random() * 2,
  risk: Math.random() * 10
}));

const WorkshopFloor: React.FC = () => {
  const [status, setStatus] = useState<FloorStatus>({
    waterArea: 2.5,
    oilArea: 0.8,
    isSlippery: true,
    riskLevel: 'medium',
    lastScanTime: '2026-03-31 10:00:00',
    detectedSpots: [
      { x: -5, y: 3, type: 'water', size: 1.2 },
      { x: 4, y: -2, type: 'oil', size: 0.8 },
      { x: 0, y: 5, type: 'water', size: 0.5 }
    ]
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'risk' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const waterArea = Math.random() * 10;
        const oilArea = Math.random() * 5;
        const riskLevel = waterArea + oilArea > 10 ? 'high' : waterArea + oilArea > 5 ? 'medium' : 'low';
        const isSlippery = waterArea > 2 || oilArea > 1;
        
        const detectedSpots = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15,
          type: Math.random() > 0.7 ? 'oil' : 'water' as any,
          size: 0.5 + Math.random() * 1.5
        }));

        return {
          ...prev,
          waterArea,
          oilArea,
          isSlippery,
          riskLevel,
          lastScanTime: new Date().toLocaleString(),
          detectedSpots
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
            <Droplets className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              车间地面油污与积水识别系统
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Workshop Floor Oil Stain & Water Accumulation Identification
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">地面风险等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.riskLevel === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.riskLevel === 'high' ? 'text-red-400' : status.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.riskLevel === 'high' ? '高风险' : status.riskLevel === 'medium' ? '中等风险' : '低风险'}
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
                <h3 className="text-xs font-mono text-blue-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">积水面积</span>
                    <span className="text-lg font-mono text-white">{status.waterArea.toFixed(1)} <span className="text-xs text-slate-500">m²</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">油污面积</span>
                    <span className="text-lg font-mono text-white">{status.oilArea.toFixed(1)} <span className="text-xs text-slate-500">m²</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'risk', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'risk' ? '风险分析' : '历史追溯'}
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
                <div className="bg-black/60 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">视觉扫描状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Navigation className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">异常点数量</div>
                    <div className="text-xl font-bold text-white">{status.detectedSpots.length} <span className="text-xs font-normal text-slate-500">SPOTS</span></div>
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
                  <Waves className="w-5 h-5 text-blue-400" />
                  污染面积趋势 (m²)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="water" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} />
                    <Area type="monotone" dataKey="oil" stroke="#1e293b" fillOpacity={1} fill="url(#colorOil)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  风险指数记录
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Line type="monotone" dataKey="risk" stroke="#a855f7" strokeWidth={2} dot={false} />
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
                { label: '积水面积', value: status.waterArea.toFixed(1), unit: 'm²', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '油污面积', value: status.oilArea.toFixed(1), unit: 'm²', icon: Waves, color: 'text-slate-400', bg: 'bg-slate-500/10' },
                { label: '异常点数', value: status.detectedSpots.length, unit: '个', icon: Search, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '滑倒风险', value: status.isSlippery ? '高' : '低', unit: '', icon: ShieldAlert, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <ShieldAlert className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">智能安全诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  诊断结果: {status.riskLevel === 'high' ? '严重地面隐患' : status.riskLevel === 'medium' ? '发现地面污渍' : '地面洁净'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.riskLevel === 'high' 
                    ? '检测到大面积油水混合物，极易导致人员滑倒或叉车失控。建议立即封锁该区域并进行深度清理。' 
                    : status.riskLevel === 'medium' 
                    ? '发现局部积水与少量油污，请安排保洁人员前往处理，防止污染扩散。' 
                    : '地面状况良好，未发现明显油污或积水。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.isSlippery ? '立即启动自动洗地机器人' : '维持日常保洁频率'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.oilArea > 0 ? '检查上方设备是否存在渗油' : '定期检查排水口通畅性'}</span>
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
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {status.isSlippery ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isSlippery ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">地面湿滑预警</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">JUST NOW</span>
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

export default WorkshopFloor;
