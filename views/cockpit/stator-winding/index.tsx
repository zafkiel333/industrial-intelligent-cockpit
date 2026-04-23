import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { StatorWindingThreeScene } from '../../../components/cockpit/stator-winding/ThreeScene';
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';
import { statorWindingSeries } from '../../../src/data/stator-winding/series-data';
import { ShieldCheck, Flame, Zap, Droplets, Activity } from 'lucide-react';

export const StatorWindingOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = statorWindingSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);
  const [prpdData, setPrpdData] = useState<any[]>([]);

  useEffect(() => {
    setHistory(statorWindingSeries.slice(0, 40).map((d, i) => ({
      time: `-${40-i}s`, 
      tempAvg: d.coreTempAvg, 
      flow: d.coolantFlowRate, 
      insulation: d.insulationResistance,
      dt: d.coolantOutletTemp - d.coolantInletTemp
    })));
    setCurrentIndex(39);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % statorWindingSeries.length;
        const nextData = statorWindingSeries[next];
        const timeStr = new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setHistory(h => [...h.slice(1), {
          time: timeStr,
          tempAvg: nextData.coreTempAvg, 
          flow: nextData.coolantFlowRate, 
          insulation: nextData.insulationResistance,
          dt: nextData.coolantOutletTemp - nextData.coolantInletTemp
        }]);

        // Accumulate PRPD points for realistic scatter build up, keeping last 200 points
        const newPrpdPoints = nextData.pdPhase.map((phase, idx) => ({
            phase: phase,
            amp: nextData.pdAmplitude[idx],
            cycle: next
        }));
        setPrpdData(curr => [...curr, ...newPrpdPoints].slice(-200));

        return next;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const maxTemp = Math.max(...data.slotTemps);
  const isDanger = data.overallStatus === 'danger';

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
       {/* Top Metrics Ribbon */}
       <div className="grid grid-cols-6 gap-3 shrink-0">
          <SciFiCard className="p-3 relative bg-slate-900/60 overflow-hidden" highlight={data.activePower > 800}>
             <div className="text-[10px] text-slate-400 mb-1">机组有功负荷实时匹配</div>
             <div className="text-2xl font-mono text-cyan-400">{data.activePower.toFixed(1)} <span className="text-xs">MW</span></div>
          </SciFiCard>
          <SciFiCard className="p-3 relative bg-slate-900/60 overflow-hidden">
             <div className="text-[10px] text-slate-400 mb-1">定子机端输出交流电压</div>
             <div className="text-2xl font-mono text-blue-400">{data.statorVoltage.toFixed(2)} <span className="text-xs">kV</span></div>
          </SciFiCard>
          <SciFiCard className={`p-3 relative overflow-hidden transition-colors ${maxTemp > 85 ? 'bg-orange-900/40 border-orange-500' : 'bg-slate-900/60'}`}>
             <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><Flame size={12}/>线棒峰值热点寻址</div>
             <div className={`text-2xl font-mono ${maxTemp > 85 ? 'text-orange-400 animate-pulse' : 'text-emerald-400'}`}>{maxTemp.toFixed(1)} <span className="text-xs">°C</span></div>
          </SciFiCard>
          <SciFiCard className="p-3 relative bg-slate-900/60 overflow-hidden">
             <div className="text-[10px] text-slate-400 mb-1">循环系统绝对流量</div>
             <div className="text-2xl font-mono text-emerald-400">{data.coolantFlowRate.toFixed(0)} <span className="text-xs">L/min</span></div>
          </SciFiCard>
          <SciFiCard className={`p-3 relative overflow-hidden transition-colors ${data.insulationResistance < 500 ? 'bg-red-900/40 border-red-500' : 'bg-slate-900/60'}`}>
             <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><Activity size={12}/>折算绝缘阻抗容差</div>
             <div className={`text-2xl font-mono ${data.insulationResistance < 500 ? 'text-red-400' : 'text-purple-400'}`}>{data.insulationResistance.toFixed(0)} <span className="text-xs">MΩ</span></div>
          </SciFiCard>
          <div className={`p-2 rounded border backdrop-blur flex items-center gap-3 transition-colors ${isDanger ? 'bg-red-900/60 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : data.overallStatus === 'warning' ? 'bg-amber-900/40 border-amber-500' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
             {isDanger ? <Zap className="text-red-400 animate-pulse" size={24}/> : <ShieldCheck className="text-emerald-400" size={24}/>}
             <div>
               <div className={`text-[10px] ${isDanger ? 'text-red-200' : 'text-slate-400'}`}>绝缘栅极保护连锁诊断</div>
               <div className={`text-md font-bold ${isDanger ? 'text-red-400' : data.overallStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                 {isDanger ? '检测到高频局部放电' : data.overallStatus === 'warning' ? '热力穿透预警' : '电涌与热态完全稳定'}
               </div>
             </div>
          </div>
       </div>

       {/* Main Content Splitting */}
       <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          
          {/* Left Panel: Slot Temps & PRPD */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
             <SciFiCard title="定子槽位高维相变阵列 (°C)" className="flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-2 h-full py-2">
                   {data.slotTemps.map((temp, idx) => (
                      <div key={idx} className="bg-slate-900/40 border border-slate-700/50 p-2 rounded flex flex-col justify-between">
                         <div className="text-[10px] text-slate-400">槽位 #{(idx*6 + 1).toString().padStart(2, '0')} 区</div>
                         <div className={`text-xl font-mono text-right ${temp > 85 ? 'text-orange-400' : temp > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>{temp.toFixed(1)}</div>
                         {/* Mini bar */}
                         <div className="w-full bg-slate-800 h-1 mt-1 rounded"><div className={`h-full ${temp > 85 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, (temp/120)*100)}%`}}/></div>
                      </div>
                   ))}
                </div>
             </SciFiCard>

             <SciFiCard title="UHF 局部放电 PRPD 定相云图" className="flex-[1.5] min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                     <XAxis type="number" dataKey="phase" name="相位" domain={[0, 360]} tick={{fill: '#64748b', fontSize: 10}}>
                       {/* Simulate the 50Hz sine wave underneath intuitively using reference areas or just ticks */}
                     </XAxis>
                     <YAxis type="number" dataKey="amp" name="频幅(mV)" domain={[0, 400]} tick={{fill: '#64748b', fontSize: 10}} />
                     <Tooltip cursor={{strokeDasharray: '1 1'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} />
                     
                     {/* Background Sine Wave Guide */}
                     <ReferenceLine x={90} stroke="#3b82f6" strokeOpacity={0.2} label={{ position: 'top', value: 'V+', fill: '#3b82f6', fontSize: 8 }} />
                     <ReferenceLine x={270} stroke="#ef4444" strokeOpacity={0.2} label={{ position: 'top', value: 'V-', fill: '#ef4444', fontSize: 8 }} />

                     <Scatter name="放电脉冲" data={prpdData} fill="#f59e0b" shape="circle" fillOpacity={0.6}>
                     </Scatter>
                  </ScatterChart>
               </ResponsiveContainer>
               {isDanger && <div className="absolute top-8 right-4 bg-red-900/50 border border-red-500 text-red-300 text-[9px] px-2 py-1 rounded animate-pulse">侦测到电晕树枝化放电聚群</div>}
             </SciFiCard>
          </div>

          {/* Center Panel: 3D Visualization */}
          <SciFiCard className="col-span-12 lg:col-span-6 p-0 relative border-slate-700 bg-[#000511] min-h-0 overflow-hidden">
             <div className="absolute inset-0 z-0">
               <StatorWindingThreeScene slotTemps={data.slotTemps} />
             </div>
             <div className="absolute top-4 left-4 z-10 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700 backdrop-blur pointer-events-none">
               <div className="text-xl font-bold text-slate-200">全息定子绕组与空冷流体场孪生模型</div>
               <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Holographic Stator & Winding Thermal Field Digital Twin</div>
             </div>
             
             <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-700/50 backdrop-blur flex justify-between gap-6 items-center">
                   <div className="text-[10px] text-slate-400">平均铁芯暗火基重</div>
                   <div className="text-xl font-mono text-orange-300">{data.coreTempAvg.toFixed(1)} <span className="text-[10px] text-slate-500">°C</span></div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-cyan-800/50 backdrop-blur flex justify-between gap-6 items-center">
                   <div className="text-[10px] text-cyan-400 flex items-center gap-1"><Droplets size={12}/>空冷器温降换热效能 (ΔT)</div>
                   <div className="text-xl font-mono text-cyan-300">{(data.coolantOutletTemp - data.coolantInletTemp).toFixed(2)} <span className="text-[10px] text-cyan-700">°C</span></div>
                </div>
             </div>
          </SciFiCard>

          {/* Right Panel: Coolant & Insulation Trending */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
             <SciFiCard title="绝缘栅阻抗逆降走势域 (MΩ)" className="flex-[1.5] min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                         <linearGradient id="insulGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                           <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#a855f7" fontSize={9} domain={[300, 1000]} />
                      <ReferenceLine y={500} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: '绝缘击穿临界点', fill: '#ef4444', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="insulation" stroke="#a855f7" fill="url(#insulGrad)" isAnimationActive={false} />
                   </AreaChart>
                </ResponsiveContainer>
             </SciFiCard>
             
             <SciFiCard title="主纯水背流换热温差幅图 (ΔT °C)" className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#06b6d4" fontSize={9} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', fontSize: '10px' }} />
                      <Line type="stepAfter" dataKey="dt" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                   </LineChart>
                </ResponsiveContainer>
             </SciFiCard>
          </div>
       </div>

    </div>
  );
};
