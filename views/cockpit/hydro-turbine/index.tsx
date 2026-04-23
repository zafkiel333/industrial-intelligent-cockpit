import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/smart-ops/hydro-turbine/ThreeScene';
import { Activity, Power, Waves, AlertTriangle, ShieldAlert, Thermometer, Zap, Radio } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';

import { HydroTurbineData } from '../../../src/data/hydro-turbine/types';
import { hydroSeriesData } from '../../../src/data/hydro-turbine/hydro-series-data';

export const HydroTurbineOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = hydroSeriesData[currentIndex];
  
  const [history, setHistory] = useState<any[]>([]);
  const [runoutHistory, setRunoutHistory] = useState<any[]>([]);

  useEffect(() => {
    // init arrays to pre-fill the charts
    const initialHistory = hydroSeriesData.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`,
      vibUpper: d.vibration.upperGuide,
      power: d.activePower,
      head: d.waterHead,
      vacuum: d.draftTubeVacuum * 1000 // Convert mPa to Pa visually
    }));
    setHistory(initialHistory);
    setCurrentIndex(19);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % hydroSeriesData.length;
        const nextData = hydroSeriesData[next];
        
        setHistory(h => {
          const newH = [...h.slice(1), {
            time: new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' }),
            vibUpper: nextData.vibration.upperGuide,
            power: nextData.activePower,
            head: nextData.waterHead,
            vacuum: nextData.draftTubeVacuum * 1000
          }];
          return newH;
        });

        setRunoutHistory(r => {
          const newR = [...r, { x: nextData.shaftRunout.x, y: nextData.shaftRunout.y, time: Date.now().toString() }];
          if (newR.length > 20) newR.shift();
          return newR;
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
      {/* Top Metrics Row - 5 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Activity size={16}/> 实时转速 (r/min)</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.rpm > 130 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            {data.rpm.toFixed(1)} <span className="text-sm text-slate-500">/ 125.0</span>
          </div>
        </SciFiCard>
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Zap size={16}/> 有功负荷 (MW)</div>
          <div className="text-3xl font-[Rajdhani] font-bold text-purple-400">
            {data.activePower.toFixed(1)} <span className="text-sm text-slate-500"> MW</span>
          </div>
        </SciFiCard>
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Waves size={16}/> 水头 / 导叶参数</div>
          <div className="text-xl font-[Rajdhani] font-bold text-blue-400 leading-tight">
            HW: {data.waterHead.toFixed(1)} <span className="text-xs text-slate-500">m</span><br/>
            GV: {data.guideVaneOpening.toFixed(1)} <span className="text-xs text-slate-500">%</span>
          </div>
        </SciFiCard>
        <SciFiCard className="p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-900/20" style={{opacity: data.cavitationRisk / 100}}></div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 relative z-10"><AlertTriangle size={16}/> 尾水空化预警指数</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`text-3xl font-[Rajdhani] font-bold ${data.cavitationRisk > 80 ? 'text-red-400' : data.cavitationRisk > 60 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {data.cavitationRisk.toFixed(0)} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">Idx</span>
            </div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${data.cavitationRisk > 80 ? 'bg-red-500' : data.cavitationRisk > 60 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${data.cavitationRisk}%`}}></div>
            </div>
          </div>
        </SciFiCard>
        <div className={`p-4 rounded-xl border backdrop-blur flex flex-col justify-center items-center transition-all duration-300 ${getStatusBgColor(data.status)}`}>
          <ShieldAlert size={28} className={`mb-2 ${getStatusColor(data.status)}`}/>
          <div className={`text-xl font-bold tracking-widest ${getStatusColor(data.status)} drop-shadow-lg`}>
            {data.status === 'optimal' ? '全景态势良好' : data.status === 'warning' ? '设备亚健康预警' : '核心指标危急告警'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        {/* Left Col: Mechanical Health */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="大轴轴心轨迹 (X-Y) 游动监测" className="flex-1 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="X向摆度" stroke="#64748b" domain={[-2, 2]} tick={{fontSize: 10}} unit="mm" />
                <YAxis type="number" dataKey="y" name="Y向摆度" stroke="#64748b" domain={[-2, 2]} tick={{fontSize: 10}} unit="mm" />
                <ZAxis type="number" range={[20, 20]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                {/* Reference circles for limits */}
                <Scatter name="警戒线" data={[{x:0, y:0}]} fill="none" 
                  shape={(props: any) => <circle cx={props.cx} cy={props.cy} r={60} fill="none" stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} />} 
                />
                <Scatter name="历史轨迹" data={runoutHistory} fill="#3b82f6" opacity={0.5} />
                <Scatter name="实时靶心" data={[data.shaftRunout]} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </SciFiCard>
          <SciFiCard title="导轴承与定子油温热力场" className="h-[250px] overflow-hidden">
             <div className="flex flex-col justify-around h-full py-2">
               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-xs text-slate-400 flex items-center gap-2"><Thermometer size={14} className="text-emerald-400"/> 定子绕组极限发热</span>
                   <span className="font-mono text-emerald-400 text-sm">{data.temperature.statorWind.toFixed(1)} °C</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300" style={{width: `${(data.temperature.statorWind/120)*100}%`}}></div></div>
               </div>
               
               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-xs text-slate-400 flex items-center gap-2"><Thermometer size={14} className="text-orange-400"/> 推力轴承油槽油温</span>
                   <span className="font-mono text-orange-400 text-sm">{data.temperature.thrustOil.toFixed(1)} °C</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-300" style={{width: `${(data.temperature.thrustOil/80)*100}%`}}></div></div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-xs text-slate-400 flex items-center gap-2"><Thermometer size={14} className="text-blue-400"/> 导轴承油瓦基底温</span>
                   <span className="font-mono text-blue-400 text-sm">{data.temperature.guideOil.toFixed(1)} °C</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-300" style={{width: `${(data.temperature.guideOil/80)*100}%`}}></div></div>
               </div>
             </div>
          </SciFiCard>
        </div>

        {/* Center Col: 3D view with HUD overlay */}
        <SciFiCard title="HT-FRANCIS 数字孪生与透视场" className="col-span-2 relative overflow-hidden p-0 border border-slate-700/50">
          <div className="absolute inset-0 z-0">
             {/* Render realistic 3d Francis turbine */}
            <ThreeScene 
              rpm={data.rpm} 
              status={data.status} 
              vibrationLevel={data.status === 'optimal' ? 0 : data.status === 'warning' ? 0.3 : 1}
              waterFlow={data.flowRate / 100}
              cavitationRisk={data.cavitationRisk}
            />
          </div>
          {/* Top-left HUD layer */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <div className="bg-slate-900/60 backdrop-blur border-l-2 border-cyan-500 p-2 mb-2">
                 <div className="text-[10px] text-cyan-500 mb-1 tracking-widest uppercase">Drive System</div>
                 <div className="text-xs text-slate-300 font-mono">FRQ: {data.frequency.toFixed(2)} Hz</div>
                 <div className="text-xs text-slate-300 font-mono">Q: {data.flowRate.toFixed(1)} m³/s</div>
             </div>
             {data.status !== 'optimal' && (
               <div className="bg-red-900/60 backdrop-blur border-l-2 border-red-500 p-2 animate-pulse">
                   <div className="text-[10px] text-red-500 mb-1 tracking-widest uppercase">System Alert</div>
                   <div className="text-xs text-slate-200">检测到运转异常</div>
               </div>
             )}
          </div>
          {/* Bottom Interaction indicator */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded text-xs text-slate-400 flex items-center gap-2">
              <Radio size={12} className={data.status === 'critical' ? 'text-red-400' : 'text-emerald-400'} />
              基于 /src/data/ 流式读取 (支持拖动视角)
            </div>
          </div>
        </SciFiCard>

        {/* Right Col: Complex charts replacing raw JSON string */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="有功负荷与上导振动耦合趋势" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} domain={[30, 80]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                <Area yAxisId="left" type="monotone" dataKey="power" name="有功负荷(MW)" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorPower)" />
                <Line yAxisId="right" type="stepAfter" dataKey="vibUpper" name="上导振动(μm)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="特性水头与微观真空度波动剖析" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} domain={[20, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
                <Area yAxisId="left" type="monotone" dataKey="head" name="工作水头(m)" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorHead)" />
                <Line yAxisId="right" type="monotone" dataKey="vacuum" name="尾水管真空度(Pa)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
