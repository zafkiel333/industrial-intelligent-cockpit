import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/TruckTire/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-truck-tire]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-truck-tire';
import { TruckTireState, TireData } from '@/components/computer-visual-inspection/TruckTire/three-types';
import { 
  Circle, 
  Activity, 
  AlertCircle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Thermometer,
  Maximize2,
  Clock,
  Gauge,
  Truck
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
  Area
} from 'recharts';

const INITIAL_TIRES: TireData[] = [
  { id: 'FL', pressure: 105, temperature: 52, wearLevel: 0.25, isCritical: false },
  { id: 'FR', pressure: 102, temperature: 55, wearLevel: 0.28, isCritical: false },
  { id: 'RL', pressure: 108, temperature: 62, wearLevel: 0.45, isCritical: false },
  { id: 'RR', pressure: 110, temperature: 65, wearLevel: 0.48, isCritical: false },
];

const MOCK_TEMP_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${i}:00`,
  temp: 50 + Math.random() * 20
}));

const TruckTireView: React.FC = () => {
  const [state, setState] = useState<TruckTireState>({
    truckId: 'TRUCK-085',
    speed: 45,
    load: 120,
    tires: INITIAL_TIRES
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        speed: 40 + Math.random() * 10,
        tires: prev.tires.map(t => ({
          ...t,
          temperature: t.temperature + (Math.random() - 0.5) * 2,
          pressure: t.pressure + (Math.random() - 0.5) * 1
        }))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <Circle className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">矿用卡车胎压与磨损视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> TIRE_SCAN_AI_V4
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Truck ID: {state.truckId}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Real-time Telemetry</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Tire Metrics */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Gauge size={14} className="text-blue-400" /> 轮胎实时参数
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {state.tires.map((tire, i) => (
                <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{tire.id}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${tire.temperature > 70 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-xl font-black text-white">{tire.pressure.toFixed(0)} <span className="text-[8px] font-normal text-slate-500">PSI</span></div>
                  <div className="text-xs text-blue-400 mt-1">{tire.temperature.toFixed(1)}°C</div>
                  <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${(1 - tire.wearLevel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Truck size={14} className="text-blue-400" /> 车辆运行状态
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '当前行驶速度', value: `${state.speed.toFixed(1)} km/h`, icon: Zap, color: 'text-yellow-400' },
                { label: '整车负载', value: `${state.load} t`, icon: Activity, color: 'text-indigo-400' },
                { label: '平均胎温', value: '58.5 °C', icon: Thermometer, color: 'text-red-400' },
                { label: '预计维护里程', value: '1,240 km', icon: Clock, color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-xl font-black text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="flex-[2] bg-[#0f172a]/40 border border-slate-800 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <ThreeScene state={state} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-6 left-6 z-10 space-y-3">
              <div className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">Thermal Twin Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-blue-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-blue-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">胎面最高温</p>
                <div className="text-2xl font-black text-white">72.4 °C</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">识别置信度</p>
                <div className="text-2xl font-black text-emerald-400">98.8%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计里程</p>
                <div className="text-2xl font-black text-white">45,200 km</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">安全状态</p>
                <div className="text-2xl font-black text-blue-400">NORMAL</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-400" /> 胎温变化趋势曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TEMP_DATA}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400" /> 智能维护建议
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-2">换位提醒</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到后轮磨损程度明显高于前轮，建议在下个维护周期进行前后轮换位，以延长整体使用寿命。
                </p>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-2">胎压调整建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  FR 轮胎压力略低于标准值，建议补气至 110 PSI，以降低滚动阻力并减少发热。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 监测事件日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '15:20:12', msg: 'AI 识别: RL 轮胎发现轻微切口', type: 'warn' },
                { time: '14:15:30', msg: '胎压传感器数据同步完成', type: 'info' },
                { time: '12:45:12', msg: '系统自检: 热成像传感器校准成功', type: 'info' },
                { time: '10:30:00', msg: '车辆负载数据更新: 120t', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20">
              生成轮胎健康报告
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default TruckTireView;
