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
  Anchor,
  Link as LinkIcon,
  Play,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  Weight
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
import { ThreeScene } from '../../../components/vibration-monitoring/PortWinch/ThreeScene';
import { WindlassState } from '../../../components/vibration-monitoring/PortWinch/three-types';

const WindlassView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [operationMode, setOperationMode] = useState<'ANCHOR_UP' | 'ANCHOR_DOWN' | 'STOP'>('ANCHOR_UP');
  const [state, setState] = useState<WindlassState>({
    chainSpeed: 0.5,
    vibrationIntensity: 0.15,
    motorTorque: 45,
    tension: 120,
    brakeTemp: 42,
    isOperating: true,
    operationMode: 'ANCHOR_UP'
  });

  // Generate mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      if (operationMode === 'STOP') {
        setState(prev => ({ ...prev, isOperating: false, operationMode: 'STOP', chainSpeed: 0, vibrationIntensity: 0.01 }));
        return;
      }
      
      const newData = {
        time: new Date().toLocaleTimeString().slice(-8),
        vibration: (0.12 + Math.random() * 0.08).toFixed(3),
        speed: (0.45 + Math.random() * 0.1).toFixed(2),
        torque: (42 + Math.random() * 8).toFixed(1),
        tension: (115 + Math.random() * 15).toFixed(1),
        temp: (40 + Math.random() * 5).toFixed(1),
      };
      setVibrationData(prev => [...prev.slice(-19), newData]);
      setState({
        chainSpeed: parseFloat(newData.speed),
        vibrationIntensity: parseFloat(newData.vibration),
        motorTorque: parseFloat(newData.torque),
        tension: parseFloat(newData.tension),
        brakeTemp: parseFloat(newData.temp),
        isOperating: true,
        operationMode: operationMode
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [operationMode]);

  const metrics = [
    { label: '起锚速度', value: operationMode !== 'STOP' ? state.chainSpeed.toFixed(2) : '0.00', unit: 'm/s', icon: RotateCw, color: 'text-amber-400' },
    { label: '基座振动', value: operationMode !== 'STOP' ? state.vibrationIntensity.toFixed(3) : '0.000', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
    { label: '电机扭矩', value: operationMode !== 'STOP' ? state.motorTorque.toFixed(1) : '0.0', unit: 'kN·m', icon: Zap, color: 'text-emerald-400' },
    { label: '锚链张力', value: operationMode !== 'STOP' ? state.tension.toFixed(1) : '0.0', unit: 'kN', icon: LinkIcon, color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-amber-900/50 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <Anchor className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              锚机启闭过程 <span className="text-amber-500">振动安全监测</span>
            </h1>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              <span className="flex items-center gap-1"><Globe size={12} className="text-amber-600" /> 区域: 前甲板 A-01</span>
              <span className="flex items-center gap-1"><Cpu size={12} className="text-orange-600" /> 状态: {operationMode === 'STOP' ? 'STANDBY' : 'OPERATING'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">刹车毂温度</div>
            <div className="text-3xl font-black font-mono text-white flex items-baseline gap-2">
              {state.brakeTemp.toFixed(1)}
              <span className="text-sm font-normal text-slate-500 uppercase tracking-normal">°C</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setOperationMode(operationMode === 'STOP' ? 'ANCHOR_UP' : 'STOP')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black tracking-widest rounded transition-all ${
                operationMode !== 'STOP' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {operationMode !== 'STOP' ? <Square size={14} /> : <Play size={14} />}
              {operationMode !== 'STOP' ? '紧急停止' : '开始作业'}
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
                className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-amber-500/30 transition-all group relative overflow-hidden"
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
                    animate={{ width: operationMode !== 'STOP' ? '65%' : '0%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
            
            <SciFiCard title="锚链长度监测" className="mt-2">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">已放出长度</span>
                  <span className="text-amber-400">45.8 m</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full border border-white/5 relative overflow-hidden">
                   <motion.div 
                     className="absolute top-0 bottom-0 left-0 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                     animate={{ width: '45%' }}
                   />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">剩余长度</span>
                  <span className="text-slate-500">154.2 m</span>
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
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">
                    <div className="text-amber-400">锚机数字孪生同步</div>
                    <div className="text-slate-500">TWIN-ID: WIND-01-A</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none">
              <div className="p-6 bg-slate-950/80 border border-white/10 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">电机负载特性</div>
                <div className="flex gap-2 items-end h-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`w-2 rounded-full ${i % 4 === 0 ? 'bg-amber-500/60' : 'bg-emerald-500/30'}`}
                      animate={{ height: operationMode !== 'STOP' ? [15, 35, 25, 45][i % 4] : 5 }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-500/20 rounded-tl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-500/20 rounded-br-[40px] pointer-events-none" />
          </section>

          {/* Right Panel: Analytics */}
          <aside className="w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pl-2">
            <SciFiCard title="起锚过程张力分析">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <defs>
                      <linearGradient id="tensionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[100, 150]} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="tension" stroke="#f59e0b" strokeWidth={2} fill="url(#tensionGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard title="智能安全诊断" className="flex-1">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">作业状态: 安全</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    锚机运行平稳，振动频率处于低频安全区间。锚链张力波动正常，未发现卡顿或跳链预兆。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">预警提示</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    刹车毂温度略有上升趋势，建议在连续作业超过 30 分钟后进行强制冷却。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">作业日志</div>
                  <div className="space-y-2">
                    {[
                      { time: '10:45', msg: '锚链放出至 45m 标记', type: 'info' },
                      { time: '10:40', msg: '电机启动，初始扭矩正常', type: 'success' },
                      { time: '10:35', msg: '刹车系统自检通过', type: 'success' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={log.type === 'success' ? 'text-emerald-500' : 'text-slate-400'}>{log.msg}</span>
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
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">作业模式</div>
            <div className="flex gap-3">
              <button 
                onClick={() => setOperationMode('ANCHOR_UP')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 transition-all ${
                  operationMode === 'ANCHOR_UP' 
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <ArrowUpRight size={14} /> 起锚
              </button>
              <button 
                onClick={() => setOperationMode('ANCHOR_DOWN')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 transition-all ${
                  operationMode === 'ANCHOR_DOWN' 
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <ArrowDownRight size={14} /> 抛锚
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 flex justify-around">
            {[
              { label: '电机电流', val: operationMode !== 'STOP' ? '156' : '0', unit: 'A' },
              { label: '液压压力', val: operationMode !== 'STOP' ? '18.5' : '0.0', unit: 'MPa' },
              { label: '齿轮箱温', val: '48.2', unit: '°C' },
              { label: '累计工时', val: '1240', unit: 'H' },
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
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">系统状态</div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Operational</div>
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

export default WindlassView;
