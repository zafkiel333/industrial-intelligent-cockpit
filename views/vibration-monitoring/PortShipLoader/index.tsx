import React, { useState, useEffect } from 'react';
import { ThreeScene } from '@/components/vibration-monitoring/PortShipLoader/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PortShipLoader]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PortShipLoader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, Thermometer, Layers, RotateCw, Settings, Anchor, Wind, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShipLoaderState } from '@/components/vibration-monitoring/PortShipLoader/three-types';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 1.8 + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.1,
  freq: 44 + Math.random() * 3,
  rate: 2450 + Math.random() * 100,
}));

const PortShipLoaderView: React.FC = () => {
  const [state, setState] = useState<ShipLoaderState>({
    vibrationFrequency: 45.5,
    vibrationAmplitude: 1.9,
    motorLoad: 78,
    boomAngle: 12,
    loadingRate: 2550
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        vibrationFrequency: 40 + Math.random() * 10,
        vibrationAmplitude: 1.5 + Math.random() * 1.0,
        motorLoad: 70 + Math.random() * 15,
        boomAngle: 10 + Math.random() * 10,
        loadingRate: 2000 + Math.random() * 1000,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] p-6 gap-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
            <ArrowUpRight className="text-cyan-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">港口装船机震动监测</h1>
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">LOADER-SYSTEM-V4</div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase">系统运行中</span>
          </div>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">2026-03-30 01:42</div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-6 overflow-hidden">
        {/* Left Stats */}
        <div className="col-span-1 row-span-2 flex flex-col gap-6">
          <div className="flex-1 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">装船速率</div>
            <div className="text-4xl font-black text-cyan-400 font-mono">{state.loadingRate.toFixed(0)} <span className="text-sm font-normal opacity-50">t/h</span></div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="#06b6d420" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-1 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">臂架角度</div>
            <div className="text-4xl font-black text-yellow-400 font-mono">{state.boomAngle.toFixed(1)} <span className="text-sm font-normal opacity-50">°</span></div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(state.boomAngle / 30) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="col-span-2 row-span-2 bg-slate-900/20 border border-slate-800 rounded-[40px] relative overflow-hidden group">
          <div className="absolute inset-0 z-0"><ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div></div>
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl flex items-center gap-3">
              <Activity className="text-cyan-400" size={16} />
              <span className="text-xs font-bold text-white">实时震动烈度: {(state.vibrationAmplitude * 1.2).toFixed(2)} mm/s</span>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 z-10">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/60 backdrop-blur-md relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="377" strokeDashoffset={377 - (377 * 0.85)} strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <div className="text-2xl font-black text-white">85<span className="text-[10px]">%</span></div>
                <div className="text-[8px] text-slate-500 font-bold uppercase">健康度</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stats */}
        <div className="col-span-1 row-span-2 flex flex-col gap-6">
          <div className="flex-1 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">电机负载</div>
            <div className="text-4xl font-black text-emerald-400 font-mono">{state.motorLoad.toFixed(1)} <span className="text-sm font-normal opacity-50">%</span></div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>当前功率</span>
                <span>450 kW</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
          <div className="flex-1 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">振动频谱</div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="step" dataKey="amplitude" stroke="#f59e0b" fill="#f59e0b10" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
          <div className="flex gap-12">
            {[
              { label: '回转角度', val: '42.5°', icon: RotateCw },
              { label: '环境温度', val: '24°C', icon: Thermometer },
              { label: '系统风速', val: '5.2m/s', icon: Wind },
              { label: '累计运量', val: '12.5k t', icon: Layers },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <item.icon size={18} className="text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</div>
                  <div className="text-lg font-black text-white">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-cyan-500 text-slate-900 text-xs font-black uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">导出报告</button>
            <button className="px-6 py-2 bg-slate-800 text-white text-xs font-black uppercase rounded-xl border border-slate-700">系统设置</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortShipLoaderView;
