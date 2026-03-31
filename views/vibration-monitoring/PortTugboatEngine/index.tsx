import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PortTugboatEngine/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Gauge, RotateCw, Wind, Layers, Settings, Anchor, Thermometer, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TugboatEngineState } from '@/components/vibration-monitoring/PortTugboatEngine/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  vibration: 0.25 + Math.sin(i * 0.4) * 0.08 + Math.random() * 0.03,
  temp: 410 + Math.sin(i * 0.1) * 20 + Math.random() * 5,
  rpm: 1480 + Math.random() * 40,
}));

const PortTugboatEngineView: React.FC = () => {
  const [engineState, setEngineState] = useState<TugboatEngineState>({
    rpm: 1520,
    vibrationIntensity: 0.28,
    fuelFlow: 88,
    exhaustTemp: 425,
    oilPressure: 0.58
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'health'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setEngineState(prev => ({
        ...prev,
        rpm: 1450 + Math.random() * 150,
        vibrationIntensity: 0.2 + Math.random() * 0.15,
        fuelFlow: 80 + Math.random() * 20,
        exhaustTemp: 400 + Math.random() * 50,
        oilPressure: 0.5 + Math.random() * 0.15,
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <RotateCw className="text-cyan-400" size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              港口拖轮主机震动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase tracking-[0.2em] font-bold">Main Engine v6.0</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5"><Activity size={14} className="text-cyan-500" /> 设备编号: ENG-TUG-04</span>
              <span className="flex items-center gap-1.5"><Anchor size={14} className="text-emerald-500" /> 运行状态: 巡航</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {[
            { label: '主机转速', val: engineState.rpm.toFixed(0), unit: 'RPM', color: 'text-cyan-400' },
            { label: '排气温度', val: engineState.exhaustTemp.toFixed(1), unit: '°C', color: 'text-yellow-400' },
            { label: '燃油流量', val: engineState.fuelFlow.toFixed(1), unit: 'L/h', color: 'text-emerald-400' },
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
            title="主机数字孪生可视化" 
            subtitle="MAIN ENGINE DIGITAL TWIN" 
            className="flex-1 relative group"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene state={engineState} />
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/80 border-l-4 border-cyan-500 p-4 backdrop-blur-md rounded-r-xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">主机振动烈度</div>
                  <div className="text-3xl font-mono font-black text-cyan-400">{(engineState.vibrationIntensity * 10).toFixed(2)} <span className="text-sm font-normal">mm/s</span></div>
                  <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500"
                      animate={{ width: `${engineState.vibrationIntensity * 100}%` }}
                    />
                  </div>
                </motion.div>

                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <Droplets className="text-cyan-400" size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">滑油压力</div>
                      <div className="text-lg font-mono font-bold text-white">{engineState.oilPressure.toFixed(2)} <span className="text-xs opacity-40">MPa</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <div className="bg-slate-900/80 border border-cyan-500/30 px-6 py-3 backdrop-blur-md rounded-full flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Wind className="text-cyan-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">增压压力: 0.22 MPa</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">单缸温差: 12°C (正常)</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-4 gap-4 h-28">
            {[
              { label: '滑油温度', val: '65.5', unit: '°C', icon: Thermometer, color: 'text-cyan-400' },
              { label: '曲轴箱压', val: '120', unit: 'mmH2O', icon: Gauge, color: 'text-yellow-400' },
              { label: '冷却水温', val: '82.0', unit: '°C', icon: Thermometer, color: 'text-orange-400' },
              { label: '燃油粘度', val: '12.5', unit: 'cSt', icon: Droplets, color: 'text-emerald-400' },
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
                <SciFiCard title="主机振动趋势" subtitle="ENGINE VIBRATION">
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
                        <YAxis hide domain={[0, 0.6]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          itemStyle={{ color: '#06b6d4' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>

                <SciFiCard title="排气温度波动" subtitle="EXHAUST TEMP">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[380, 450]} />
                        <Line type="monotone" dataKey="temp" stroke="#eab308" strokeWidth={2} dot={false} />
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
                        <ShieldCheck className="text-cyan-400" size={18} />
                        <span className="text-xs font-bold text-cyan-400 uppercase">健康状态: 优</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        主机运行工况良好，振动频谱未发现明显的爆压不均或轴承磨损特征。各项热工参数稳定。建议维持当前运行模式，并按计划在 250 小时后进行滑油滤器清洗。
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: '活塞环磨损', val: 18, color: 'bg-emerald-500' },
                        { label: '喷油器状态', val: 95, color: 'bg-cyan-500' },
                        { label: '滑油品质', val: 88, color: 'bg-yellow-500' },
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
                  生成详细维保计划
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PortTugboatEngineView;
