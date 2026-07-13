import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineExcavatorVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-MineExcavatorVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-MineExcavatorVibration';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Thermometer, ArrowRight, Settings, BarChart3, Info, RotateCw, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShovelSwingState } from '@/components/vibration-monitoring/MineExcavatorVibration/three-types';

const mockVibrationData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.2 + Math.sin(i * 0.5) * 0.8 + Math.random() * 0.4,
  speed: 3.5 + Math.sin(i * 0.2) * 1.5 + Math.random() * 0.5,
}));

const barData = [
  { name: '100Hz', value: 45, color: '#06b6d4' },
  { name: '250Hz', value: 82, color: '#eab308' },
  { name: '500Hz', value: 35, color: '#06b6d4' },
  { name: '1kHz', value: 12, color: '#06b6d4' },
  { name: '2kHz', value: 8, color: '#06b6d4' },
];

const MineExcavatorVibrationView: React.FC = () => {
  const [swingState, setSwingState] = useState<ShovelSwingState>({
    vibration: 0.48,
    swingSpeed: 3.5,
    swingAngle: 0,
    motorTemp: 52.4,
    gearboxTemp: 64.8,
    load: 78
  });

  const [activeAnalysis, setActiveAnalysis] = useState<'vibration' | 'spectrum' | 'health'>('vibration');

  useEffect(() => {
    const interval = setInterval(() => {
      setSwingState(prev => ({
        ...prev,
        vibration: 0.3 + Math.random() * 0.6,
        swingSpeed: 3.0 + Math.random() * 1.5,
        swingAngle: (prev.swingAngle + 0.02) % (Math.PI * 2)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40" />
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-cyan-500/5 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          >
            <RotateCw className="text-cyan-400" size={32} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
              露天矿电铲回转机构振动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-[0.3em] font-bold">Swing Dynamics Pro</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-5 mt-1.5 font-medium">
              <span className="flex items-center gap-2"><Activity size={14} className="text-cyan-500" /> 运行状态: 连续回转</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> 回转支承健康度: 91%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {[
            { label: '回转速度', val: swingState.swingSpeed.toFixed(1), unit: 'rpm', color: 'text-cyan-400' },
            { label: '回转角度', val: ((swingState.swingAngle * 180) / Math.PI).toFixed(0), unit: '°', color: 'text-yellow-400' },
            { label: '减速机温度', val: swingState.gearboxTemp.toFixed(1), unit: '°C', color: 'text-orange-400' },
          ].map((item, i) => (
            <div key={i} className="text-right group">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold group-hover:text-slate-300 transition-colors">{item.label}</div>
              <div className={item.color + " text-2xl font-mono font-black tracking-tight"}>{item.val} <span className="text-xs opacity-40 font-normal">{item.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* Left: 3D Visualization & HUD */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5 overflow-hidden">
          <SciFiCard 
            title="回转机构数字孪生" 
            subtitle="SWING MECHANISM DIGITAL TWIN" 
            className="flex-1 relative overflow-hidden"
            highlight
          >
            <div className="absolute inset-0 z-0 opacity-80">
              <ThreeScene state={swingState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/90 border border-cyan-500/30 p-5 backdrop-blur-xl rounded-2xl shadow-2xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">回转支承振动强度</div>
                  <div className="text-4xl font-mono font-black text-cyan-400">{(swingState.vibration * 4.8).toFixed(2)} <span className="text-sm font-normal text-slate-500">mm/s</span></div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        className="h-1.5 w-2 rounded-full"
                        animate={{ 
                          backgroundColor: i < swingState.vibration * 12 ? '#06b6d4' : '#1e293b' 
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-900/90 border border-slate-700/50 p-4 backdrop-blur-xl rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <Zap className="text-yellow-400" size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">回转电机电流</div>
                      <div className="text-xl font-mono font-black text-white">425 <span className="text-xs opacity-50">A</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">润滑泵: 运行中</span>
                  </div>
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">抱闸状态: 已释放</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/50 p-4 backdrop-blur-xl rounded-2xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">回转方位角</div>
                  <div className="w-24 h-24 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="2" />
                      <motion.line 
                        x1="50" y1="50" x2="50" y2="10" 
                        stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"
                        animate={{ transform: `rotate(${swingState.swingAngle}rad)`, transformOrigin: '50px 50px' }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-5 h-32">
            {[
              { label: '回转电机振动', val: '0.92', unit: 'mm/s', icon: Zap, color: 'text-yellow-400' },
              { label: '回转减速机振动', val: '1.25', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '齿轮啮合噪声', val: '52', unit: 'dB', icon: Info, color: 'text-emerald-400' },
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
            {(['vibration', 'spectrum', 'health'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveAnalysis(tab)}
                className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeAnalysis === tab 
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'vibration' ? '振动趋势' : tab === 'spectrum' ? '频谱分析' : '健康诊断'}
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
                title={activeAnalysis === 'vibration' ? '回转速度与振动关联' : activeAnalysis === 'spectrum' ? '回转机构能量分布' : '智能健康报告'} 
                subtitle="ANALYTICS ENGINE"
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeAnalysis === 'vibration' ? (
                      <AreaChart data={mockVibrationData}>
                        <defs>
                          <linearGradient id="vibeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#06b6d4' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={3} fill="url(#vibeGrad)" />
                        <Area type="monotone" dataKey="speed" stroke="#eab308" strokeWidth={2} fill="transparent" />
                      </AreaChart>
                    ) : activeAnalysis === 'spectrum' ? (
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                        <Bar dataKey="value">
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl">
                          <div className="text-xs font-black text-cyan-400 mb-2 flex items-center gap-2">
                            <AlertCircle size={14} />
                            回转支承异常预警
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            检测到回转支承在 45° 至 90° 区间内存在周期性冲击振动，且伴随金属摩擦声。初步判定为滚道局部磨损或润滑脂污染。建议在下个检修周期进行内窥镜检查。
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">剩余寿命预测</div>
                            <div className="text-xl font-black text-white">1250 <span className="text-xs opacity-40">h</span></div>
                          </div>
                          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">维护紧迫度</div>
                            <div className="text-xl font-black text-yellow-400">低</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </SciFiCard>

              <SciFiCard title="系统参数监控" subtitle="SYSTEM PARAMETERS">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '回转电机转速', val: '1450', unit: 'rpm', icon: Settings },
                    { label: '回转扭矩', val: '125', unit: 'kN·m', icon: Gauge },
                    { label: '电机温度', val: '52.4', unit: '°C', icon: Thermometer },
                    { label: '环境湿度', val: '42', unit: '%', icon: Info },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                        <item.icon size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</div>
                        <div className="text-lg font-black text-white font-mono">{item.val} <span className="text-xs opacity-30 font-normal">{item.unit}</span></div>
                      </div>
                    </div>
                  ))}
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

export default MineExcavatorVibrationView;
