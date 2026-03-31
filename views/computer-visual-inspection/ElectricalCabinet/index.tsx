import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Gauge, 
  Settings, 
  Activity, 
  ShieldCheck,
  Cpu,
  RefreshCcw,
  History,
  Wind,
  Box
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/ElectricalCabinet/ThreeScene';
import { CabinetStatus } from '../../../components/computer-visual-inspection/ElectricalCabinet/three-types';
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
  temp: 35 + Math.random() * 10 + (i > 15 ? 15 : 0),
  voltage: 380 + Math.random() * 10,
  current: 120 + Math.random() * 20
}));

const ElectricalCabinetView: React.FC = () => {
  const [status, setStatus] = useState<CabinetStatus>({
    temperature: 38.5,
    isOverheating: false,
    looseBolts: 0,
    discoloredComponents: 0,
    voltage: 382.4,
    current: 125.6,
    humidity: 42
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'thermal' | 'electrical'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isHot = Math.random() > 0.9;
        return {
          ...prev,
          temperature: 35 + Math.random() * 15 + (isHot ? 20 : 0),
          isOverheating: isHot || prev.temperature > 50,
          voltage: 380 + Math.random() * 5,
          current: 120 + Math.random() * 10,
          humidity: 40 + Math.random() * 5
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              配电柜元器件变色与松动监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Electrical Cabinet Component Status Visual Inspection System v2.5
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">运行状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isOverheating ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.isOverheating ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.isOverheating ? '高温预警' : '运行正常'}
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">3D 数字孪生视图</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前电压</span>
                    <span className="text-lg font-mono text-white">{status.voltage.toFixed(1)} <span className="text-xs text-slate-500">V</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">总电流</span>
                    <span className="text-lg font-mono text-white">{status.current.toFixed(1)} <span className="text-xs text-slate-500">A</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'thermal', 'electrical'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'thermal' ? '热成像分析' : '电参数分析'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Box className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">设备编号</div>
                    <div className="text-xl font-bold text-white">EC-08-A1</div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Cpu className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">AI 识别精度</div>
                    <div className="text-xl font-bold text-white">98.5%</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">系统自检周期</div>
                <div className="text-sm font-mono text-slate-400">15s / 次</div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  关键节点温升趋势 (°C)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-orange-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fb923c' }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#fb923c" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  负荷电流波动 (A)
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
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line type="monotone" dataKey="current" stroke="#60a5fa" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-cyan-500/50 uppercase tracking-widest mb-6">实时环境与电参数</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '最高节点温度', value: status.temperature.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '系统电压', value: status.voltage.toFixed(1), unit: 'V', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '柜内湿度', value: status.humidity.toFixed(1), unit: '%', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '松动螺栓检测', value: status.looseBolts, unit: '个', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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
                  <div className="h-8 w-16 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockHistoryData.slice(-5)}>
                        <Bar dataKey="temp" fill={item.color.includes('orange') ? '#fb923c' : item.color.includes('blue') ? '#60a5fa' : '#22d3ee'} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">AI 智能诊断报告</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${status.isOverheating ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isOverheating ? 'text-red-400' : 'text-emerald-400'}`}>
                  {status.isOverheating ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  设备健康度: {status.isOverheating ? '65%' : '98%'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isOverheating 
                    ? '检测到 5 号断路器接线端子存在异常温升，颜色已发生明显改变。建议立即停电检查紧固情况。' 
                    : '配电柜整体运行参数正常。元器件未发现变色或松动迹象，环境湿度处于理想范围。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>每季度进行一次红外热成像复核</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>检查柜门密封条，防止灰尘进入</span>
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
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">NEW EVENT</span>
            </div>
            
            <div className="space-y-3">
              {[
                { time: '02:15:22', msg: '5号节点温度突破 55°C 阈值', level: 'error' },
                { time: '昨日 22:10', msg: 'B相电压瞬时波动 > 5%', level: 'warning' },
                { time: '昨日 15:45', msg: '环境湿度超过 50% 预警线', level: 'info' },
              ].map((alert, idx) => (
                <div key={idx} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 pt-1">{alert.time}</div>
                  <div className="flex-1">
                    <div className={`text-xs font-medium ${alert.level === 'error' ? 'text-red-400' : alert.level === 'warning' ? 'text-orange-400' : 'text-slate-300'}`}>
                      {alert.msg}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default ElectricalCabinetView;
