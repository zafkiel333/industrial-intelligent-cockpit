import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ValveThreeScene } from '../../../components/cockpit/inlet-valve/ThreeScene';
import { Activity, Droplets, ArrowRightLeft, AlertTriangle, ShieldAlert, Clock, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';

import { InletValveData } from '../../../src/data/inlet-valve/types';
import { valveSeriesData } from '../../../src/data/inlet-valve/valve-series-data';

export const InletValveOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = valveSeriesData[currentIndex];
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fill initial history
    const initialHistory = valveSeriesData.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`,
      angle: d.valveAngle,
      vib: d.vibration,
      upP: d.upstreamPressure,
      caseP: d.spiralCasingPressure,
      sealP: d.sealWaterPressure
    }));
    setHistory(initialHistory);
    setCurrentIndex(19);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % valveSeriesData.length;
        const nextData = valveSeriesData[next];
        
        setHistory(h => {
          const newH = [...h.slice(1), {
            time: new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' }),
            angle: nextData.valveAngle,
            vib: nextData.vibration,
            upP: nextData.upstreamPressure,
            caseP: nextData.spiralCasingPressure,
            sealP: nextData.sealWaterPressure
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
      case 'optimal': return 'text-emerald-400';
      case 'warning': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]';
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
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Gauge size={16}/> 阀芯绝对开启角</div>
          <div className="text-3xl font-[Rajdhani] font-bold text-cyan-400">
            {data.valveAngle.toFixed(1)} <span className="text-sm text-slate-500">°</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><ArrowRightLeft size={16}/> 接力器伸缩行程</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.servoStroke > 500 ? 'text-orange-400' : 'text-blue-400'}`}>
            {data.servoStroke.toFixed(1)} <span className="text-sm text-slate-500">mm</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyan-900/20" style={{opacity: data.isBypassOpen ? 1 : 0}}></div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 relative z-10"><RefreshCwIcon size={16} spinning={data.isBypassOpen}/> 平压旁通阀状态</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`text-3xl font-[Rajdhani] font-bold ${data.isBypassOpen ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
              {data.isBypassOpen ? 'OPEN (充水中)' : 'CLOSED'}
            </div>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Droplets size={16}/> 检修密封漏水量</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.leakageFlow > 25 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {data.leakageFlow.toFixed(1)} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">L/min</span>
          </div>
        </SciFiCard>

        <div className={`p-4 rounded-xl border backdrop-blur flex flex-col justify-center items-center transition-all duration-300 ${getStatusBgColor(data.healthStatus)}`}>
          <ShieldAlert size={28} className={`mb-2 ${getStatusColor(data.healthStatus)}`}/>
          <div className={`text-lg font-bold tracking-widest ${getStatusColor(data.healthStatus)} drop-shadow-lg`}>
            {data.healthStatus === 'optimal' ? '水封防漏与振动达标' : data.healthStatus === 'warning' ? '设备动作阻涩或微漏' : '密封失效或剧烈爆震!'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        {/* Left Col: Pressures */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="三端静/动水压力对比 (MPa)" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 6]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
                  <Bar dataKey="upP" name="钢管引水压力" fill="#3b82f6" opacity={0.6} />
                  <Line type="monotone" dataKey="caseP" name="蜗壳内压力" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  <Line type="stepAfter" dataKey="sealP" name="工作密封水压" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} />
               </ComposedChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="动作时滞偏离度(微秒级磨损)" className="h-[200px]">
             <div className="h-full flex flex-col justify-center items-center p-2 text-center">
                 <div className="text-slate-400 text-xs mb-2">对比出厂基准开合曲线时间偏差 (ms)</div>
                 <div className={`text-5xl font-mono font-bold tracking-tighter ${Math.abs(data.actionTimeDeviation) > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {data.actionTimeDeviation > 0 ? '+' : ''}{data.actionTimeDeviation}
                 </div>
                 <div className="text-slate-500 text-xs mt-2 w-3/4 leading-tight">
                    * 偏离度绝对值增大，往往预示着控制油路微堵塞、活塞漏油或轴系机械阻力骤增。
                 </div>
             </div>
          </SciFiCard>
        </div>

        {/* Center Col: 3D Twin */}
        <SciFiCard title="MAIN INLET VALVE 进水球阀流场数字孪生" className="col-span-2 relative overflow-hidden p-0 border border-slate-700/50">
          <div className="absolute inset-0 z-0">
             <ValveThreeScene angle={data.valveAngle} vibration={data.vibration} bypass={data.isBypassOpen} />
          </div>
          {/* Top-left HUD layer */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <div className="bg-slate-900/60 backdrop-blur border-l-2 border-cyan-500 p-2 mb-2">
                 <div className="text-[10px] text-cyan-500 mb-1 tracking-widest uppercase">System Phase</div>
                 <div className="text-xs text-slate-300 font-mono">STATE: <span className="text-emerald-400 font-bold">{data.valveStatus.toUpperCase()}</span></div>
                 {data.isBypassOpen && <div className="text-xs text-orange-400 font-mono">EQUALIZING PRESSURE...</div>}
             </div>
          </div>
        </SciFiCard>

        {/* Right Col: Vibration and Mechanism */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="阀芯与接力器联动位移曲线" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAngle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} domain={[0, 90]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
                  <Area yAxisId="left" type="monotone" dataKey="angle" name="开启角度(°)" stroke="#0284c7" strokeWidth={2} fill="url(#colorAngle)" />
               </AreaChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="阀体流激振动烈度 (RMS mm/s)" className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#f43f5e" fontSize={10} domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#e11d48' }} />
                  <Area type="stepAfter" dataKey="vib" name="绝对震动(mm/s)" stroke="#e11d48" strokeWidth={2} fill="url(#colorVib)" />
               </AreaChart>
             </ResponsiveContainer>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

const RefreshCwIcon = ({ size, spinning }: { size: number, spinning: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? "animate-spin text-cyan-400" : ""}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);
