import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { GuideVaneThreeScene } from '../../../components/cockpit/guide-vane/ThreeScene';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ReferenceLine, ReferenceArea } from 'recharts';
import { guideVaneSeries } from '../../../src/data/guide-vane/series-data';
import { Wrench, Settings2, Scissors, Gauge } from 'lucide-react';

export const GuideVaneOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = guideVaneSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(guideVaneSeries.slice(0, 40).map((d, i) => ({
      time: `-${40-i}s`, 
      stroke: d.servoStroke, 
      pressure: d.servoOilPressure,
      rpm: d.turbineRpm,
      shear: d.shearPinStress
    })));
    setCurrentIndex(39);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % guideVaneSeries.length;
        const nextData = guideVaneSeries[next];
        const timeStr = new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setHistory(h => [...h.slice(1), {
          time: timeStr,
          stroke: nextData.servoStroke, 
          pressure: nextData.servoOilPressure,
          rpm: nextData.turbineRpm,
          shear: nextData.shearPinStress
        }]);

        return next;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const isDanger = data.overallStatus === 'danger';
  const isWarning = data.overallStatus === 'warning';
  
  // Format vanes for radar chart
  const radarVanes = [
     { point: 'I 象限 (0°)', angle: data.vaneAngles[0] },
     { point: 'II 象限 (90°)', angle: data.vaneAngles[1] },
     { point: 'III 象限 (180°)', angle: data.vaneAngles[2] },
     { point: 'IV 象限 (270°)', angle: data.vaneAngles[3] }
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
       {/* 3 Split Horizontal Layout */}
       
       {/* Top Deck: Action Parameters */}
       <div className="grid grid-cols-4 gap-4 shrink-0">
          <SciFiCard className={`p-4 flex justify-between items-center bg-slate-900/60 transition-colors ${isWarning || isDanger ? 'border-amber-500 bg-amber-900/20' : ''}`}>
             <div><div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Gauge size={14}/>卡滞摩擦耗力阻矩</div><div className={`text-3xl font-mono ${isWarning||isDanger?'text-amber-400 animate-pulse':'text-cyan-400'}`}>{data.frictionTorque.toFixed(1)} <span className="text-xs">kN.m</span></div></div>
             <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-500 bg-slate-950">TRQ</div>
          </SciFiCard>
          <SciFiCard className={`p-4 flex justify-between items-center bg-slate-900/60 transition-colors ${isDanger ? 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}>
             <div><div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Scissors size={14}/>保护臂剪断销应力</div><div className={`text-3xl font-mono ${isDanger?'text-red-400 font-bold':'text-orange-400'}`}>{data.shearPinStress.toFixed(0)} <span className="text-xs">MPa</span></div></div>
             <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${isDanger?'border-red-500 text-red-500 bg-red-950 animate-bounce':'border-slate-800 text-slate-500 bg-slate-950'}`}>PIN</div>
          </SciFiCard>
          <SciFiCard className="p-4 flex justify-between items-center bg-slate-900/60">
             <div><div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Settings2 size={14}/>接力器活塞主行程</div><div className="text-3xl font-mono text-emerald-400">{data.servoStroke.toFixed(0)} <span className="text-xs">mm</span></div></div>
             <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-500 bg-slate-950">STR</div>
          </SciFiCard>
          <SciFiCard className="p-4 flex justify-between items-center bg-slate-900/60">
             <div><div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Wrench size={14}/>液压伺服环路高压</div><div className="text-3xl font-mono text-purple-400">{data.servoOilPressure.toFixed(2)} <span className="text-xs">MPa</span></div></div>
             <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-500 bg-slate-950">OIL</div>
          </SciFiCard>
       </div>

       {/* Middle Deck: 3D Twin & Correlations */}
       <div className="flex-[2] grid grid-cols-2 gap-4 min-h-0">
          <SciFiCard title="微观寻址控制环与导叶群 3D 动力学孪生" className="p-0 overflow-hidden relative border-slate-700 bg-slate-950 min-h-0">
             <div className="absolute inset-0 z-0">
               <GuideVaneThreeScene stroke={data.servoStroke} vanes={data.vaneAngles} />
             </div>
             
             {isDanger && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/90 border-2 border-red-500 p-6 rounded-lg backdrop-blur z-20 pointer-events-none text-center animate-pulse">
                   <AlertTriangle className="text-red-400 mx-auto mb-2" size={48} />
                   <div className="font-black text-2xl text-red-100 tracking-widest leading-relaxed">极其危险<br/>剪断销受力超越极限</div>
                   <div className="text-rose-300 text-sm mt-2">系统可能即将切断油压进行紧急宕机</div>
                </div>
             )}
          </SciFiCard>

          <div className="flex flex-col gap-4 min-h-0">
             <SciFiCard title="接力器指令行程与液压伺服抗力对偶散点簇 (mm / MPa)" className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                     <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                     <XAxis type="number" dataKey="stroke" name="行程" domain={[0, 450]} tick={{fill: '#64748b', fontSize: 10}} />
                     <YAxis type="number" dataKey="pressure" name="油压" domain={[0, 6]} tick={{fill: '#64748b', fontSize: 10}} />
                     <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6', fontSize: '10px' }} />
                     {/* Safe operational band */}
                     <ReferenceArea x1={0} x2={450} y1={2} y2={5} fill="#10b981" fillOpacity={0.05} />
                     <Scatter name="运动时空轨线" data={history} fill="#8b5cf6" line={{stroke: '#8b5cf6', strokeWidth: 1}} shape="circle" />
                  </ScatterChart>
               </ResponsiveContainer>
             </SciFiCard>
             <SciFiCard title="转轮联动降维响应瀑布 (RPM)" className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                     <YAxis stroke="#38bdf8" fontSize={9} domain={['auto', 'auto']} />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '10px' }} />
                     <Line type="monotone" dataKey="rpm" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
               </ResponsiveContainer>
             </SciFiCard>
          </div>
       </div>

       {/* Bottom Deck: Quad Analysis */}
       <div className="flex-1 grid grid-cols-12 gap-4 shrink-0 min-h-[220px]">
          <SciFiCard title="剪切应力破断时态轴 (MPa)" className="col-span-8 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="shearGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                     <YAxis stroke="#f59e0b" fontSize={9} domain={[0, Math.max(200, ...history.map(h=>h.shear))] } />
                     <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: '物理破断应力极值', fill: '#ef4444', fontSize: 10 }} />
                     <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b', fontSize: '10px' }} />
                     <Bar dataKey="shear" radius={[2,2,0,0]} isAnimationActive={false}>
                        {history.map((entry, index) => (
                           <cell key={`cell-${index}`} fill={entry.shear > 150 ? 'url(#shearGrad)' : '#f59e0b'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="四象限导叶开环寻址图谱" className="col-span-4 min-h-0 flex items-center justify-center">
             {/* If warning/danger, radar map becomes distorted noticeably */}
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarVanes}>
                 <PolarGrid stroke="#334155" />
                 <PolarAngleAxis dataKey="point" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                 <PolarRadiusAxis angle={45} domain={[0, 25]} tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} />
                 <Radar dataKey="angle" stroke={isWarning||isDanger ? '#ef4444' : '#10b981'} fill={isWarning||isDanger ? '#ef4444' : '#10b981'} fillOpacity={0.4} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: isWarning||isDanger ? '#ef4444' : '#10b981', fontSize: '10px' }} />
               </RadarChart>
             </ResponsiveContainer>
          </SciFiCard>
       </div>

    </div>
  );
};
