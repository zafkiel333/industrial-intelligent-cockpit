import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PortFunnel/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelState } from '@/components/vibration-monitoring/PortFunnel/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  vibration: 0.15 + Math.sin(i * 0.5) * 0.04 + Math.random() * 0.02,
  impact: 100 + Math.random() * 50,
  level: 60 + Math.sin(i * 0.1) * 10 + Math.random() * 5,
}));

const PortFunnelView: React.FC = () => {
  const [state, setState] = useState<FunnelState>({
    vibrationIntensity: 0.18,
    materialLevel: 68,
    impactForce: 125,
    gateOpening: 48,
    vibrationFrequency: 32
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        vibrationIntensity: 0.1 + Math.random() * 0.2,
        materialLevel: 40 + Math.random() * 50,
        impactForce: 80 + Math.random() * 100,
        gateOpening: 20 + Math.random() * 60,
        vibrationFrequency: 25 + Math.random() * 15,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden relative">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      {/* Top Navigation / Status Bar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Wind className="text-cyan-400" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase italic">港口漏斗 <span className="text-cyan-500">震动监测</span></h1>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Port Funnel Intelligence System</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">系统在线</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">数据加密传输</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">当前闸门开度</div>
            <div className="text-2xl font-black font-mono text-cyan-400">{state.gateOpening.toFixed(1)}%</div>
          </div>
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 relative z-10">
        {/* Left Sidebar: Detailed Metrics */}
        <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-cyan-500" size={18} />
              <span className="text-xs font-black uppercase tracking-widest">核心监测指标</span>
            </div>
            <div className="space-y-6">
              {[
                { label: '物料仓位', val: state.materialLevel.toFixed(1), unit: '%', color: 'text-cyan-400', icon: Layers },
                { label: '冲击压力', val: state.impactForce.toFixed(0), unit: 'kN', color: 'text-yellow-400', icon: Zap },
                { label: '激振频率', val: state.vibrationFrequency.toFixed(1), unit: 'Hz', color: 'text-blue-400', icon: Activity },
                { label: '振动烈度', val: (state.vibrationIntensity * 10).toFixed(2), unit: 'mm/s', color: 'text-orange-400', icon: Wind },
              ].map((metric, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <metric.icon size={14} className={metric.color} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{metric.label}</span>
                    </div>
                    <div className={`text-lg font-black font-mono ${metric.color}`}>{metric.val} <span className="text-[10px] font-normal opacity-50">{metric.unit}</span></div>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${metric.color.replace('text', 'bg')}`} 
                      animate={{ width: `${(parseFloat(metric.val) / (i === 0 ? 100 : i === 1 ? 200 : i === 2 ? 50 : 5)) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex-1">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-emerald-500" size={18} />
              <span className="text-xs font-black uppercase tracking-widest">智能诊断建议</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">系统自检: 正常</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  漏斗内壁无挂料现象，激振器运行频率稳定，未发现异常共振点。
                </p>
              </div>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2">预警提示</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  当前物料冲击力较大，建议检查底部闸门密封件的磨损情况。
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Central 3D Visualization */}
        <section className="flex-1 relative bg-slate-950/40 border border-white/5 rounded-[40px] overflow-hidden group shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 z-0">
            <ThreeScene state={state} />
          </div>

          {/* Viewport UI */}
          <div className="absolute top-8 left-8 pointer-events-none">
            <div className="flex flex-col gap-3">
              <div className="px-5 py-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Digital Twin Active</span>
              </div>
              <div className="px-5 py-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Sync Rate: 120Hz</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 pointer-events-none flex justify-between items-end">
            <div className="p-6 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl w-72">
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">壁板振动频谱</div>
              <div className="flex gap-2 items-end h-12">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="flex-1 bg-cyan-500/30 rounded-t-sm"
                    animate={{ height: [10, 30, 15, 45, 20][i % 5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">设备坐标系</div>
              <div className="w-24 h-24 relative border border-white/10 rounded-2xl bg-slate-950/50 flex items-center justify-center">
                <div className="absolute w-12 h-px bg-red-500/50 rotate-0" />
                <div className="absolute w-12 h-px bg-green-500/50 rotate-90" />
                <div className="absolute w-12 h-px bg-blue-500/50 rotate-[45deg]" />
                <span className="absolute top-1 right-2 text-[8px] text-red-500 font-bold">X</span>
                <span className="absolute bottom-1 left-2 text-[8px] text-green-500 font-bold">Y</span>
                <span className="absolute top-1 left-2 text-[8px] text-blue-500 font-bold">Z</span>
              </div>
            </div>
          </div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-cyan-500/20 rounded-tl-[40px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-cyan-500/20 rounded-br-[40px] pointer-events-none" />
        </section>

        {/* Right Sidebar: Analysis & History */}
        <aside className="w-96 flex flex-col gap-4 overflow-y-auto custom-scrollbar pl-1">
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                <span className="text-xs font-black uppercase tracking-widest">振动烈度趋势</span>
              </div>
              <Activity size={16} className="text-cyan-500" />
            </div>
            <div className="h-44 w-full">
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
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex-1">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="text-yellow-500" size={18} />
              <span className="text-xs font-black uppercase tracking-widest">历史异常记录</span>
            </div>
            <div className="space-y-3">
              {[
                { time: '10:45:22', type: '冲击过载', val: '185kN', status: 'critical' },
                { time: '09:12:05', type: '激振频率偏移', val: '42Hz', status: 'warning' },
                { time: '08:30:15', type: '闸门响应延迟', val: '1.2s', status: 'warning' },
                { time: '07:22:40', type: '壁板振动超限', val: '2.4mm/s', status: 'critical' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold">{log.time}</span>
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{log.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[11px] font-black font-mono ${log.status === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>{log.val}</span>
                    <span className={`text-[8px] font-black uppercase ${log.status === 'critical' ? 'text-red-500/50' : 'text-yellow-500/50'}`}>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Status Bar */}
      <footer className="relative z-20 px-8 py-3 bg-slate-950 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">数据采集频率: 2000Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">算法版本: V4.2-NEURAL</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          © 2026 Port Intelligence Monitoring System
        </div>
      </footer>
    </div>
  );
};

export default PortFunnelView;
