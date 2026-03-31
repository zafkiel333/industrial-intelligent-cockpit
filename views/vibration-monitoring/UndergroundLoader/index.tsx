import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/UndergroundLoader/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Truck, Zap, Activity, ShieldCheck, AlertCircle, Gauge, Thermometer, Wind } from 'lucide-react';
import { motion } from "framer-motion";

const mockLoaderData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 0.8 + Math.sin(i * 0.3) * 0.4 + Math.random() * 0.2,
  pressure: 180 + Math.random() * 20,
  temp: 60 + Math.random() * 10,
}));

const UndergroundLoaderView: React.FC = () => {
  const [loaderState, setLoaderState] = useState({
    vibration: 1.2,
    bucketAngle: -0.2,
    articulationAngle: 0.1,
    speed: 5,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLoaderState(prev => ({
        ...prev,
        vibration: 0.8 + Math.random() * 0.8,
        bucketAngle: Math.sin(Date.now() * 0.001) * 0.4,
        articulationAngle: Math.cos(Date.now() * 0.0005) * 0.3,
        speed: 5 + Math.random() * 10,
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Top Header & Quick Stats */}
      <div className="grid grid-cols-12 gap-4 h-24 shrink-0">
        <div className="col-span-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
            <Truck className="text-cyan-400" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white">地下铲运机震动监测</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Underground LHD Intelligent Monitoring System</p>
          </div>
        </div>
        
        <div className="col-span-8 grid grid-cols-4 gap-4">
          {[
            { label: '底盘振动', val: loaderState.vibration.toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
            { label: '液压压力', val: '21.4', unit: 'MPa', icon: Gauge, color: 'text-blue-400' },
            { label: '系统温度', val: '68.5', unit: '°C', icon: Thermometer, color: 'text-orange-400' },
            { label: '电池电量', val: '88', unit: '%', icon: Zap, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">{stat.val} <span className="text-xs font-normal opacity-50">{stat.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: 3D & Detailed Stats */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <SciFiCard title="铲运机动态数字孪生" subtitle="LHD DYNAMIC TWIN" className="flex-1 relative overflow-hidden" highlight>
            <ThreeScene state={loaderState} />
            
            {/* HUD Overlays */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
              <div className="bg-slate-900/80 p-3 border-r-4 border-cyan-500 rounded backdrop-blur-md">
                <div className="text-[10px] text-slate-500 uppercase">当前工况</div>
                <div className="text-lg font-bold text-cyan-400">重载爬坡 (8°)</div>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 grid grid-cols-2 gap-4 pointer-events-none">
              <div className="bg-slate-900/80 p-2 border border-slate-800 rounded backdrop-blur-md">
                <div className="text-[9px] text-slate-500 uppercase">铲斗角度</div>
                <div className="text-sm font-mono font-bold text-white">{(loaderState.bucketAngle * 57.3).toFixed(1)}°</div>
              </div>
              <div className="bg-slate-900/80 p-2 border border-slate-800 rounded backdrop-blur-md">
                <div className="text-[9px] text-slate-500 uppercase">铰接角度</div>
                <div className="text-sm font-mono font-bold text-white">{(loaderState.articulationAngle * 57.3).toFixed(1)}°</div>
              </div>
            </div>
          </SciFiCard>

          <div className="h-48 grid grid-cols-2 gap-4">
            <SciFiCard title="振动频谱分布" subtitle="VIBRATION SPECTRUM">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.from({length: 12}, (_, i) => ({f: i*10, v: Math.random()*10}))}>
                  <Bar dataKey="v" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  <XAxis dataKey="f" hide />
                  <YAxis hide />
                </BarChart>
              </ResponsiveContainer>
            </SciFiCard>
            <SciFiCard title="液压脉动分析" subtitle="HYDRAULIC PULSATION">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockLoaderData}>
                  <Area type="step" dataKey="pressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Analysis & Reports */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="实时振动趋势" subtitle="REAL-TIME VIBRATION TREND">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLoaderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能健康诊断" subtitle="AI HEALTH DIAGNOSIS" className="flex-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">整体健康度: 96.5%</div>
                    <div className="text-[10px] text-slate-500 uppercase">Status: Optimal</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  运行中
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  诊断报告摘要
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  当前处于重载爬坡工况，底盘低频振动分量有所增加，属于正常负载反馈。液压系统压力脉动平稳，未发现空化或内泄特征。建议关注左前轮悬挂阻尼状态，预计剩余寿命 1240 小时。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">下次保养</div>
                  <div className="text-sm font-bold text-white">2026-04-15</div>
                </div>
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">运行时长</div>
                  <div className="text-sm font-bold text-white">4,250 h</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-4">
                <button className="flex-1 py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-600/40 transition-all">
                  历史数据
                </button>
                <button className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">
                  参数配置
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default UndergroundLoaderView;
