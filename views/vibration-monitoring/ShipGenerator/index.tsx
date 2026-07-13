import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  RotateCw, 
  Settings, 
  AlertTriangle,
  Cpu,
  Database,
  Globe,
  Battery,
  Bolt,
  Waves
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ShipGenerator/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ShipGenerator]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ShipGenerator';
import { GeneratorState } from '@/components/vibration-monitoring/ShipGenerator/three-types';

const ShipGeneratorView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('realtime');
  const [state, setState] = useState<GeneratorState>({
    rpm: 1200,
    vibrationIntensity: 0.12,
    outputPower: 450,
    windingTemp: 68,
    voltage: 440
  });

  // Generate mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString().slice(-8),
        vibration: (0.1 + Math.random() * 0.05).toFixed(3),
        rpm: (1195 + Math.random() * 10).toFixed(0),
        power: (440 + Math.random() * 20).toFixed(1),
        temp: (65 + Math.random() * 8).toFixed(1),
        voltage: (438 + Math.random() * 4).toFixed(1),
      };
      setVibrationData(prev => [...prev.slice(-19), newData]);
      setState({
        rpm: parseInt(newData.rpm),
        vibrationIntensity: parseFloat(newData.vibration),
        outputPower: parseFloat(newData.power),
        windingTemp: parseFloat(newData.temp),
        voltage: parseFloat(newData.voltage)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '发电机转速', value: state.rpm.toFixed(0), unit: 'RPM', icon: RotateCw, color: 'text-cyan-400' },
    { label: '振动烈度', value: state.vibrationIntensity.toFixed(3), unit: 'mm/s', icon: Activity, color: 'text-amber-400' },
    { label: '输出功率', value: state.outputPower.toFixed(1), unit: 'kW', icon: Zap, color: 'text-emerald-400' },
    { label: '绕组温度', value: state.windingTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-cyan-900/50 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Battery className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              船舶发电机 <span className="text-cyan-500">数字孪生监测</span>
            </h1>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              <span className="flex items-center gap-1"><Globe size={12} className="text-cyan-600" /> 船名: 远洋号 (OCEAN-01)</span>
              <span className="flex items-center gap-1"><Waves size={12} className="text-blue-600" /> 机舱位置: ENGINE ROOM L-02</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">当前输出电压</div>
            <div className="text-3xl font-black font-mono text-white flex items-baseline gap-2">
              {state.voltage.toFixed(1)}
              <span className="text-sm font-normal text-slate-500 uppercase tracking-normal">V</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/5">
            {['REALTIME', 'HARMONIC', 'DIAGNOSTIC'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t.toLowerCase())}
                className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded transition-all ${
                  activeTab === t.toLowerCase() 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 p-6 overflow-hidden relative">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel: Metrics */}
          <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-cyan-500/30 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-800/50 ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black font-mono tracking-tight ${m.color}`}>{m.value}</span>
                  <span className="text-xs text-slate-600 font-bold uppercase">{m.unit}</span>
                </div>
                <div className="mt-4 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${m.color.replace('text', 'bg')}`}
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
            
            <SciFiCard title="电能质量分析" className="mt-2">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">频率稳定性</span>
                  <span className="text-emerald-400">60.02 Hz</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full border border-white/5 relative overflow-hidden">
                   <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2" />
                   <motion.div 
                     className="absolute top-0 bottom-0 w-2 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                     animate={{ left: '50.2%' }}
                   />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">谐波失真 (THD)</span>
                  <span className="text-slate-500">1.2 %</span>
                </div>
              </div>
            </SciFiCard>
          </aside>

          {/* Central 3D Viewport */}
          <section className="flex-1 relative rounded-[40px] bg-slate-900/20 border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Viewport Overlays */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">
                    <div className="text-cyan-400">3D 数字孪生同步</div>
                    <div className="text-slate-500">GENSET ID: AUX-01-STARBOARD</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none">
              <div className="p-6 bg-slate-950/80 border border-white/10 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">发电机轴承振动轨迹</div>
                <div className="flex gap-2 items-end h-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`w-2 rounded-full ${i % 3 === 0 ? 'bg-amber-500/60' : 'bg-cyan-500/30'}`}
                      animate={{ height: [15, 35, 25, 45][i % 4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[40px] pointer-events-none" />
          </section>

          {/* Right Panel: Analytics */}
          <aside className="w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pl-2">
            <SciFiCard title="振动频谱分析">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <defs>
                      <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 0.2]} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard title="AI 故障预测" className="flex-1">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">系统状态: 优</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    发电机组运行参数稳定。振动频谱未见明显的轴承磨损或转子不平衡特征。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">维护建议</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    建议在下次靠港期间对联轴器进行例行检查。当前绕组温度正常，冷却系统效能良好。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">最近报警记录</div>
                  <div className="space-y-2">
                    {[
                      { time: '02:45', msg: '瞬时负载波动补偿', type: 'info' },
                      { time: 'Yesterday', msg: '燃油滤清器压差正常', type: 'success' },
                      { time: 'Mar 28', msg: '系统自检程序完成', type: 'info' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SciFiCard>
          </aside>
        </div>

        {/* Bottom Control Panel */}
        <footer className="h-20 bg-slate-900/40 border border-white/5 rounded-[25px] flex items-center px-10 gap-12">
          <div className="flex items-center gap-6">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">系统控制</div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Settings size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <Bolt size={18} />
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 flex justify-around">
            {[
              { label: '燃油消耗率', val: '195', unit: 'g/kWh' },
              { label: '滑油压力', val: '0.45', unit: 'MPa' },
              { label: '冷却水温', val: '78', unit: '°C' },
              { label: '排气温度', val: '380', unit: '°C' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{item.label}</div>
                <div className="text-xl font-black font-mono text-white">{item.val} <span className="text-xs font-normal opacity-30">{item.unit}</span></div>
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">数据链路</div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Satellite / Encrypted</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ShipGeneratorView;
