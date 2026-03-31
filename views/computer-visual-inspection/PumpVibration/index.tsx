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
  Activity as VibrationIcon,
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
  Microscope
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/PumpVibration/ThreeScene';
import { PumpVibrationStatus } from '../../../components/computer-visual-inspection/PumpVibration/three-types';
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
  vibration: 2 + Math.random() * 8,
  frequency: 40 + Math.random() * 20,
  motorTemp: 45 + Math.random() * 15
}));

const mockSpectrumData = Array.from({ length: 50 }, (_, i) => ({
  freq: i * 2,
  amp: i === 25 ? 10 + Math.random() * 5 : Math.random() * 2
}));

const PumpVibration: React.FC = () => {
  const [status, setStatus] = useState<PumpVibrationStatus>({
    vibrationAmplitude: 2.5,
    vibrationFrequency: 50.0,
    motorTemp: 52.4,
    bearingTemp: 48.2,
    flowRate: 320,
    pressure: 0.45,
    isAbnormal: false,
    anomalyType: 'none',
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isAbnormal = Math.random() > 0.8;
        const vibrationAmplitude = isAbnormal ? 8.5 + Math.random() * 10 : 1.5 + Math.random() * 2;
        const vibrationFrequency = 45 + Math.random() * 10;
        const motorTemp = 50 + (vibrationAmplitude * 2) + Math.random() * 5;
        const bearingTemp = 45 + (vibrationAmplitude * 1.5) + Math.random() * 5;
        const flowRate = 300 + Math.random() * 50;
        const pressure = 0.4 + Math.random() * 0.1;
        
        const anomalyTypes: PumpVibrationStatus['anomalyType'][] = ['unbalance', 'misalignment', 'looseness', 'bearing_fault'];
        const anomalyType = isAbnormal ? anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)] : 'none';

        return {
          ...prev,
          isAbnormal,
          anomalyType,
          vibrationAmplitude,
          vibrationFrequency,
          motorTemp,
          bearingTemp,
          flowRate,
          pressure,
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
            <Microscope className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              泵组异常振动视觉放大分析系统
            </h1>
            <p className="text-blue-500/60 text-sm font-mono uppercase tracking-widest">
              Pump Vibration Visual Magnification Analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-blue-500/50 uppercase font-mono">设备健康指数</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isAbnormal ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.vibrationAmplitude > 5 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.isAbnormal ? 'text-red-400' : status.vibrationAmplitude > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.isAbnormal ? 'CRITICAL' : status.vibrationAmplitude > 5 ? 'WARNING' : 'HEALTHY'}
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
                <h3 className="text-xs font-mono text-blue-500/70 uppercase mb-3 tracking-wider">实时振动视觉放大</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">振动幅值</span>
                    <span className="text-lg font-mono text-white">{status.vibrationAmplitude.toFixed(2)} <span className="text-xs text-slate-500">mm/s</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">主频频率</span>
                    <span className="text-lg font-mono text-white">{status.vibrationFrequency.toFixed(1)} <span className="text-xs text-slate-500">Hz</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'spectrum', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '视觉放大' : tab === 'spectrum' ? '频谱分析' : '趋势监测'}
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
                    <Radio className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500/50 uppercase font-mono tracking-widest">采样频率</div>
                    <div className="text-xl font-bold text-white">2.4 <span className="text-xs font-normal text-slate-500">kHz</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Thermometer className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">电机温度</div>
                    <div className="text-xl font-bold text-white">{status.motorTemp.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">VIB-MAG ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <VibrationIcon className="w-5 h-5 text-blue-400" />
                  振动频谱分析 (FFT)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockSpectrumData}>
                    <defs>
                      <linearGradient id="colorAmp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="freq" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="amp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  振动幅值历史 (mm/s)
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
                    <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
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
                { label: '振动幅值', value: status.vibrationAmplitude.toFixed(2), unit: 'mm/s', icon: VibrationIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '主频频率', value: status.vibrationFrequency.toFixed(1), unit: 'Hz', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '轴承温度', value: status.bearingTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '出口压力', value: status.pressure.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <h3 className="text-lg font-bold">智能振动诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isAbnormal ? 'bg-red-500/5 border-red-500/20' : status.vibrationAmplitude > 5 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isAbnormal ? 'text-red-400' : status.vibrationAmplitude > 5 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.isAbnormal ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isAbnormal ? `检测到${status.anomalyType === 'unbalance' ? '不平衡' : status.anomalyType === 'misalignment' ? '不对中' : '机械松动'}` : status.vibrationAmplitude > 5 ? '振动幅值偏高' : '运行状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isAbnormal 
                    ? `视觉放大算法检测到泵体存在明显的${status.anomalyType === 'unbalance' ? '质量不平衡' : '轴系不对中'}特征。振动主频集中在 1X 转速频率，且伴随相位偏移。建议检查联轴器及叶轮平衡。` 
                    : status.vibrationAmplitude > 5 
                    ? '振动幅值超出正常阈值，但频谱特征尚不明确。可能存在初期轴承磨损或基础不稳，建议缩短监测周期并进行现场核实。' 
                    : '视觉放大监测未发现异常位移轨迹。振动频谱纯净，各特征频率幅值均在安全范围内，系统运行平稳。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.isAbnormal ? '安排停机进行动平衡校正' : '维持日常视觉放大在线监测'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{status.motorTemp > 60 ? '检查电机冷却风扇及散热片' : '定期备份振动特征指纹库'}</span>
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
                {status.isAbnormal ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isAbnormal ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      泵组异常振动告警
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

export default PumpVibration;
