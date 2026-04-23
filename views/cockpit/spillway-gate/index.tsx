import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { SpillwayThreeScene } from '../../../components/cockpit/spillway-gate/ThreeScene';
import { Activity, Droplets, Waves, AlertTriangle, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';

import { SpillwayGateData } from '../../../src/data/spillway-gate/types';
import { spillwaySeriesData } from '../../../src/data/spillway-gate/spillway-series-data';

export const SpillwayGateOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = spillwaySeriesData[currentIndex];
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fill initial history
    const initialHistory = spillwaySeriesData.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`,
      opening: d.openingPercentage,
      flow: d.dischargeFlow,
      stressL: d.armStressLeft,
      stressR: d.armStressRight,
      upstream: d.upstreamLevel
    }));
    setHistory(initialHistory);
    setCurrentIndex(19);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % spillwaySeriesData.length;
        const nextData = spillwaySeriesData[next];
        
        setHistory(h => {
          const newH = [...h.slice(1), {
            time: new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' }),
            opening: nextData.openingPercentage,
            flow: nextData.dischargeFlow,
            stressL: nextData.armStressLeft,
            stressR: nextData.armStressRight,
            upstream: nextData.upstreamLevel
          }];
          return newH;
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400';
      case 'warning': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-900/40 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
      case 'warning': return 'bg-orange-900/40 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.4)]';
      case 'critical': return 'bg-red-900/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse';
      default: return 'bg-slate-900/40 border-slate-500/50';
    }
  };

  if (!data) return null;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Metrics Rows */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Cpu size={16}/> 通信机理状态</div>
          <div className="text-3xl font-[Rajdhani] font-bold text-cyan-400 flex items-center gap-2">
            ONL <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">在线</span>
          </div>
        </SciFiCard>
        
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Activity size={16}/> 闸门开度控制</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.openingPercentage > 90 ? 'text-orange-400' : 'text-blue-400'}`}>
            {data.openingPercentage.toFixed(1)} <span className="text-sm text-slate-500">%</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Waves size={16}/> 库前实时水位</div>
          <div className="text-3xl font-[Rajdhani] font-bold text-cyan-500">
            {data.upstreamLevel.toFixed(2)} <span className="text-sm text-slate-500">m</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/20" style={{opacity: data.dischargeFlow / 1500}}></div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 relative z-10"><Droplets size={16}/> 下泄推算总流</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`text-3xl font-[Rajdhani] font-bold ${data.dischargeFlow > 1000 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {data.dischargeFlow.toFixed(0)} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">m³/s</span>
            </div>
          </div>
        </SciFiCard>

        <div className={`p-4 rounded-xl border backdrop-blur flex flex-col justify-center items-center transition-all duration-300 ${getStatusBgColor(data.healthStatus)}`}>
          <ShieldAlert size={28} className={`mb-2 ${getStatusColor(data.healthStatus)}`}/>
          <div className={`text-lg font-bold tracking-widest ${getStatusColor(data.healthStatus)} drop-shadow-lg`}>
            {data.healthStatus === 'optimal' ? '结构应力安全' : data.healthStatus === 'warning' ? '支臂应力告警' : '极大形变危急!'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        {/* Left Col: Hydraulic & Cylinder */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="液压缸压力双路侦测 (MPa)" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 25]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                  <Bar dataKey="cylinderPressureLeft" name="左油缸伸缩压力" fill="#3b82f6" opacity={0.8} />
                  <Line type="stepAfter" dataKey="cylinderPressureRight" name="右油缸伸缩压力" stroke="#38bdf8" strokeWidth={2} dot={false} />
               </ComposedChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="面板流激振动分析" className="h-[250px]">
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="w-full relative h-[120px] bg-slate-900 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="z-10 flex flex-col items-center">
                  <div className={`text-4xl font-mono font-bold ${data.vibration > 25 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                    {data.vibration.toFixed(1)} 
                  </div>
                  <div className="text-slate-500 text-sm mt-1 mb-2">Hz / 实时表面震波频率</div>
                </div>
                {/* Visualizer bars */}
                <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end gap-1 px-2 opacity-50">
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="flex-1 bg-cyan-500 transition-all duration-75" style={{ height: `${Math.random() * Math.min(100, data.vibration * 3)}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Col: 3D Twin */}
        <SciFiCard title="SPILLWAY GATE 泄洪道控制机房数字孪生" className="col-span-2 relative overflow-hidden p-0 border border-slate-700/50">
          <div className="absolute inset-0 z-0">
             <SpillwayThreeScene opening={data.openingPercentage} vibration={data.vibration} />
          </div>
          {/* Top-left HUD layer */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <div className="bg-slate-900/60 backdrop-blur border-l-2 border-cyan-500 p-2 mb-2">
                 <div className="text-[10px] text-cyan-500 mb-1 tracking-widest uppercase">Drive System</div>
                 <div className="text-xs text-slate-300 font-mono">STATUS: {data.gateStatus.toUpperCase()}</div>
                 <div className="text-xs text-slate-300 font-mono">MOTOR CUR: {data.motorCurrent.toFixed(1)} A</div>
             </div>
          </div>
        </SciFiCard>

        {/* Right Col: Arm Stress & Opening profile */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="径向支臂全流程偏载追踪 (MPa)" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#f43f5e" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#e11d48' }} />
                  <Area type="monotone" dataKey="stressL" name="左支臂受力" stroke="#e11d48" strokeWidth={2} fill="url(#colorStress)" />
                  <Line type="monotone" dataKey="stressR" name="右支臂受力" stroke="#fb923c" strokeWidth={2} dot={false} />
               </AreaChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="下泄流量突变曲线 (m³/s)" className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#10b981" fontSize={10} domain={[-100, 2000]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} />
                  <Area type="monotone" dataKey="flow" name="流量估算模型" stroke="#34d399" strokeWidth={2} fill="url(#colorFlow)" />
               </AreaChart>
             </ResponsiveContainer>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
