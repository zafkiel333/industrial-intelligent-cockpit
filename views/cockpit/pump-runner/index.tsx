import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { PumpRunnerThreeScene } from '../../../components/cockpit/pump-runner/ThreeScene';
import { PowerCircle, Cpu, Crosshair, Wrench } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceArea } from 'recharts';
import { pumpRunnerSeries } from '../../../src/data/pump-runner/series-data';

export const PumpRunnerOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = pumpRunnerSeries[currentIndex];
  const [history, setHistory] = useState<any[]>([]);
  const [hillChartData, setHillChartData] = useState<any[]>([]);

  useEffect(() => {
    setHistory(pumpRunnerSeries.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`, rpm: d.rpm, flow: d.flowRate, head: d.waterHead, cavIndex: d.cavitationIndex,
      pulse: d.draftTubePressurePulse
    })));
    setCurrentIndex(19);
    
    // Static optimal curves for Hill Chart background
    const bgPoints = [];
    for(let h = 80; h <= 150; h+=10) {
      for(let q = 150; q <= 400; q+=20) {
        bgPoints.push({ h, q, eff: 100 - Math.abs(h-120)*0.5 - Math.abs(q-300)*0.1 });
      }
    }
    setHillChartData(bgPoints);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % pumpRunnerSeries.length;
        const nextData = pumpRunnerSeries[next];
        setHistory(h => [...h.slice(1), {
          time: new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' }),
          rpm: nextData.rpm, flow: nextData.flowRate, head: nextData.waterHead, cavIndex: nextData.cavitationIndex, pulse: nextData.draftTubePressurePulse
        }]);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const efficiency = data.operatingMode === 'idle' ? 0 : 85 + Math.random() * 5 + (data.cavitationIndex < 0.15 ? -5 : 0);
  const isDangerous = data.cavitationIndex < 0.12;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Deck: Operation Station */}
      <div className="grid grid-cols-4 gap-4 h-[350px]">
        {/* Command & Control */}
        <SciFiCard title="机组综合运行指挥舱" className="col-span-1 flex flex-col gap-4 border-slate-700/50">
           <div className="bg-[#0f172a] rounded-lg p-6 flex flex-col items-center justify-center border border-slate-800 shadow-inner flex-1">
              <PowerCircle size={48} className={data.operatingMode === 'pump' ? 'text-purple-500 mb-2' : data.operatingMode === 'turbine' ? 'text-blue-500 mb-2' : 'text-slate-500 mb-2'} />
              <div className="text-slate-400 text-xs tracking-widest uppercase mb-1">主轴全相耦合控制</div>
              <div className={`text-4xl font-bold ${data.operatingMode === 'pump' ? 'text-purple-400' : data.operatingMode === 'turbine' ? 'text-blue-400' : 'text-slate-400'}`}>
                {data.operatingMode === 'pump' ? '抽水态(P)' : data.operatingMode === 'turbine' ? '发电态(T)' : '静止/调相'}
              </div>
              <div className="mt-4 px-4 py-1 bg-slate-800 rounded-full text-xs text-slate-300">
                联锁系统: <span className="text-emerald-400">进水球阀已开启</span>
              </div>
           </div>

           <div className="flex flex-col justify-center px-2 gap-4">
             <div>
               <div className="flex justify-between text-[10px] mb-1 text-slate-400"><span>机组综合水力效率</span> <span className="text-emerald-400 font-mono">{efficiency.toFixed(1)}%</span></div>
               <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden"><div className="bg-emerald-500 h-full rounded transition-all duration-300" style={{ width: `${efficiency}%` }} /></div>
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-1 text-slate-400"><span>转子瞬时转速寻址</span> <span className="text-cyan-400 font-mono">{Math.abs(data.rpm).toFixed(0)} rpm</span></div>
               <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden"><div className="bg-cyan-500 h-full rounded transition-all duration-300" style={{ width: `${(Math.abs(data.rpm)/400)*100}%` }} /></div>
             </div>
           </div>
        </SciFiCard>

        {/* 3D Flow Twin */}
        <SciFiCard className="col-span-2 p-0 overflow-hidden relative border-slate-700 bg-[#00040f]">
           <div className="absolute inset-0 z-0">
             <PumpRunnerThreeScene rpm={data.rpm} mode={data.operatingMode} guideVaneAngle={data.guideVaneAngle} cavIndex={data.cavitationIndex} />
           </div>
           
           <div className="absolute top-4 left-4 z-10 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700 backdrop-blur flex items-center gap-2 pointer-events-none">
             <Cpu size={14} className="text-blue-400"/>
             <span className="text-sm font-bold text-slate-200">可逆式转轮流场孪生</span>
           </div>
           {isDangerous && (
             <div className="absolute top-4 right-4 z-10 bg-red-900/80 px-4 py-2 rounded border border-red-500 backdrop-blur animate-pulse pointer-events-none">
               <div className="text-sm font-bold text-red-200">严重空化(气蚀)警告</div>
             </div>
           )}
        </SciFiCard>

        {/* Servomotor & Actuators */}
        <SciFiCard title="执行机构液压伺服" className="col-span-1 flex flex-col justify-between">
           <div className="flex flex-col gap-4 mt-2">
              <div className="bg-slate-900/40 p-3 rounded border border-slate-800 relative overflow-hidden">
                <Wrench className="absolute -right-2 -bottom-2 text-slate-800" size={60}/>
                <div className="text-xs text-slate-400 mb-1 z-10 relative">接力器油压 (MPa)</div>
                <div className="text-2xl font-mono text-amber-400 z-10 relative">6.42</div>
              </div>
              <div className="bg-slate-900/40 p-3 rounded border border-slate-800 relative overflow-hidden">
                <Crosshair className="absolute -right-2 -bottom-2 text-slate-800" size={60}/>
                <div className="text-xs text-slate-400 mb-1 z-10 relative">导叶开合指令寻址</div>
                <div className="text-2xl font-mono text-amber-500 z-10 relative">{data.guideVaneAngle.toFixed(1)}°</div>
              </div>
              <div className="mt-2">
                 <div className="text-[10px] text-slate-400 mb-1">同步控制环反馈行程</div>
                 <div className="w-full bg-slate-800 h-2 rounded border border-slate-700 p-[1px]">
                   <div className="bg-amber-500 h-full rounded transition-all duration-300" style={{ width: `${(data.guideVaneAngle/45)*100}%` }} />
                 </div>
              </div>
           </div>
        </SciFiCard>
      </div>

      {/* Middle Deck: 4 dense metrics */}
      <div className="grid grid-cols-4 gap-4">
         <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-lg flex justify-between items-center">
            <div><div className="text-xs text-slate-500">机组动水头/扬程</div><div className="text-2xl text-blue-400 font-mono">{data.waterHead.toFixed(1)} <span className="text-xs">m</span></div></div>
            <div className="w-12 h-12 rounded-full border-2 border-blue-900 flex items-center justify-center text-blue-500">HD</div>
         </div>
         <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-lg flex justify-between items-center">
            <div><div className="text-xs text-slate-500">蜗壳双向流量</div><div className="text-2xl text-cyan-400 font-mono">{data.flowRate.toFixed(1)} <span className="text-xs">m³/s</span></div></div>
            <div className="w-12 h-12 rounded-full border-2 border-cyan-900 flex items-center justify-center text-cyan-500">FL</div>
         </div>
         <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-lg flex justify-between items-center relative overflow-hidden">
            {isDangerous && <div className="absolute inset-0 bg-red-500/10 animate-pulse"/>}
            <div className="z-10"><div className="text-xs text-slate-500">水力空化系数 σ</div><div className={`text-2xl font-mono ${isDangerous?'text-red-400':'text-emerald-400'}`}>{data.cavitationIndex.toFixed(3)}</div></div>
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 ${isDangerous?'border-red-900 text-red-500':'border-emerald-900 text-emerald-500'}`}>CV</div>
         </div>
         <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-lg flex justify-between items-center">
            <div><div className="text-xs text-slate-500">尾水管压力脉动</div><div className={`text-2xl font-mono ${data.draftTubePressurePulse>0.1?'text-amber-400':'text-purple-400'}`}>{data.draftTubePressurePulse.toFixed(3)} <span className="text-xs">MPa</span></div></div>
            <div className="w-12 h-12 rounded-full border-2 border-purple-900 flex items-center justify-center text-purple-500">PL</div>
         </div>
      </div>

      {/* Bottom Deck: Charts */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-[220px]">
         <SciFiCard title="综合特性曲线 (Hill Chart)" className="col-span-1">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                 <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                 <XAxis type="number" dataKey="q" name="流量" domain={[100, 400]} tick={{fontSize: 9, fill: '#64748b'}} />
                 <YAxis type="number" dataKey="h" name="水头" domain={[60, 160]} tick={{fontSize: 9, fill: '#64748b'}} />
                 <ReferenceArea x1={180} x2={350} y1={90} y2={140} fill="#10b981" fillOpacity={0.05} />
                 <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', fontSize: '10px' }} />
                 {/* Current operation point */}
                 <Scatter name="当前工况" data={[{q: data.flowRate, h: data.waterHead}]} fill="#ef4444" shape="star" />
               </ScatterChart>
             </ResponsiveContainer>
         </SciFiCard>

         <SciFiCard title="蜗壳全息双向流量走势 (m³/s)" className="col-span-1">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#3b82f6" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', fontSize: '10px' }} />
                <Bar dataKey="flow" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false}/>
             </BarChart>
           </ResponsiveContainer>
         </SciFiCard>

         <SciFiCard title="水膜空化(气蚀)探针底限系数" className="col-span-1">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="cavGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#ef4444" fontSize={9} domain={[0, 0.3]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444', fontSize: '10px' }} />
                <Area type="monotone" dataKey="cavIndex" stroke="#ef4444" fill="url(#cavGrad)" isAnimationActive={false} />
             </AreaChart>
           </ResponsiveContainer>
         </SciFiCard>

         <SciFiCard title="尾水管阻流波纹压力脉动 (MPa)" className="col-span-1">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#a855f7" fontSize={9} domain={[0, 0.2]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', fontSize: '10px' }} />
                <Line type="stepAfter" dataKey="pulse" stroke="#a855f7" strokeWidth={1} dot={false} isAnimationActive={false} />
             </LineChart>
           </ResponsiveContainer>
         </SciFiCard>
      </div>
    </div>
  );
};
