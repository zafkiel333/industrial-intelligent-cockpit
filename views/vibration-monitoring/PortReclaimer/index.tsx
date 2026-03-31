import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortReclaimer/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReclaimerState } from '@/components/vibration-monitoring/PortReclaimer/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 1.5 + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.1,
  freq: 42 + Math.random() * 4,
  rate: 1450 + Math.random() * 100,
}));

const PortReclaimerView: React.FC = () => {
  const [state, setState] = useState<ReclaimerState>({
    wheelSpeed: 5.2,
    vibrationIntensity: 0.16,
    motorTemp: 46,
    reclaimRate: 1550,
    boomAngle: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        wheelSpeed: 4 + Math.random() * 3,
        vibrationIntensity: 0.1 + Math.random() * 0.15,
        motorTemp: 40 + Math.random() * 15,
        reclaimRate: 1000 + Math.random() * 1000,
        boomAngle: 5 + Math.random() * 15,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Left: Immersive 3D View */}
      <div className="flex-1 relative border-r border-slate-800/50">
        <div className="absolute inset-0 z-0"><ThreeScene state={state} /></div>
        
        {/* Floating UI Elements */}
        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
              <RotateCw className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">港口取料机震动监测</h1>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">RECLAIMER-CORE-V2</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 z-10 flex gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">取料速率</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">{state.reclaimRate.toFixed(0)} <span className="text-xs font-normal opacity-50">t/h</span></div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">轮速</div>
              <div className="text-2xl font-black text-yellow-400 font-mono">{state.wheelSpeed.toFixed(1)} <span className="text-xs font-normal opacity-50">rpm</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Data & Analysis Panel */}
      <div className="w-[450px] flex flex-col bg-slate-900/40 backdrop-blur-2xl border-l border-slate-800 p-8 gap-8 overflow-y-auto custom-scrollbar">
        {/* Health Status */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">系统健康评估</h2>
            <ShieldCheck className="text-emerald-500" size={18} />
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden">
            <div className="flex items-end gap-4 mb-4">
              <div className="text-6xl font-black text-white">92<span className="text-xl opacity-30">%</span></div>
              <div className="text-xs font-bold text-emerald-400 uppercase mb-2 tracking-widest">状态极佳</div>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
            </div>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              取料机斗轮运行平稳，主轴承震动幅值处于安全区间。AI预测未来48小时内无故障风险。
            </p>
          </div>
        </section>

        {/* Real-time Charts */}
        <section className="flex-1 flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">震动烈度趋势 (mm/s)</h3>
              <Activity className="text-cyan-400" size={14} />
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="amplitude" stroke="#06b6d4" fill="#06b6d410" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">电机温度监测 (°C)</h3>
              <Thermometer className="text-yellow-400" size={14} />
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="step" dataKey="freq" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button className="py-4 bg-cyan-500 text-slate-900 text-xs font-black uppercase rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)]">智能诊断</button>
          <button className="py-4 bg-slate-800 text-white text-xs font-black uppercase rounded-2xl border border-slate-700">历史数据</button>
        </div>
      </div>
    </div>
  );
};

export default PortReclaimerView;
