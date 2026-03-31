import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/DredgerVibration/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Gauge, Anchor, RotateCw, Wind, Droplets, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DredgerState } from '@/components/vibration-monitoring/DredgerVibration/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  vibration: 0.35 + Math.sin(i * 0.5) * 0.15 + Math.random() * 0.08,
  pumpPressure: 2.2 + Math.sin(i * 0.3) * 0.4 + Math.random() * 0.2,
  swingSpeed: 12 + Math.random() * 5,
}));

const DredgerVibrationView: React.FC = () => {
  const [dredgerState, setDredgerState] = useState<DredgerState>({
    cutterSpeed: 28,
    vibrationIntensity: 0.32,
    pumpPressure: 2.4,
    swingSpeed: 14,
    dredgingDepth: 10.5
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'health'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setDredgerState(prev => ({
        ...prev,
        cutterSpeed: 25 + Math.random() * 10,
        vibrationIntensity: 0.25 + Math.random() * 0.3,
        pumpPressure: 2.0 + Math.random() * 1.0,
        swingSpeed: 10 + Math.random() * 10,
        dredgingDepth: 8 + Math.random() * 5
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <RotateCw className="text-cyan-400" size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              绞吸式挖泥船智能振动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase tracking-[0.2em] font-bold">Dredger Dynamics v4.0</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5"><Anchor size={14} className="text-cyan-500" /> 船舶编号: DR-2026-X1</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> 挖泥系统状态: 运行中</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {[
            { label: '绞刀转速', val: dredgerState.cutterSpeed.toFixed(0), unit: 'RPM', color: 'text-cyan-400' },
            { label: '泥泵压力', val: dredgerState.pumpPressure.toFixed(1), unit: 'MPa', color: 'text-yellow-400' },
            { label: '挖泥深度', val: dredgerState.dredgingDepth.toFixed(1), unit: 'm', color: 'text-emerald-400' },
          ].map((item, i) => (
            <div key={i} className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{item.label}</div>
              <div className={item.color + " text-xl font-mono font-black"}>{item.val} <span className="text-xs opacity-50 font-normal">{item.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left: 3D Scene & Controls */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="挖泥船数字孪生可视化" 
            subtitle="DREDGER DIGITAL TWIN" 
            className="flex-1 relative group"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene state={dredgerState} />
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/80 border-l-4 border-cyan-500 p-4 backdrop-blur-md rounded-r-xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">绞刀架振动强度</div>
                  <div className="text-3xl font-mono font-black text-cyan-400">{(dredgerState.vibrationIntensity * 8.5).toFixed(2)} <span className="text-sm font-normal">mm/s</span></div>
                  <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500"
                      animate={{ width: `${dredgerState.vibrationIntensity * 100}%` }}
                    />
                  </div>
                </motion.div>

                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <Zap className="text-yellow-400" size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">泥泵负载</div>
                      <div className="text-lg font-mono font-bold text-white">82.4%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <div className="bg-slate-900/80 border border-cyan-500/30 px-6 py-3 backdrop-blur-md rounded-full flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Layers className="text-cyan-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">土质识别: 粘土</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">横移速度: {dredgerState.swingSpeed.toFixed(1)} m/min</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-4 gap-4 h-28">
            {[
              { label: '泥泵转速', val: '450', unit: 'RPM', icon: RotateCw, color: 'text-cyan-400' },
              { label: '液压系统压力', val: '15.8', unit: 'MPa', icon: Gauge, color: 'text-yellow-400' },
              { label: '绞刀电机温', val: '62', unit: '°C', icon: Zap, color: 'text-orange-400' },
              { label: '排泥流量', val: '2500', unit: 'm³/h', icon: Droplets, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <stat.icon size={40} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-black font-mono text-white">{stat.val} <span className="text-xs font-normal opacity-40">{stat.unit}</span></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Analysis & Diagnostics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex gap-2">
            {(['realtime', 'spectrum', 'health'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
                  activeTab === tab 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {tab === 'realtime' ? '实时波形' : tab === 'spectrum' ? '频谱分析' : '健康诊断'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'realtime' && (
              <motion.div 
                key="realtime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <SciFiCard title="绞刀振动趋势" subtitle="CUTTER VIBRATION TREND">
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
                        <YAxis hide domain={[0, 1]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          itemStyle={{ color: '#06b6d4' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>

                <SciFiCard title="泥泵压力波动" subtitle="PUMP PRESSURE FLUCTUATION">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[1, 4]} />
                        <Line type="monotone" dataKey="pumpPressure" stroke="#eab308" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>
              </motion.div>
            )}

            {activeTab === 'health' && (
              <motion.div 
                key="health"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <SciFiCard title="智能诊断报告" subtitle="AI DIAGNOSTICS">
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-cyan-400" size={18} />
                        <span className="text-xs font-bold text-cyan-400 uppercase">施工参数优化建议</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        当前土质粘性较大，绞刀架振动主频集中在 45Hz 附近。建议将横移速度降低 10%，同时增加泥泵转速 5%，以防止吸口堵塞并降低结构疲劳损伤。
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: '绞刀刀齿磨损', val: 78, color: 'bg-emerald-500' },
                        { label: '泥泵叶轮健康', val: 85, color: 'bg-cyan-500' },
                        { label: '液压密封状态', val: 92, color: 'bg-yellow-500' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-bold uppercase">{item.label}</span>
                            <span className="text-white font-mono">{item.val}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.val}%` }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SciFiCard>
                
                <button className="w-full py-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:from-cyan-600/30 hover:to-blue-600/30 transition-all shadow-lg shadow-cyan-500/10">
                  生成完整维保计划
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DredgerVibrationView;
