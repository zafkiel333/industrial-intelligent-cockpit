import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { MainShaftThreeScene } from '../../../components/cockpit/main-shaft/ThreeScene';
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { mainShaftSeries } from '../../../src/data/main-shaft/series-data';
import { ShieldCheck, Flame, Crosshair, Cpu } from 'lucide-react';

export const MainShaftOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = mainShaftSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);
  const [aiDiagnosis, setAiDiagnosis] = useState<{time: string, msg: string, confidence: number}[]>([]);

  useEffect(() => {
    setHistory(mainShaftSeries.slice(0, 40).map((d, i) => ({
      time: `-${40-i}s`, dx: d.displacementX, dy: d.displacementY, vib: d.vibrationVelocity
    })));
    setCurrentIndex(39);

    setAiDiagnosis([
       {time: '12:00:01', msg: '机组偏心稳态验证通过', confidence: 98},
       {time: '12:05:32', msg: '极低频微小不平衡被拦截 (0.1X)', confidence: 85},
    ]);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % mainShaftSeries.length;
        const nextData = mainShaftSeries[next];
        const timeStr = new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setHistory(h => [...h.slice(1), {
          time: timeStr,
          dx: nextData.displacementX, dy: nextData.displacementY, vib: nextData.vibrationVelocity
        }]);

        const severity = Math.sqrt(nextData.displacementX*nextData.displacementX + nextData.displacementY*nextData.displacementY);
        if (severity > 80) {
           setAiDiagnosis(l => [{time: timeStr, msg: '侦测到强烈一阶共振不平衡 (Mass Unbalance)', confidence: 92}, ...l].slice(0, 4));
        }

        return next;
      });
    }, 500); 
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  // Generate simulated FFT array for freq analysis
  const fftData = Array.from({length: 12}, (_, i) => {
     const freq = (i + 1) * 12.5; 
     let amp = Math.random() * 0.5;
     if (i === 3) amp = data.vibrationVelocity * 1.5; 
     if (i === 7) amp = data.vibrationVelocity * 0.6;
     return { freq: `${freq}Hz`, amp: Number(amp.toFixed(2)) };
  });

  // Generate Air Gap dynamic data inverse to vibration
  const airGapData = Array.from({length: 8}, (_, i) => {
     const base = 12.0; // mm
     const mod = Math.sin((currentIndex + i) * 0.5) * (data.vibrationVelocity * 0.5);
     return { sensor: `S${i+1}`, gap: Number((base + mod).toFixed(2)) };
  });

  const severity = Math.sqrt(data.displacementX*data.displacementX + data.displacementY*data.displacementY);
  const isDanger = severity > 80;

  return (
    <div className="h-full grid grid-cols-12 gap-4 overflow-hidden">
       {/* Left Column: Orbital & Frequency Analysis */}
       <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
          <SciFiCard title="主轴轴心李萨如轨迹 (Orbit)" className="h-[280px] shrink-0">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="dx" name="X轴差" domain={[-100, 100]} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis type="number" dataKey="dy" name="Y轴差" domain={[-100, 100]} tick={{fill: '#64748b', fontSize: 10}} />
                  <ZAxis range={[15, 15]} />
                  <Tooltip cursor={{strokeDasharray: '1 1'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <ReferenceLine x={0} stroke="#475569" />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Scatter name="运动轨迹" data={history} fill="#3b82f6" line={{stroke: '#3b82f6', strokeWidth: 1}} lineType="joint" />
                  <Scatter name="瞬时极点" data={[{dx: data.displacementX, dy: data.displacementY}]} fill="#ef4444" shape="cross" />
               </ScatterChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="全相频域谱分析 (FFT)" className="h-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={fftData} margin={{ top: 5, right: -10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="freq" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#f59e0b" fontSize={9} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b', fontSize: '10px' }} />
                  <Bar dataKey="amp" fill="#f59e0b" radius={[2,2,0,0]} />
               </BarChart>
            </ResponsiveContainer>
          </SciFiCard>
          
          <SciFiCard title="专家级 AI 轴系异常诊断分析" className="flex-1 min-h-0 overflow-auto">
             <div className="flex flex-col gap-2 pt-2">
                {aiDiagnosis.map((log, idx) => (
                   <div key={idx} className={`p-2 rounded text-xs border ${log.confidence > 90 && idx === 0 && isDanger ? 'bg-red-900/20 border-red-500/50 text-red-300' : 'bg-slate-900/40 border-slate-700/50 text-slate-300'}`}>
                      <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                         <span><Cpu size={10} className="inline mr-1"/>{log.time}</span>
                         <span>可信度: {log.confidence}%</span>
                      </div>
                      <div className="font-mono">{log.msg}</div>
                   </div>
                ))}
             </div>
          </SciFiCard>
       </div>

       {/* Center Column: 3D Physics */}
       <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0">
          <SciFiCard title="大型发电机主轴与导轴承微观干涉模型" className="flex-1 min-h-0 p-0 overflow-hidden relative border-slate-700 bg-[#020617]">
            <div className="absolute inset-0 z-0">
               <MainShaftThreeScene dx={data.displacementX} dy={data.displacementY} speed={10} />
            </div>
            
            {/* Top HUD */}
            <div className="absolute top-4 left-4 flex gap-4 w-[calc(100%-2rem)] z-10 pointer-events-none">
               <div className={`bg-slate-900/80 backdrop-blur p-2 rounded border min-w-[120px] transition-colors ${isDanger ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700/50'}`}>
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><Crosshair size={10}/>矢量偏心模长</div>
                  <div className={`text-2xl font-mono ${isDanger ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                     {severity.toFixed(1)} <span className="text-[10px]">μm</span>
                  </div>
               </div>
               <div className="bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700/50 min-w-[120px]">
                  <div className="text-[10px] text-slate-400 mb-1">动态偏心频角</div>
                  <div className="text-2xl font-mono text-cyan-400">{data.phaseAngle.toFixed(1)}<span className="text-[10px]">°</span></div>
               </div>
            </div>

             <div className="absolute bottom-4 left-4 bg-[#0f172a]/90 px-3 py-2 rounded border border-[#1e293b] backdrop-blur-md z-10 pointer-events-none">
                <div className="text-slate-400 text-[10px] mb-1">机组有功负荷实时匹配</div>
                <div className="text-2xl font-mono font-bold text-white tracking-wider">{data.activePower.toFixed(1)} <span className="text-xs text-slate-500">MW</span></div>
             </div>
          </SciFiCard>
       </div>

       {/* Right Column: Multi-Bearing & Air Gap */}
       <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
          <SciFiCard title="发电机定转子气隙扫描面 (Air Gap - mm)" className="h-[250px] shrink-0">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={airGapData}>
                 <PolarGrid stroke="#334155" />
                 <PolarAngleAxis dataKey="sensor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                 <PolarRadiusAxis domain={[10, 15]} tick={false} axisLine={false} />
                 <Radar dataKey="gap" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '10px' }} />
               </RadarChart>
             </ResponsiveContainer>
             {/* Small magnetic pull indicator */}
             <div className="absolute top-10 right-4 bg-slate-900/50 p-2 border border-slate-800 rounded">
                 <div className="text-[9px] text-slate-400">电磁不平衡单边拉伸力</div>
                 <div className="text-lg font-mono text-purple-400">{(severity * 0.15).toFixed(2)} <span className="text-[9px]">kN</span></div>
             </div>
          </SciFiCard>

          <div className="flex-1 grid grid-cols-1 gap-2 min-h-0">
             <SciFiCard className="p-2 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-0">
                <div className="text-xs text-slate-400 mb-1 absolute top-2 left-2 z-10">上机架导轴承 绝对振速</div>
                <div className="text-lg font-mono text-cyan-400 absolute top-1 right-2 z-10">{(data.vibrationVelocity * 0.8).toFixed(2)} <span className="text-[9px]">mm/s</span></div>
                <div className="h-full w-full pt-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                         <YAxis hide domain={[0, 4]} />
                         <Area type="monotone" dataKey={(d) => d.vib * 0.8} stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} isAnimationActive={false} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </SciFiCard>
             <SciFiCard className="p-2 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-0">
                <div className="text-xs text-slate-400 mb-1 absolute top-2 left-2 z-10">下机架导轴承 绝对振速</div>
                <div className="text-lg font-mono text-purple-400 absolute top-1 right-2 z-10">{(data.vibrationVelocity * 0.9).toFixed(2)} <span className="text-[9px]">mm/s</span></div>
                <div className="h-full w-full pt-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                         <YAxis hide domain={[0, 4]} />
                         <Area type="monotone" dataKey={(d) => d.vib * 0.9} stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} isAnimationActive={false} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </SciFiCard>
             <SciFiCard className="p-2 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-0">
                 <div className="text-xs text-slate-400 mb-1 absolute top-2 left-2 z-10">水导轴承 承流激振极值</div>
                 <div className={`text-lg font-mono absolute top-1 right-2 z-10 ${data.vibrationVelocity * 1.2 > 3.0 ? 'text-red-400' : 'text-amber-400'}`}>{(data.vibrationVelocity * 1.2).toFixed(2)} <span className="text-[9px]">mm/s</span></div>
                 <div className="h-full w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={history} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                          <YAxis hide domain={[0, 4]} />
                          <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" />
                          <Area type="step" dataKey={(d) => d.vib * 1.2} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} isAnimationActive={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
             </SciFiCard>
          </div>
       </div>
    </div>
  );
};
