import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThrustBearingThreeScene } from '../../../components/cockpit/thrust-bearing/ThreeScene';
import { Thermometer, ShieldCheck, AlertTriangle, RefreshCcw, Droplets, Activity, Settings, Database, ArrowDownToLine } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { thrustBearingSeries } from '../../../src/data/thrust-bearing/series-data';

export const ThrustBearingOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = thrustBearingSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string, type: string}[]>([]);

  useEffect(() => {
    setHistory(thrustBearingSeries.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`, load: d.axialLoad, thickness: d.oilFilmThickness, pressure: d.oilPressure
    })));
    setCurrentIndex(19);

    const initialLogs = [
      { time: '10:02:14', msg: '冷却水管网流速稳定: 150.2 L/min', type: 'info' },
      { time: '10:05:32', msg: '高压顶起系统执行自检...完成', type: 'success' },
      { time: '10:12:05', msg: '机组负荷并网攀升，轴力同步增加', type: 'warning' },
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % thrustBearingSeries.length;
        const nextData = thrustBearingSeries[next];
        const timeStr = new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setHistory(h => [...h.slice(1), {
          time: timeStr,
          load: nextData.axialLoad, thickness: nextData.oilFilmThickness, pressure: nextData.oilPressure
        }]);

        if (nextData.overallStatus === 'danger') {
           setLogs(l => [{time: timeStr, msg: `临界报警: 油膜厚度极低 (${nextData.oilFilmThickness.toFixed(1)}μm)`, type: 'danger'}, ...l].slice(0, 8));
        } else if (nextData.padTemperatures[4] > 58) {
           setLogs(l => [{time: timeStr, msg: `警告: #5推力瓦温升异常 (${nextData.padTemperatures[4].toFixed(1)}°C)`, type: 'warning'}, ...l].slice(0, 8));
        }

        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const radarData = data.padTemperatures.map((temp, index) => ({ pad: `瓦${index + 1}`, "温度": temp }));
  const oilHealth = [
    { name: '运动粘度', value: 45 - (Math.max(...data.padTemperatures) - 50) * 0.4, min: 38, max: 55, unit: 'cSt' },
    { name: '微水含量', value: 120 + Math.sin(currentIndex * 0.5) * 30, min: 0, max: 300, unit: 'ppm' },
    { name: '清洁度(NAS)', value: 6 + (data.oilFilmThickness < 30 ? 2 : 0), min: 0, max: 12, unit: '级' }
  ];

  // Derived cooling subsystem data
  const coolerTempIn = 25.4;
  const coolerTempOut = coolerTempIn + (Math.max(...data.padTemperatures) - 45) * 0.6;
  const blockDeformation = (data.axialLoad / 12500) * 45; // mm

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Top Deck: 5 Dense Metric Cards */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
         <SciFiCard className="p-3 bg-slate-900/40 relative overflow-hidden">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Thermometer size={14}/>阵列最高瓦温</div>
            <div className="text-2xl font-mono text-cyan-400">{Math.max(...data.padTemperatures).toFixed(1)} <span className="text-xs">°C</span></div>
            <div className="absolute right-2 bottom-2 text-[10px] text-cyan-700">T-MAX</div>
         </SciFiCard>
         <SciFiCard className="p-3 bg-slate-900/40 relative overflow-hidden">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Activity size={14}/>动态轴向荷载</div>
            <div className="text-2xl font-mono text-emerald-400">{(data.axialLoad / 1000).toFixed(2)} <span className="text-xs">MN</span></div>
            <div className="absolute right-2 bottom-2 text-[10px] text-emerald-700">AXIAL</div>
         </SciFiCard>
         <SciFiCard className="p-3 bg-slate-900/40 relative overflow-hidden">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Droplets size={14}/>供压顶起油站</div>
            <div className="text-2xl font-mono text-amber-400">{data.oilPressure.toFixed(2)} <span className="text-xs">MPa</span></div>
            <div className="absolute right-2 bottom-2 text-[10px] text-amber-700">PUMP</div>
         </SciFiCard>
         <SciFiCard className="p-3 bg-slate-900/40 relative overflow-hidden">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><ArrowDownToLine size={14}/>推力头微观形变</div>
            <div className="text-2xl font-mono text-purple-400">{blockDeformation.toFixed(2)} <span className="text-xs">μm</span></div>
            <div className="absolute right-2 bottom-2 text-[10px] text-purple-700">DEFORM</div>
         </SciFiCard>
         <div className={`p-3 rounded-lg border backdrop-blur flex items-center gap-3 transition-colors ${data.overallStatus === 'danger' ? 'bg-red-900/40 border-red-500' : data.overallStatus === 'warning' ? 'bg-amber-900/40 border-amber-500' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
            {data.overallStatus === 'normal' ? <ShieldCheck className="text-emerald-400" size={28}/> : <AlertTriangle className={`${data.overallStatus === 'danger' ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} size={28}/>}
            <div>
              <div className={`text-xs ${data.overallStatus === 'danger' ? 'text-red-200' : 'text-slate-400'}`}>状态机评估</div>
              <div className={`text-lg font-bold ${data.overallStatus === 'danger' ? 'text-red-400' : data.overallStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data.overallStatus === 'danger' ? '油膜承载崩溃' : data.overallStatus === 'warning' ? '热力边界告警' : '流体动压稳定'}
              </div>
            </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {/* Left Column: 3D Twin & Cooling */}
        <div className="col-span-2 flex flex-col gap-4 min-h-0">
           <SciFiCard title="立式推力承载引擎孪生诊断面" className="flex-[3] min-h-0 p-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#020617]"><ThrustBearingThreeScene padTemps={data.padTemperatures} oilThickness={data.oilFilmThickness} /></div>
              <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-2 rounded border border-slate-700/50 backdrop-blur w-40 pointer-events-none">
                 <div className="text-[10px] text-slate-400 flex justify-between"><span>当前油膜极值厚度</span> <span className={`${data.oilFilmThickness < 35 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>{data.oilFilmThickness.toFixed(1)}μm</span></div>
                 <div className="w-full bg-slate-800 h-1 mt-1 rounded"><div className={`h-full ${data.oilFilmThickness < 35 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, data.oilFilmThickness)}%`}}/></div>
              </div>
           </SciFiCard>
           <div className="flex-[1] min-h-0 grid grid-cols-2 gap-4">
              <SciFiCard title="外循环冷却水效能站">
                 <div className="flex justify-between items-end h-full py-2">
                    <div className="text-center">
                       <div className="text-[10px] text-slate-400">进水温</div>
                       <div className="font-mono text-cyan-400 text-lg">{coolerTempIn.toFixed(1)}°</div>
                    </div>
                    <div className="w-16 h-8 flex items-center justify-center bg-slate-800 rounded mx-2 border border-slate-700">
                       <div className="font-mono text-amber-500 text-xs">ΔT {(coolerTempOut - coolerTempIn).toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] text-slate-400">出水温</div>
                       <div className="font-mono text-red-400 text-lg">{coolerTempOut.toFixed(1)}°</div>
                    </div>
                 </div>
              </SciFiCard>
              <SciFiCard title="油泵射流阵列压力 (MPa)">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={history} margin={{top:5, right:0, left:-20, bottom:0}}>
                     <XAxis dataKey="time" hide />
                     <YAxis domain={['dataMin-1', 'dataMax+1']} fontSize={8} stroke="#64748b"/>
                     <Area type="step" dataKey="pressure" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                   </AreaChart>
                </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* Right Columns: Analytics & Diagnostics */}
        <div className="col-span-2 flex flex-col gap-4 min-h-0">
           {/* Radar and Health */}
           <div className="flex-[2] min-h-0 grid grid-cols-2 gap-4">
              <SciFiCard title="推力瓦面相控热激分布">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="pad" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[40, 65]} tick={{ fill: '#cbd5e1', fontSize: 8 }} />
                    <Radar dataKey="温度" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </SciFiCard>

              <SciFiCard title="循环透平油防劣化图谱">
                <div className="flex flex-col justify-around h-full py-2">
                  {oilHealth.map(item => (
                    <div key={item.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="font-mono text-cyan-400">{item.value.toFixed(1)} <span className="text-[9px] text-slate-500">{item.unit}</span></span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                        <div className="absolute inset-0 border-x-2 border-slate-600/50 w-full" />
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, ((item.value - item.min) / (item.max - item.min)) * 100))}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="bg-slate-900/50 p-2 rounded mt-2 border border-slate-800 text-[10px] text-slate-400 text-center">系统定期对透平油行脱水/脱气处理，保障油膜承载刚度。</div>
                </div>
              </SciFiCard>
           </div>

           {/* Trend Chart */}
           <SciFiCard title="油膜厚度与轴向载荷逆相关分析域 (μm / kN)" className="flex-[2] min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#fbbf24" fontSize={10} domain={[10, 60]} name="厚度" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} domain={['auto', 'auto']} name="载荷" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#fbbf24', fontSize: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="thickness" stroke="#fbbf24" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="load" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
           </SciFiCard>

           {/* Event Log Console */}
           <SciFiCard title="AI诊断与工况事件流" className="flex-[1.5] min-h-0 overflow-y-auto">
             <div className="flex flex-col gap-2 pt-2">
               {logs.map((log, idx) => (
                 <div key={idx} className="flex gap-3 text-xs items-start bg-slate-900/30 p-2 rounded border border-slate-800/50">
                    <span className="font-mono text-slate-500 whitespace-nowrap">[{log.time}]</span>
                    <span className={`${log.type === 'danger' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {log.msg}
                    </span>
                 </div>
               ))}
             </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
