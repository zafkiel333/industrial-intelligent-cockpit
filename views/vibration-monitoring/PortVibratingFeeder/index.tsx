import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortVibratingFeeder/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VibratingFeederState } from '@/components/vibration-monitoring/PortVibratingFeeder/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 4.2 + Math.sin(i * 0.5) * 0.5 + Math.random() * 0.2,
  freq: 28 + Math.random() * 4,
  rate: 480 + Math.random() * 40,
}));

const PortVibratingFeederView: React.FC = () => {
  const [state, setState] = useState<VibratingFeederState>({
    vibrationFrequency: 30.5,
    vibrationAmplitude: 4.6,
    motorTemp: 41,
    feedRate: 510,
    exciterForce: 88
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        vibrationFrequency: 28 + Math.random() * 5,
        vibrationAmplitude: 4.2 + Math.random() * 0.8,
        motorTemp: 38 + Math.random() * 6,
        feedRate: 450 + Math.random() * 100,
        exciterForce: 85 + Math.random() * 10,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-slate-300 font-mono overflow-hidden selection:bg-cyan-500/30">
      {/* Top Status Bar - Technical Style */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/20 backdrop-blur-md relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ArrowDown className="text-cyan-400" size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase">港口给料机震动监测系统</h1>
              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM_ACTIVE // FEEDING_MODE_01
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex gap-6">
            {[
              { label: '给料速率', val: state.feedRate.toFixed(0), unit: 'T/H' },
              { label: '激振力', val: state.exciterForce.toFixed(1), unit: '%' },
              { label: '运行时间', val: '1248.5', unit: 'HRS' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[9px] text-slate-500 uppercase tracking-tighter">{item.label}</div>
                <div className="text-sm font-bold text-slate-200">{item.val} <span className="text-[10px] opacity-40">{item.unit}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-tighter">当前时间</div>
            <div className="text-xs font-bold text-cyan-400/80 tracking-widest">2026-03-30 01:42:15</div>
          </div>
          <Settings className="text-slate-600 hover:text-cyan-400 cursor-pointer transition-colors" size={18} />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-px bg-slate-800/50 overflow-hidden">
        {/* Left Column: Primary Metrics */}
        <div className="col-span-3 bg-[#0a0a0a] flex flex-col gap-px overflow-y-auto custom-scrollbar">
          {[
            { label: '振动频率', val: state.vibrationFrequency.toFixed(2), unit: 'Hz', icon: Activity, color: 'text-cyan-400', trend: '+0.2%' },
            { label: '振动幅值', val: state.vibrationAmplitude.toFixed(2), unit: 'mm', icon: Layers, color: 'text-amber-400', trend: '-0.1%' },
            { label: '激振器温度', val: state.motorTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-rose-400', trend: 'NORMAL' },
            { label: '弹簧压缩', val: '12.4', unit: 'mm', icon: Zap, color: 'text-emerald-400', trend: 'STABLE' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="p-6 border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <item.icon size={16} className={item.color + " opacity-50 group-hover:opacity-100 transition-opacity"} />
                <span className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">{item.trend}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-3xl font-bold text-white tracking-tighter">
                {item.val} <span className="text-xs font-normal opacity-30 ml-1">{item.unit}</span>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${item.color.replace('text', 'bg')}`} 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(parseFloat(item.val) / 60) * 100}%` }} 
                />
              </div>
            </motion.div>
          ))}
          
          <div className="p-6 flex-1 bg-slate-900/10">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">系统健康诊断</div>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded text-[10px] leading-relaxed text-emerald-400/80">
                [OK] 激振器运行平稳，偏心块同步性良好。
              </div>
              <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded text-[10px] leading-relaxed text-slate-400">
                [INFO] 建议在 48 小时后检查弹簧支座紧固件。
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: 3D Viewport */}
        <div className="col-span-6 bg-[#0a0a0a] relative flex flex-col">
          <div className="flex-1 relative">
            <div className="absolute inset-0 z-0 opacity-80"><ThreeScene state={state} /></div>
            
            {/* Viewport HUD */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-[9px] text-cyan-400 tracking-[0.3em] uppercase">
                    Digital Twin // Real-time Sync
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    LAT: 31.2304° N<br />
                    LON: 121.4737° E
                  </div>
                </div>
                <div className="w-32 h-32 border border-slate-800 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase">Load</div>
                    <div className="text-lg font-bold text-white">84%</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex gap-4 p-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded">
                  {['FRONT', 'SIDE', 'TOP', 'ISO'].map(view => (
                    <button key={view} className="px-4 py-1 text-[9px] font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-slate-700" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-slate-700" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-slate-700" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-slate-700" />
          </div>

          {/* Bottom Analysis Panel */}
          <div className="h-48 border-t border-slate-800 grid grid-cols-2 gap-px bg-slate-800">
            <div className="bg-[#0a0a0a] p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-500" />
                振幅实时波形 (AMPLITUDE_WAVEFORM)
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 8]} />
                    <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" strokeWidth={1} fill="url(#areaGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500" />
                给料速率监测 (FEED_RATE_TELEMETRY)
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[300, 700]} />
                    <Line type="stepAfter" dataKey="rate" stroke="#f59e0b" strokeWidth={1} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Logs */}
        <div className="col-span-3 bg-[#0a0a0a] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-900/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span>频谱分析报告</span>
              <Activity size={12} className="text-cyan-500" />
            </div>
            <div className="space-y-4">
              {[
                { label: '主频 (F1)', val: '29.8', unit: 'Hz', p: '92%' },
                { label: '二倍频 (F2)', val: '59.6', unit: 'Hz', p: '4%' },
                { label: '三倍频 (F3)', val: '89.4', unit: 'Hz', p: '1%' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-400">{f.label}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-white">{f.val} <span className="text-[9px] opacity-30">{f.unit}</span></div>
                    <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: f.p }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">实时事件日志 (EVENT_LOG)</div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {[
                { t: '01:42:10', m: '给料速率调整至 510 t/h', s: 'INFO' },
                { t: '01:41:55', m: '激振器 A 启动同步校验', s: 'OK' },
                { t: '01:41:30', m: '弹簧支座振动幅值正常', s: 'OK' },
                { t: '01:40:45', m: '系统进入自动给料模式', s: 'MODE' },
                { t: '01:40:00', m: '传感器节点 #04 信号重连', s: 'WARN' },
              ].map((log, i) => (
                <div key={i} className="text-[9px] font-mono border-l border-slate-800 pl-3 py-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-slate-600">{log.t}</span>
                    <span className={`px-1 rounded-[2px] ${log.s === 'OK' ? 'bg-emerald-500/10 text-emerald-500' : log.s === 'WARN' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                      {log.s}
                    </span>
                  </div>
                  <div className="text-slate-400">{log.m}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900/20 border-t border-slate-900/50">
            <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-slate-900 transition-all">
              导出分析报告 (EXPORT_PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortVibratingFeederView;
