import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortBeltConveyor/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeltConveyorState } from '@/components/vibration-monitoring/PortBeltConveyor/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 0.12 + Math.sin(i * 0.5) * 0.03 + Math.random() * 0.02,
  speed: 3.4 + Math.random() * 0.2,
  tension: 14.8 + Math.random() * 0.5,
}));

const PortBeltConveyorView: React.FC = () => {
  const [state, setState] = useState<BeltConveyorState>({
    beltSpeed: 3.5,
    vibrationIntensity: 0.14,
    motorTemp: 43,
    beltTension: 15.2,
    loadWeight: 850
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        beltSpeed: 3 + Math.random() * 1,
        vibrationIntensity: 0.1 + Math.random() * 0.1,
        motorTemp: 40 + Math.random() * 10,
        beltTension: 14 + Math.random() * 2,
        loadWeight: 500 + Math.random() * 500,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Top Control Bar */}
      <div className="h-20 bg-slate-900/80 border-b border-cyan-500/20 backdrop-blur-2xl flex items-center justify-between px-10 relative z-20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
            <ArrowRight className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">港口皮带机震动监测</h1>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              <span className="flex items-center gap-1"><Activity size={10} className="text-cyan-500" /> 实时在线</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>ID: BELT-CONV-08</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">皮带速度</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{state.beltSpeed.toFixed(1)} <span className="text-xs font-normal opacity-40">m/s</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">系统负载</span>
            <span className="text-2xl font-black text-yellow-400 font-mono">{(state.loadWeight / 10).toFixed(1)} <span className="text-xs font-normal opacity-40">%</span></span>
          </div>
          <button className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-900 transition-all">
            系统设置
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Detailed Metrics */}
        <div className="w-80 bg-slate-900/40 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">核心指标</h2>
          {[
            { label: '托辊振动', val: (state.vibrationIntensity * 10).toFixed(2), unit: 'mm/s', color: 'text-cyan-400', icon: Activity },
            { label: '皮带张力', val: state.beltTension.toFixed(1), unit: 'kN', color: 'text-yellow-400', icon: Layers },
            { label: '电机温度', val: state.motorTemp.toFixed(1), unit: '°C', color: 'text-orange-400', icon: Thermometer },
            { label: '主轴承震动', val: '1.24', unit: 'mm/s', color: 'text-emerald-400', icon: ShieldCheck },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl group hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <item.icon size={14} className={item.color} />
                <div className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</div>
              </div>
              <div className="text-2xl font-black text-white font-mono">{item.val} <span className="text-xs font-normal opacity-30">{item.unit}</span></div>
              <div className="mt-3 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div className={`h-full ${item.color.replace('text', 'bg')}`} initial={{ width: 0 }} animate={{ width: '75%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-[#020617]">
          <div className="absolute inset-0 z-0"><ThreeScene state={state} /></div>
          
          {/* Legend/Status */}
          <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl min-w-[200px]">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI 诊断状态</div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">运行良好 - 无异常</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Analytics */}
        <div className="w-96 bg-slate-900/40 border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">实时分析</h2>
          
          <div className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">振幅频谱趋势</span>
              <Activity size={12} className="text-cyan-400" />
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" fill="#06b6d410" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">张力波动监测</span>
              <Layers size={12} className="text-yellow-400" />
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="tension" stroke="#eab308" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-auto p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">维护提示</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              当前皮带张力稳定，托辊震动频率正常。建议在下次停机维护时检查驱动滚筒的磨损情况。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortBeltConveyorView;
