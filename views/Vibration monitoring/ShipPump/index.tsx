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
  Gauge,
  Droplets,
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
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
import { ThreeScene } from '../../../components/Vibration monitoring/ShipPump/ThreeScene';
import { PumpState } from '../../../components/Vibration monitoring/ShipPump/three-types';

const ShipPumpView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [state, setState] = useState<PumpState>({
    rpm: 1450,
    vibrationIntensity: 0.08,
    flowRate: 120,
    dischargePressure: 0.45,
    bearingTemp: 45
  });

  // Generate mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString().slice(-8),
        vibration: (0.06 + Math.random() * 0.04).toFixed(3),
        rpm: (1440 + Math.random() * 20).toFixed(0),
        flow: (115 + Math.random() * 10).toFixed(1),
        pressure: (0.42 + Math.random() * 0.06).toFixed(2),
        temp: (42 + Math.random() * 6).toFixed(1),
      };
      setVibrationData(prev => [...prev.slice(-19), newData]);
      setState({
        rpm: parseInt(newData.rpm),
        vibrationIntensity: parseFloat(newData.vibration),
        flowRate: parseFloat(newData.flow),
        dischargePressure: parseFloat(newData.pressure),
        bearingTemp: parseFloat(newData.temp)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '泵组转速', value: state.rpm.toFixed(0), unit: 'RPM', icon: RotateCw, color: 'text-emerald-400' },
    { label: '轴承振动', value: state.vibrationIntensity.toFixed(3), unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
    { label: '实时流量', value: state.flowRate.toFixed(1), unit: 'm³/h', icon: Waves, color: 'text-blue-400' },
    { label: '出口压力', value: state.dischargePressure.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-emerald-900/50 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <Droplets className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              船舶泵组 <span className="text-emerald-500">运行状态监测</span>
            </h1>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              <span className="flex items-center gap-1"><Globe size={12} className="text-emerald-600" /> 船名: 远洋号 (OCEAN-01)</span>
              <span className="flex items-center gap-1"><Cpu size={12} className="text-cyan-600" /> 设备 ID: PUMP-SET-03</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">轴承温度</div>
            <div className="text-3xl font-black font-mono text-white flex items-baseline gap-2">
              {state.bearingTemp.toFixed(1)}
              <span className="text-sm font-normal text-slate-500 uppercase tracking-normal">°C</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/5">
             <button className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black tracking-widest rounded bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <RefreshCw size={14} className="animate-spin-slow" />
                自动巡检中
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 p-6 overflow-hidden relative">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel: Metrics */}
          <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-emerald-500/30 transition-all group relative overflow-hidden"
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
                    animate={{ width: '80%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
            
            <SciFiCard title="汽蚀风险评估" className="mt-2">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">风险等级</span>
                  <span className="text-emerald-400">极低 (2%)</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full border border-white/5 relative overflow-hidden">
                   <motion.div 
                     className="absolute top-0 bottom-0 left-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                     animate={{ width: '2%' }}
                   />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">NPSH 余量</span>
                  <span className="text-slate-500">4.5 m</span>
                </div>
              </div>
            </SciFiCard>
          </aside>

          {/* Central 3D Viewport */}
          <section className="flex-1 relative rounded-[40px] bg-slate-900/20 border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            <ThreeScene state={state} />
            
            {/* Viewport Overlays */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">
                    <div className="text-emerald-400">泵组数字孪生同步</div>
                    <div className="text-slate-500">MODEL: PUMP-V3-PRO</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none">
              <div className="p-6 bg-slate-950/80 border border-white/10 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">流体动力学模拟</div>
                <div className="flex gap-2 items-end h-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`w-2 rounded-full ${i % 4 === 0 ? 'bg-emerald-500/60' : 'bg-cyan-500/30'}`}
                      animate={{ height: [10, 30, 20, 40][i % 4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-emerald-500/20 rounded-tl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-emerald-500/20 rounded-br-[40px] pointer-events-none" />
          </section>

          {/* Right Panel: Analytics */}
          <aside className="w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pl-2">
            <SciFiCard title="泵组振动趋势">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <defs>
                      <linearGradient id="pumpVibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 0.2]} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="vibration" stroke="#10b981" strokeWidth={2} fill="url(#pumpVibGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard title="智能运维决策" className="flex-1">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">健康评分: 96</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    泵组运行状态极佳。联轴器对中良好，轴承振动值远低于预警阈值。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">能效评估</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    当前处于高效率运行区间。建议维持当前工况以优化船舶能耗。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">系统日志</div>
                  <div className="space-y-2">
                    {[
                      { time: '11:20', msg: '出口阀门开度自动调节', type: 'info' },
                      { time: '10:55', msg: '轴承润滑系统压力正常', type: 'success' },
                      { time: '09:30', msg: '泵组启动自检通过', type: 'success' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SciFiCard>
          </aside>
        </div>

        {/* Bottom Control Panel */}
        <footer className="h-20 bg-slate-900/40 border border-white/5 rounded-[25px] flex items-center px-10 gap-12">
          <div className="flex items-center gap-6">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">泵组控制</div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Settings size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 flex justify-around">
            {[
              { label: '吸入压力', val: '0.05', unit: 'MPa' },
              { label: '电机功率', val: '45.8', unit: 'kW' },
              { label: '绝缘电阻', val: '500', unit: 'MΩ' },
              { label: '密封泄漏', val: '0.0', unit: 'ml/h' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{item.label}</div>
                <div className="text-xl font-black font-mono text-white">{item.val} <span className="text-xs font-normal opacity-30">{item.unit}</span></div>
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">数据状态</div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Real-time Sync</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ShipPumpView;
