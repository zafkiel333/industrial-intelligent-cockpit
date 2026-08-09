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
  Wind,
  Snowflake,
  Thermometer,
  Gauge,
  TrendingDown,
  Maximize2,
  Search,
  ShieldAlert,
  Layers,
  ArrowDownToLine,
  Waves,
  Activity as VibrationIcon
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/CoolingTowerFan/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-cooling-tower-fan]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-cooling-tower-fan';
import { FanStatus } from '../../../components/computer-visual-inspection/CoolingTowerFan/three-types';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: 2 + Math.random() * 2,
  icing: Math.random() > 0.7 ? Math.random() * 5 : 0,
  speed: 180 + Math.random() * 20
}));

const CoolingTowerFan: React.FC = () => {
  const [status, setStatus] = useState<FanStatus>({
    rotationSpeed: 195,
    vibrationX: 1.2,
    vibrationY: 0.8,
    vibrationZ: 0.5,
    icingThickness: 0,
    isIcing: false,
    isVibrating: false,
    healthScore: 98
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'vibration' | 'icing'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isIcing = Math.random() > 0.8;
        const isVibrating = isIcing || Math.random() > 0.9;
        const icingThickness = isIcing ? 2 + Math.random() * 4 : 0;
        const vibrationX = isVibrating ? 4 + Math.random() * 3 : 1 + Math.random() * 1;
        const vibrationY = isVibrating ? 3 + Math.random() * 2 : 0.5 + Math.random() * 0.5;
        const vibrationZ = isVibrating ? 2 + Math.random() * 2 : 0.3 + Math.random() * 0.3;
        const healthScore = 100 - (icingThickness * 5) - (vibrationX * 2);

        return {
          ...prev,
          rotationSpeed: 190 + Math.random() * 15,
          vibrationX,
          vibrationY,
          vibrationZ,
          icingThickness,
          isIcing,
          isVibrating,
          healthScore: Math.max(0, Math.min(100, healthScore))
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const vibrationData = [
    { subject: 'X-Axis', A: status.vibrationX, fullMark: 10 },
    { subject: 'Y-Axis', A: status.vibrationY, fullMark: 10 },
    { subject: 'Z-Axis', A: status.vibrationZ, fullMark: 10 },
    { subject: 'Peak', A: Math.max(status.vibrationX, status.vibrationY, status.vibrationZ), fullMark: 10 },
    { subject: 'Avg', A: (status.vibrationX + status.vibrationY + status.vibrationZ) / 3, fullMark: 10 },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-blue-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Wind className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              冷却塔风机叶片结冰与振动视觉监测系统
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Cooling Tower Fan Blade Icing & Vibration Visual Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">设备健康度</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.healthScore < 80 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.healthScore < 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.healthScore.toFixed(0)}% {status.healthScore < 80 ? '需要维护' : '运行正常'}
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
                    <span className="text-sm text-slate-400">转速</span>
                    <span className="text-lg font-mono text-white">{status.rotationSpeed.toFixed(0)} <span className="text-xs text-slate-500">RPM</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">结冰厚度</span>
                    <span className="text-lg font-mono text-white">{status.icingThickness.toFixed(1)} <span className="text-xs text-slate-500">mm</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'vibration', 'icing'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'vibration' ? '振动分析' : '结冰监测'}
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
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">视觉识别状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Snowflake className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">结冰预警</div>
                    <div className="text-xl font-bold text-white">{status.isIcing ? 'DETECTED' : 'CLEAR'}</div>
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
                  <VibrationIcon className="w-5 h-5 text-blue-400" />
                  振动幅值趋势 (mm/s)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="vibration" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-purple-400" />
                  结冰厚度记录 (mm)
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
                    <Line type="monotone" dataKey="icing" stroke="#a855f7" strokeWidth={2} dot={false} />
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
                { label: '风机转速', value: status.rotationSpeed.toFixed(0), unit: 'RPM', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '结冰厚度', value: status.icingThickness.toFixed(1), unit: 'mm', icon: Snowflake, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: '振动幅值 (X)', value: status.vibrationX.toFixed(2), unit: 'mm/s', icon: VibrationIcon, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '健康评分', value: status.healthScore.toFixed(0), unit: 'pts', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <h3 className="text-lg font-bold">智能故障诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vibrationData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name="Vibration"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  诊断状态: {status.isIcing ? '严重结冰' : status.isVibrating ? '异常振动' : '运行平稳'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isIcing 
                    ? '视觉识别显示叶片前缘存在明显结冰层，厚度超过3mm。结冰导致叶片动平衡失效，引起剧烈振动。' 
                    : status.isVibrating 
                    ? '检测到非对称性振动，疑似叶片紧固件松动或轴承磨损。' 
                    : '各项指标正常，叶片表面洁净，振动频谱符合基准要求。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.isIcing ? '启动叶片除冰加热系统' : '检查风机轴承润滑状态'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.isIcing ? '降低转速运行以减小离心力' : '定期进行动平衡校验'}</span>
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
                {status.isIcing || status.isVibrating ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isIcing ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">叶片严重结冰预警</span>
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

export default CoolingTowerFan;
