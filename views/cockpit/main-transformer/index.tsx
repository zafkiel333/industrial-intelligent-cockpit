import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { TransformerThreeScene } from '../../../components/cockpit/main-transformer/ThreeScene';
import { Activity, Zap, Flame, Wind, ShieldAlert, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend, ComposedChart } from 'recharts';

import { MainTransformerData } from '../../../src/data/main-transformer/types';
import { transformerSeriesData } from '../../../src/data/main-transformer/transformer-series-data';

export const MainTransformerOpsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = transformerSeriesData[currentIndex];
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fill initial history
    const initialHistory = transformerSeriesData.slice(0, 20).map((d, i) => ({
      time: `-${20-i}s`,
      power: d.activePower,
      pd: d.partialDischarge,
      oilTemp: d.topOilTemp,
      windTemp: d.windingTemp
    }));
    setHistory(initialHistory);
    setCurrentIndex(19);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % transformerSeriesData.length;
        const nextData = transformerSeriesData[next];
        
        setHistory(h => {
          const newH = [...h.slice(1), {
            time: new Date(nextData.timestamp).toLocaleTimeString('zh-CN', { hour12: false, minute: '2-digit', second: '2-digit' }),
            power: nextData.activePower,
            pd: nextData.partialDischarge,
            oilTemp: nextData.topOilTemp,
            windTemp: nextData.windingTemp
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

  const gasColors = {
    H2: "#38bdf8",
    CH4: "#22d3ee",
    C2H4: "#fb923c",
    C2H2: "#ef4444",
    CO: "#94a3b8"
  };

  const gasData = [
    { name: 'H2', value: data?.dga.hydrogen, fill: gasColors.H2 },
    { name: 'CH4', value: data?.dga.methane, fill: gasColors.CH4 },
    { name: 'C2H4', value: data?.dga.ethylene, fill: gasColors.C2H4 },
    { name: 'C2H2', value: data?.dga.acetylene, fill: gasColors.C2H2 },
    { name: 'CO', value: data?.dga.carbonMonoxide, fill: gasColors.CO }
  ];

  if (!data) return null;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Metrics Rows */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Zap size={16}/> 传输有功负荷</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.activePower > 330 ? 'text-orange-400' : 'text-cyan-400'}`}>
            {data.activePower.toFixed(1)} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">MW</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Flame size={16}/> 绕组热点温度</div>
          <div className={`text-3xl font-[Rajdhani] font-bold ${data.windingTemp > 90 ? 'text-red-400' : 'text-emerald-500'}`}>
            {data.windingTemp.toFixed(1)} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">°C</span>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-900/20" style={{opacity: data.partialDischarge > 300 ? 1 : 0}}></div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 relative z-10"><Activity size={16}/> 局放幅值 (UHF)</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`text-3xl font-[Rajdhani] font-bold ${data.partialDischarge > 500 ? 'text-red-400' : data.partialDischarge > 300 ? 'text-purple-400' : 'text-blue-400'}`}>
              {data.partialDischarge} <span className="text-sm text-slate-500 pl-1">pC</span>
            </div>
          </div>
        </SciFiCard>

        <SciFiCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Wind size={16}/> 散热控制群组投入</div>
          <div className="text-3xl font-[Rajdhani] font-bold text-slate-200">
            {data.fanGroupOn} <span className="text-sm text-slate-500 border-l border-slate-700 pl-2">/ 4 组在线</span>
          </div>
        </SciFiCard>

        <div className={`p-4 rounded-xl border backdrop-blur flex flex-col justify-center items-center transition-all duration-300 ${getStatusBgColor(data.healthStatus)}`}>
          <ShieldAlert size={28} className={`mb-2 ${getStatusColor(data.healthStatus)}`}/>
          <div className={`text-lg font-bold tracking-widest ${getStatusColor(data.healthStatus)} drop-shadow-lg`}>
            {data.healthStatus === 'optimal' ? '热力与绝缘正常' : data.healthStatus === 'warning' ? '过热伴随微局放' : '危险性放电告警!'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        {/* Left Col: DGA Gas and Health */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="DGA 在线色谱指纹特征 (ppm)" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <RadialBarChart 
                 cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" barSize={10} 
                 data={gasData} startAngle={90} endAngle={-270}
               >
                 <RadialBar
                   background={{ fill: '#1e293b' }}
                   dataKey="value"
                   cornerRadius={5}
                 />
                 <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{top: 0, right: 0, fontSize: '10px'}} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', fontSize: '12px' }} />
               </RadialBarChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="气相分解追踪与乙炔(C2H2)红线" className="h-[250px]">
             <div className="h-full flex flex-col justify-around py-2">
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-slate-400">产气速率追踪 (H2+CH4)</span>
                     <span className="text-cyan-400 font-mono">{(data.dga.hydrogen + data.dga.methane).toFixed(1)} ppm</span>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-cyan-500 h-full" style={{width: `${Math.min(100, (data.dga.hydrogen + data.dga.methane)/1.5)}%`}}></div></div>
                 </div>
                 <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded flex flex-col gap-2">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-red-500">C2H2 (乙炔) 阿基里斯后跟</span>
                      <span className={`font-mono font-bold ${data.dga.acetylene > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>{data.dga.acetylene.toFixed(2)} ppm</span>
                   </div>
                   <div className="text-[10px] text-slate-400 leading-tight">
                     * 正常状态绝对禁止微量乙炔，检出提示存在高能量电弧放电。
                   </div>
                 </div>
             </div>
          </SciFiCard>
        </div>

        {/* Center Col: 3D Twin */}
        <SciFiCard title="MAIN TRANSFORMER 升压主变数字孪生" className="col-span-2 relative overflow-hidden p-0 border border-slate-700/50">
          <div className="absolute inset-0 z-0">
             <TransformerThreeScene fans={data.fanGroupOn} temperature={data.windingTemp} discharge={data.partialDischarge} />
          </div>
          {/* Top-left HUD layer */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <div className="bg-slate-900/60 backdrop-blur border-l-2 border-purple-500 p-2 mb-2">
                 <div className="text-[10px] text-purple-500 mb-1 tracking-widest uppercase">Grid Side</div>
                 <div className="text-xs text-slate-300 font-mono">V: {data.voltageHigh.toFixed(1)} kV</div>
                 <div className="text-xs text-slate-300 font-mono">I: {data.currentHigh.toFixed(1)} A</div>
             </div>
          </div>
        </SciFiCard>

        {/* Right Col: Temp vs PD history */}
        <div className="col-span-1 flex flex-col gap-4">
          <SciFiCard title="UHF 局部放电频谱图潜伏性映射 (pC)" className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#a855f7" fontSize={10} domain={[0, 800]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7' }} />
                  <Area type="monotone" dataKey="pd" name="超高频局放幅值" stroke="#d946ef" strokeWidth={2} fill="url(#colorPD)" />
               </AreaChart>
             </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="热力延滞模型 (绕组滞后于油温)" className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#ef4444" fontSize={10} domain={[40, 110]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444' }} />
                  <Line type="monotone" dataKey="windTemp" name="热点温度(°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="oilTemp" name="顶层油温(°C)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
               </ComposedChart>
             </ResponsiveContainer>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
