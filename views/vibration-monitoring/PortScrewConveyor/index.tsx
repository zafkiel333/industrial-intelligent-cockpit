import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortScrewConveyor/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrewConveyorState } from '@/components/vibration-monitoring/PortScrewConveyor/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 0.12 + Math.sin(i * 0.5) * 0.03 + Math.random() * 0.02,
  speed: 58 + Math.random() * 4,
  torque: 14.5 + Math.random() * 1.0,
}));

const PortScrewConveyorView: React.FC = () => {
  const [state, setState] = useState<ScrewConveyorState>({
    screwSpeed: 60,
    vibrationIntensity: 0.13,
    motorTemp: 41,
    materialFlow: 125,
    torque: 15.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        screwSpeed: 40 + Math.random() * 40,
        vibrationIntensity: 0.1 + Math.random() * 0.1,
        motorTemp: 35 + Math.random() * 15,
        materialFlow: 80 + Math.random() * 80,
        torque: 10 + Math.random() * 10,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header Area */}
      <header className="relative z-20 flex items-center justify-between px-10 py-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <RotateCcw className="text-white" size={32} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">港口螺旋机 <span className="text-cyan-500">震动监测系统</span></h1>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">SC-9000 Series</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><Activity size={14} className="text-cyan-500" /> 状态: 运行中</span>
              <span className="flex items-center gap-2"><Wind size={14} className="text-blue-500" /> 输送效率: 94.2%</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> 安全等级: A+</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">当前物料流量</div>
            <div className="text-4xl font-black font-mono text-white flex items-baseline gap-2">
              {state.materialFlow.toFixed(0)}
              <span className="text-sm font-normal text-slate-500 uppercase tracking-normal">t/h</span>
            </div>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-cyan-500" animate={{ width: '75%' }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">负载率 75%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-emerald-500" animate={{ width: '92%' }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">健康度 92%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden p-6 gap-6 relative z-10">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel: Detailed Metrics */}
          <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            {[
              { label: '螺旋转速', val: state.screwSpeed.toFixed(1), unit: 'RPM', icon: RotateCw, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
              { label: '输出扭矩', val: state.torque.toFixed(1), unit: 'kN·m', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
              { label: '电机温度', val: state.motorTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/5' },
              { label: '振动烈度', val: (state.vibrationIntensity * 10).toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/5' },
            ].map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-3xl border border-white/5 ${metric.bg} backdrop-blur-sm group hover:border-white/20 transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${metric.bg.replace('/5', '/20')} flex items-center justify-center`}>
                    <metric.icon size={20} className={metric.color} />
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black font-mono text-white">{metric.val}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase">{metric.unit}</div>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${metric.color.replace('text', 'bg')}`} 
                    animate={{ width: `${(parseFloat(metric.val) / (i === 0 ? 100 : i === 1 ? 30 : i === 2 ? 100 : 5)) * 100}%` }} 
                  />
                </div>
              </motion.div>
            ))}
          </aside>

          {/* Central 3D Viewport */}
          <section className="flex-1 relative bg-slate-900/20 border border-white/5 rounded-[40px] overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <ThreeScene state={state} />
            </div>

            {/* Viewport Overlays */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">实时数字孪生同步中</span>
                </div>
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">渲染精度: </span>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Ultra High</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none">
              <div className="p-6 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">轴承位移分析</div>
                <div className="flex gap-4 items-end h-16">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-1.5 bg-cyan-500/40 rounded-full"
                      animate={{ height: [10, 40, 20, 60, 30][i % 5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[40px] pointer-events-none" />
          </section>

          {/* Right Panel: Analytics */}
          <aside className="w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pl-2">
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                  <span className="text-xs font-black uppercase tracking-widest">振动频谱趋势</span>
                </div>
                <Activity size={16} className="text-cyan-500" />
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 0.3]} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex-1">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span className="text-xs font-black uppercase tracking-widest">智能诊断报告</span>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">运行状态评估</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    螺旋轴同轴度良好，未发现明显的叶片磨损或物料堆积导致的偏心振动。
                  </p>
                </div>
                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">维护预测</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    预计 240 小时后需进行轴承润滑维护。当前物料填充率处于最优区间。
                  </p>
                </div>
                <div className="p-5 bg-slate-800/20 border border-white/5 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">最近异常记录</div>
                  <div className="space-y-2">
                    {[
                      { time: '03-29 14:20', msg: '瞬时扭矩波动', type: 'warn' },
                      { time: '03-28 09:15', msg: '启动振动峰值', type: 'info' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={log.type === 'warn' ? 'text-yellow-500' : 'text-blue-500'}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Control Panel */}
        <footer className="h-24 bg-slate-900/40 border border-white/5 rounded-[30px] flex items-center px-10 gap-12">
          <div className="flex items-center gap-6">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">系统控制</div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Settings size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <RotateCw size={18} />
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 flex justify-around">
            {[
              { label: '轴承 A 振动', val: '0.04', unit: 'mm' },
              { label: '轴承 B 振动', val: '0.06', unit: 'mm' },
              { label: '中间轴承 C', val: '0.05', unit: 'mm' },
              { label: '尾部轴承 D', val: '0.03', unit: 'mm' },
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
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">数据同步状态</div>
              <div className="text-xs font-bold text-emerald-500 uppercase">Connected / Real-time</div>
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

export default PortScrewConveyorView;
