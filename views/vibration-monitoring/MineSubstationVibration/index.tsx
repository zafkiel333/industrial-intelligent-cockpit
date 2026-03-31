import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineSubstationVibration/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Thermometer, ArrowRight, Settings, BarChart3, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConveyorState } from '@/components/vibration-monitoring/MineSubstationVibration/three-types';

const mockData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.2 + Math.sin(i * 0.5) * 0.8 + Math.random() * 0.4,
  temp: 38 + Math.sin(i * 0.2) * 5 + Math.random() * 2,
  tension: 85 + Math.random() * 5,
}));

const scatterData = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100,
}));

const MineSubstationVibrationView: React.FC = () => {
  const [conveyorState, setConveyorState] = useState<ConveyorState>({
    vibration: 0.45,
    beltSpeed: 3.2,
    tension: 88.5,
    rollerTemp: 42.8,
    load: 75
  });

  const [activeAnalysis, setActiveAnalysis] = useState<'vibration' | 'temperature' | 'tension'>('vibration');

  useEffect(() => {
    const interval = setInterval(() => {
      setConveyorState(prev => ({
        ...prev,
        vibration: 0.3 + Math.random() * 0.5,
        beltSpeed: 3.0 + Math.random() * 0.4,
        load: 60 + Math.random() * 30
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40" />
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-cyan-500/5 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          >
            <Settings className="text-cyan-400" size={32} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
              矿用皮带机滚筒及托辊振动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-[0.3em] font-bold">Belt System Pro</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-5 mt-1.5">
              <span className="flex items-center gap-2"><Activity size={14} className="text-cyan-500" /> 运行状态: 负载运行中</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> 系统健康度: 94%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {[
            { label: '皮带速度', val: conveyorState.beltSpeed.toFixed(1), unit: 'm/s', color: 'text-cyan-400' },
            { label: '瞬时流量', val: (conveyorState.load * 12.5).toFixed(0), unit: 't/h', color: 'text-yellow-400' },
            { label: '托辊温度', val: conveyorState.rollerTemp.toFixed(1), unit: '°C', color: 'text-orange-400' },
          ].map((item, i) => (
            <div key={i} className="text-right group">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold group-hover:text-slate-300 transition-colors">{item.label}</div>
              <div className={item.color + " text-2xl font-mono font-black tracking-tight"}>{item.val} <span className="text-xs opacity-40 font-normal">{item.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* Left: 3D Visualization */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5 overflow-hidden">
          <SciFiCard 
            title="皮带机数字孪生" 
            subtitle="CONVEYOR DIGITAL TWIN" 
            className="flex-1 relative overflow-hidden"
            highlight
          >
            <div className="absolute inset-0 z-0 opacity-80">
              <ThreeScene state={conveyorState} />
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/90 border border-cyan-500/30 p-5 backdrop-blur-xl rounded-2xl shadow-2xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">托辊组振动强度</div>
                  <div className="text-4xl font-mono font-black text-cyan-400">{(conveyorState.vibration * 4.5).toFixed(2)} <span className="text-sm font-normal text-slate-500">mm/s</span></div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        className="h-1.5 w-2 rounded-full"
                        animate={{ 
                          backgroundColor: i < conveyorState.vibration * 12 ? '#06b6d4' : '#1e293b' 
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-900/90 border border-slate-700/50 p-4 backdrop-blur-xl rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <ShieldCheck className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">皮带张紧力</div>
                      <div className="text-xl font-mono font-black text-white">{conveyorState.tension.toFixed(1)} <span className="text-xs opacity-50">kN</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">驱动电机: 正常</span>
                  </div>
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">跑偏监测: 无偏移</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-5 h-32">
            {[
              { label: '驱动滚筒振动', val: '0.85', unit: 'mm/s', icon: Zap, color: 'text-yellow-400' },
              { label: '改向滚筒振动', val: '0.62', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '托辊轴承噪声', val: '42', unit: 'dB', icon: Info, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col justify-center relative group overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon size={80} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</span>
                </div>
                <div className="text-3xl font-black font-mono text-white tracking-tighter">{stat.val} <span className="text-xs font-normal opacity-30">{stat.unit}</span></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Analysis & Diagnostics */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
            {(['vibration', 'temperature', 'tension'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveAnalysis(tab)}
                className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeAnalysis === tab 
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'vibration' ? '振动分析' : tab === 'temperature' ? '温度监测' : '张力诊断'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeAnalysis}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <SciFiCard 
                title={activeAnalysis === 'vibration' ? '振动实时频谱' : activeAnalysis === 'temperature' ? '托辊组温度分布' : '皮带张力波动'} 
                subtitle="ANALYTICS ENGINE"
              >
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeAnalysis === 'vibration' ? (
                      <AreaChart data={mockData}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 3]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#06b6d4' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={3} fill="url(#chartGrad)" />
                      </AreaChart>
                    ) : activeAnalysis === 'temperature' ? (
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[30, 60]} />
                        <Line type="stepAfter" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={false} />
                      </LineChart>
                    ) : (
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis type="number" dataKey="x" hide />
                        <YAxis type="number" dataKey="y" hide />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} />
                        <Scatter name="Tension" data={scatterData} fill="#10b981" />
                      </ScatterChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </SciFiCard>

              <SciFiCard title="智能健康预警" subtitle="SMART DIAGNOSTICS">
                <div className="space-y-4">
                  <div className="p-5 bg-cyan-950/20 border border-cyan-500/20 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <AlertCircle className="text-cyan-400 animate-pulse" size={20} />
                    </div>
                    <div className="text-xs font-black text-cyan-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <BarChart3 size={16} />
                      托辊故障预测
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      通过对 4# 托辊组的振动频谱分析，发现 1250Hz 处存在异常谐波，且伴随温度升高 3.2°C。初步诊断为轴承内圈疲劳剥落。建议在 72 小时内进行预防性更换，以避免皮带纵向撕裂风险。
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { label: '皮带磨损指数', val: 12, color: 'bg-emerald-500' },
                      { label: '滚筒对中偏差', val: 0.15, max: 2, unit: 'mm', color: 'bg-cyan-500' },
                      { label: '清扫器效率', val: 98, color: 'bg-blue-500' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="text-white font-mono">{item.val}{'unit' in item ? item.unit : '%'}</span>
                        </div>
                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${'max' in item ? (item.val / item.max) * 100 : item.val}%` }}
                            className={`h-full ${item.color} shadow-[0_0_10px_rgba(6,182,212,0.3)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SciFiCard>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:from-cyan-600/30 hover:to-blue-600/30 transition-all shadow-xl shadow-cyan-500/5 flex items-center justify-center gap-3"
              >
                查看完整诊断报告 <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MineSubstationVibrationView;
