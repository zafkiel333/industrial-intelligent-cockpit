import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PortStacker/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackerState } from '@/components/vibration-monitoring/PortStacker/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  vibration: 0.25 + Math.sin(i * 0.6) * 0.07 + Math.random() * 0.03,
  load: 70 + Math.random() * 20,
  rate: 1100 + Math.random() * 200,
}));

const PortStackerView: React.FC = () => {
  const [state, setState] = useState<StackerState>({
    rotationSpeed: 32,
    vibrationIntensity: 0.28,
    motorLoad: 75,
    bearingTemp: 44,
    stackingRate: 1250
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'health'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        rotationSpeed: 20 + Math.random() * 20,
        vibrationIntensity: 0.1 + Math.random() * 0.2,
        motorLoad: 50 + Math.random() * 40,
        bearingTemp: 35 + Math.random() * 20,
        stackingRate: 800 + Math.random() * 800,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="flex items-center gap-6">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Settings className="text-cyan-400" size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">港口堆料机震动监测<span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase tracking-[0.2em] font-bold">Stacker v3.8</span></h1>
            <div className="text-xs text-slate-400 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5"><Activity size={14} className="text-cyan-500" /> 设备编号: STACK-PORT-03</span>
              <span className="flex items-center gap-1.5"><Layers size={14} className="text-emerald-500" /> 运行状态: 堆料中</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {[
            { label: '回转速度', val: state.rotationSpeed.toFixed(1), unit: '°/s', color: 'text-cyan-400' },
            { label: '电机负载', val: state.motorLoad.toFixed(1), unit: '%', color: 'text-yellow-400' },
            { label: '堆料效率', val: state.stackingRate.toFixed(0), unit: 't/h', color: 'text-emerald-400' },
          ].map((item, i) => (
            <div key={i} className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{item.label}</div>
              <div className={item.color + " text-xl font-mono font-black"}>{item.val} <span className="text-xs opacity-50 font-normal">{item.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard title="堆料机数字孪生可视化" subtitle="STACKER DIGITAL TWIN" className="flex-1 relative group" highlight>
            <div className="absolute inset-0 z-0"><ThreeScene state={state} /></div>
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/80 border-l-4 border-cyan-500 p-4 backdrop-blur-md rounded-r-xl">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">回转机构振动烈度</div>
                  <div className="text-3xl font-mono font-black text-cyan-400">{(state.vibrationIntensity * 10).toFixed(2)} <span className="text-sm font-normal">mm/s</span></div>
                  <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-cyan-500" animate={{ width: `${state.vibrationIntensity * 100}%` }} />
                  </div>
                </motion.div>
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl flex items-center gap-3">
                  <Thermometer className="text-cyan-400" size={20} />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">回转轴承温度</div>
                    <div className="text-lg font-mono font-bold text-white">{state.bearingTemp.toFixed(1)} <span className="text-xs opacity-40">°C</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
          <div className="grid grid-cols-4 gap-4 h-28">
            {[
              { label: '臂架振动', val: '1.5', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '皮带电流', val: '65', unit: 'A', icon: Zap, color: 'text-yellow-400' },
              { label: '俯仰角度', val: '15', unit: '°', icon: RotateCw, color: 'text-orange-400' },
              { label: '系统健康度', val: '97', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-black font-mono text-white">{stat.val} <span className="text-xs font-normal opacity-40">{stat.unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex gap-2">
            {(['realtime', 'spectrum', 'health'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${activeTab === tab ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                {tab === 'realtime' ? '实时波形' : tab === 'spectrum' ? '频谱分析' : '健康诊断'}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'realtime' && (
              <motion.div key="realtime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <SciFiCard title="回转机构振动波形" subtitle="SLEWING MECHANISM VIBRATION">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockData}>
                        <defs><linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 0.5]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>
                <SciFiCard title="堆料速率趋势" subtitle="STACKING RATE TREND">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[800, 1500]} />
                        <Line type="monotone" dataKey="rate" stroke="#eab308" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>
              </motion.div>
            )}
            {activeTab === 'health' && (
              <motion.div key="health" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <SciFiCard title="智能诊断报告" subtitle="AI DIAGNOSTICS">
                  <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2"><ShieldCheck className="text-cyan-400" size={18} /><span className="text-xs font-bold text-cyan-400 uppercase">健康状态: 优</span></div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">堆料机回转系统运行平稳，振动烈度处于正常范围。各关键点温度稳定，未见异常波动。</p>
                  </div>
                </SciFiCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PortStackerView;
