import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ExcitationBrushThreeScene } from '../../../components/cockpit/excitation-brush/ThreeScene';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { excitationBrushSeries } from '../../../src/data/excitation-brush/series-data';
import { Zap, Activity, ThermometerSun, AlertOctagon } from 'lucide-react';

export const ExcitationBrushOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = excitationBrushSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(excitationBrushSeries.slice(0, 40).map((d, i) => ({
      time: `-${40-i}s`, 
      temp: d.slipRingTemp, 
      spark: d.sparkIntensity,
      current: d.excitationCurrent
    })));
    setCurrentIndex(39);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % excitationBrushSeries.length;
        const nextData = excitationBrushSeries[next];
        const timeStr = new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setHistory(h => [...h.slice(1), {
          time: timeStr,
          temp: nextData.slipRingTemp, 
          spark: nextData.sparkIntensity,
          current: nextData.excitationCurrent
        }]);

        return next;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const isDanger = data.overallStatus === 'danger';
  
  const fftData = data.currentHarmonics.map((v, i) => ({ freq: i === 0 ? 'DC' : `${i*50}Hz`, amp: v }));

  return (
    <div className="h-full grid grid-flow-col grid-cols-12 grid-rows-12 gap-4 overflow-hidden">
       
       {/* ----------------- LEFT COLUMN (4 spans width) ----------------- */}
       <div className="col-span-12 lg:col-span-3 row-span-12 flex flex-col gap-4 min-h-0">
          <SciFiCard className="p-4 relative bg-slate-900/60 overflow-hidden flex flex-col items-center justify-center shrink-0">
             <div className="text-xs text-slate-400 mb-2 uppercase tracking-widest text-center">母线直流电压</div>
             <div className="text-5xl font-mono text-blue-400 font-light">{data.excitationVoltage.toFixed(1)} <span className="text-lg">V</span></div>
          </SciFiCard>
          <SciFiCard className="p-4 relative bg-slate-900/60 overflow-hidden flex flex-col items-center justify-center shrink-0">
             <div className="text-xs text-slate-400 mb-2 uppercase tracking-widest text-center flex items-center gap-2"><Zap size={14}/> 转子激磁电流真实负荷</div>
             <div className="text-5xl font-mono text-cyan-400 font-light">{data.excitationCurrent.toFixed(0)} <span className="text-lg">A</span></div>
          </SciFiCard>
          
          <SciFiCard title="励磁功率响应走势域 (A)" className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="currGrad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                         <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#06b6d4" fontSize={9} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="current" stroke="#06b6d4" strokeWidth={2} fill="url(#currGrad)" isAnimationActive={false} />
                 </AreaChart>
              </ResponsiveContainer>
          </SciFiCard>
          
          <SciFiCard title="转子场域强迫稳态转速" className="flex-[0.5] min-h-0 min-h-[100px] flex items-center justify-center bg-slate-900/40">
             <div className="text-4xl font-mono text-emerald-400 text-center tracking-widest">{data.rotorSpeed.toFixed(1)} <span className="text-xs text-slate-500">RPM</span></div>
          </SciFiCard>
       </div>

       {/* ----------------- CENTER COLUMN (5 spans width) ----------------- */}
       <div className="col-span-12 lg:col-span-5 row-span-12 flex flex-col gap-4 min-h-0">
          
          <div className={`shrink-0 p-3 rounded border backdrop-blur flex items-center justify-between transition-colors ${isDanger ? 'bg-red-900/60 border-red-500' : 'bg-slate-900/40 border-slate-700/50'}`}>
             <div className="flex gap-3 items-center">
                {isDanger ? <AlertOctagon className="text-red-400 animate-pulse" size={32}/> : <Activity className="text-slate-400" size={32}/>}
                <div>
                   <div className={`text-xs ${isDanger ? 'text-red-200' : 'text-slate-400'}`}>电接插件摩擦与热控状态机</div>
                   <div className={`text-xl font-bold ${isDanger ? 'text-red-400 tracking-wider' : 'text-slate-200'}`}>
                     {isDanger ? '严重脱轨环火 (Ring Fire)' : '碳刷表面贴合良好'}
                   </div>
                </div>
             </div>
             {isDanger && <div className="text-right text-[10px] text-red-300 font-mono">CODE: ARC_0X88<br/>ACTION: 削减无功输出</div>}
          </div>

          <SciFiCard className="flex-1 p-0 overflow-hidden relative border-slate-700 bg-[#000000] min-h-0">
             <div className="absolute inset-0 z-0">
               <ExcitationBrushThreeScene rpm={data.rotorSpeed} sparkIntensity={data.sparkIntensity} brushWear={data.brushWearLevels} />
             </div>
             <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="text-sm font-bold text-slate-300 flex items-center gap-2"><ThermometerSun size={14}/> 高频滑环集电场分布孪生室</div>
             </div>
             
             {/* Center display for Spark Level overlay */}
             {data.sparkIntensity > 0.2 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-black/60 px-4 py-2 rounded-full border border-orange-500/50 backdrop-blur">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] text-orange-200">火花烈度</span>
                     <div className="w-32 h-1 bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-orange-500" style={{width: `${data.sparkIntensity * 100}%`}}></div>
                     </div>
                     <span className="text-sm font-mono text-orange-400 font-bold">{(data.sparkIntensity * 10).toFixed(1)}/10</span>
                  </div>
               </div>
             )}
          </SciFiCard>
       </div>

       {/* ----------------- RIGHT COLUMN (4 spans width) ----------------- */}
       <div className="col-span-12 lg:col-span-4 row-span-12 flex flex-col gap-4 min-h-0">
          
          <SciFiCard title="四组碳刷磨损与恒定弹簧受力剖析" className="flex-[2] min-h-0 flex flex-col gap-2">
             <div className="flex-1 grid grid-rows-4 gap-2 h-full">
                {data.brushWearLevels.map((wear, idx) => {
                   const press = data.brushPressures[idx];
                   const isCritical = wear < 41 || press < 18;
                   return (
                      <div key={idx} className={`p-2 rounded border flex flex-col justify-center transition-colors ${isCritical ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-slate-300 font-mono">B-#{`0${idx+1}`} <span className="text-[9px] text-slate-500">剩余长度</span></span>
                            <span className={`text-lg font-mono ${wear < 41 ? 'text-red-400' : 'text-emerald-400'}`}>{wear.toFixed(2)} <span className="text-[9px]">mm</span></span>
                         </div>
                         {/* Progress bar representing wear (max 50mm) */}
                         <div className="flex items-center gap-2">
                           <div className="flex-1 bg-slate-800 h-1.5 rounded overflow-hidden">
                             <div className={`h-full ${wear < 41 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${(wear/50)*100}%`}}></div>
                           </div>
                           <span className={`text-[9px] font-mono whitespace-nowrap min-w-[50px] text-right ${press < 18 ? 'text-orange-400' : 'text-slate-400'}`}>{press.toFixed(1)} N</span>
                         </div>
                      </div>
                   )
                })}
             </div>
          </SciFiCard>

          <SciFiCard title="滑环热效应与摩擦积累曲线 (°C)" className="flex-[1.5] min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#f97316" fontSize={9} domain={[60, 'auto']} />
                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f97316', fontSize: '10px' }} />
                    <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
                 </LineChart>
              </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="输出场电流直流与高次谐波指纹 (FFT)" className="flex-[1.5] min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={fftData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="freq" stroke="#64748b" fontSize={8} />
                    <YAxis stroke="#8b5cf6" fontSize={8} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6', fontSize: '10px' }} />
                    <Bar dataKey="amp" fill="#8b5cf6" radius={[2,2,0,0]} isAnimationActive={false} />
                 </BarChart>
              </ResponsiveContainer>
          </SciFiCard>

       </div>
    </div>
  );
};
