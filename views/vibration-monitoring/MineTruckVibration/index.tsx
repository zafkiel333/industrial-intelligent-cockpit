import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineTruckVibration/ThreeScene';
import { TruckState } from '@/components/vibration-monitoring/MineTruckVibration/three-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Truck, Zap, Activity, ShieldCheck, AlertCircle, Gauge, Navigation, Weight } from 'lucide-react';
import { motion } from "framer-motion";

const mockTruckData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 0.5 + Math.sin(i * 0.4) * 0.3 + Math.random() * 0.2,
  stress: 120 + Math.random() * 30,
  suspension: 0.8 + Math.random() * 0.4,
}));

const radarData = [
  { subject: '左前悬挂', A: 120, fullMark: 150 },
  { subject: '右前悬挂', A: 98, fullMark: 150 },
  { subject: '左后悬挂', A: 86, fullMark: 150 },
  { subject: '右后悬挂', A: 99, fullMark: 150 },
  { subject: '主大梁', A: 85, fullMark: 150 },
  { subject: '驾驶室', A: 65, fullMark: 150 },
];

const MineTruckVibrationView: React.FC = () => {
  const [state, setState] = useState<TruckState>({
    vibration: 0.6,
    speed: 22.5,
    loadWeight: 240,
    suspensionHeight: 0,
    dumpAngle: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        vibration: 0.4 + Math.random() * 0.8,
        suspensionHeight: Math.sin(Date.now() * 0.002) * 0.2,
        speed: 20 + Math.random() * 5,
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-2xl backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
        <div className="flex items-center gap-5">
          <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <Truck className="text-yellow-400" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white">矿用卡车悬挂与车架振动监测</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Mine Truck Suspension & Frame Vibration Monitoring</span>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded border border-yellow-500/30">MT-790 CLASS</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-10">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前载重</div>
            <div className="text-2xl font-bold font-mono text-yellow-400">{state.loadWeight} <span className="text-xs font-normal opacity-50">T</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">行驶速度</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{state.speed.toFixed(1)} <span className="text-xs font-normal opacity-50">KM/H</span></div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left: 3D Visualization & Real-time Stats */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard title="卡车运行数字孪生" subtitle="TRUCK DYNAMIC TWIN" className="flex-1 relative" highlight>
            <ThreeScene state={state} />
            
            {/* HUD Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
              <div className="bg-slate-900/80 p-3 border-l-4 border-yellow-500 rounded backdrop-blur-md w-48">
                <div className="text-[10px] text-slate-500 uppercase mb-1">车架应力水平</div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-yellow-500"
                    animate={{ width: `${(state.vibration * 100) % 100}%` }}
                  />
                </div>
                <div className="text-sm font-mono font-bold text-yellow-400 mt-1">NORMAL</div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 grid grid-cols-2 gap-4 pointer-events-none">
              <div className="bg-slate-900/80 p-3 border border-slate-800 rounded-xl backdrop-blur-md">
                <div className="text-[9px] text-slate-500 uppercase mb-1">举升角度</div>
                <div className="text-lg font-mono font-bold text-white">{(state.dumpAngle * 57.3).toFixed(1)}°</div>
              </div>
              <div className="bg-slate-900/80 p-3 border border-slate-800 rounded-xl backdrop-blur-md">
                <div className="text-[9px] text-slate-500 uppercase mb-1">悬挂行程</div>
                <div className="text-lg font-mono font-bold text-white">{(state.suspensionHeight * 100).toFixed(1)} cm</div>
              </div>
            </div>
          </SciFiCard>
          
          <div className="grid grid-cols-4 gap-4 h-28 shrink-0">
            {[
              { label: '发动机转速', val: '1850', unit: 'RPM', icon: Zap, color: 'text-yellow-400' },
              { label: '轮胎压力', val: '7.2', unit: 'BAR', icon: Gauge, color: 'text-cyan-400' },
              { label: '燃油余量', val: '65', unit: '%', icon: Navigation, color: 'text-blue-400' },
              { label: '结构健康度', val: '98.2', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">{stat.val} <span className="text-xs font-normal opacity-50">{stat.unit}</span></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Analysis & Diagnostics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="悬挂振动实时曲线" subtitle="SUSPENSION VIBRATION">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTruckData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="vibration" stroke="#eab308" fillOpacity={1} fill="url(#colorVib)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="车架载荷分布" subtitle="FRAME LOAD DISTRIBUTION">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="应力" dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断建议" subtitle="AI DIAGNOSTICS" className="flex-1">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl">
                <div className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <AlertCircle size={16} />
                  诊断报告
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  当前处于满载行驶工况，车架中段纵梁处监测到异常扭转振动分量，初步分析为路面冲击引起的共振响应。建议检查悬挂氮气压力及液压阻尼器是否存在内泄。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">预计剩余寿命</div>
                  <div className="text-lg font-bold text-white">12,450 H</div>
                </div>
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">维护优先级</div>
                  <div className="text-lg font-bold text-yellow-400">MEDIUM</div>
                </div>
              </div>

              <button className="w-full py-4 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-600/40 transition-all mt-4">
                生成详细诊断报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MineTruckVibrationView;
