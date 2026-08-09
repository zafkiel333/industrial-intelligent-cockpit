import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortShipUnloader/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShipUnloaderState } from '@/components/vibration-monitoring/PortShipUnloader/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 2.5 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.2,
  freq: 48 + Math.random() * 4,
  load: 1150 + Math.random() * 100,
}));

const PortShipUnloaderView: React.FC = () => {
  const [state, setState] = useState<ShipUnloaderState>({
    vibrationFrequency: 52,
    vibrationAmplitude: 2.6,
    motorTemp: 46,
    grabLoad: 1250,
    trolleyPosition: 12
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'health'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        vibrationFrequency: 45 + Math.random() * 10,
        vibrationAmplitude: 2 + Math.random() * 1.5,
        motorTemp: 40 + Math.random() * 10,
        grabLoad: 1000 + Math.random() * 500,
        trolleyPosition: 5 + Math.random() * 15,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden relative">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <ThreeScene state={state} />
      </div>

      {/* Header Overlay */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 bg-slate-900/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Anchor className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
              港口卸船机震动监测系统
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 tracking-[0.2em]">UNLOADER-X1</span>
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                系统在线
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">设备编号: #SU-0824</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          {[
            { label: '抓斗载荷', val: state.grabLoad.toFixed(0), unit: 'kg', color: 'text-cyan-400' },
            { label: '电机温度', val: state.motorTemp.toFixed(1), unit: '°C', color: 'text-orange-400' },
            { label: '振动烈度', val: (state.vibrationAmplitude * 2.5).toFixed(2), unit: 'mm/s', color: 'text-yellow-400' },
          ].map((item, i) => (
            <div key={i} className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{item.label}</div>
              <div className={`${item.color} text-xl font-mono font-black`}>{item.val} <span className="text-xs opacity-50 font-normal">{item.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Overlays */}
      <div className="flex-1 relative z-10 p-6 flex justify-between pointer-events-none">
        {/* Left Panel: Real-time Stats */}
        <div className="w-80 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">实时振动波形</span>
              <Activity size={14} className="text-cyan-500" />
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '小车位置', val: state.trolleyPosition.toFixed(1), unit: 'm', icon: Layers },
              { label: '主卷电流', val: '185', unit: 'A', icon: Zap },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon size={12} className="text-cyan-500" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</span>
                </div>
                <div className="text-lg font-black font-mono text-white">{item.val} <span className="text-[10px] opacity-40">{item.unit}</span></div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">智能诊断预警</div>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">抓斗钢丝绳状态</div>
                <div className="text-[10px] text-slate-400">磨损率 12%，处于安全运行区间。</div>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="text-[10px] font-bold text-cyan-400 uppercase mb-1">减速机震动分析</div>
                <div className="text-[10px] text-slate-400">频谱稳定，未见异常冲击信号。</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Spectrum & Health */}
        <div className="w-96 flex flex-col gap-4 pointer-events-auto">
          <div className="flex gap-2 p-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl">
            {(['realtime', 'spectrum', 'health'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab === 'realtime' ? '实时' : tab === 'spectrum' ? '频谱' : '诊断'}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'realtime' && (
                <motion.div key="rt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">小车运行轨迹</div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <Line type="monotone" dataKey="speed" stroke="#eab308" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
              {activeTab === 'health' && (
                <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="text-center py-6">
                    <div className="text-5xl font-black text-emerald-400 font-mono">98<span className="text-xl">%</span></div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">综合健康指数</div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: '结构疲劳度', val: 15 },
                      { label: '轴承磨损度', val: 22 },
                      { label: '润滑有效性', val: 88 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Accents */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        <div className="px-6 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-full flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wind size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-slate-300">风速: 4.2 m/s</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-slate-300">作业模式: 自动</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortShipUnloaderView;
