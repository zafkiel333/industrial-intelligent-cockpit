import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ShipBoilerVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ShipBoilerVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ShipBoilerVibration';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Gauge, Thermometer, Droplets, Flame, Settings, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoilerState } from '@/components/vibration-monitoring/ShipBoilerVibration/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  vibration: 0.08 + Math.sin(i * 0.3) * 0.02 + Math.random() * 0.01,
  pressure: 1.15 + Math.sin(i * 0.1) * 0.05 + Math.random() * 0.02,
  water: 48 + Math.sin(i * 0.2) * 5 + Math.random() * 2,
}));

const ShipBoilerVibrationView: React.FC = () => {
  const [boilerState, setBoilerState] = useState<BoilerState>({
    steamPressure: 1.25,
    vibrationIntensity: 0.12,
    waterLevel: 52,
    burnerStatus: 'normal',
    temperature: 185
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'health'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setBoilerState(prev => ({
        ...prev,
        steamPressure: 1.1 + Math.random() * 0.3,
        vibrationIntensity: 0.08 + Math.random() * 0.08,
        waterLevel: 45 + Math.random() * 10,
        temperature: 175 + Math.random() * 20,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-orange-500/20 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <Flame className="text-orange-400" size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              船舶锅炉震动监测系统
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30 uppercase tracking-[0.2em] font-bold">Boiler v3.0</span>
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5"><Activity size={14} className="text-orange-500" /> 设备编号: BLR-MAIN-02</span>
              <span className="flex items-center gap-1.5"><Power size={14} className="text-emerald-500" /> 燃烧状态: 正常</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {[
            { label: '蒸汽压力', val: boilerState.steamPressure.toFixed(2), unit: 'MPa', color: 'text-orange-400' },
            { label: '水位高度', val: boilerState.waterLevel.toFixed(1), unit: '%', color: 'text-cyan-400' },
            { label: '蒸汽温度', val: boilerState.temperature.toFixed(1), unit: '°C', color: 'text-yellow-400' },
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
            title="锅炉数字孪生可视化" 
            subtitle="BOILER DIGITAL TWIN" 
            className="flex-1 relative group"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene state={boilerState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-slate-900/80 border-l-4 border-orange-500 p-4 backdrop-blur-md rounded-r-xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">炉体振动烈度</div>
                  <div className="text-3xl font-mono font-black text-orange-400">{(boilerState.vibrationIntensity * 10).toFixed(2)} <span className="text-sm font-normal">mm/s</span></div>
                  <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-orange-500"
                      animate={{ width: `${boilerState.vibrationIntensity * 100}%` }}
                    />
                  </div>
                </motion.div>

                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Droplets className="text-cyan-400" size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">给水流量</div>
                      <div className="text-lg font-mono font-bold text-white">12.5 <span className="text-xs opacity-40">t/h</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <div className="bg-slate-900/80 border border-orange-500/30 px-6 py-3 backdrop-blur-md rounded-full flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Flame className="text-orange-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">燃烧器: 运行中</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 uppercase">含氧量: 3.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-4 gap-4 h-28">
            {[
              { label: '炉水pH值', val: '9.2', unit: '', icon: Droplets, color: 'text-cyan-400' },
              { label: '烟气温度', val: '220', unit: '°C', icon: Thermometer, color: 'text-orange-400' },
              { label: '鼓风机压', val: '4.5', unit: 'kPa', icon: Gauge, color: 'text-yellow-400' },
              { label: '燃油压力', val: '2.8', unit: 'MPa', icon: Zap, color: 'text-emerald-400' },
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
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
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
                <SciFiCard title="炉体振动波形" subtitle="BOILER VIBRATION">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockData}>
                        <defs>
                          <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 0.2]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Area type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} fill="url(#vibGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SciFiCard>

                <SciFiCard title="蒸汽压力趋势" subtitle="STEAM PRESSURE">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[1.0, 1.4]} />
                        <Line type="monotone" dataKey="pressure" stroke="#eab308" strokeWidth={2} dot={false} />
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
                    <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="text-orange-400" size={18} />
                        <span className="text-xs font-bold text-orange-400 uppercase">健康状态: 优</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        锅炉本体运行平稳，振动烈度处于安全范围内。燃烧器火焰稳定，未发现明显的燃烧脉动或结构共振。建议维持当前负荷，并按计划在 300 小时后进行水质化验及排污检查。
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: '炉墙完整性', val: 98, color: 'bg-emerald-500' },
                        { label: '换热管结垢', val: 12, color: 'bg-cyan-500' },
                        { label: '燃烧效率', val: 94, color: 'bg-orange-500' },
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
                
                <button className="w-full py-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:from-orange-600/30 hover:to-red-600/30 transition-all shadow-lg shadow-orange-500/10">
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

export default ShipBoilerVibrationView;
