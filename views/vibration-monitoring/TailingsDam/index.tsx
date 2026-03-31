import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/TailingsDam/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Thermometer, ArrowUp, ArrowDown, Settings, BarChart3, Info, Gauge, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShovelHoistState } from '@/components/vibration-monitoring/TailingsDam/three-types';

const mockVibrationData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.5 + Math.sin(i * 0.4) * 0.6 + Math.random() * 0.3,
  load: 80 + Math.sin(i * 0.1) * 20 + Math.random() * 5,
}));

const radarData = [
  { subject: '轴承振动', A: 120, B: 110, fullMark: 150 },
  { subject: '齿轮啮合', A: 98, B: 130, fullMark: 150 },
  { subject: '电机温度', A: 86, B: 130, fullMark: 150 },
  { subject: '钢丝绳张力', A: 99, B: 100, fullMark: 150 },
  { subject: '润滑压力', A: 85, B: 90, fullMark: 150 },
  { subject: '制动性能', A: 65, B: 85, fullMark: 150 },
];

const TailingsDamView: React.FC = () => {
  const [hoistState, setHoistState] = useState<ShovelHoistState>({
    vibration: 0.52,
    hoistSpeed: 1.2,
    load: 85,
    cableTension: 120,
    motorTemp: 58.5,
    bucketHeight: 0.5
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'diagnostic'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setHoistState(prev => ({
        ...prev,
        vibration: 0.4 + Math.random() * 0.6,
        hoistSpeed: 1.0 + Math.random() * 0.5,
        bucketHeight: (prev.bucketHeight + 0.05) % 1.0
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-yellow-500/20 bg-slate-900/60 backdrop-blur-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-40" />
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-yellow-500/5 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
          >
            <Gauge className="text-yellow-400" size={32} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
              露天矿电铲提升机构振动监测
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 uppercase tracking-[0.3em] font-bold">Hoist Monitor v4.0</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-5 mt-1.5 font-medium">
              <span className="flex items-center gap-2"><Activity size={14} className="text-yellow-500" /> 运行模式: 自动提升</span>
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> 钢丝绳寿命: 82%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {[
            { label: '提升速度', val: hoistState.hoistSpeed.toFixed(1), unit: 'm/s', color: 'text-yellow-400' },
            { label: '瞬时载荷', val: (hoistState.load * 1.5).toFixed(1), unit: 't', color: 'text-cyan-400' },
            { label: '电机温度', val: hoistState.motorTemp.toFixed(1), unit: '°C', color: 'text-orange-400' },
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
            title="提升机构数字孪生" 
            subtitle="HOIST MECHANISM DIGITAL TWIN" 
            className="flex-1 relative overflow-hidden"
            highlight
          >
            <div className="absolute inset-0 z-0 opacity-80">
              <ThreeScene state={hoistState} />
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/90 border border-yellow-500/30 p-5 backdrop-blur-xl rounded-2xl shadow-2xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">提升滚筒振动强度</div>
                  <div className="text-4xl font-mono font-black text-yellow-400">{(hoistState.vibration * 5.2).toFixed(2)} <span className="text-sm font-normal text-slate-500">mm/s</span></div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        className="h-1.5 w-2 rounded-full"
                        animate={{ 
                          backgroundColor: i < hoistState.vibration * 12 ? '#eab308' : '#1e293b' 
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-900/90 border border-slate-700/50 p-4 backdrop-blur-xl rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <Zap className="text-cyan-400" size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">钢丝绳张力</div>
                      <div className="text-xl font-mono font-black text-white">{hoistState.cableTension.toFixed(1)} <span className="text-xs opacity-50">kN</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">制动器状态: 已释放</span>
                  </div>
                  <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-md flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">润滑泵: 运行中</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/50 p-4 backdrop-blur-xl rounded-2xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">铲斗高度</div>
                  <div className="flex items-center gap-3">
                    <div className="h-24 w-2 bg-slate-800 rounded-full relative overflow-hidden">
                      <motion.div 
                        className="absolute bottom-0 w-full bg-yellow-500"
                        animate={{ height: `${hoistState.bucketHeight * 100}%` }}
                      />
                    </div>
                    <div className="text-2xl font-mono font-black text-white">{(hoistState.bucketHeight * 12).toFixed(1)} <span className="text-xs opacity-50">m</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-5 h-32">
            {[
              { label: '减速机振动', val: '1.42', unit: 'mm/s', icon: Settings, color: 'text-yellow-400' },
              { label: '电机轴承振动', val: '0.95', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '提升电流', val: '420', unit: 'A', icon: Zap, color: 'text-emerald-400' },
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
            {(['realtime', 'spectrum', 'diagnostic'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'realtime' ? '实时趋势' : tab === 'spectrum' ? '频谱分析' : '智能诊断'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <SciFiCard 
                title={activeTab === 'realtime' ? '提升载荷与振动关联' : activeTab === 'spectrum' ? '提升机构健康雷达' : '故障诊断报告'} 
                subtitle="ANALYTICS ENGINE"
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'realtime' ? (
                      <AreaChart data={mockVibrationData}>
                        <defs>
                          <linearGradient id="vibeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#eab308' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#eab308" strokeWidth={3} fill="url(#vibeGrad)" />
                        <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fill="transparent" />
                      </AreaChart>
                    ) : activeTab === 'spectrum' ? (
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis hide />
                        <Radar name="当前状态" dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.4} />
                      </RadarChart>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl">
                          <div className="text-xs font-black text-yellow-400 mb-2 flex items-center gap-2">
                            <AlertCircle size={14} />
                            减速机异常预警
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            检测到减速机输入轴承存在 23.5Hz 异常频率，幅值呈上升趋势。结合润滑油分析结果，初步判定为轴承内圈点蚀。建议在 15 个工作日内安排停机检查。
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">剩余寿命预测</div>
                            <div className="text-xl font-black text-white">420 <span className="text-xs opacity-40">h</span></div>
                          </div>
                          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">维护紧迫度</div>
                            <div className="text-xl font-black text-orange-400">中等</div>
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
                    { label: '提升电机转速', val: '980', unit: 'rpm', icon: Settings },
                    { label: '制动油压', val: '12.5', unit: 'MPa', icon: Gauge },
                    { label: '润滑油温', val: '45.2', unit: '°C', icon: Thermometer },
                    { label: '环境湿度', val: '65', unit: '%', icon: Info },
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
                className="w-full py-5 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-400 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:from-yellow-600/30 hover:to-orange-600/30 transition-all shadow-xl shadow-yellow-500/5 flex items-center justify-center gap-3"
              >
                生成详细诊断报告 <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TailingsDamView;
