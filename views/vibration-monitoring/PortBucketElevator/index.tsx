import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortBucketElevator/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BucketElevatorState } from '@/components/vibration-monitoring/PortBucketElevator/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 0.18 + Math.sin(i * 0.5) * 0.04 + Math.random() * 0.02,
  speed: 1.1 + Math.random() * 0.2,
  tension: 24.5 + Math.random() * 1.0,
}));

const PortBucketElevatorView: React.FC = () => {
  const [state, setState] = useState<BucketElevatorState>({
    chainSpeed: 1.2,
    vibrationIntensity: 0.19,
    motorTemp: 46,
    bucketLoad: 88,
    tension: 25.4
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        chainSpeed: 0.8 + Math.random() * 0.8,
        vibrationIntensity: 0.1 + Math.random() * 0.15,
        motorTemp: 40 + Math.random() * 15,
        bucketLoad: 50 + Math.random() * 50,
        tension: 20 + Math.random() * 10,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full bg-[#050505] text-slate-300 font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Left Sidebar: Vertical Metrics */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-xl z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ArrowUp className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">斗提机监测</h1>
              <div className="text-[10px] text-slate-500 mt-1 tracking-widest uppercase font-bold">Bucket Elevator // V2.1</div>
            </div>
          </div>
          
          <div className="space-y-6">
            {[
              { label: '提升速度', val: state.chainSpeed.toFixed(2), unit: 'm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '系统张力', val: state.tension.toFixed(1), unit: 'kN', icon: Zap, color: 'text-amber-400' },
              { label: '电机温度', val: state.motorTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-rose-400' },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className={item.color + " opacity-50"} />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{item.val} <span className="text-[9px] opacity-30">{item.unit}</span></span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${item.color.replace('text', 'bg')}`} 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(parseFloat(item.val) / 60) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold">实时状态分析</div>
          <div className="space-y-8 relative">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-white/5" />
            {[
              { t: '01:42:10', m: '提升载荷达到 88%，运行平稳', s: 'NORMAL' },
              { t: '01:41:30', m: '头轮轴承振动烈度 1.8mm/s', s: 'OPTIMAL' },
              { t: '01:40:15', m: '链条自动张紧系统已激活', s: 'SYSTEM' },
              { t: '01:38:50', m: '检测到料斗轻微偏载，已自动修正', s: 'ADJUST' },
            ].map((log, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                </div>
                <div className="text-[9px] text-slate-600 mb-1 font-bold">{log.t} // {log.s}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{log.m}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold">系统健康度</span>
            <span className="text-xs font-bold text-emerald-400">96%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[96%]" />
          </div>
        </div>
      </div>

      {/* Main Content: 3D Viewport */}
      <div className="flex-1 relative bg-black">
        <div className="absolute inset-0 z-0"><ThreeScene state={state} /></div>
        
        {/* Viewport HUD */}
        <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">头轮振动烈度</div>
                <div className="text-4xl font-black text-white tracking-tighter">
                  {(state.vibrationIntensity * 10).toFixed(2)} <span className="text-sm font-normal opacity-30">mm/s</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                  Status: Optimal
                </div>
                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                  Sync: Real-time
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">提升载荷百分比</div>
              <div className="text-6xl font-black text-white/10 tracking-tighter relative">
                {state.bucketLoad.toFixed(0)}%
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <div className="text-2xl font-black text-white">{state.bucketLoad.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="w-64 h-32">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4">振动实时趋势 (VIB_TELEMETRY)</div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">尾轮张力</div>
                <div className="text-xl font-bold text-white tracking-tight">{(state.tension * 0.8).toFixed(1)} <span className="text-[10px] opacity-30 uppercase">kN</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">料斗间距</div>
                <div className="text-xl font-bold text-white tracking-tight">1250 <span className="text-[10px] opacity-30 uppercase">mm</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* Right Sidebar: Analysis & Controls */}
      <div className="w-96 border-l border-white/5 flex flex-col bg-black/40 backdrop-blur-xl z-20">
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-8 font-bold">智能诊断报告</div>
          
          <div className="space-y-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-500" size={18} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI 诊断结论</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                当前提升机运行状态极佳。头轮及尾轮振动频谱分析显示，轴承磨损率低于 5%，链条运行轨迹稳定，无偏磨或跳齿现象。
              </p>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold">频谱特征提取</div>
              <div className="space-y-4">
                {[
                  { label: '链条啮合频率', val: '12.5 Hz', p: 85 },
                  { label: '轴承故障频率', val: '145.2 Hz', p: 2 },
                  { label: '电机转频', val: '24.8 Hz', p: 12 },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-2">
                      <span className="text-slate-400">{f.label}</span>
                      <span className="text-white font-bold">{f.val}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${f.p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-amber-500" size={18} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">维护建议</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                预计 120 小时后需进行链条润滑。建议在下次停机检查时，对料斗紧固螺栓进行抽样力矩校验。
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5">
          <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-400 transition-all">
            生成详细报告
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortBucketElevatorView;
