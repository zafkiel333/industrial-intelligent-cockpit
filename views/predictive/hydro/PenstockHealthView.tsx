import React, { useState, useEffect } from 'react';
import { PenstockScene } from '../../../components/predictive/hydro-penstock/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, Legend, Cell
} from 'recharts';
import { 
  Activity, Gauge, MoveHorizontal, AlertOctagon, 
  Layers, Waves, ShieldCheck, Ruler, 
  Minimize2, Maximize2, Zap, ArrowDownToLine
} from 'lucide-react';

const PRESSURE_DATA = Array.from({length: 100}, (_, i) => {
    const t = i;
    let pressure = 5.2; 
    if (t > 40 && t < 70) {
        pressure += 2.5 * Math.exp(-(t-40)/5) * Math.cos((t-40)*0.5);
    }
    return { time: t, pressure, limit: 7.5 };
});

const THICKNESS_DATA = Array.from({length: 50}, (_, i) => {
    // Fix: Declare dist in scope before using it in thickness calculation
    const dist = i * 10;
    return {
        dist: dist,
        thickness: 30 - (dist > 200 && dist < 250 ? 1.5 : Math.random() * 0.5),
        limit: 24
    };
});

export const PenstockHealthView: React.FC = () => {
  const [metrics, setMetrics] = useState({
      pressure: 5.2,
      flow: 120,
      stress: 145,
      vibration: 1.2,
      jointDisp: 12,
      thicknessMin: 28.5,
  });

  const [simState, setSimState] = useState({ isHammering: false, pulsePos: 0, showInternal: false });

  useEffect(() => {
    const interval = setInterval(() => {
        let p = 5.2;
        let pulse = simState.pulsePos;
        let hammering = simState.isHammering;
        if (Math.random() > 0.98 && !hammering) { hammering = true; pulse = 0; }
        if (hammering) {
            pulse += 0.02;
            p = 5.2 + 2.5 * Math.sin(pulse * Math.PI * 4) * Math.exp(-pulse*2);
            if (pulse >= 1) { hammering = false; pulse = 0; p = 5.2; }
        }
        setMetrics(prev => ({
            ...prev,
            pressure: p + (Math.random()-0.5)*0.05,
            stress: (p / 7.5) * 200 + (Math.random()-0.5)*2,
            vibration: 1.2 + (hammering ? 2.5 : 0) + (Math.random()-0.5)*0.1,
            jointDisp: 12 + (p - 5.2) * 2,
        }));
        setSimState(prev => ({ ...prev, isHammering: hammering, pulsePos: pulse }));
    }, 50);
    return () => clearInterval(interval);
  }, [simState.isHammering, simState.pulsePos]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0b121e] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end border-b border-slate-700 pb-4 bg-gradient-to-r from-[#1e293b] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <ArrowDownToLine size={14} className="animate-pulse" />
             High Pressure Conduit Surveillance
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             压力钢管 <span className="text-blue-500">结构健康状态评估</span>
          </h1>
        </div>
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">环向应力 (Hoop Stress)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.stress > 250 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{metrics.stress.toFixed(1)} MPa</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">管壁最小厚度</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.thicknessMin.toFixed(1)} mm</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="管壁减薄趋势" subtitle="CORROSION SCAN" className="h-[300px] border-slate-700 bg-[#0f172a]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={THICKNESS_DATA} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                           <XAxis type="number" domain={[20, 32]} stroke="#94a3b8" tick={{fontSize: 10}} />
                           <YAxis dataKey="dist" type="number" stroke="#94a3b8" tick={{fontSize: 10}} />
                           <Area type="monotone" dataKey="thickness" stroke="#3b82f6" fill="#1e3a8a" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
           <SciFiCard title="伸缩节位移监测" className="flex-1 border-slate-700">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <MoveHorizontal size={16} className="text-yellow-500" />
                           <span className="text-xs text-slate-300">轴向位移量</span>
                       </div>
                       <span className="text-xl font-mono text-white font-bold">{metrics.jointDisp.toFixed(1)} mm</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className={`h-full ${metrics.jointDisp > 18 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(metrics.jointDisp/25)*100}%`}}></div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           <div className="flex-1 min-h-[400px] bg-[#020202] border border-blue-900/30 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(30,58,138,0.2)]">
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setSimState(s => ({...s, showInternal: !s.showInternal}))} className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${simState.showInternal ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/50 border-slate-600 text-slate-400'}`}>
                       {simState.showInternal ? '透视模式 (ON)' : '实体视图'}
                   </button>
               </div>
               {simState.isHammering && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-pulse">
                       <Waves size={48} className="text-red-500" />
                       <span className="text-red-500 font-bold bg-black/80 px-4 py-1 rounded mt-2 border border-red-500 uppercase">Pressure Transient Detected</span>
                   </div>
               )}
               <PenstockScene pressure={metrics.pressure} flowRate={metrics.flow} stressFactor={metrics.stress/300} vibration={metrics.vibration/10} showInternal={simState.showInternal} waterHammerPulse={simState.pulsePos} jointDisplacement={metrics.jointDisp} />
           </div>
           <SciFiCard title="动态压力脉动监测" subtitle="WATER HAMMER" className="h-[250px] border-slate-700" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PRESSURE_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 10]} />
                           <ReferenceLine y={7.5} stroke="red" strokeDasharray="3 3" label={{value: '极限压力', fill: 'red', fontSize: 10}} />
                           <Area type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e922" isAnimationActive={false} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="风险预警矩阵" className="flex-1 border-slate-700">
               <div className="flex flex-col gap-4">
                   <div className="p-3 rounded border border-red-900/30 bg-red-900/10 flex items-start gap-3">
                       <AlertOctagon size={20} className="text-red-500 shrink-0" />
                       <div className="text-xs">
                           <div className="font-bold text-red-300">屈服强度预警</div>
                           <p className="text-slate-400 mt-1">检测到瞬态水击压力下，弯头部位应力集中系数达到 0.72。建议限制机组甩负荷速率。</p>
                       </div>
                   </div>
                   <button className="w-full py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/50 rounded text-xs text-blue-200 transition-colors flex items-center justify-center gap-2">
                       <ShieldCheck size={14} /> 生成结构安全报告
                   </button>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
