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
  Cpu,
  Database,
  Globe,
  Anchor,
  Gauge,
  Waves
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
  Area,
  BarChart,
  Bar
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ShipMainEngine/ThreeScene';
import { MainEngineState } from '@/components/vibration-monitoring/ShipMainEngine/three-types';

const ShipMainEngineView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('realtime');
  const [state, setState] = useState<MainEngineState>({
    rpm: 120,
    vibrationIntensity: 0.15,
    torque: 450,
    temperature: 78,
    cylinderPressure: [8.2, 8.1, 8.3, 8.0, 8.2, 8.1]
  });

  // Generate mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString().slice(-8),
        vibration: (0.12 + Math.random() * 0.08).toFixed(3),
        rpm: (118 + Math.random() * 4).toFixed(1),
        torque: (445 + Math.random() * 10).toFixed(1),
        temp: (76 + Math.random() * 4).toFixed(1),
      };
      setVibrationData(prev => [...prev.slice(-19), newData]);
      setState(prev => ({
        ...prev,
        rpm: parseFloat(newData.rpm),
        vibrationIntensity: parseFloat(newData.vibration),
        torque: parseFloat(newData.torque),
        temperature: parseFloat(newData.temp),
        cylinderPressure: prev.cylinderPressure.map(p => p + (Math.random() - 0.5) * 0.1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '主轴转速', value: state.rpm.toFixed(1), unit: 'RPM', icon: RotateCw, color: 'text-cyan-400' },
    { label: '扭振烈度', value: state.vibrationIntensity.toFixed(3), unit: 'mm/s', icon: Activity, color: 'text-amber-400' },
    { label: '输出扭矩', value: state.torque.toFixed(1), unit: 'kN·m', icon: Zap, color: 'text-emerald-400' },
    { label: '排气温度', value: state.temperature.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-blue-400' },
  ];

  const cylinderData = state.cylinderPressure.map((p, i) => ({
    name: `Cyl ${i + 1}`,
    pressure: p.toFixed(2)
  }));

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-cyan-900/50 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Anchor className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              船舶主主机 <span className="text-cyan-500">轴系扭振监测系统</span>
            </h1>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              <span className="flex items-center gap-1"><Globe size={12} className="text-cyan-600" /> 船号: MS-VANGUARD-07</span>
              <span className="flex items-center gap-1"><Waves size={12} className="text-blue-600" /> 海况: 良好 (Level 2)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/5">
            {['REALTIME', 'TORSIONAL', 'DIAGNOSTIC'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t.toLowerCase())}
                className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded transition-all ${
                  activeTab === t.toLowerCase() 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex items-center gap-4">
             <div className="text-right">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">系统完整性</div>
               <div className="text-xs font-bold text-emerald-400">SECURE / ENCRYPTED</div>
             </div>
             <Settings className="w-6 h-6 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.05),_transparent_70%)] pointer-events-none" />

        {/* Left Panel: Metrics & AI */}
        <aside className="w-80 flex flex-col gap-6 z-10">
          <div className="grid grid-cols-1 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-cyan-500/30 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-800/50 ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black font-mono tracking-tight ${m.color}`}>{m.value}</span>
                  <span className="text-xs text-slate-600 font-bold uppercase">{m.unit}</span>
                </div>
                <div className="mt-4 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${m.color.replace('text', 'bg')}`}
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <SciFiCard title="智能健康评估" className="flex-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">健康评分</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">98.5</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">运行状态: 极佳</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  轴系扭转振动处于安全包络线内。曲轴平衡度良好，未检测到异常谐波分量。
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">轴承剩余寿命预测</span>
                  <span className="text-cyan-400">12,450 小时</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>
              </div>
            </div>
          </SciFiCard>
        </aside>

        {/* Center Panel: 3D Scene & Charts */}
        <section className="flex-1 flex flex-col gap-6 z-10">
          <div className="flex-1 relative rounded-[40px] bg-slate-900/20 border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            <ThreeScene state={state} />
            
            {/* Viewport Overlays */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">
                    <div className="text-cyan-400">实时数字孪生同步</div>
                    <div className="text-slate-500">ENGINE ID: ME-01-X</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">燃油消耗: 185g/kWh</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none">
              <div className="p-6 bg-slate-950/80 border border-white/10 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">曲轴转角相位分析</div>
                <div className="flex gap-4 items-end h-12">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-1 bg-cyan-500/40 rounded-full"
                      animate={{ height: [10, 30, 15, 45, 20][i % 5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[40px] pointer-events-none" />
          </div>

          {/* Bottom Chart Area */}
          <div className="h-72 flex gap-6">
            <SciFiCard title="实时扭振波形" className="flex-1">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 0.3]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard title="各缸爆发压力 (Pmax)" className="w-[400px]">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cylinderData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                      cursor={{ fill: '#ffffff05' }}
                    />
                    <Bar dataKey="pressure" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </section>

        {/* Right Panel: Analysis & Logs */}
        <aside className="w-80 flex flex-col gap-6 z-10">
          <SciFiCard title="频谱阶次分析">
            <div className="space-y-4">
              <div className="h-32 flex items-end justify-between px-2">
                {[0.2, 0.8, 0.4, 0.1, 0.3, 0.9, 0.2, 0.1].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-4 bg-blue-500/20 rounded-t-sm relative overflow-hidden" style={{ height: `${h * 100}%` }}>
                      <motion.div 
                        className="absolute bottom-0 left-0 w-full bg-blue-500"
                        animate={{ height: ['80%', '100%', '90%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <span className="text-[8px] text-slate-600 font-bold">{i + 1}X</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase">主要阶次</span>
                  <span className="text-blue-400 font-bold">6.0X (Firing)</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase">能量占比</span>
                  <span className="text-slate-300 font-bold">72.4%</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="系统运行日志" className="flex-1">
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {[
                { time: '01:42:15', type: 'INFO', msg: '主轴转速同步完成' },
                { time: '01:41:50', type: 'SUCCESS', msg: '涡轮增压器压力稳定' },
                { time: '01:40:22', type: 'WARN', msg: '3号缸爆发压力轻微波动' },
                { time: '01:38:10', type: 'INFO', msg: '燃油共轨压力自适应调整' },
                { time: '01:35:00', type: 'INFO', msg: '系统自检程序启动' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] leading-tight group">
                  <span className="text-slate-600 font-mono group-hover:text-cyan-500 transition-colors">{log.time}</span>
                  <span className={`font-black ${
                    log.type === 'SUCCESS' ? 'text-emerald-500' : 
                    log.type === 'WARN' ? 'text-amber-500' : 'text-blue-500'
                  }`}>[{log.type}]</span>
                  <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.msg}</span>
                </div>
              ))}
            </div>
          </SciFiCard>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">边缘处理单元</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold space-y-1">
              <div>CPU: 18.2% | MEM: 1.2GB/8GB</div>
              <div>TEMP: 42.5°C | UPTIME: 842H</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 bg-slate-950 border-t border-white/5 flex items-center justify-between px-8 text-[10px] font-black tracking-[0.2em] text-slate-600">
        <div className="flex gap-10">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            DATA STREAM: <span className="text-emerald-500">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ALERTS: <span className="text-slate-500">0</span>
          </div>
        </div>
        <div className="flex gap-10">
          <span className="flex items-center gap-2"><Globe size={12} /> REGION: ASIA-PACIFIC</span>
          <span>© 2026 VANGUARD MARINE SYSTEMS</span>
        </div>
      </footer>
    </div>
  );
};

export default ShipMainEngineView;
