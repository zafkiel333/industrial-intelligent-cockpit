import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/OpenPitSlope/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-open-pit-slope]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-open-pit-slope';
import { SlopeState, SlopePoint } from '@/components/computer-visual-inspection/OpenPitSlope/three-types';
import { 
  Mountain, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Radar,
  Maximize2,
  Clock,
  CloudRain,
  ShieldCheck
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

const INITIAL_POINTS: SlopePoint[] = [
  { id: 'P-01', position: [5, 2, 3], displacement: 12.4, velocity: 0.5 },
  { id: 'P-02', position: [-2, 4, 1], displacement: 45.2, velocity: 2.1 },
  { id: 'P-03', position: [8, -3, 2], displacement: 5.8, velocity: 0.2 },
  { id: 'P-04', position: [-6, -5, 4], displacement: 22.1, velocity: 1.2 },
];

const MOCK_TREND_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${i}:00`,
  displacement: 10 + i * 2 + Math.random() * 5
}));

const OpenPitSlopeView: React.FC = () => {
  const [state, setState] = useState<SlopeState>({
    maxDisplacement: 45.2,
    avgVelocity: 1.0,
    safetyFactor: 1.42,
    points: INITIAL_POINTS
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        maxDisplacement: prev.maxDisplacement + Math.random() * 0.1,
        avgVelocity: 0.8 + Math.random() * 0.4,
        points: prev.points.map(p => ({
          ...p,
          displacement: p.displacement + Math.random() * 0.05,
          velocity: p.velocity + (Math.random() - 0.5) * 0.1
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
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Mountain className="text-emerald-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">露天矿边坡稳定性视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> SLOPE_RADAR_AI_V2
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Status: Monitoring Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Safety Level: Stable</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Stability Metrics */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Radar size={14} className="text-emerald-400" /> 边坡位移实时分布
            </h3>
            <div className="space-y-4">
              {state.points.map((point, i) => (
                <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{point.id} 监测区</span>
                    <span className={`text-[10px] font-bold ${point.displacement > 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {point.displacement > 40 ? '高风险' : '正常'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-black text-white">{point.displacement.toFixed(1)} <span className="text-xs font-normal text-slate-500">mm</span></div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <TrendingUp size={12} className="text-indigo-400" /> {point.velocity.toFixed(2)} mm/d
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${point.displacement > 40 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (point.displacement / 60) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" /> 核心稳定性指标
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '最大累计位移', value: `${state.maxDisplacement.toFixed(1)} mm`, icon: Zap, color: 'text-yellow-400' },
                { label: '平均变形速率', value: `${state.avgVelocity.toFixed(2)} mm/d`, icon: Activity, color: 'text-indigo-400' },
                { label: '安全稳定系数', value: state.safetyFactor.toFixed(2), icon: ShieldCheck, color: 'text-emerald-400' },
                { label: '降雨量影响因子', value: '0.12', icon: CloudRain, color: 'text-blue-400' },
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
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Terrain Scan Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-emerald-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-emerald-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">监测面积</p>
                <div className="text-2xl font-black text-white">2.4 km²</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">数据刷新率</p>
                <div className="text-2xl font-black text-emerald-400">0.5 Hz</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">传感器在线</p>
                <div className="text-2xl font-black text-white">12/12</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">预警状态</p>
                <div className="text-2xl font-black text-emerald-400">NORMAL</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> 边坡位移趋势曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="displacement" stroke="#10b981" fillOpacity={1} fill="url(#colorDisp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Risk & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> 风险评估报告
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-2">局部变形预警</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  P-02 监测点位移速率近期有所增加，初步判断受降雨渗透影响。建议加强该区域的巡检频率。
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-2">整体稳定性</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  当前边坡整体安全系数处于安全区间，未发现大规模滑坡迹象。
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
                { time: '16:45:12', msg: 'AI 识别: 边坡裂缝宽度增加 0.2mm', type: 'warn' },
                { time: '15:30:00', msg: '三维激光扫描数据处理完成', type: 'info' },
                { time: '14:15:30', msg: '气象站数据同步: 降雨量 12mm', type: 'info' },
                { time: '12:00:00', msg: '系统自检: 视觉传感器状态正常', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20">
              导出稳定性分析报告
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

export default OpenPitSlopeView;
