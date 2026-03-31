import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  RotateCw, 
  Settings, 
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Globe
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PortUnloader/ThreeScene';
import { UnloaderState } from '@/components/vibration-monitoring/PortUnloader/three-types';

const PortUnloaderView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState('NORMAL');
  const [activeTab, setActiveTab] = useState('realtime');
  const [state, setState] = useState<UnloaderState>({
    vibrationIntensity: 1.2,
    temperature: 45.5,
    load: 75,
    speed: 1450
  });

  // Generate mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString().slice(-8),
        vibration: (Math.random() * 2 + 1).toFixed(2),
        temperature: (Math.random() * 5 + 45).toFixed(1),
        load: (Math.random() * 20 + 70).toFixed(1),
      };
      setVibrationData(prev => [...prev.slice(-19), newData]);
      setState({
        vibrationIntensity: parseFloat(newData.vibration),
        temperature: parseFloat(newData.temperature),
        load: parseFloat(newData.load),
        speed: 1450 + Math.random() * 10
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '震动幅值', value: vibrationData[vibrationData.length - 1]?.vibration || '0.00', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
    { label: '电机温度', value: vibrationData[vibrationData.length - 1]?.temperature || '0.0', unit: '°C', icon: Thermometer, color: 'text-amber-400' },
    { label: '当前负载', value: vibrationData[vibrationData.length - 1]?.load || '0.0', unit: '%', icon: Zap, color: 'text-emerald-400' },
    { label: '运行转速', value: '1450', unit: 'RPM', icon: RotateCw, color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Header Section */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/50 bg-slate-900/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              卸船机抓斗卷扬机智能监测系统
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              系统在线 | 实时同步率: 99.9% | 节点: HK-PORT-01
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {['REALTIME', 'SPECTRUM', 'DIAGNOSTIC'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t.toLowerCase())}
                className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded transition-all ${
                  activeTab === t.toLowerCase() 
                  ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
            <div className="px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              SAFE MODE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Left Panel: Metrics & Status */}
        <aside className="w-80 flex flex-col gap-4 z-10">
          <div className="grid grid-cols-1 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:border-cyan-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <m.icon className="w-12 h-12" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-slate-800 ${m.color}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold tracking-tight ${m.color}`}>{m.value}</span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">{m.unit}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full bg-current ${m.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <SciFiCard title="AI 故障预测" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>预测置信度</span>
                <span className="text-cyan-400">94.2%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">运行健康</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  基于深度学习模型的实时分析，当前卷扬机震动特征符合健康基准。预计未来 72 小时内发生故障的概率低于 2.5%。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">轴承磨损指数</span>
                  <span className="text-slate-300">12/100</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[12%] bg-cyan-500" />
                </div>
              </div>
            </div>
          </SciFiCard>
        </aside>

        {/* Center Panel: 3D Scene */}
        <section className="flex-1 flex flex-col gap-4 z-10">
          <div className="flex-1 relative rounded-2xl bg-slate-900/20 border border-slate-800 overflow-hidden shadow-2xl">
            <ThreeScene state={state} />
            
            {/* Overlay UI Elements */}
            <div className="absolute top-6 left-6 pointer-events-none">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <div className="text-[10px] font-bold tracking-widest uppercase">
                  <div className="text-cyan-400">3D 数字孪生同步中</div>
                  <div className="text-slate-500">LATENCY: 12ms</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 pointer-events-none text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">坐标参考系</div>
              <div className="flex gap-4 text-[10px] font-mono text-cyan-400/70">
                <span>X: 124.55</span>
                <span>Y: -12.33</span>
                <span>Z: 45.01</span>
              </div>
            </div>

            {/* Tech Borders */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-2xl pointer-events-none" />
          </div>

          {/* Bottom Chart Area */}
          <div className="h-64 flex gap-4">
            <SciFiCard title="实时震动波形" className="flex-1">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard title="负载趋势" className="w-80">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vibrationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="stepAfter" dataKey="load" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </section>

        {/* Right Panel: Analysis & Logs */}
        <aside className="w-80 flex flex-col gap-4 z-10">
          <SciFiCard title="频谱分析 (FFT)">
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart3 className="w-full h-full text-slate-800 opacity-20" />
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2">
                  频谱数据计算中...
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">主频 (F1)</span>
                <span className="text-cyan-400">24.5 Hz</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">谐波 (F2)</span>
                <span className="text-slate-400">49.0 Hz</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">能量集中度</span>
                <span className="text-emerald-400">88.5%</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="系统事件日志" className="flex-1">
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {[
                { time: '10:42:15', type: 'INFO', msg: '抓斗下降操作启动' },
                { time: '10:42:08', type: 'SUCCESS', msg: '卷扬机电机自检通过' },
                { time: '10:41:55', type: 'INFO', msg: '物料卸载完成，重量: 24.5t' },
                { time: '10:41:30', type: 'WARN', msg: '震动幅值轻微波动 (2.1mm/s)' },
                { time: '10:40:12', type: 'INFO', msg: '系统初始化完成' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] leading-tight">
                  <span className="text-slate-600 font-mono">{log.time}</span>
                  <span className={`font-bold ${
                    log.type === 'SUCCESS' ? 'text-emerald-500' : 
                    log.type === 'WARN' ? 'text-amber-500' : 'text-blue-500'
                  }`}>[{log.type}]</span>
                  <span className="text-slate-400">{log.msg}</span>
                </div>
              ))}
            </div>
          </SciFiCard>

          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400">边缘计算单元</span>
            </div>
            <div className="text-[10px] text-slate-500">
              CPU LOAD: 12.5% | MEM: 256MB/2GB
              <br />
              TEMP: 38.2°C | UPTIME: 142h
            </div>
          </div>
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-slate-950 border-t border-slate-900 flex items-center justify-between px-6 text-[10px] font-bold tracking-widest text-slate-600">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            DATA SYNC: <span className="text-emerald-500">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            ALERTS: <span className="text-slate-500">0</span>
          </div>
        </div>
        <div className="flex gap-6">
          <span>ENCRYPTION: AES-256</span>
          <span>PROTOCOL: MQTT v5.0</span>
          <span className="text-slate-500">© 2026 SMART PORT SYSTEMS</span>
        </div>
      </footer>
    </div>
  );
};

export default PortUnloaderView;
